<?php
declare(strict_types=1);

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$name = getenv('DB_NAME') ?: 'health_platform';
$user = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';

$database = new PDO(
    "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
    $user,
    $password,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
);

$services = [
    ['slug' => 'medecine-generale', 'service' => 'Médecine générale', 'specialty' => 'Médecine générale'],
    ['slug' => 'pediatrie', 'service' => 'Pédiatrie', 'specialty' => 'Pédiatrie'],
    ['slug' => 'gynecologie', 'service' => 'Gynécologie', 'specialty' => 'Gynécologie'],
    ['slug' => 'cardiologie', 'service' => 'Cardiologie', 'specialty' => 'Cardiologie'],
];

$credentialsPath = __DIR__ . DIRECTORY_SEPARATOR . 'demo-doctor-credentials.local';
$credentialsFile = fopen($credentialsPath, 'ab');
if ($credentialsFile === false) {
    throw new RuntimeException('Impossible de créer le fichier local des identifiants.');
}

if (filesize($credentialsPath) === 0) {
    fwrite($credentialsFile, "Comptes fictifs de démonstration. Mots de passe temporaires, à conserver localement.\nEmail\tMot de passe initial\n");
}

$created = 0;
$countStatement = $database->prepare(
    "SELECT COUNT(*) FROM users u
     JOIN account_profiles p ON p.user_id = u.id
     WHERE u.role = 'MEDECIN' AND p.service = :service AND p.status = 'ACTIF'",
);
$emailStatement = $database->prepare('SELECT id FROM users WHERE email = :email');
$userInsert = $database->prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (:name, :email, :password_hash, \'MEDECIN\')',
);
$profileInsert = $database->prepare(
    'INSERT INTO account_profiles (user_id, first_name, last_name, phone, registration_number, specialty, service, status)
     VALUES (:user_id, :first_name, :last_name, :phone, :registration_number, :specialty, :service, \'ACTIF\')',
);

foreach ($services as $service) {
    $countStatement->execute(['service' => $service['service']]);
    $activeCount = (int) $countStatement->fetchColumn();
    $sequence = 1;

    while ($activeCount < 5 && $sequence <= 100) {
        $email = sprintf('demo.%s.%02d@centre-sante.test', $service['slug'], $sequence);
        $sequence++;
        $emailStatement->execute(['email' => $email]);
        if ($emailStatement->fetch()) {
            continue;
        }

        $suffix = sprintf('%02d', $sequence - 1);
        $firstName = 'Démo';
        $lastName = $service['specialty'] . ' ' . $suffix;
        $displayName = 'Dr ' . $firstName . ' ' . $lastName;
        $initialPassword = rtrim(strtr(base64_encode(random_bytes(18)), '+/', '-_'), '=');

        $database->beginTransaction();
        try {
            $userInsert->execute([
                'name' => $displayName,
                'email' => $email,
                'password_hash' => password_hash($initialPassword, PASSWORD_DEFAULT),
            ]);
            $userId = $database->lastInsertId();
            $profileInsert->execute([
                'user_id' => $userId,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'phone' => '+237 000 000 ' . str_pad((string) $created, 3, '0', STR_PAD_LEFT),
                'registration_number' => sprintf('DEMO-%s-%02d', strtoupper(substr($service['slug'], 0, 2)), $sequence - 1),
                'specialty' => $service['specialty'],
                'service' => $service['service'],
            ]);
            $database->commit();
        } catch (Throwable $error) {
            if ($database->inTransaction()) {
                $database->rollBack();
            }
            fclose($credentialsFile);
            throw $error;
        }

        fwrite($credentialsFile, $email . "\t" . $initialPassword . "\n");
        $created++;
        $activeCount++;
    }
}

fclose($credentialsFile);
echo "Comptes médecins de démonstration ajoutés : {$created}.\n";
echo 'Identifiants initiaux : ' . $credentialsPath . PHP_EOL;