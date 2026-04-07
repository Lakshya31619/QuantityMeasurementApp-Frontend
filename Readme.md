# 📐 Quantity Measurement — Frontend

An **Angular 21 SSR application** for performing unit conversions and arithmetic operations across Length, Weight, Volume, and Temperature — with JWT authentication, Google OAuth2 sign-in, guest mode with history replay, and a live Spring Boot backend.

---

## 📚 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Pages & Routing](#-pages--routing)
- [Core Architecture](#-core-architecture)
- [Supported Operations & Units](#-supported-operations--units)
- [Guest Mode & History Replay](#-guest-mode--history-replay)
- [Environment Configuration](#-environment-configuration)
- [Local Setup](#-local-setup)
- [Build & Deployment](#-build--deployment)
- [Backend Integration](#-backend-integration)

---

## 🧭 Project Overview

This is the frontend client for the Quantity Measurement Application. It connects to a Spring Boot REST API and provides a clean, interactive dashboard for performing unit operations — with full auth support (email/password and Google OAuth2) and persistent operation history for logged-in users.

Guest users can still use all calculation features without an account. Their operation history is stored in `localStorage` and automatically replayed to the server when they log in.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 21.2 |
| Language | TypeScript 5.9 |
| Rendering | Angular SSR (`@angular/ssr` + Express 5) |
| HTTP | Angular `HttpClient` with class-based interceptor |
| Auth | JWT (localStorage) + Google Identity Services (GSI) |
| Forms | Angular `FormsModule` (template-driven) |
| Routing | Angular Router with lazy-loaded standalone components |
| State | Service-based (`TokenService`, `GuestHistoryService`) |
| Testing | Vitest |
| Package Manager | npm 11 |

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts               # Route guard (checks JWT in localStorage)
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts          # Attaches Bearer token; handles 401/403
│   │   └── services/
│   │       ├── auth.service.ts             # login / signup / googleLogin HTTP calls
│   │       ├── quantity.service.ts         # convert / add / subtract / multiply / divide / compare / getHistory
│   │       ├── token.service.ts            # JWT read/write/clear (SSR-safe localStorage)
│   │       └── guest-history.service.ts    # Guest op history (localStorage, max 50 entries)
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts      # Email/password + Google login + guest replay
│   │   │   │   └── login.component.html
│   │   │   └── signup/
│   │   │       ├── signup.component.ts     # Email/password + Google signup
│   │   │       └── signup.component.html
│   │   └── dashboard/
│   │       ├── dashboard.component.ts      # Main calculator UI + history panel
│   │       ├── dashboard.component.html
│   │       └── dashboard.component.css
│   │
│   ├── app.config.ts                       # HttpClient + JwtInterceptor provider setup
│   ├── app.config.server.ts                # SSR-specific app config
│   ├── app.routes.ts                       # Route definitions (lazy-loaded)
│   ├── app.routes.server.ts                # Server render mode (Prerender)
│   ├── app.ts                              # Root component
│   ├── app.html                            # Root template (<router-outlet>)
│   └── app.css
│
├── environments/
│   ├── environment.ts                      # Dev: http://localhost:8080
│   └── environment.prod.ts                 # Prod: Railway backend URL
│
├── index.html                              # Loads Google GSI script
├── main.ts                                 # Browser bootstrap
├── main.server.ts                          # SSR bootstrap
├── server.ts                               # Express SSR server
└── styles.css                              # Global styles
```

---

## ✨ Features

- ✅ **Unit conversion** across Length, Weight, Volume, and Temperature
- ✅ **Arithmetic operations** — add, subtract, multiply, divide
- ✅ **Equality comparison** between two quantities (cross-unit)
- ✅ **Email/password signup & login**
- ✅ **Google OAuth2 sign-in** via Google Identity Services (GSI)
- ✅ **JWT stored in localStorage** — auto-attached to every HTTP request via interceptor
- ✅ **Guest mode** — use the calculator without an account
- ✅ **Guest history replay** — operations done as a guest are replayed to the server on login
- ✅ **Persistent operation history** for logged-in users (fetched from backend)
- ✅ **401/403 handling** — auto-redirect to login for protected routes; guests allowed through on public routes
- ✅ **SSR (Server-Side Rendering)** with Angular Universal + Express
- ✅ **Lazy-loaded standalone components** for optimal bundle size
- ✅ **SSR-safe** localStorage access via `isPlatformBrowser` guards

---

## 🗺 Pages & Routing

| Path | Component | Auth Required | Description |
|------|-----------|:---:|-------------|
| `/` | — | ❌ | Redirects to `/dashboard` |
| `/login` | `LoginComponent` | ❌ | Email/password + Google login |
| `/signup` | `SignupComponent` | ❌ | Email/password + Google signup |
| `/dashboard` | `DashboardComponent` | ❌ | Calculator UI (guests allowed) |

> The dashboard is publicly accessible. History viewing requires login — clicking "View History" as a guest redirects to `/login`.

---

## 🏗 Core Architecture

### JWT Interceptor (`jwt.interceptor.ts`)
Automatically attaches `Authorization: Bearer <token>` to every outgoing HTTP request when a token exists in localStorage.

On `401`/`403` responses:
- **Guest-allowed routes** (all `/api/quantity/` operations, `/api/auth/**`) — error is surfaced normally, no redirect.
- **Protected routes** (e.g. `/api/quantity/history`) — token is cleared and user is redirected to `/login`.

### Token Service (`token.service.ts`)
Wraps all `localStorage` access with `isPlatformBrowser()` checks, making it safe for Angular SSR where `localStorage` does not exist.

### Auth Guard (`auth.guard.ts`)
Functional `CanActivateFn` guard. Checks for `auth_token` in localStorage. Redirects to `/login` if not found. Returns `true` on the server (SSR pass-through).

### Guest History Service (`guest-history.service.ts`)
Stores up to 50 guest operations in `localStorage` under the key `guest_history`. Each entry records the operation type, the full request payload, and a display object.

On login (email, password, or Google), `LoginComponent` reads all guest entries and replays them via `forkJoin` through `QuantityService`, then clears the guest history and navigates to the dashboard.

### Quantity Service (`quantity.service.ts`)
Thin HTTP service wrapping all `/api/quantity/` endpoints:

```typescript
convert(data)    → POST /api/quantity/convert
add(data)        → POST /api/quantity/add
subtract(data)   → POST /api/quantity/subtract
multiply(data)   → POST /api/quantity/multiply
divide(data)     → POST /api/quantity/divide
compare(data)    → POST /api/quantity/compare
getHistory()     → GET  /api/quantity/history
```

---

## 📏 Supported Operations & Units

### Operations
| Operation | Description |
|-----------|-------------|
| Convert | Convert a value from one unit to another |
| Compare | Check equality between two quantities (cross-unit) |
| Add | Sum two quantities, result in first unit |
| Subtract | Difference of two quantities |
| Multiply | Product of two quantities |
| Divide | Quotient of two quantities |

### Units by Measurement Type

**LENGTH** — `METER`, `CENTIMETER`, `INCH`, `FOOT`, `YARD`

**WEIGHT** — `KILOGRAM`, `GRAM`, `POUND`

**VOLUME** — `LITER`, `MILLILITER`, `GALLON`

**TEMPERATURE** *(convert & compare only)* — `CELSIUS`, `FAHRENHEIT`, `KELVIN`

---

## 👤 Guest Mode & History Replay

Users who are not logged in can still use the full calculator. Their operations are saved locally:

```
localStorage key: "guest_history"
Max entries: 50 (oldest are dropped)
```

When a guest logs in or signs up via Google, the app:
1. Reads all saved guest entries
2. Fires all operations in parallel via `forkJoin`
3. Failed replays are silently skipped (never block login)
4. Clears guest history from localStorage
5. Navigates to the dashboard

This ensures that work done before creating an account is not lost.

---

## ⚙️ Environment Configuration

### `src/environments/environment.ts` (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### `src/environments/environment.prod.ts` (Production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://quantitymeasurementapp-production-b8c4.up.railway.app'
};
```

> To point to a different backend, update `apiUrl` in the appropriate environment file.

---

## 🚀 Local Setup

### Prerequisites
- Node.js 20+
- npm 11+
- Angular CLI 21+ (`npm install -g @angular/cli`)
- The [backend](../backend) running on `http://localhost:8080`

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm start
# or
ng serve
```

Open `http://localhost:4200` in your browser.

### 3. Run tests
```bash
npm test
```

### 4. Watch mode build
```bash
npm run watch
```

---

## 📦 Build & Deployment

### Production build
```bash
npm run build
# Output: dist/temp-app/
```

This produces both:
- `dist/temp-app/browser/` — static client bundle
- `dist/temp-app/server/` — Express SSR server

### Run SSR server locally
```bash
npm run serve:ssr:temp-app
# Runs: node dist/temp-app/server/server.mjs
```

### Deploy to Vercel (Static)
- Build command: `ng build`
- Output directory: `dist/temp-app/browser`

### Deploy to Railway / Render (SSR)
- Build command: `npm run build`
- Start command: `node dist/temp-app/server/server.mjs`
- Set `PORT` environment variable if required

---

## 🔗 Backend Integration

This frontend requires the [Quantity Measurement Spring Boot backend](../backend).

| Requirement | Value |
|-------------|-------|
| Backend base URL (dev) | `http://localhost:8080` |
| Backend base URL (prod) | Configured in `environment.prod.ts` |
| Auth endpoints | `POST /api/auth/login`, `/api/auth/signup`, `/api/auth/google` |
| Quantity endpoints | `POST /api/quantity/{convert,add,subtract,multiply,divide,compare}` |
| History endpoint | `GET /api/quantity/history` *(JWT required)* |
| Google Client ID | `1006158982714-55dkjfupq1oqkeg8ukpcar1j9929q1rs.apps.googleusercontent.com` |

> The Google Client ID is hardcoded in `login.component.ts` and `signup.component.ts`. Update it if you change your Google OAuth2 credentials.