# Accreditation API

A secure, RESTful API built with **NestJS**, **Prisma** and **PostgreSQL** allowing users to register, log in, and manage their accreditations with support for authentication and token refresh.

This project is containerised with Docker and leverages a Makefile to streamline development tasks, migrations, and testing.

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
