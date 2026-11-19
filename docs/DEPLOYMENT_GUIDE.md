# EduConnect AI — Production Deployment & DevOps Runbook

## 1. Quick Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL & Redis (optional, SQLite/LocMem fallback available)

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/your-org/EduConnect-AI.git
cd EduConnect-AI
cp .env.example .env
```

### Step 2: Initialize Backend & Database
```bash
# Run migrations & seed demo dataset
python backend/manage.py migrate
python backend/seed_data.py

# Start Django Development Server
python backend/manage.py runserver 8000
```
Backend is live at `http://localhost:8000/api/v1/`.

### Step 3: Start AI Guardian Autonomous Monitor
```bash
python ai_guardian/guardian_daemon.py
```

### Step 4: Start React Web Frontend
```bash
npm --prefix frontend install
npm --prefix frontend run dev
```
Frontend is live at `http://localhost:5173`.

---

## 2. Docker & Multi-Container Production Setup

Run all 6 microservices (Postgres, Redis, Django, Celery, AI Guardian, and Nginx React Frontend):

```bash
docker compose up -d --build
```

Verify service status:
```bash
docker compose ps
docker compose logs -f guardian
```

---

## 3. Cloud Deployment on Render

EduConnect AI includes a declarative infrastructure blueprint: `infrastructure/render/render.yaml`.

1. Connect your GitHub repository to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Select this repository. Render automatically provisions:
   - Managed PostgreSQL database (`educonnect-postgres`)
   - Managed Redis cluster (`educonnect-redis`)
   - Django Web Service (`educonnect-backend`)
   - Celery background worker (`educonnect-celery-worker`)
   - Independent AI Guardian worker (`educonnect-ai-guardian`)
   - React Static Site (`educonnect-frontend`)
4. Populate `OPENAI_API_KEY` in environment secrets.
5. Deploy!

---

## 4. Mobile App Build (Expo EAS)

```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform all
```
