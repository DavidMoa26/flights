# Flight Booking Website - Final Project

## Table of Contents

- [Project Structure & Design](#project-structure--design)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker & Environment Configuration](#docker--environment-configuration)
- [Deployment & Scaling](#deployment--scaling)
- [Installation](#installation)
- [Usage](#usage)
- [Running the Project, Tests, and Deployment Scripts](#running-the-project-tests-and-deployment-scripts)

---

## Project Structure & Design

This project is a full-stack flight booking web application, organized as follows:

```
flights/
  backend/      # Node.js Express API, PostgreSQL ORM (Sequelize)
    src/
      controllers/      # Route controllers for flights and bookings
      data-access/      # Database models, seeders, and connection logic
      routes/           # API route definitions
      app.js            # Express app setup
      index.js          # Entry point, DB connection, server start
    tests/              # Mocha/Chai API tests
    Dockerfile          # Backend Docker image
  frontend/     # React (Vite) SPA
    src/
      components/       # UI components (search, booking, etc.)
      services/         # API service abstraction
      tests/            # Vitest/RTL tests
    Dockerfile          # Frontend Docker image
  docker-compose.yml    # Multi-container orchestration (DB, backend, frontend)
  .github/workflows/    # CI/CD GitHub Actions workflows
```

- **Backend**: RESTful API for flights and bookings, connects to PostgreSQL, includes health checks and seeding.
- **Frontend**: React SPA for searching flights, booking, and managing reservations.
- **Database**: PostgreSQL, seeded with sample data.

---

## CI/CD Pipeline

Automated via **GitHub Actions** (`.github/workflows/ci-cd.yml`):

- **Triggers**: On push to `development`, `main`, or `production` branches, and on pull requests.
- **Jobs**:
  - **test-backend**: Lints, installs, and tests backend with a temporary Postgres DB.
  - **test-frontend**: Lints, installs, tests, and builds frontend.
  - **integration-tests**: Runs backend and frontend together with a fresh DB, checks health.
  - **security-scan**: Runs `npm audit` on both backend and frontend.
  - **build-and-deploy**: (Production branch only) Builds Docker images, pushes to Google Artifact Registry, and deploys to Google Cloud Run using `gcloud` CLI. Environment variables are securely injected from GitHub secrets.
  - **pipeline-summary**: Prints a summary of all job results.

---

## Docker & Environment Configuration

- **docker-compose.yml** orchestrates:
  - `database`: PostgreSQL 15, with persistent volume and healthcheck.
  - `db-seed`: Seeds the database after DB is healthy.
  - `backend`: Node.js Express API, hot reload, connects to DB via env vars.
  - `frontend`: React app, hot reload, proxies API to backend.
- **Dockerfiles**:
  - Both backend and frontend use `node:18-alpine` for lightweight images.
  - Backend exposes port 4000, frontend exposes 3000.
- **Environment Variables**:
  - Managed via `.env` files (not committed), and injected in CI/CD and Docker Compose.
  - Key variables: `POSTGRES_URI`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `VITE_SERVICE_URL` (frontend API base URL).
  - Secrets for production (DB URI, API URLs, GCP credentials) are managed in GitHub secrets and injected at deploy time.

---

## Deployment & Scaling

### Deployment Steps

1. **Local Development**:
   - Run `./local_setup` or `docker-compose up -d` to start all services locally.
   - Access frontend at [http://localhost:3000](http://localhost:3000/), backend at [http://localhost:4000](http://localhost:4000/).
2. **CI/CD Pipeline**:
   - On push to `production`, the pipeline builds and pushes Docker images to Google Artifact Registry.
   - Deploys backend and frontend to Google Cloud Run using `gcloud run deploy`, with environment variables set from GitHub secrets.
3. **Production**:
   - Both services are deployed as stateless containers on Cloud Run, auto-scaled based on traffic.
   - Database is expected to be managed (e.g., Cloud SQL) and configured via `POSTGRES_URI`.

### Scaling

- **Cloud Run** provides automatic horizontal scaling for both backend and frontend containers based on incoming requests.
- **Stateless containers**: No local state; all persistent data is in PostgreSQL.
- **Database scaling**: For high load, use managed PostgreSQL (e.g., Google Cloud SQL) with read replicas and connection pooling.
- **Frontend**: Can be served via Cloud Run, or optionally via a CDN/static hosting for even greater scalability.

---

## Installation

Docker desktop/CLI required

Backend + Frontend + PostgreSQL containers and Seeder with one command

```bash
./local_setup
```

---

## Usage

After successful installation of the script use the following Local URLs to:

### Frontend

[http://localhost:3000](http://localhost:3000/)

### Backend

[http://localhost:4000](http://localhost:4000/)

---

## Running the Project, Tests, and Deployment Scripts

### Running the Project

#### With Docker (Recommended)

1. **Start all services:**
   ```bash
   ./local_setup
   # or
   docker-compose up -d
   ```
2. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000/)
   - Backend: [http://localhost:4000](http://localhost:4000/)

#### Locally (Without Docker)

1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   - Ensure PostgreSQL is running and environment variables are set (see `.env.example`).
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - The frontend will proxy API requests to the backend at `localhost:4000` by default.

### Running Tests

#### Backend Tests

```bash
cd backend
npm test
```

- Runs Mocha/Chai tests. Requires a test database (see CI/CD for auto-setup).

#### Frontend Tests

```bash
cd frontend
npm test
```

- Runs Vitest and React Testing Library tests.

#### Production Deployment (CI/CD)

- On push to the `production` branch, GitHub Actions will:
  - Build and test the app
  - Build and push Docker images to Google Artifact Registry
  - Deploy to Google Cloud Run using `gcloud run deploy`
- No manual action is needed if CI/CD is configured and secrets are set.

---
