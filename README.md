# AuthGrid

AuthGrid is a premium authentication and authorization solution.

## 🚀 Quick Start for Developers

Follow these steps to get the project running in under 2 minutes:

### 1. Prerequisite
Ensure you have **Docker** and **Node.js (v20+)** installed.

### 2. Setup
Clone the repo and run the automated setup:

> [!IMPORTANT]
> The setup script uses Docker to spin up a PostgreSQL instance. Make sure Docker Desktop is running before you execute `npm run setup`.

```bash
# Clone
git clone https://github.com/Hammad324/AuthGrid.git
cd AuthGrid/backend

# Copy environment variables
cp .env.example .env
cp .env.test.example .env.test

# Run automated setup (Installs deps, starts Docker, runs migrations)
npm run setup
```

## 🔍 Verifying & Visualizing Data

You have two ways to check your data:

### 1. Terminal (Quick Check)
To list all databases inside the Docker container:
```bash
docker exec -it auth_postgres_dev psql -U dev_user -l
```

### 2. Prisma Studio (Visual GUI)
Prisma Studio provides a clean web interface to view and edit your data.

*   **View Dev Data**:
    ```bash
    npm run db:studio
    ```
*   **View Test Data**:
    ```bash
    npm run db:studio:test
    ```

> [!TIP]
> Use `db:studio:test` after running integration tests to see exactly what records were created during the test run!

### 3. Start Development
```bash
npm run start:dev
```

## 🧪 Testing
Run the integration tests to verify your setup:
```bash
npm run test:integration
```

---
