# 🛡️ POLICYCRAFT — Insurance Simplified

**POLICYCRAFT** is a modern, premium full-stack Insurance Management System designed for single-user administration. It features a responsive dashboard, robust client-vehicle-policy CRUD management, real-time analytics, and automated daily insurance renewal checkers.

The application is built using a unified monorepo architecture, optimized for local execution and seamless serverless deployment on **Vercel** or traditional VPS hosting (like **Render**).

---

## 🚀 Key Features

* **📊 Premium Analytics Dashboard:** Interactive data visualizations (monthly metrics, carrier distribution, agent reports) using Chart.js.
* **👥 Client & Vehicle Directory:** Full CRUD operations for managing clients and linking vehicles directly to their profiles.
* **📑 Policy Management:** Comprehensive insurance policy creation, editing, and archiving with link associations.
* **⏰ Renewal Checker & Alerts:** Real-time visual tracking of expiring policies and automated daily renewal evaluations (powered by native Vercel Cron).
* **📱 Progressive Web App (PWA):** Offline asset caching, desktop/mobile app installation, and instant updates using Workbox.
* **🔑 Secure Authentication:** Secure JWT-based administrative portal with robust password hashing and encryption.

---

## 🛠️ Technology Stack

* **Frontend:** React.js, Vite, React Router, Chart.js, Axios, React Hot Toast, Tailwind/Custom CSS.
* **Backend:** Node.js, Express.js, Mongoose.
* **Database:** MongoDB Atlas (Cloud database).
* **Deployment:** Vercel (Unified frontend + serverless backend) / Render.

---

## 📂 Project Structure

```text
├── api/                  # Vercel Serverless Function entrypoint
│   └── index.js
├── client/               # React Frontend (Vite + React Router)
│   ├── src/
│   │   ├── components/   # Shared layout & protected route components
│   │   ├── context/      # Authentication & App Global State
│   │   ├── pages/        # Dashboard, Clients, Vehicles, Policies, Settings
│   │   └── services/     # Axios API configuration & endpoints
│   ├── vite.config.js    # Optimized build splitting & PWA settings
│   └── package.json
├── server/               # Node.js Express Backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers (Auth, Dashboard, CRUDs)
│   ├── middleware/       # JWT auth & error handling middlewares
│   ├── models/           # Mongoose schemas (User, Client, Vehicle, Policy)
│   ├── routes/           # REST endpoints
│   ├── utils/            # Renewal email & notification schedulers
│   ├── seed.js           # Database initialization script
│   └── package.json
├── vercel.json           # Unified production deployment settings
└── render.yaml           # VPS Blueprint settings
```

---

## 💻 Local Development Setup

To run both the frontend and backend locally on your machine, follow these steps:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Database Configuration
Create a `.env` file inside the `server/` directory and configure your MongoDB database and security keys:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Initialize & Seed the Database
Seed the initial administrative account into your database:
```bash
cd server
npm install
node seed.js
```
*(This sets up your default Admin user).*

### 4. Run the Backend
```bash
npm run dev
```
The server will start listening on **`http://localhost:5000`**.

### 5. Run the Frontend
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
The React dev portal will launch on **`http://localhost:3000`**.

---

## 🔑 Default Administrator Credentials

Once seeded, you can sign in to the administrative portal using these details:

* **Username:** `Admin`
* **Password:** `Admin@123`

---

## ☁️ Vercel Deployment Instructions

The project is pre-configured for a zero-configuration, single-service deployment on **Vercel** utilizing Serverless Functions.

### 1. Environment Variables
Add these four environment variables to your **Vercel Project Dashboard** (Settings > Environment Variables):

| Key | Description / Value |
| :--- | :--- |
| `MONGODB_URI` | Your live MongoDB Atlas connection string |
| `JWT_SECRET` | A secure, random string for signing JWT tokens |
| `JWT_EXPIRE` | Token expiry duration (e.g., `7d`) |
| `NODE_ENV` | Must be set to `production` at runtime |

### 2. Deploying
* Deploy via the Vercel CLI (`vercel`) or link your GitHub repository to Vercel for automatic deployment on every `git push`.
* Vercel will build the frontend assets, bundle the backend files, and establish serverless API routes on `/api/v1/*` automatically!

*(Note: Always perform a **Hard Reload / Clear Site Data** in your browser if you've transitioned from local testing to production to avoid cached PWA assets pointing to `localhost`!).*
