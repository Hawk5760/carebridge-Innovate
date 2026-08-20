# CareBridge AI — PRD

## Problem statement
Imported GitHub repo (Hawk5760/carebridge-ai), a Lovable-built TanStack Start (Vite + React 19 + TS)
app. User asked to: build the full Patient side, improve the Hospital dashboard, keep the current
teal/glass aesthetic (polished), and add real AI.

## Architecture
- Frontend: TanStack Start (Vite 8, React 19, Tailwind v4, file-based routing) at /app, served on
  port 3000 via a launcher at /app/frontend (supervisor `yarn start` -> `cd /app && yarn dev`).
- vite.config.ts: overrides Lovable sandbox config to serve on 3000; `hmrGate:false` so hydration
  does not depend on the HMR websocket (which the preview proxy can't reach).
- State: client-side React context + localStorage (`src/lib/carebridge/store.tsx`), seeded patients
  (`seed.ts`), risk/care-score engine `recompute()`. No DB used for app data.
- Backend: FastAPI (/app/backend) on 8001, `/api/*` routes. Real AI via emergentintegrations
  (LlmChat, model openai/gpt-5.4, EMERGENT_LLM_KEY). Endpoints:
  - POST /api/ai/risk-explanation, /api/ai/intervention-message, /api/ai/care-insight
- Frontend calls AI through relative `/api/...` (ingress routes /api -> 8001).

## Implemented (2026-06)
- Full Patient side: login (phone+OTP), dashboard shell + Home, Medicines, Appointments, Tests,
  Care Score, Messages, Family/Caregiver, Profile — all interactive, updating care score/risk live.
- Real AI: patient "Why am I struggling?" insight + chat AI reply; hospital patient-detail AI risk
  explanation + AI-drafted WhatsApp outreach message.
- Fixes: served app on port 3000; disabled hmr boot-gate (was blocking interactivity); hydration
  race fix in store (`hydrated` flag) so refreshing a dashboard URL no longer bounces to login.
- Verified end-to-end via Playwright on the public preview URL (patient + hospital flows + AI).

## Backlog / next
- P1: Hospital "Draft outreach message" -> one-click log into intervention history.
- P1: Persist patient-selectable identity at login (choose which patient to sign in as).
- P2: Streaming AI responses (currently one-shot); AI on interventions/analytics pages.
- P2: Real reminder/automation timeline simulation on the patient/hospital side.
