# 🌿 Green Petals — Botanical Nursery & Living Plants Boutique

[![Status](https://img.shields.io/badge/status-production--ready-success.svg)](https://github.com/NoorAbdullah02/Full-stack-E-Commerce-Project)
[![Database](https://img.shields.io/badge/database-Neon%20Serverless%20Postgres-00e699.svg)](https://neon.tech)
[![AI Engine](https://img.shields.io/badge/AI-Groq%20%7C%20GPT--OSS--20B-f55036.svg)](https://groq.com)
[![Media Storage](https://img.shields.io/badge/media-Cloudinary%20CDN-3448c5.svg)](https://cloudinary.com)
[![Email Service](https://img.shields.io/badge/email-Brevo%20Transactional-0b996f.svg)](https://brevo.com)
[![Payment](https://img.shields.io/badge/payment-bKash%20%26%20COD-e2136e.svg)](https://bkash.com)

**Green Petals** (গ্রিন পেটালস) is an enterprise-grade, mobile-first full-stack e-commerce platform crafted exclusively for living botanical houseplants, exotic flowers, succulents, handcrafted planters, and organic plant care. Directed and founded by **Munnar Khanam** and based in **Barishal, Bangladesh**, the platform delivers healthy live plants nationwide across all 64 districts with moisture-lock protective packaging.

---

## 🌸 Store & Proprietor Information

- **Nursery Name:** Green Petals (গ্রিন পেটালস)
- **Founder & Proprietor:** Munnar Khanam (মুন্নার খানম)
- **Direct Hotline & WhatsApp:** `01768686120`
- **Official Store Email:** `munner.ent@gmail.com`
- **Facebook Profile:** [https://www.facebook.com/munnar.khanam](https://www.facebook.com/munnar.khanam)
- **Official bKash Payment (Send Money):** `01715020391`
- **Home Hub & Nursery Location:** Barishal, Bangladesh
- **Delivery Rates:**
  - **Inside Barishal Metro:** ৳100 (24–48 Hours Express Transit)
  - **Outside Barishal (All 64 Districts):** ৳150 (2–4 Days Moist-Locked Protective Packaging)

---

## ✨ Key Platform Highlights

### 📱 100% Mobile-First Touch Experience
- **Fluid Mobile Drawer:** Dedicated zero-clipping slide-over menu with touch navigation, quick search, hotline, and Facebook shortcuts.
- **Responsive 2-Column Grid:** High-density, touch-optimized product cards on mobile that expand to 3–4 columns on tablets and wide screens.
- **Real-Time Shuffle (🔀):** Real-time randomized plant discovery so visitors always see fresh botanical varieties.
- **Interactive Quick-Pill Category Scroller:** Horizontal swiping across Indoor Plants, Flowering Blooms, Air Purifiers, Succulents, Ceramic Pots, and Organic Care.
- **Button Loading & Visual Feedback:** Instant spinner and floating toast popups on Add to Cart, Wishlist, and Checkout.

### 💳 Seamless bKash Mobile Payment & Cash on Delivery
- **One-Tap Number Copy:** Copies `01715020391` to clipboard with animated confirmation and toast.
- **Step-by-step Visual Tutorial:** Easy Bangla + English 5-step instructions for dialling `*247#` or using the bKash App.
- **Transaction ID (TrxID) Verification:** Strict validation before order finalization.
- **Celebration Checkout:** High-velocity multi-color confetti cannon (`canvas-confetti`) and emerald glass receipt modal (`SweetAlert2`).
- **Immediate Invoice Access:** Direct redirection to `/order/:id` with real-time status tracking bar.

### 🤖 Live Database-Connected Botanical AI Assistant (Groq)
- **Real-Time Inventory Awareness:** Connected directly to Neon PostgreSQL. The AI knows all 22+ live plants, prices, stock levels, categories, and care tips.
- **Multi-Lingual:** Fluent in English, Bengali (বাংলা), and Banglish.
- **Store Guidance:** Answers inquiries about plant care, sunlight, watering schedules, delivery rates, bKash numbers, and proprietor Munnar Khanam's contact info.
- **Admin Copywriting:** Generates SEO-optimized poetic product descriptions with 1 click.

### 📄 Pristine PDF Invoices & Automated Emails
- **Zero Character Corruption:** Custom PDFKit rendering using universal Bangladeshi financial formatting (`Tk. 1,450.00`) and clean WinAnsi typography without corrupted characters (`Ÿ3cSã`).
- **Automated Brevo Dispatch:** Clean HTML confirmation email with attached PDF invoice sent to the customer's inbox (`user.email`) and instant new order alert dispatched to the store owner (`munner.ent@gmail.com`).
- **1-Click Download:** Customer can download their PDF invoice anytime from `/order/:id`.

### 🛡️ Unified Single `.env` Architecture
- **Single Root Configuration:** Zero duplicate `.env` files. Both the Node backend and Vite frontend read seamlessly from the root `/.env`, simplifying cloud deployment on **Render**, **Railway**, or **VPS**.

---

## 🔐 Administrative Access

Admin panels and inventory management can be accessed at `/login` or `/admin`:

| User Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Store Owner** | `munner.ent@gmail.com` | `munnar12345` | Full Catalog, Orders, User Analytics, Image Studio |
| **Super Admin** | `noor@admin.com` | `noorabdullah` | Technical System Administration & DB Controls |

---

## 🛠️ Complete Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Redux Toolkit, Tailwind CSS, SweetAlert2, Canvas-Confetti, Lucide Icons |
| **Backend** | Node.js, Express, Prisma ORM, JWT, Bcrypt, Winston Logger |
| **Cloud Database** | **Neon** Serverless Cloud PostgreSQL (`ap-southeast-1.aws`) |
| **AI Engine** | **Groq API** (`openai/gpt-oss-20b`) |
| **Media & Images** | **Cloudinary CDN** (Folder: `green_petals/products`) |
| **Transactional Email**| **Brevo API** (Verified Sender: `sheikhnoorabdullah04@gmail.com`) |
| **PDF Generation** | **PDFKit** (Official Botanical Invoices in `Tk.`) |

---

## 📁 Repository Structure

```
Full-stack-E-Commerce-Project/
├── .env                          # Single Unified Environment Config (Render Ready)
├── .env.example                  # Environment Template
├── client/                       # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/           # Navbar, Footer, ChatBot, SearchBar, Toast
│   │   ├── pages/                # Home, Products, ProductDetails, Checkout, OrderTracking, Admin
│   │   ├── redux/slices/         # authSlice, cartSlice, orderSlice, productSlice, toastSlice
│   │   ├── utils/                # alerts.js (SweetAlert2 & Confetti), currency.js (Tk.)
│   │   ├── App.jsx               # Route definitions
│   │   └── main.jsx              # React Entrypoint
│   └── vite.config.js            # Configured to load root .env
├── server/                       # Express + Prisma Backend
│   ├── config/                   # cloudinary.js, etc.
│   ├── controllers/              # orderController, productController, aiController, authController
│   ├── prisma/                   # schema.prisma, seedAdmin.js, seedPlants.js
│   ├── routes/                   # API routes (/api/orders, /api/products, /api/ai, /api/auth)
│   ├── services/                 # aiService.js (Groq + Neon), emailService.js (Brevo), pdfService.js
│   └── server.js                 # Serves API + production client/dist bundle
└── README.md
```

---

## 🚀 Local Quickstart Guide

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **Package Manager:** npm v9+

### 2. Clone & Install
```bash
git clone https://github.com/NoorAbdullah02/Full-stack-E-Commerce-Project.git
cd Full-stack-E-Commerce-Project

# Install backend dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

### 3. Setup Single Root Environment
The project uses a single `.env` at the root directory:
```bash
cp .env.example .env
```
Ensure your database, Groq, Cloudinary, and Brevo credentials are in `.env`.

### 4. Database Setup & Seeding
Push the Prisma schema to Neon PostgreSQL and seed initial admins and botanical plants:
```bash
cd server
npx prisma db push
node prisma/seedAdmin.js
node prisma/seedPlants.js
cd ..
```

### 5. Run Development Servers
```bash
# Terminal 1: Start Backend (Port 4000)
cd server && npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd client && npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## ☁️ Deployment Guide (Render)

This repository is pre-configured for a **unified single-service deployment** on Render:

1. **Create Web Service** on Render connected to this repository.
2. **Build Command:**
   ```bash
   cd client && npm install && npm run build && cd ../server && npm install && npx prisma db push
   ```
3. **Start Command:**
   ```bash
   node server/server.js
   ```
4. **Environment Variables:**
   Copy the contents of the root [`.env`](.env) into Render's Environment Variables panel.
   In production, `server/server.js` automatically serves the compiled `client/dist` static assets and handles all API routes under `/api/*`.

---

## 🌿 Botanical Catalog Categories

1. **Indoor Plants:** Monstera Deliciosa, Snake Plant, Peace Lily, Fiddle Leaf Fig, ZZ Plant, Golden Pothos
2. **Flowering Plants:** Arabian Jasmine (Beli), Royal Adenium Desert Rose, Gardenia, Bougainvillea, Phalaenopsis Orchid
3. **Air Purifying Plants:** Areca Palm, Boston Fern, Spider Plant, Aglaonema Silver Bay
4. **Succulents & Cacti:** Aloe Vera Barbadensis, Echeveria Elegans, Haworthia Zebra, Jade Plant
5. **Pots & Planters:** Handcrafted Terracotta Pots, Modern Ceramic Glazed Planters
6. **Organic Plant Care:** Premium Vermicompost Bio-Fertilizer, Pure Cold-Pressed Neem Oil Spray

---

## 📞 Support & Inquiries

For botanical inquiries, bulk orders, or technical support:
- **Proprietor:** Munnar Khanam
- **Hotline:** `01768686120`
- **Email:** `munner.ent@gmail.com`
- **Facebook:** [https://www.facebook.com/munnar.khanam](https://www.facebook.com/munnar.khanam)

---

&copy; 2026 **Green Petals**. All rights reserved. Cultivating nature's peace across Bangladesh. 🌱
