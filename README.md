# Wellness Package Management System

A full-stack wellness package management system built with NestJS, Next.js, and Flutter.

## Project Structure

```
/
├── backend/              # NestJS REST API (TypeScript + MySQL)
├── admin-portal/         # Next.js admin dashboard (TypeScript + Tailwind)
├── mobile/           # Flutter mobile app
├── docs/
│   └── DESIGN.md         # Architecture and design document (Part A)
├── docker-compose.yml    # One-command spin-up for backend + admin + DB
└── README.md
```

### Backend (`/backend`)
```
src/
├── app.module.ts               # Root module — ConfigModule + TypeORM
├── main.ts                     # Entry point — ValidationPipe, CORS
└── packages/
    ├── package.entity.ts       # WellnessPackage entity + enums
    ├── packages.module.ts      # Feature module
    ├── packages.service.ts     # Business logic + DB access
    ├── packages.controller.ts  # Admin + Mobile controllers
    ├── packages.service.spec.ts # Unit tests
    └── dto/
        ├── create-package.dto.ts
        └── update-package.dto.ts
```

### Admin Portal (`/admin-portal`)
```
src/
├── app/
│   ├── page.tsx                     # Packages list
│   ├── packages/new/page.tsx        # Create package
│   └── packages/[id]/edit/page.tsx  # Edit package
├── components/
│   └── PackageForm.tsx              # Shared create/edit form
├── services/
│   └── packages.ts                  # Typed API client
└── types/
    └── package.ts                   # Shared types + enums
```

### Mobile App (`/mobile`)
```
lib/
├── main.dart                    # Entry point + CartProvider setup
├── models/
│   ├── wellness_package.dart    # Package model
│   └── cart_item.dart           # Cart item model
├── providers/
│   └── cart_provider.dart       # Cart state management
├── screens/
│   ├── packages_screen.dart     # Browse packages + buy controls
│   └── cart_screen.dart         # Cart view with totals
└── services/
    └── package_service.dart     # API call to /mobile/packages
```

---

## Running with Docker (Recommended)

Spins up MySQL, the backend API, and the admin portal in one command.

**Prerequisites:** [Docker](https://www.docker.com/get-started) and Docker Compose installed.

```bash
# From the project root
docker-compose up --build
```

| Service      | URL                    |
|--------------|------------------------|
| Backend API  | http://localhost:3000  |
| Admin Portal | http://localhost:3001  |
| MySQL        | localhost:3306         |

To stop:
```bash
docker-compose down
```

To stop and remove the database volume:
```bash
docker-compose down -v
```

> The Flutter mobile app must be run manually — see below.

---

## Running Manually

### Prerequisites

- Node.js 20+
- npm 10+
- Docker (for MySQL) or a local MySQL 8.0 instance
- Flutter SDK ([install guide](https://flutter.dev/docs/get-started/install))
- NestJS CLI: `npm install -g @nestjs/cli`

---

### 1. Start MySQL

If you have Docker:
```bash
cd backend
docker-compose up -d
```

Or connect to your own MySQL 8.0 instance and create a database:
```sql
CREATE DATABASE wellness_db;
```

---

### 2. Backend

```bash
cd backend
npm install
```

Create `.env` in `/backend`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=wellness_db
PORT=3000
```

Start in development mode (hot reload):
```bash
npm run start:dev
```

The API will be available at **http://localhost:3000**.

#### Run tests
```bash
npm run test          # Run all unit tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage report
```

---

### 3. Admin Portal

```bash
cd admin-portal
npm install
```

Create `.env.local` in `/admin-portal`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the dev server:
```bash
npm run dev
```

The admin portal will be available at **http://localhost:3001**.

---

### 4. Mobile App

```bash
cd mobile_app
flutter pub get
flutter run
```

Select your target device when prompted (Android emulator, iOS simulator, or physical device).

> **Android emulator:** The app connects to `http://10.0.2.2:3000` which maps to your machine's localhost.
> **iOS simulator or physical device:** Update `baseUrl` in `lib/services/package_service.dart` to your machine's local IP (e.g. `http://192.168.x.x:3000`).

---

## API Overview

### Admin — Full CRUD

| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| GET    | `/admin/packages`         | List all packages   |
| GET    | `/admin/packages/:id`     | Get one package     |
| POST   | `/admin/packages`         | Create package      |
| PATCH  | `/admin/packages/:id`     | Update package      |
| DELETE | `/admin/packages/:id`     | Delete package      |

### Mobile — Read Only

| Method | Endpoint                  | Description                  |
|--------|---------------------------|------------------------------|
| GET    | `/mobile/packages`        | List active packages only    |
| GET    | `/mobile/packages/:id`    | Get one package              |

### Sample Request

```bash
curl -X POST http://localhost:3000/admin/packages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deep Tissue Massage",
    "description": "A relaxing full-body massage targeting deep muscle layers",
    "price": 120,
    "duration_minutes": 60,
    "category": "SERVICES",
    "status": "active"
  }'
```

---

## Environment Variables

### Backend (`.env`)

| Variable      | Description               | Default       |
|---------------|---------------------------|---------------|
| `DB_HOST`     | MySQL host                | `localhost`   |
| `DB_PORT`     | MySQL port                | `3306`        |
| `DB_USERNAME` | MySQL username            | `root`        |
| `DB_PASSWORD` | MySQL password            | `root`        |
| `DB_NAME`     | MySQL database name       | `wellness_db` |
| `PORT`        | API server port           | `3000`        |

### Admin Portal (`.env.local`)

| Variable                | Description         | Default                  |
|-------------------------|---------------------|--------------------------|
| `NEXT_PUBLIC_API_URL`   | Backend API URL     | `http://localhost:3000`  |
