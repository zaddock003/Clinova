# Clinova

Clinova is a simulated AI-powered healthcare ecosystem built as a cohesive network of patient, doctor, hospital, and emergency coordination workflows.

## Features

- Patient Dashboard: symptom reporting, AI urgency analysis, SOS emergency trigger, live status and health insights.
- Doctor Dashboard: case queue, AI-assisted risk scoring, diagnosis suggestions, treatment management.
- Hospital Dashboard: bed/ICU capacity, incoming emergency feed, smart admission matching.
- Emergency Intelligence: triage engine, hospital matching, ambulance routing simulation, pre-arrival report.

## Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the workspace:
   ```bash
   npm run dev
   ```

The client runs at `http://localhost:5173` and the backend API runs at `http://localhost:4000`.

## Deployment

This project can be deployed as a single Docker-backed web service.

1. Initialize git in the repo:
   ```bash
   git init
   git add .
   git commit -m "Initial Clinova deployment setup"
   ```
2. Push to a GitHub repository.
3. Connect the repository to a service such as Render or any Docker-compatible host.

### Render

- Use the provided `render.yaml` and `Dockerfile`.
- Set the branch to `main` and enable auto-deploy.
- On every push to `main`, Render will rebuild and update the live app.

### Local production build

```bash
npm install
npm run build
npm run server
```

The app will then serve the built client and API from the same server on port `4000`.

## Architecture

- `server/` contains in-memory state and a simulated AI coordination engine.
- `src/` contains the React dashboards and data polling logic.

## Notes

This MVP is a prototype of a healthcare operating layer with AI-assisted decision workflows, emergency routing, and cross-role coordination.
