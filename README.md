# S.P.E.A.K. — Frontend

> **S.P.E.A.K.** (Tech4Change 2026 MVP) — an assistive-technology platform enabling bidirectional accessibility in consultations through **Libras-to-text** and **speech-to-text** conversion, running entirely in the browser.
>
> ⚠️ **Disclaimer:** This is an MVP. It does not diagnose, does not replace psychologists, and does not replace professional Libras interpreters.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks_Vision-00897b)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

**Live app:** https://speak-front-rho.vercel.app
**Backend repository:** https://github.com/vicmazzola/accessible-care-api

---

## Overview

S.P.E.A.K. lets a Deaf person and a hearing person hold a real-time conversation on a single shared screen, without a human interpreter:

- **Camera → Libras → text:** the webcam captures hand landmarks with MediaPipe, the frontend builds a normalized `64 × 126` sequence and sends it to the backend, which queries an OCI Model Deployment and returns the recognized sign.
- **Microphone → speech → text:** the hearing person's speech is transcribed to text (browser Web Speech API in the current MVP; OCI Speech via the backend planned).
- **Shared chat:** both sides of the conversation appear in a single message thread, differentiated by source (Libras / speech / text).

This repository contains the **frontend** only. The backend (Java / Spring Boot + OCI) lives in a [separate repository](https://github.com/vicmazzola/accessible-care-api).

---

## Architecture

```
Webcam ─► MediaPipe HandLandmarker (browser)
             │  21 landmarks × (x,y,z) per hand
             ▼
      64 × 126 sequence (normalized)
             │  POST /api/sign-language/predict
             ▼
   Java / Spring Boot backend ─► OCI Model Deployment ─► prediction + top3

Microphone ─► Web Speech API (browser) ─► text   (MVP)
             (OCI Speech via /api/speech/session — planned)
```

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand.
- **In-browser capture:** MediaPipe Tasks Vision (`HandLandmarker`, VIDEO mode, 2 hands), `getUserMedia`, Web Speech API.
- **Backend / cloud:** Java 21 / Spring Boot, OCI Speech, OCI Model Deployment, OCI Data Science.
- **Hosting:** Frontend on Vercel; backend on OCI.

---

## Tech stack

| Layer | Technologies |
|---|---|
| Framework | Next.js 15 (App Router), React, TypeScript |
| Styling / UI | Tailwind CSS, shadcn/ui, lucide-react |
| State | Zustand |
| Sign capture | @mediapipe/tasks-vision (HandLandmarker) |
| Speech | Web Speech API (`pt-BR`) |
| Deployment | Vercel |

---

## Libras capture pipeline

The frontend reproduces the exact preprocessing used to train the model, so inference matches training:

1. **Landmark extraction** — MediaPipe returns 21 landmarks `(x, y, z)` per hand, point-by-point: `[x0,y0,z0, …, x20,y20,z20]` (63 values per hand).
2. **Frame assembly** — `126` values per frame: indices `0–62` = **Left** hand, `63–125` = **Right** hand, using MediaPipe's `handedness` label directly (no pixel flip, no manual swap). A missing hand is filled during gap-filling, otherwise zeroed.
3. **Temporal pipeline** — leading/trailing frames with no hands are trimmed; internal detection gaps are linearly interpolated per hand; the whole sequence is resampled to exactly **64 frames** (linear interpolation per feature).
4. **Normalization (per hand, per frame)** — translate by the wrist (landmark 0), then divide by the 3D distance between the wrist and the middle-finger MCP (landmark 9); fallbacks handle near-zero scale.
5. **Prediction** — the resulting `64 × 126` sequence is sent to the backend.

Auto-segmentation drives capture: when hands enter the frame it starts capturing; when they leave (or a pause is detected) it finalizes and sends. A manual capture button is available as a fallback.

---

## Backend API consumed

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/sign-language/predict` | POST | Sends the `64 × 126` landmark sequence for prediction |
| `/api/speech/session` | POST | Creates an OCI Speech realtime session *(planned integration)* |

**Prediction request:**
```json
{ "sequence": "number[64][126]" }
```

**Prediction response:**
```json
{
  "success": true,
  "prediction": "Obrigado",
  "distance": 0.0,
  "top3": [{ "label": "Obrigado", "distance": 0.0 }],
  "error": null
}
```

> `distance` is a DTW distance — **lower means a closer match** (it is not a confidence score).

**Current sign vocabulary (10 signs):** Aconselhar, Ajudar, Bem, Com medo, Deprimir, Feliz, Obrigado, Oi, Psicologia, Triste.

---

## Getting started

### Prerequisites
- Node.js 18+ and npm
- A browser with camera and microphone (use **Chrome** or **Edge** — the Web Speech API is not supported in Firefox)
- The MediaPipe model file at `public/models/hand_landmarker.task` (float16)

### Install and run
```bash
git clone https://github.com/<your-user>/speak-front.git
cd speak-front
npm install
npm run dev
```
Open http://localhost:3000.

### Environment variables
Create a `.env.local` in the project root:
```env
NEXT_PUBLIC_API_URL=https://<backend-url>
```
When `NEXT_PUBLIC_API_URL` is empty, the app runs in **mock mode** (sign prediction returns sample data), so the frontend works end-to-end without the backend. Set the variable to the deployed backend URL to use real predictions — no code change required.

### Build
```bash
npm run build
npm start
```

---

## Project structure

```
src/
├─ app/
│  ├─ page.tsx            # Landing
│  └─ sala/page.tsx       # Consultation room (camera + mic + chat)
├─ components/
│  ├─ brand/              # Logo
│  └─ room/               # camera-panel, mic-panel, chat-panel, message-bubble, room-header
├─ hooks/
│  ├─ useLibrasCapture.ts # MediaPipe capture + auto-segmentation
│  └─ useSpeechRecognition.ts
├─ lib/
│  ├─ libras-sequence.ts  # 64×126 assembly + normalization
│  ├─ api.ts              # predictSign() + mock fallback
│  └─ types.ts
└─ store/
   └─ useRoomStore.ts     # shared chat state (Zustand)
```

---

## Accessibility notes

- Uses the term **"surdo/surda"** (Deaf), the identity term preferred by the Brazilian Deaf community, rather than "deficiente auditivo".
- Light and dark themes, adjustable, with WCAG-conscious contrast.
- Text input is always available as a communication fallback.

---

## Limitations & next steps

- The Libras model recognizes only **isolated signs** within a limited vocabulary — no continuous translation.
- Speech recognition currently depends on the browser (Chrome/Edge). Migrating to the backend **OCI Speech** endpoint will add cross-browser support and keep audio within our own infrastructure.
- **Next steps:** "always listening" mode with noise/non-verbal filtering; expanded sign vocabulary; native mobile app; a signing avatar for the text → Libras direction.

---

## Team

| Member | Role |
|---|---|
| **Victor Silva Mazzola** | Backend — Spring Boot, OCI integrations, deployment |
| **Patrick Nascimento Andrade** | Frontend — Next.js, MediaPipe integration, Vercel deployment |
| **Fabiana Luizon Martins Campos** | AI/ML — OCI Data Science, dataset & model pipeline |

---

<sub>Developed for **Tech4Change 2026** — "Potencializando o ser humano com Inteligência Artificial" (PosTech FIAP).</sub>
