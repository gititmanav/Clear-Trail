# ClearTrail — Financial Operations Platform

> Every transaction leaves a trail you can follow with clarity.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS + Custom Utility CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (httpOnly cookies), bcrypt |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js v20+
- MongoDB Atlas account (free tier works)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/cleartrail.git
cd cleartrail

# 2. Install all dependencies
npm run install:all

# 3. Set up server environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and a JWT secret

# 4. Start both client and server
npm run dev
```

The client runs on `http://localhost:5173` and proxies API calls to the server on `http://localhost:3000`.

## Project Structure

```
cleartrail/
├── client/                  React + Vite + TypeScript frontend
│   └── src/
│       ├── api/             API client layer (axios)
│       ├── components/      Atomic Design components
│       │   ├── atoms/       Button, Input, Badge, etc.
│       │   ├── molecules/   SearchBar, StatCard, FormField, etc.
│       │   ├── organisms/   Sidebar, TopBar, TransactionTable, etc.
│       │   └── templates/   DashboardLayout, AuthLayout
│       ├── context/         React Context (Auth, Theme)
│       ├── hooks/           Custom hooks
│       ├── pages/           Route-level page components
│       ├── styles/          Global CSS + custom utilities
│       └── utils/           Helpers, constants, formatters
│
├── server/                  Express + TypeScript backend
│   └── src/
│       ├── config/          DB, env, CORS config
│       ├── controllers/     Route handlers
│       ├── middleware/       Auth, validation, error handling
│       ├── models/          Mongoose schemas
│       ├── routes/          Express route definitions
│       ├── services/        Business logic layer
│       ├── validators/      Zod schemas
│       └── utils/           Error classes, helpers
│
└── shared/                  Shared constants and types
```

## Author

**Manav Kaneria** — [GitHub](https://github.com/gititmanav)

## License

[MIT](LICENSE)
