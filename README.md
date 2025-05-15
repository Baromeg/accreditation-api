# Accreditation API

A production-grade, **secure accreditation management system** built using **NestJS, Prisma, PostgreSQL, and Docker**, designed to demonstrate best practices in **modular architecture**, **token-based authentication**, and **real-world API design**.

#### 🔑 Key Achievements

- **Robust User Authentication & Token Management**
  Designed and implemented a **secure, stateless JWT authentication system** supporting access and refresh tokens, including secure storage and rotation of refresh tokens using hashed persistence.

- **Business-Driven Accreditation Management**
  Developed full **CRUD functionality** for user-owned accreditations with **business rule enforcement**, including restricted deletion based on status (`PENDING`, `APPROVED`, `REJECTED`).

- **Modular, Scalable System Architecture**
  Applied **NestJS** best practices to deliver **highly testable**, **modular** components with clear separation of concerns across controllers, services, and data layers.

- **Database Modelling and Migration with Prisma & PostgreSQL**
  Designed a relational data model using **Prisma schema** and managed schema changes via **safe, versioned migrations**.

- **Automated End-to-End and Unit Testing**
  Delivered a **comprehensive testing suite**:

  - **E2E Tests**: Cover full user journeys including registration, login, and token refresh.
  - **Unit Tests**: Validate business logic for authentication, user management, and token handling.

- **Streamlined Developer Experience with Docker & Makefile**
  Containerised the entire development and testing environment using **Docker Compose**, and simplified onboarding and workflow execution via a **custom Makefile**.

- **Clean Development Workflow & CI Readiness**
  Structured the project to support **consistent local development**, **testing**, and **production deployment readiness**, aligned with modern CI/CD practices.

---

#### 🌱 **What This Project Taught Me**

- **How to design production-grade, secure authentication flows**.
- **How to apply architectural principles like Single Responsibility and Separation of Concerns**.
- **How to balance unit testing and end-to-end testing to validate both logic and integration**.
- **How to use Docker and Makefiles to streamline developer experience and team workflows**.
- **How to document, justify, and communicate technical decisions in a professional setting**.

---

## Tech Stack

- NestJS (TypeScript, modular architecture)
- Prisma (type-safe ORM)
- PostgreSQL (relational DB)
- Docker (for local development)
- pnpm (fast, efficient package manager)
- Makefile (for predictable, standardised dev commands)

---

## Getting Started

### 1. Install Dependencies

```
pnpm install
```

> I use pnpm for its performance and strict dependency resolution. It ensures a reproducible install and smaller node_modules footprint.

---

### 2. Set Up Environment Variables

Create a `.env` file at the root (use the .env.example as reference):

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/accreditation
JWT_SECRET=your-very-secret-key
```

---

### 3. Run the Stack (API + DB)

```
make start
```

> This command uses Docker Compose to spin up the API and the Postgres DB together. You can also run `make dev` to enable hot reload when saving changes.

---

### 4. Run Migrations and Generate Prisma Client

Once containers are running:

```
make migrate name=init
make generate
```

These commands:

- Apply schema changes to the DB
- Generate the Prisma client based on your latest schema

---

## Test Coverage

This project includes both **unit tests** and **end-to-end tests** to ensure robustness and reliability.

### ✔️ End-to-End Tests

These validate the API endpoints with real HTTP requests and a connected database:

- `POST /auth/register` – Registers a new user
- `POST /auth/login` – Authenticates and returns access + refresh tokens
- `POST /auth/refresh` – Exchanges refresh token for new tokens

### 🧪 Unit Tests

These validate individual services and business logic in isolation:

- `AuthService.login()` – Validates credentials and returns tokens
- `AuthService.refreshTokens()` – Handles secure token rotation
- `UsersService.createUser()` – Hashes password and persists user
- `UsersService.updateRefreshToken()` – Persists hashed refresh token

> Tests are run inside the containerised environment using `make test` and `make teste2e`.

---

## Authentication Flow

### 1. Registration and Login

- POST /auth/register – Creates a user with hashed password
- POST /auth/login – Returns access_token (10m) and refresh_token (7d)

### 2. Refreshing Tokens

- POST /auth/refresh – Requires a valid refresh_token and returns a new pair

### 3. Protecting Routes

Routes like /accreditations use a JWT Guard to enforce authentication.

---

## JWT Strategy and Guard

- JwtStrategy extracts the token from the Authorization: Bearer header
- It validates the token’s signature and decodes the payload (sub = userId)
- On success, the decoded payload is injected into req.user
- This lets any controller access the authenticated user context

Example:

@UseGuards(JwtAuthGuard)
@Get('accreditations')
getAll(@Request() req) {
return this.service.findAllForUser(req.user.userId);
}

---

## DTOs and Validation

All incoming request bodies are validated using DTOs + class-validator.

Example:

export class CreateAccreditationDto {
@IsString()
@IsNotEmpty()
name: string;
}

These DTOs:

- Ensure only expected data is processed
- Prevent overposting attacks
- Provide early feedback to API clients

---

## Accreditations Domain Logic

- Each user can have multiple accreditations
- Fields: name, status (PENDING/APPROVED/REJECTED), expirationDate
- Only PENDING accreditations can be deleted
- Only the name field is editable by the user

---

## Makefile Commands

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| make start             | Start the app and DB containers    |
| make dev               | Start app with hot-reload          |
| make stop              | Stop containers                    |
| make generate          | Generate Prisma client from schema |
| make migrate name=init | Apply schema migration with name   |
| make test              | Run unit tests                     |
| make teste2e           | Run end-to-end tests               |

---

## Example API Flow

1. Register:

POST /auth/register  
{
"email": "user@example.com",
"password": "securePass123",
"firstName": "Jane",
"lastName": "Doe"
}

2. Login:

POST /auth/login  
→ returns access_token and refresh_token

3. Use access_token to call:

GET /accreditations  
Authorization: Bearer <access_token>

4. Refresh token when expired:

POST /auth/refresh  
{
"refresh_token": "<refresh_token>"
}

---

## Author

Your Name – https://github.com/Baromeg

---

## License

MIT
