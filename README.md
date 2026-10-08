# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Backend Node.js et MySQL local

L'API Express utilise MySQL et des sessions stockées dans la base. Le navigateur n'accède jamais directement à MySQL.

1. Démarrez MySQL dans le panneau de contrôle XAMPP.
2. Dans phpMyAdmin, exécutez `database/schema.sql` pour créer la base `health_platform` et ses tables (`users`, profils, examens, rendez-vous et messages). Si la base existe déjà, réexécutez le script pour ajouter les nouvelles tables manquantes.
3. Copiez `.env.example` vers `.env` et renseignez les paramètres MySQL ainsi qu'une valeur privée pour `SESSION_SECRET`.
4. Dans un terminal à la racine du projet, démarrez le backend :

  ```powershell
  npm run dev:backend
  ```

5. Dans un second terminal, démarrez le frontend avec `npm run dev`.
6. Inscrivez un patient depuis `/inscription`, puis connectez-vous depuis `/connexion`.

En local, Vite transfère `/api` vers Node sur le port `3001`. La route `/api/health` vérifie l'API et MySQL. Pour Netlify, définissez `VITE_API_URL` avec l'URL publique du backend au moment du build et `FRONTEND_ORIGINS` avec le domaine Netlify côté backend.

Les inscriptions publiques créent uniquement des comptes `PATIENT`. Les autres rôles doivent être attribués par un administrateur de confiance dans MySQL. Le script optionnel `database/seed-demo-doctors.php` permet d'amorcer des médecins fictifs si PHP/XAMPP est installé. Ces comptes sont réservés à la démonstration. En production, utilisez un compte MySQL dédié, un `SESSION_SECRET` robuste et HTTPS; ne stockez pas de vraies données de santé dans une démo.
