# EduSphere AI (Next.js Frontend)

This is the production-style Next.js (App Router) frontend.

## Run

```bash
cd frontend-next
npm install
npm run dev
```

## Backend

By default, the app calls the backend via `/api/orchestrate`, which proxies to `http://127.0.0.1:8000/orchestrate`.

Override backend URL:

```bash
setx EDUSPHERE_BACKEND_URL "http://127.0.0.1:8000"
```

Then restart `npm run dev`.
