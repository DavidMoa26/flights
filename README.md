# Flight Booking Website - Final Project

## Installation

Docker desktop/CLI required

Create a `.env` file in the project root with the following settings:

```env
PORT=4000
RUN_SEED=true
POSTGRES_DB=flights_db
POSTGRES_USER=flights_admin
POSTGRES_PASSWORD=super_duper_secure_password
POSTGRES_URI=postgresql://flights_35fy_user:t9C199dmRUd0ck1DAIBgow0U3FrW4v0M@dpg-d17bjg95pdvs7386c8d0-a.frankfurt-postgres.render.com/flights_35fy
VITE_SERVICE_URL=http://localhost:4000
```

Backend + Frontend + PostgreSQL containers and Seeder with one command

```bash
./setup.sh
```

## Usage

After successful installation of the script use the following Local URLs to:

### Frontend
[http://localhost:3000](http://localhost:3000/)

### Backend
[http://localhost:4000](http://localhost:4000/)

