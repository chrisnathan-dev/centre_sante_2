CREATE DATABASE IF NOT EXISTS health_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE health_platform;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PATIENT', 'MEDECIN', 'PERSONNEL', 'ADMINISTRATEUR') NOT NULL DEFAULT 'PATIENT',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_profiles (
  user_id BIGINT UNSIGNED NOT NULL,
  first_name VARCHAR(80) NULL,
  last_name VARCHAR(80) NULL,
  phone VARCHAR(40) NULL,
  registration_number VARCHAR(80) NULL,
  specialty VARCHAR(120) NULL,
  service VARCHAR(120) NULL,
  function_title VARCHAR(120) NULL,
  staff_type VARCHAR(40) NULL,
  status ENUM('ACTIF', 'INACTIF') NOT NULL DEFAULT 'ACTIF',
  PRIMARY KEY (user_id),
  CONSTRAINT account_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exam_types (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  label VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('ACTIF', 'INACTIF') NOT NULL DEFAULT 'ACTIF',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY exam_types_label_unique (label)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  service_name VARCHAR(160) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason VARCHAR(255) NOT NULL,
  details TEXT NULL,
  status ENUM('EN_ATTENTE', 'CONFIRME', 'REFUSE', 'ANNULE') NOT NULL DEFAULT 'EN_ATTENTE',
  patient_confirmed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY appointments_doctor_slot_unique (doctor_id, appointment_date, appointment_time),
  KEY appointments_patient_created (patient_id, created_at),
  KEY appointments_doctor_created (doctor_id, created_at),
  CONSTRAINT appointments_patient_fk FOREIGN KEY (patient_id) REFERENCES users (id),
  CONSTRAINT appointments_doctor_fk FOREIGN KEY (doctor_id) REFERENCES users (id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  appointment_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY appointment_messages_thread (appointment_id, created_at),
  CONSTRAINT appointment_messages_appointment_fk FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
  CONSTRAINT appointment_messages_sender_fk FOREIGN KEY (sender_id) REFERENCES users (id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;