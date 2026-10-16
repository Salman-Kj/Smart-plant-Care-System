# Smart Plant Care

A full-stack plant care application with plant disease detection, plant and gardening information, and account-based features. The web app uses React, Vite, Express, TypeScript, and PostgreSQL. Disease prediction uses the Python files and model under `ml/`.

## Run locally on Windows

### Requirements

- Node.js (LTS recommended) and npm
- PostgreSQL running locally
- Python 3.10 or newer for disease prediction

### Setup

1. Open PowerShell in this folder (`smart_plant_care`).
2. Install JavaScript dependencies:

   ```powershell
   npm install
   ```

3. Create a local environment file and edit the database connection string:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

   Create a PostgreSQL database named `smart_plant_care` (or use a different name and update `DATABASE_URL`). Set a unique `SESSION_SECRET`. `OPENROUTER_API_KEY` is needed only for features that use OpenRouter.

4. Push the app schema to the local database:

   ```powershell
   npm run db:push
   ```

5. Start the development server:

   ```powershell
   npm run dev
   ```

6. Open [http://localhost:5000](http://localhost:5000).

Install the Python packages from `ml/requirements.txt` if you plan to use disease prediction. The PlantVillage and PlantDoc image datasets are not stored in this repository; download them separately and put them in the paths expected by the scripts under `ml/`.

## Useful commands

```powershell
npm run check
npm run build
npm start
```

Never commit your `.env` file or real API keys. Start from `.env.example` instead.
