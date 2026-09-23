# Mini Design Canvas

A canvas editor built for the Glazia Full Stack Developer Intern assignment — create rectangles, circles, and text; select, drag, resize, and rotate them; edit their properties; and save/load canvases per user, backed by MongoDB.

**Live demo:** [add your deployed URL here]

## Tech stack

**Frontend:** Next.js 14 (App Router) · React · TypeScript · React Konva / Konva · Zustand · Tailwind CSS · Framer Motion · Axios · lucide-react

**Backend:** Node.js · Express · TypeScript · MongoDB (Mongoose) · JWT (jsonwebtoken) · bcryptjs · Zod · CORS · dotenv

**Database:** MongoDB Atlas

## Project structure

```
canvas/
├── backend/     Express + TypeScript + MongoDB REST API
└── frontend/    Next.js + React + TypeScript + Konva editor
```

## Setup instructions

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
MONGODB_URI=<your MongoDB Atlas connection string>
PORT=5000
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

```bash
npm run dev
```

Runs on `http://localhost:5000`. Health check: `GET /api/health`.

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Runs on `http://localhost:3000`. Run the backend first — the frontend depends on it for everything past the login screen.

## Dependencies

Both `backend/` and `frontend/` have their own `package.json` with exact versions, restored automatically by `npm install`. Full list of what each side uses:

**Backend (`backend/package.json`)**

| Package | Purpose |
|---|---|
| express | REST API framework |
| mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT signing/verification |
| cors | Cross-origin request handling |
| dotenv | Environment variable loading |
| morgan | Request logging |
| zod | Request body validation |
| typescript, ts-node, nodemon | Dev tooling — TypeScript compilation and auto-restart |
| @types/* | Type definitions for the above |

**Frontend (`frontend/package.json`)**

| Package | Purpose |
|---|---|
| next, react, react-dom | Core framework |
| konva, react-konva | Canvas rendering (Stage, Layer, Transformer, shapes) |
| zustand | Client-side state (canvas elements, selection, undo/redo history, auth) |
| axios | HTTP client for the backend API |
| uuid | Client-generated ids for new canvas elements |
| framer-motion | Animations (auth screens, dashboard transitions, UI micro-interactions) |
| lucide-react | Icon set used throughout the toolbar and panels |
| tailwindcss, postcss, autoprefixer | Styling |
| typescript | Type checking |
| eslint, eslint-config-next | Linting |

## Architecture decisions

- **Auth:** JWT-based, stateless. Passwords are hashed with bcrypt before storage. Every canvas document carries a `userId`, and all canvas routes are protected by an `authMiddleware` that verifies the token and attaches `req.userId` — controllers always scope queries by this value, never by a userId supplied in the request body, so one user can never read or modify another's canvases even if they guessed an id.

- **Single-document canvas model:** a canvas and all of its elements live in one MongoDB document rather than a separate `elements` collection. Canvases are always read and written as a whole (open one, edit several elements, save), so this avoids unnecessary joins/queries for data that's naturally atomic per-canvas.

- **Client state:** canvas elements live in a Zustand store (`canvasStore`), not local component state. The Toolbar, the Konva stage, the Properties Panel, and the Layers panel all need to read and write the same element list and the same "currently selected element" without prop-drilling through several component layers.

- **State flows one way:** Konva shapes are rendered *from* the Zustand store, not the other way around. After a drag or a transform (resize/rotate), the shape's new `x/y/width/height/radius/rotation` is read back out of the Konva node and written into the store — Konva's internal node state is treated as transient, and the store is the single source of truth. This is also why every resize resets the Konva node's internal `scale` back to 1 after folding it into the stored width/height/radius/fontSize — otherwise repeated resizes would compound scale on top of scale.

- **Undo/Redo:** implemented as two stacks (`past` and `future`) of full element-array snapshots in the Zustand store, capped at 50 entries. Every mutating action (add, update, delete, reorder) pushes the pre-change state onto `past` and clears `future`. This is simple and robust for a canvas of this scale; a production app with much larger documents might instead store diffs rather than full snapshots.

- **Autosave:** a canvas is created in the database the instant a user clicks "New canvas" (rather than waiting for an explicit first save), so a debounced autosave effect — watching `elements` and `canvasName`, firing 2 seconds after the last change — has a valid canvas id to update from the very first edit.

- **Validation:** all request bodies are validated with Zod schemas before reaching controllers, so controllers can trust the shape of `req.body`.

- **Inline text editing:** double-clicking a text element overlays a real HTML `<textarea>` positioned exactly over the Konva text node (matching its font size, rotation, and position), rather than using a separate modal or side-panel input, so editing feels native to the canvas.

- **Auth token storage:** the JWT is stored in `localStorage` rather than an httpOnly cookie. This was a deliberate tradeoff for this deployment — frontend (Vercel) and backend (Render/Railway) live on different domains, and cookie-based auth across different domains requires `SameSite=None; Secure` plus `credentials: true` on every request, which several browsers restrict by default for third-party cookies. A `Bearer` token in an `Authorization` header sidesteps that entirely at the cost of slightly weaker XSS protection — see Known limitations below.

## API Endpoints

| Method | Route                | Auth required | Description                                  |
|--------|-----------------------|:---:|-----------------------------------------------|
| POST   | `/api/auth/register`  | No  | Create an account, returns `{ token, user }`  |
| POST   | `/api/auth/login`     | No  | Log in, returns `{ token, user }`             |
| POST   | `/api/canvases`       | Yes | Create a canvas                                |
| GET    | `/api/canvases`       | Yes | List the current user's canvases (metadata only) |
| GET    | `/api/canvases/:id`   | Yes | Get one full canvas (including its elements)  |
| PUT    | `/api/canvases/:id`   | Yes | Update a canvas's name and/or elements        |
| DELETE | `/api/canvases/:id`   | Yes | Delete a canvas                                |

Protected routes expect `Authorization: Bearer <token>`. All canvas queries are automatically scoped to the authenticated user's `userId`.

## Bonus features implemented

- [x] Layer management/reordering — move any element forward/backward via the Layers panel
- [x] Undo/Redo — Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y), plus toolbar buttons
- [x] Autosave — debounced 2s after any change, from the moment a canvas is created
- [x] Authentication with user-owned canvases — JWT-based, canvases scoped per user
- [x] PNG export — exports the current canvas as a downloadable PNG via Konva's `toDataURL`

Beyond the assignment's bonus list, the UI also includes a custom dark/glass design system (Framer Motion transitions, animated auth screens, a profile menu, Canva-style selection handles with a custom rotate cursor) and in-place text editing directly on the canvas.

## Known limitations

- JWTs are stored in `localStorage` on the client for simplicity and cross-domain deployment compatibility. This is vulnerable to XSS in a way an httpOnly cookie wouldn't be — a production version on a single shared domain should move to cookie-based auth.
- No real-time collaboration — canvases are single-user; two people editing the same canvas simultaneously would overwrite each other's autosaves (last write wins).
- No image elements — only Rectangle, Circle, and Text are supported, per the assignment's core requirements.
- Undo/Redo history is per-session (held in memory, reset on reload) rather than persisted.
- The canvas Stage has a fixed size (900×600) rather than a resizable/infinite canvas.
