# FleetStudio Git Commit API Server

A high-performance Node.js & Express.js REST API server written in TypeScript that fetches, caches, and parses Git commit details and unified diff patches directly from the GitHub REST API.

---

## 1. Overview

This project provides a robust interface to retrieve structured Git commit data and hunk-level diff mappings. By wrapping raw GitHub endpoints, it formats commit metadata and parses diff logs into structured JSON hunks showing line-by-line insertions and deletions with precise line numbers.

### High-Level Architecture
Implements a strict **Controller-Service-DAO** pattern:
- **Integrations (API/DAO)**: Integrates with GitHub's REST API. Uses an in-memory `Map` caching layer to persist raw payloads for 5 minutes, mitigating rate-limiting.
- **Service Layer**: Maps file statuses and parses unified diff patches into structured lines using a line-tracking parser.
- **Controller Layer**: Coordinates parameters, query filters, and builds standardized HTTP response envelopes.
- **Global Error Handling**: Standardizes error messaging and propagates remote GitHub API status codes.

---

## 2. Features

- **Simplified Commit Metadata**: Returns a single-element array containing the OID, message, author, committer, and a list of parent commit OIDs.
- **Commit Diff Endpoint**: Returns file additions, deletions, modifications, renames, copies, and type changes mapped to standardized kinds (`ADDED`, `COPIED`, `DELETED`, `MODIFIED`, `RENAMED`, `TYPE_CHANGED`).
- **Structured Hunk Parsing**: Parses unified diff patch logs line-by-line into structured hunk objects showing `baseLineNumber` and `headLineNumber`.
- **Query-Based Path Filtering**: Supports filtering diff output via a `path` query param (e.g., `?path=README`). Throws a custom `404` error if the file is not in the commit.
- **In-Memory Map Cache**: Persists GitHub API call payloads for 5 minutes to optimize performance and share resources across multiple endpoints.
- **GitHub Error Code Mapping**: Maps standard GitHub error status codes (`404`, `409`, `422`, `500`, `503`) to explicit descriptions.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (v20+) |
| **Language** | TypeScript |
| **Framework** | Express.js |
| **API** | GitHub REST API (fetch) |
| **Dev Runner** | `tsx watch` |
| **Testing Framework** | Jest |
| **API Testing** | Supertest |
| **Logging & Security** | Morgan, Helmet, CORS |

---

## 4. Folder Structure

```text
fleetstudio/
├── .env.example            # Environment variables configuration template
├── .gitignore              # Git ignore file
├── jest.config.js          # Jest configuration
├── package.json            # NPM project configuration and scripts
├── tsconfig.json           # TypeScript configuration
├── postman_collection.json # Downloadable Postman collection
└── src/
    ├── index.ts            # Server entrypoint and middleware assembly
    ├── config/
    │   └── config.ts       # Dotenv configurations loader
    ├── helpers/
    │   ├── customresponse.ts # Standard success/error envelopes
    │   ├── httpexception.ts # Custom HTTP exception class
    │   └── responsecode.ts  # HTTP & Custom error codes mapping
    ├── integrations/
    │   └── github/
    │       ├── github.api.ts # Directly calls GitHub API
    │       └── github.dao.ts # Caching layer with 5-minute TTL Map
    ├── middleware/
    │   └── error.middleware.ts # Global error-handling middleware
    └── modules/
        ├── health/
        │   ├── health.controller.ts # Uptime / server checks controller
        │   └── health.routes.ts     # Health routes mapping
        └── repositories/
            ├── repositories.controller.ts # Route actions for commits & diffs
            ├── repositories.service.ts    # Diff file mapping & patch parsing
            ├── repositories.route.ts      # Routes definition
            └── repositories.test.ts       # Jest/Supertest integration specs
```

---

## 5. Getting Started

### Prerequisites
- Node.js (v20 or higher)
- NPM

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   Copy `.env.example` to `.env` and set your preferred port (default `5000`) 
   ```bash
   cp .env.example .env
   ```

### Scripts
- **Development**: Start the server in watch mode:
  ```bash
  npm run dev
  ```
- **Build**: Compile TypeScript code to the `dist/` directory:
  ```bash
  npm run build
  ```
- **Start**: Start the compiled production server:
  ```bash
  npm run start
  ```
- **Test**: Run the Jest test suite:
  ```bash
  npm run test
  ```

---

## 6. API Documentation

### Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies that the Express server is running and healthy.

### Get Commit Metadata
- **Endpoint**: `GET /api/v1/repositories/:owner/:repository/commits/:oid`
- **Description**: Returns simplified metadata for a given commit.

### Get Commit Diff
- **Endpoint**: `GET /api/v1/repositories/:owner/:repository/commits/:oid/diff`
- **Query Params**:
  - `path` (Optional): Filter results to a specific file. Throws a `404` error if the file is not part of the commit.
- **Description**: Returns file changes and unified diff hunks mapped to line numbers.

---

## 7. Resources

- **Postman Collection**: Download the collection to test endpoints locally: [postman_collection.json](file:///d:/InterviewTasks/FleetStudio/postman_collection.json).
