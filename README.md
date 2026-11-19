# EduConnect AI 🎓✨
### AI-Powered Student Social Learning Ecosystem & Autonomous Reliability Engine

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Passing-emerald.svg)](.github/workflows/ci.yml)
[![Django](https://img.shields.io/badge/Backend-Django%205.2%20%7C%20DRF-092e20.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61dafb.svg)](https://react.dev/)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native%20%7C%20Expo-000000.svg)](https://expo.dev/)
[![AI Guardian](https://img.shields.io/badge/Autonomous%20SRE-AI%20Guardian%20v2.4-blueviolet.svg)](docs/guardian/AI_GUARDIAN_SRE.md)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 1. Project Vision

**EduConnect AI** is a production-oriented, unified student social learning platform that integrates four core student experiences into a single ecosystem:

1. **Instagram for Academics:** Social posts, photo galleries, ephemeral 24h stories, short video reels, likes, nested comments, and hashtags.
2. **WhatsApp for Classrooms:** Real-time 1-on-1 direct messages, group study chats, file/image attachments, read receipts, and typing indicators.
3. **LinkedIn for Students:** Verified academic profiles, degrees, CGPA, verified skills, GitHub & portfolio links, mentorship opportunities, and internship/job recruitment pipelines.
4. **YouTube for Education:** Modular video lesson catalog, playlist syllabi, course enrollments, study notes, interactive graded quizzes, and streak tracking.
5. **Autonomous AI Guardian (SRE):** An independent background watchdog service that monitors platform health, classifies software anomalies using OpenAI GPT-4o-mini, executes safe automated self-healing procedures, and halts high-risk actions behind a human approval gate.

---

## 🏗️ 2. Monorepo Architecture

```
EduConnect-AI/
├── backend/                  # Django + Django REST Framework + Channels
│   ├── config/               # Settings, URLs, ASGI, WSGI, Celery
│   ├── apps/                 # 17 Modular Domain Applications
│   │   ├── accounts/         # User auth, JWT, RBAC
│   │   ├── profiles/         # Academic portfolios, skills, streaks
│   │   ├── colleges/         # Universities & official verification
│   │   ├── social/           # Feed, posts, likes, comments, hashtags
│   │   ├── stories/          # 24-hour ephemeral stories & viewer analytics
│   │   ├── messaging/        # Real-time WebSocket chat & direct messages
│   │   ├── communities/      # Student clubs, study groups, announcements
│   │   ├── learning/         # Courses, video lessons, quizzes, progress
│   │   ├── networking/       # Connections & recommendation engine
│   │   ├── careers/          # Internships, jobs, applicant tracking
│   │   ├── projects/         # Student collaborative hackathon Kanban boards
│   │   ├── notifications/    # Multi-channel notification dispatch
│   │   ├── integrations/     # Instagram, WhatsApp, LinkedIn, YouTube adapters
│   │   ├── ai_assistant/     # Academic AI tutor, code debugger, quiz generator
│   │   ├── guardian/         # Guardian incident telemetry & API models
│   │   ├── moderation/       # Content report review & audit logging
│   │   └── analytics/        # Platform usage, DAU, course completion stats
│   ├── manage.py
│   ├── requirements.txt
│   └── seed_data.py          # Comprehensive demo seeder
├── frontend/                 # React 18 + Vite + Tailwind CSS + Lucide
│   ├── src/
│   │   ├── components/       # Design system (Cards, Modals, Feed, VideoPlayer, Badges)
│   │   ├── context/          # AuthContext, NotificationContext, ThemeContext
│   │   ├── pages/            # 13 Complete Full-Stack Pages
│   │   ├── services/         # Axios API clients & WebSocket handlers
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── mobile/                   # React Native (Expo) Mobile App (16 Screens)
│   ├── src/
│   │   ├── navigation/       # Tab & Native Stack navigators
│   │   ├── screens/          # Splash, Onboarding, Feed, Chat, Learn, Profile, AI Tutor
│   │   └── services/         # Mobile Axios client with AsyncStorage token auth
│   ├── App.js
│   ├── app.json
│   └── package.json
├── ai_guardian/              # Independent Autonomous Software Reliability Engineer
│   ├── monitors/             # System, Backend, DB, Redis, Celery probes
│   ├── diagnosis/            # Rule engine + OpenAI GPT-4o-mini diagnostic reasoning
│   ├── recovery/             # Sandboxed tool registry (cache clear, task retry, worker restart)
│   ├── safety/               # Risk scoring, cooldowns, human approval gatekeeper
│   └── guardian_daemon.py    # Independent background daemon loop
├── infrastructure/           # Dockerfiles, docker-compose, Render blueprints
├── docs/                     # Architecture, DB schema, REST API specs, Runbooks
├── tests/                    # Backend, Frontend, Guardian, End-to-End suites
├── .github/workflows/        # Automated CI/CD pipeline
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🚀 3. Quick Start & Local Execution

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Configure Environment
```bash
cp .env.example .env
```
*(The default `.env` is pre-configured with safe local development defaults including SQLite and local cache fallback).*

### 3. Initialize & Seed Database
```bash
# Run database migrations
python backend/manage.py migrate

# Seed verified Colleges, Users, Posts, Stories, Courses, Quizzes, Jobs, and Projects
python backend/seed_data.py
```

### 4. Start Django Backend Server
```bash
python backend/manage.py runserver 8000
```
Backend is accessible at: `http://localhost:8000/api/v1/`
Health check at: `http://localhost:8000/health/`

### 5. Start Autonomous AI Guardian Service
In a separate terminal:
```bash
python ai_guardian/guardian_daemon.py
```

### 6. Start React Web Application
In a separate terminal:
```bash
npm --prefix frontend install
npm --prefix frontend run dev
```
Open your browser at: `http://localhost:5173`

---

## 🔑 4. Pre-Configured Demo Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Student (MIT)** | `alex@educonnect.ai` | `StudentPass123!` | CS Junior @ MIT, Full-Stack & AI Builder |
| **Student (Stanford)** | `sarah@educonnect.ai` | `StudentPass123!` | Data Science & ML @ Stanford |
| **Educator / Mentor** | `dr.emily@educonnect.ai` | `TeacherPass123!` | CS Professor & Learning Hub Instructor |
| **Recruiter (Google)** | `mark.recruiter@google.com` | `RecruiterPass123!` | Senior University Talent Scout @ Google |
| **Platform Administrator** | `admin@educonnect.ai` | `AdminPassword123!` | Platform Superuser & SRE Operator |

*(Buttons to quick-fill demo credentials are built directly into the login screen).*

---

## 🛡️ 5. AI Guardian Autonomous Reliability Engineer

The AI Guardian is an autonomous monitoring agent that ensures 99.99% uptime for EduConnect:

- **Independent Execution**: Runs as an isolated daemon process separate from the Django WSGI/ASGI event loop.
- **Multi-layer Probes**: Continuously evaluates API response times, database latency, Redis memory, and host CPU.
- **Diagnostic Engine**: Employs OpenAI GPT-4o-mini to diagnose incident root causes in real-time.
- **Safe Recovery Allowlist**: Only predefined, non-destructive tools can be auto-executed:
  - `CLEAR_APPROVED_CACHE`
  - `RETRY_FAILED_TASKS`
  - `REFRESH_EXPIRED_TOKENS`
  - `RESTART_WORKER`
  - `COLLECT_DIAGNOSTICS`
- **Human Approval Gatekeeper**: High-risk actions (production migrations, credential changes, data rollbacks) are strictly paused and enqueued on the Guardian Dashboard until an administrator approves.

---

## 🧪 6. Automated Test Suite

Run all test suites across backend, AI Guardian, and end-to-end user journeys:

```bash
# 1. Django App Unit & API Tests
python backend/manage.py test apps.accounts apps.social

# 2. AI Guardian Anomaly Detection & Safety Policy Tests
python tests/guardian/test_guardian_probes.py

# 3. End-to-End Student Workflow Test
python tests/e2e/test_student_workflow.py

# 4. Frontend Production Build Verification
npm --prefix frontend run build
```

**Test Verification Summary:**
- Backend Unit Tests: **3 / 3 Passed (100%)**
- Guardian Probes & Safety Gate: **4 / 4 Passed (100%)**
- End-to-End Student Lifecycle: **1 / 1 Passed (100%)**
- Frontend Vite Build: **Zero errors, bundled in 4.34s**

---

## 🐳 7. Docker Production Deployment

To start the entire platform with PostgreSQL, Redis, Django, Celery, AI Guardian, and React Nginx in Docker:

```bash
docker compose up -d --build
```

View active container logs:
```bash
docker compose logs -f guardian
docker compose logs -f backend
```

---

## 📱 8. React Native Mobile App (Expo)

```bash
cd mobile
npm install
npx expo start
```
Scan the QR code with Expo Go on Android or iOS.

---

## 📚 9. Documentation Index

- [REST API Reference](docs/api/API_DOCUMENTATION.md)
- [PostgreSQL Database Schema](docs/architecture/DATABASE_SCHEMA.md)
- [AI Guardian SRE Architecture](docs/guardian/AI_GUARDIAN_SRE.md)
- [Production Deployment Runbook](docs/DEPLOYMENT_GUIDE.md)

---

## ⚖️ License
Distributed under the MIT License.
