# Design Document — Wellness Package Management System

---

## 1. Problem Framing & Scope

### What We Built

A three-surface Wellness Package Management System:

- **Backend API** (NestJS + TypeScript + MySQL via TypeORM) — single API serving both admin and mobile clients via separate route namespaces
- **Admin Portal** (Next.js + TypeScript + Tailwind CSS) — internal dashboard for managing wellness packages with full CRUD
- **Mobile App** (Flutter + Dart) — end-user facing app to browse active packages, add them to a cart, and adjust quantities

### What Was Deliberately Left Out

| Feature | Reason |
|---|---|
| Authentication & Authorization | Deferred — assumed internal admin trust for prototype scope |
| User accounts on mobile | No booking or purchase flow required at this stage |
| Payment / Checkout flow | Cart is fully implemented; checkout is stubbed with a placeholder action |
| Search & filtering | List view is sufficient for the prototype; easy to add later |
| Pagination | Package count is low at this stage; would add cursor-based pagination at scale |

### Assumptions

- Admins are internal staff — authentication is deferred, not permanently skipped
- Scale is low (hundreds of packages, not millions) — a single DB node is sufficient
- Mobile users are browsing and buying packages; they do not manage packages
- Single currency, no localization required
- All three surfaces are run locally for this prototype
- The assessment mentions React Native / TypeScript in the overview, but the prototype requirement specifically asks for a Flutter screen. I followed the Part B prototype requirement and implemented the mobile app in Flutter.

---

## 2. Architecture

### High-Level Diagram

```
┌─────────────────────┐        ┌─────────────────────┐
│   Admin Portal      │        │    Mobile App        │
│   Next.js / TS      │        │    Flutter / Dart    │
│   localhost:3001    │        │    Android Emulator  │
└────────┬────────────┘        └──────────┬──────────┘
         │ REST (fetch)                    │ REST (http package)
         │ /admin/packages                 │ /mobile/packages
         ▼                                 ▼
┌─────────────────────────────────────────────────────┐
│               Backend API                           │
│               NestJS + TypeScript                   │
│               localhost:3000                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │            PackagesModule                   │   │
│  │  AdminPackagesController  — full CRUD       │   │
│  │  MobilePackagesController — read-only       │   │
│  │  PackagesService          — business logic  │   │
│  │  WellnessPackage          — TypeORM entity  │   │
│  └─────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │ TypeORM
                       ▼
          ┌────────────────────────┐
          │   MySQL 8.0 (Docker)   │
          │   wellness_packages    │
          └────────────────────────┘
```

### Docker Compose (One-Command Spin-Up)

For the full backend stack (DB + API + Admin Portal):

```
docker-compose up --build    ← runs from project root
```

Services start in dependency order: MySQL (with healthcheck) → Backend → Admin Portal. The Flutter mobile app is run separately via `flutter run` as it targets a device/emulator.

### Code Organisation

**Backend (`/backend/src`)**
```
app.module.ts               ← root module: ConfigModule + TypeORM wired here
main.ts                     ← bootstrap, global ValidationPipe (whitelist + transform), CORS
packages/
  package.entity.ts         ← WellnessPackage TypeORM entity + PackageStatus + PackageCategory enums
  packages.module.ts        ← registers entity, service, both controllers
  packages.service.ts       ← all DB logic (findAll, findAllActive, findOne, create, update, remove)
  packages.controller.ts    ← AdminPackagesController + MobilePackagesController
  packages.service.spec.ts  ← Jest unit tests (8 cases, repository fully mocked)
  dto/
    create-package.dto.ts   ← class-validator decorators, all fields required except status
    update-package.dto.ts   ← PartialType(CreatePackageDto) — all fields optional
```

**Admin Portal (`/admin-portal/src`)**
```
app/
  page.tsx                       ← packages list table with edit + delete actions
  packages/new/page.tsx          ← create form page
  packages/[id]/edit/page.tsx    ← edit form page (fetches existing package by ID)
components/
  PackageForm.tsx                ← shared controlled form for create and edit
services/
  packages.ts                    ← typed fetch wrapper: getAll, getOne, create, update, delete
types/
  package.ts                     ← WellnessPackage interface + enums mirrored from backend
```

**Mobile App (`/mobile_app/lib`)**
```
main.dart                        ← app entry point, ChangeNotifierProvider wrapping the app
models/
  wellness_package.dart          ← Dart model with fromJson factory
  cart_item.dart                 ← CartItem model: package + quantity + subtotal getter
providers/
  cart_provider.dart             ← ChangeNotifier: addToCart, increment, decrement, remove, totals
screens/
  packages_screen.dart           ← package list, per-card Buy/+/- controls, cart badge in AppBar
  cart_screen.dart               ← cart view: items, quantity controls, grand total, checkout stub
services/
  package_service.dart           ← single HTTP GET to /mobile/packages
```

### Shared Concerns

| Concern | How It Is Handled |
|---|---|
| Types | Defined once in backend entity; mirrored in `admin-portal/src/types/package.ts` and Dart models |
| Validation | Backend: `class-validator` on DTOs with `transform: true` for type coercion; Frontend: HTML5 `min`/`required` attributes |
| Error handling | Backend: `NotFoundException` for missing records, `400` for invalid input; Frontend/Mobile: try/catch with user-facing error states |
| Config | `.env` + `@nestjs/config` on backend; `.env.local` + `NEXT_PUBLIC_API_URL` on admin portal |
| CORS | `app.enableCors()` in `main.ts` allows the admin portal (different port) to call the API |
| HTTP (Android) | `android:usesCleartextTraffic="true"` in `AndroidManifest.xml` to allow plain HTTP in the emulator |

---

## 3. Data Model & API Contract

### Schema: `wellness_packages`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, auto-generated | UUID over integer for distribution-readiness |
| `name` | VARCHAR(100) | NOT NULL, min 2 chars | |
| `description` | TEXT | NOT NULL, min 10 chars | |
| `price` | DECIMAL(10,2) | NOT NULL, >= 0 | Decimal to avoid floating point rounding errors on currency |
| `duration_minutes` | INT | NOT NULL, >= 0 | 0 is valid — represents packages with no fixed duration |
| `category` | ENUM | NOT NULL | `PRODUCT`, `SERVICES`, `PACKAGE` |
| `status` | ENUM | DEFAULT `active` | `active`, `inactive` — soft disable without deletion |
| `created_at` | TIMESTAMP | Auto on insert | |
| `updated_at` | TIMESTAMP | Auto on update | Basic audit trail |

**Extensions beyond the base spec and their reasoning:**

- `category` — Added to support filtering and grouping by offering type. Justified by the realistic need to distinguish physical products, services, and bundled packages in a wellness business.
- `status` — Allows admins to deactivate packages without deleting them. The mobile API filters to `active` only, so inactive packages are never shown to end users.
- `updated_at` — Lightweight audit trail. Useful for admin review and future "last modified" displays.

### API Contract

#### Admin Routes — `/admin/packages`

| Method | Route | Description | Body | Success | Error |
|---|---|---|---|---|---|
| GET | `/admin/packages` | List all packages | — | `200 WellnessPackage[]` | — |
| GET | `/admin/packages/:id` | Get one package | — | `200 WellnessPackage` | `404` |
| POST | `/admin/packages` | Create package | `CreatePackageDto` | `201 WellnessPackage` | `400` |
| PATCH | `/admin/packages/:id` | Update package | `UpdatePackageDto` | `200 WellnessPackage` | `400`, `404` |
| DELETE | `/admin/packages/:id` | Delete package | — | `200` | `404` |

#### Mobile Routes — `/mobile/packages`

| Method | Route | Description | Success | Error |
|---|---|---|---|---|
| GET | `/mobile/packages` | List active packages only | `200 WellnessPackage[]` | — |

**Why they differ:** Mobile users should never see inactive packages. Keeping separate controllers makes this boundary explicit and allows independent middleware (e.g. auth guards) to be applied to admin routes only without touching the mobile path.

#### `CreatePackageDto` shape and validation rules

```typescript
{
  name: string;              // @IsString, @MinLength(2)
  description: string;       // @IsString, @MinLength(10)
  price: number;             // @IsNumber, @Min(0)
  duration_minutes: number;  // @IsInt, @Min(0)  ← 0 is valid
  category: PackageCategory; // @IsEnum(['PRODUCT','SERVICES','PACKAGE'])
  status?: PackageStatus;    // @IsOptional, @IsEnum — defaults to 'active'
}
```

`UpdatePackageDto` uses `PartialType(CreatePackageDto)` — all fields are optional, same validation rules apply to whatever is provided.

---

## 4. Key Technical Decisions & Trade-offs

### 1. Separate Admin and Mobile Controllers

**Decision:** Two controllers (`AdminPackagesController`, `MobilePackagesController`) sharing one `PackagesService`.

**Rejected:** A single controller with a query param or role guard to switch behaviour.

**Why:** The two surfaces have structurally different requirements — admin sees all packages including inactive, mobile sees only active ones. Separating at the controller level makes the intent explicit in code, keeps each controller simple and readable, and makes it straightforward to apply auth middleware to `/admin/*` routes later without touching `/mobile/*`.

---

### 2. TypeORM `synchronize: true` vs. Migrations

**Decision:** `synchronize: true` for the prototype.

**Rejected:** TypeORM migration files from the start.

**Why:** Migrations add ceremony that slows down schema iteration during early development. `synchronize: true` auto-applies entity changes on server start, which is appropriate here. This would be replaced with versioned migration files before any production deployment to prevent accidental data loss on schema changes.

---

### 3. `transform: true` on the Global `ValidationPipe`

**Decision:** `new ValidationPipe({ whitelist: true, transform: true })` in `main.ts`.

**Why this came up:** During development, setting `@Min(0)` on `duration_minutes` still resulted in `400` errors when sending `0`. The root cause was that without `transform: true`, `class-transformer` does not run — incoming JSON values are not coerced to the TypeScript types declared in the DTO before `class-validator` runs. A `"0"` string or uncoerced value would fail `@IsInt()`. Adding `transform: true` resolved this.

**Lesson:** Validator decorators alone are not enough — type coercion must be explicitly enabled in NestJS.

---

### 4. Flutter `provider` for Cart State

**Decision:** `ChangeNotifier` + `provider` package for cart state management.

**Rejected:** `setState` only; `Riverpod`; `Bloc`.

**Why:** The cart needs to be shared across two screens (packages list and cart screen). `setState` is scoped to a single widget tree and cannot cross screen boundaries without prop-drilling. `provider` is the lightest solution that solves this — one `ChangeNotifierProvider` at the app root, consumed anywhere with `context.watch` or `context.read`. `Riverpod` and `Bloc` are better at production scale but add unnecessary complexity for a prototype with two screens.

---

### 5. Plain `fetch` with Typed Service Layer (Admin Portal)

**Decision:** Native `fetch` wrapped in a typed `packagesService` object in `src/services/packages.ts`.

**Rejected:** TanStack React Query.

**Why:** The admin portal has simple, non-concurrent data needs — one list fetch, one form submission at a time. React Query's caching, background refetch, and stale-while-revalidate are real value-adds at scale but are overkill here. The custom service layer keeps API calls typed and centralised, making it easy to swap in React Query later without changing the call sites.

---

### 6. Docker Compose with Healthcheck

**Decision:** Used a `healthcheck` on the MySQL service so the backend only starts after the database is genuinely ready.

**Why this mattered:** During development, the backend would crash on startup because it tried to connect to MySQL before the container had finished initialising. Adding a `mysqladmin ping` healthcheck and `depends_on: condition: service_healthy` on the backend service resolved the race condition cleanly.

---

### What I Would Do Differently at Production Scale

- **Auth:** Add JWT-based authentication on the backend with a guard on all `/admin/*` routes. Mobile could use a public read-only API key.
- **Migrations:** Replace `synchronize: true` with TypeORM migration files run as part of CI/CD.
- **Error response standardisation:** Add a global NestJS exception filter to produce consistent error response shapes across all endpoints.
- **Pagination:** Add cursor or offset-based pagination to all list endpoints before going to production.
- **Secrets management:** Use a secrets manager (AWS Secrets Manager, Doppler, etc.) instead of `.env` files in production.
- **Test coverage:** Expand unit tests to include controller-level tests and add E2E tests on the API routes using `supertest`.
- **Mobile network config:** Use environment-based config in Flutter to switch between `10.0.2.2` (emulator), `localhost` (iOS simulator), and a real API hostname in production.

---

## 5. AI Workflow

### Tools Used

**Claude (Cowork)** was the sole AI tool used across this entire build — used as a live pair programmer, architecture reviewer, code generator, and debugger.

| Phase | How Claude Was Used |
|---|---|
| Step 1 — Scoping | Helped frame what to build vs. leave out and identify assumptions |
| Step 2 — Architecture | Designed the two-controller pattern and NestJS module structure |
| Step 3 — Backend setup | Generated `app.module.ts`, `main.ts`, `docker-compose.yml`, `.env` config |
| Step 4 — Entity + CRUD | Generated entity, DTOs, service, controllers, and module |
| Step 5 — Admin portal | Generated Next.js pages, `PackageForm` component, typed API service |
| Step 6 — Mobile app | Generated Flutter model, `CartProvider`, packages screen, cart screen |
| Step 7 — Docker | Generated multi-stage Dockerfiles and root `docker-compose.yml` |
| Step 8 — Tests | Generated all 8 Jest unit test cases with mocked TypeORM repository |
| Step 9 — Docs | Generated README and this design document |
| Debugging (throughout) | Diagnosed Docker volume issue, Android cleartext traffic error, `transform: true` fix |

---

### Prompts I'm Proud Of

**1. Architecture with explicit constraints**

> "I'm building a Wellness Package Management System with three surfaces: NestJS backend, Next.js admin portal, and Flutter mobile app. The mobile app is read-only. Design the backend module structure and explain how to separate admin and mobile API routes cleanly."

Giving Claude the full context upfront — the three surfaces, the read-only mobile constraint, and the specific concern — produced a clean two-controller/one-service pattern immediately rather than a generic CRUD scaffold.

**2. Targeted entity extension**

> "Add a category column to the WellnessPackage entity with a fixed enum of PRODUCT, SERVICES, PACKAGE. Update the DTO to require it on creation."

Tightly scoped — one concern, one file pair, explicit values. Claude updated both the entity and DTO in one pass without touching anything else, and exported the enum from the entity so it could be imported in the DTO.

**3. Stateful mobile UI described as a UX flow**

> "Add a shopping cart to the Flutter app using provider. Each package card should show a Buy Item button. After tapping, replace the button with plus/minus quantity controls. Add a cart icon in the app bar with a badge showing total item count."

Describing the intended UX flow rather than just the data structure led Claude to correctly infer the full state model: a `CartProvider` with `addToCart`, `increment`, and `decrement` methods, a widget-level toggle between button and controls, and a badge that reacts to `cart.totalCount`.

---

### Where AI Got It Wrong

**Issue 1 — Docker volume / empty password**

When setting up Docker, the MySQL container log showed `root@localhost is created with an empty password`, and the backend failed to connect. Claude's initial docker-compose generated the correct `MYSQL_ROOT_PASSWORD` environment variable, but the container had been previously initialised without it — the persisted volume was stale.

**How I caught it:** I read the container logs directly via `docker-compose logs db` and spotted the empty password warning. The fix was `docker-compose down -v` to wipe the volume and reinitialise MySQL with the correct credentials.

**Issue 2 — `ValidationPipe` missing `transform: true`**

After updating `@Min(1)` to `@Min(0)` on `duration_minutes`, POST requests with `duration_minutes: 0` still returned `400`. Claude's initial `main.ts` scaffold only had `whitelist: true` on the `ValidationPipe`.

**How I caught it:** I ran a direct `curl` to isolate whether the issue was in the frontend or the backend. The backend was still rejecting `0`. Claude had generated the correct DTO decorator but hadn't anticipated that `class-transformer` needs `transform: true` to coerce types before validation runs.

**How I corrected it:** Updated the `ValidationPipe` to `new ValidationPipe({ whitelist: true, transform: true })`. This tells NestJS to run `class-transformer` before `class-validator`, ensuring `"0"` or any uncoerced value is cast to `number` before the `@IsInt` and `@Min(0)` checks run.

**Lesson:** AI generates correct validation decorators but doesn't always account for the full NestJS pipeline configuration needed for them to work end-to-end. I had to understand *why* the `400` was happening rather than just re-prompting for a fix.

**Issue 3 — Android cleartext traffic**

The Flutter app threw `ClientException: Failed to fetch` when hitting `http://10.0.2.2:3000`. Claude's scaffold did not include `android:usesCleartextTraffic="true"` in `AndroidManifest.xml`.

**How I caught it:** The error was specific enough to identify — `http://` on Android is blocked by default from API level 28+. Added the manifest flag and confirmed the fix by re-running `flutter run`.

---

### Where I Chose NOT to Use AI
- **Trade-off decisions** — The call on `synchronize: true` vs. migrations, `provider` vs. Riverpod, and `fetch` vs. React Query were made by me. These depend on reading the scope of the task correctly. AI is useful for explaining the options, but the decision has to be owned by the engineer building it.
- **Debugging the `400` on `duration_minutes: 0`** — I used `curl` to isolate the problem before asking Claude for a fix. Understanding *where* the failure was (pipeline, not decorator) meant I could ask a precise question and get a precise answer rather than a speculative one.
