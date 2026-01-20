# 🛍️ Nexora — AI-Powered E-commerce Platform

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Backend](https://img.shields.io/badge/backend-Node.js%20%7C%20Express-blue.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Vite-blueviolet.svg)]()
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%7C%20Prisma-lightblue.svg)]()

**Nexora** is a cutting-edge, full-stack e-commerce solution designed with a focus on premium user experience, AI-driven automation, and robust administrative control. Built using the modern PERN stack (PostgreSQL, Express, React, Node), it features seamless integrations for AI assistance, secure payments, and dynamic content management.

---

## ✨ Key Features

### 👤 User Experience
- **Dynamic Catalog**: Intelligent product discovery with advanced filtering, sorting, and categories.
- **Smart Recommendations**: AI-powered product suggestions tailored to user interests.
- **Secure Auth**: Full authentication suite including JWT-based login, registration, and OTP-based password resets.
- **Wishlist & Cart**: Persistent shopping cart and wishlist functionality for a smooth shopping journey.
- **Order Tracking**: Real-time status updates for placed orders with PDF invoice generation.
- **Product Reviews**: Interactive review system with helpfulness tracking.

### 🤖 AI Integration (Gemini 2.0)
- **AI Chatbot**: Real-time support to help users find products and answers.
- **Auto-Content**: AI-generated SEO-friendly product descriptions for administrators.

### 🔐 Administrative Control
- **Powerful Dashboard**: Comprehensive CRUD operations for Products, Categories, and Orders.
- **Sales Analytics**: Visual representation of sales data and order trends using Recharts.
- **Image Management**: Seamless file uploads integrated with Cloudinary.

---

## 🛠️ Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Redux Toolkit, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, Prisma ORM, JWT, Winston Logging |
| **Database** | PostgreSQL |
| **Integrations** | Google Gemini AI, Cloudinary (Media), Brevo (Email), PDFKit (Invoices) |

---

## 🧭 Repository Structure

```cmd
.
├── client/                 # Frontend React application (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── store/          # Redux Toolkit state management
│   │   └── utils/          # Frontend utility functions
│   └── public/             # Static assets
├── server/                 # Backend Node/Express application
│   ├── controllers/        # Request handling logic
│   ├── services/           # Business logic (AI, Email, PDF)
│   ├── routes/             # API endpoint definitions
│   ├── prisma/             # Database schema and seed files
│   └── middleware/         # Auth and error-handling middleware
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher.
- **PostgreSQL**: A local instance or a cloud provider (e.g., Supabase).
- **External Accounts**: Cloudinary (Image storage), Brevo (Emailing), and Google AI Studio (Gemini API).

### 1. Clone & Install
```bash
git clone https://github.com/NoorAbdullah02/Full-stack-E-Commerce-Project.git
cd Full-stack-E-Commerce-Project
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in `server/` with the following:
```env
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

BREVO_API_KEY=...
BREVO_SENDER_EMAIL=...
BREVO_SENDER_NAME="Nexora Support"

GEMINI_API_KEY=...
```
Initialize the database:
```bash
npm run prisma:generate
npm run prisma:push
# Optional: Seed the database
node prisma/seed.js
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in `client/` with:
```env
VITE_BACKEND_URL=http://localhost:4000
```
Start the application:
```bash
npm run dev
```

---

## 🧪 Development Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts development server (Client or Server) |
| `npm run build` | Generates optimized production build (Client) |
| `npm start` | Starts production server (Server) |
| `npm run lint` | Runs ESLint for code quality checks |

---

## 🛡️ Security & Performance
- **Data Protection**: Input validation and secure headers (Helmet).
- **Logging**: Production-grade logging with Winston.
- **Responsiveness**: Mobile-first design using Tailwind CSS utility classes.
- **Auth**: Secure password hashing with Bcrypt and stateless JWT authentication.

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
Internal use only. Please contact the repository owner for licensing details.

---
*Made with ❤️ for high-performance e-commerce.*
