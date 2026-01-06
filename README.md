# Nexora — AI-Powered E-commerce (Full-Stack)

> A modern, responsive e-commerce web app built with React (Vite) + Tailwind on the frontend and Node/Express + Prisma/Postgres on the backend. Includes AI features, PDF invoice generation, file uploads (Cloudinary), and robust auth workflows.

---

## 🚀 Quick Overview

- Name: **Nexora**
- Architecture: **React (Vite) front-end** + **Node/Express back-end** with **Prisma** (Postgres DB)
- Styling: **Tailwind CSS**
- Key features: product catalog, filters, cart, checkout, orders, user auth, reviews, wishlist, admin dashboard, AI chat & recommendations, invoice generation

---

## 🧭 Repo Structure (high level)

- client/ — React frontend (Vite)
  - src/ — app source (components, pages, redux slices)
  - public/
  - package.json
- server/ — Express backend
  - controllers/, services/, routes/, middleware/, prisma/ (schema + seeds)
  - server.js
  - package.json

---

## 🔧 Tech Stack

- Frontend: React + Vite, React Router, Redux Toolkit, Tailwind CSS
- Backend: Node.js + Express, Prisma ORM, PostgreSQL
- Other: Cloudinary (image uploads), Brevo (email), Google Generative AI (Gemini) integrations, PDFKit, Winston logging

---

## 🧩 Features

- Fully-featured product listing with categories, sorting, and filters
- Cart and checkout flow with order summary and invoice generation
- User accounts, authentication, password reset, email notifications
- Wishlist and recently viewed items
- Reviews with rating, helpful / not helpful tracking
- Admin dashboard (CRUD for products, categories, orders)
- AI-powered components (chat/recommendations)
- Responsive UI with mobile-first styles (Tailwind)

---

## ⚙️ Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL (or a hosted DB like Supabase / ElephantSQL)
- Cloudinary account (optional — for file uploads)
- Brevo (formerly Sendinblue) API key (optional — for emails)
- Google Gemini key (optional — for AI features)

---

## 🛠️ Local Setup (Development)

### 1) Clone repository

```bash
git clone <repo-url> && cd Google_E-commerce
```

### 2) Backend setup

- Move into server

```bash
cd server
npm install
```

- Create a `.env` file (see example below) or copy `.env.example` and set values.

- Initialize / Migrate DB (Prisma)

```bash
# generate client
npm run prisma:generate
# push schema to DB (safe for development)
npm run prisma:push
```

- Seed (optional)

```bash
node prisma/seed.js
node prisma/seedAdmin.js
node prisma/seedProducts.js
```

- Run server

```bash
npm run dev
# server listens at http://localhost:4000 by default
```

### 3) Frontend setup

- Move into client

```bash
cd ../client
npm install
```

- Copy `.env.example` → `.env` and set `VITE_BACKEND_URL` (e.g. `http://localhost:4000`)

- Run dev server

```bash
npm run dev
# open http://localhost:5173
```

---

## 🧾 Example environment variables

server/.env (example)

```text
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=...
BREVO_SENDER_NAME=...
GEMINI_API_KEY=... # for AI features
```

client/.env (example)

```text
VITE_BACKEND_URL=http://localhost:4000
```

> Store secrets safely (do not commit .env with real credentials).

---

## ✅ Scripts

- Client
  - `npm run dev` — start Vite dev server
  - `npm run build` — produce production build
  - `npm run preview` — preview production build
  - `npm run lint` — run ESLint

- Server
  - `npm run dev` — start server with nodemon
  - `npm start` — start server (production)
  - `npm run prisma:generate` / `npm run prisma:push`

---

## 📦 Deployment tips

- Build client (`npm run build`), then host on Netlify/Vercel or serve the static `dist` from a static server or combined with Express static middleware.
- For production backend, set `NODE_ENV=production` and provide secure `DATABASE_URL`, `JWT_SECRET`, and other service keys.
- Attach proper CORS origin values (see `server/server.js`).

---

## 🧪 Testing & QA

- Manual testing: Use browser devtools to test common breakpoints (320/375/412/768px) and ensure no horizontal overflow.
- Linting: `npm run lint` (client) — fix issues flagged by ESLint.

---

## 🧰 Troubleshooting (common fixes)

- "Blank page or CORS errors": ensure `VITE_BACKEND_URL` matches the server origin and server allows that origin.
- "Database connection issues": confirm `DATABASE_URL` and run `npx prisma db pull` / `prisma:push`.
- "Images not uploading": verify Cloudinary keys and allowed file sizes in `server/config/cloudinary.js`.
- "Mobile layout issues": open DevTools (Device Toolbar) and inspect which component has long fixed widths or missing responsive classes; the project uses Tailwind utility classes for responsive behavior.

---

## ♿ Accessibility & Responsiveness

- Uses Tailwind's responsive utilities (`sm:`, `md:`, `lg:`) and avoids fixed horizontal widths where possible.
- If you find a layout issue on a particular page, please open an issue or attach a screenshot and viewport size.

---

## 📈 Roadmap & Improvements

- Add automated UI tests (Cypress / Playwright)
- Improve accessibility audits (axe)
- Add image optimization & caching for production
- Add CI workflows for tests, linting, and deployment

---

## 🤝 Contributing

Contributions welcome! Please open issues for bugs or feature requests and send PRs against `main` with clear descriptions and tests if applicable.

---

## 📞 Contact

If you need help running or customizing the project, open an issue or reach out to the repo owner.

---

## 📜 License

This project is provided as-is. Add a license file (e.g., MIT) if you intend to publish.

---

Happy hacking! 🛍️
