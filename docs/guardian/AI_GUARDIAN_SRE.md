# EduConnect AI Guardian — Autonomous Software Reliability Engineer (SRE)

## 1. System Vision & Purpose
**EduConnect AI Guardian** is a standalone, isolated daemon service designed to guarantee platform reliability, continuous observability, and safe automated self-healing.

Even if the main Django web server experiences an outage, database lockup, or Celery worker drop, **the Guardian process continues executing independently on its own event loop and hardware thread**.

---

## 2. Multi-Layer Observability Collectors

```
[System Host Probe]    --> CPU, Virtual Memory, Disk Space (psutil)
[Backend Probe]        --> HTTP Health, Latency (ms), Status Codes (requests)
[Database Probe]       --> PostgreSQL / SQLite Connection Handshake, Query Execution Time
[Redis & Socket Probe] --> Ping/Pong Latency, Channel Layer Saturation
[Celery Worker Probe]  --> Worker Heartbeat, Task Queue Backpressure
[AI API Probe]         --> OpenAI Quota, Error Rates, Fallback Readiness
```

---

## 3. Decision & Self-Healing Pipeline

```
Monitoring Collectors
        │
        ▼
Metric & Error Normalization
        │
        ▼
Rule-Based Anomaly Detection (Threshold alerts: latency > 800ms, CPU > 85%, HTTP 5xx)
        │
        ▼
AI Root-Cause Diagnosis (OpenAI GPT-4o-mini structured analysis)
        │
        ▼
Safety Policy Gatekeeper
        │
        ├── [Approved Non-Destructive Tool] ───> Automatic Execution ───> Post-Recovery Verification
        │
        └── [High-Risk Intervention] ─────────> Halt & Enqueue for Human Sign-off
```

---

## 4. Approved Pre-defined Tool Registry

The AI Guardian is strictly sandboxed. **It can NEVER execute arbitrary shell commands or raw unrestricted SQL statements.**

Permitted Non-Destructive Tools:
1. `CLEAR_APPROVED_CACHE`: Invalidates transient cache keys when memory spikes or stale state occurs.
2. `RETRY_FAILED_TASKS`: Re-enqueues failed Celery tasks with exponential backoff.
3. `REFRESH_EXPIRED_TOKENS`: Renews expired OAuth credentials for Instagram, WhatsApp, LinkedIn.
4. `RESTART_WORKER`: Dispatches a graceful reload signal to child worker processes.
5. `COLLECT_DIAGNOSTICS`: Captures thread dumps, memory profiles, and error traces.

---

## 5. Human-in-the-Loop Approval Gatekeeper

The following actions strictly halt automatic execution and notify platform administrators via email and dashboard alerts:
- Production database schema migrations
- Destructive cleanup or record deletion
- Security credential modifications
- Rollback of deployment versions
- Modification of platform code

---

## 6. How to Run AI Guardian Independently

### In Local Development:
```bash
# Terminal 1: Run Django Backend
python backend/manage.py runserver 8000

# Terminal 2: Run AI Guardian Watchdog
python ai_guardian/guardian_daemon.py
```

### In Docker Compose:
```bash
docker compose up guardian
```
