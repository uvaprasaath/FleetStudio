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
├── .gitignore              # Root git ignore file
├── README.md               # Root project documentation
├── Fleet Studio API.postman_collection.json # Root Postman backup collection
├── frontend/               # React TypeScript Client
│   ├── src/
│   │   ├── assets/         # Static assets (images, icons)
│   │   ├── lib/
│   │   │   └── constants/
│   │   │       └── index.tsx # Configuration and constant mappings
│   │   ├── pages/
│   │   │   └── CommitPage/
│   │   │       ├── commit.page.tsx        # Commit detail and diff container page
│   │   │       └── commitpage.components.tsx # Shared UI components for diff and file list
│   │   ├── services/
│   │   │   └── api.ts      # API consumer and typed Axios/fetch instance
│   │   ├── App.css         # Component specific baseline styles
│   │   ├── App.tsx         # Main application wrapper and router definition
│   │   ├── index.css       # Global styles importing Tailwind CSS v4
│   │   └── main.tsx        # Client application entry point
│   ├── package.json        # Client NPM packages and build scripts
│   └── vite.config.ts      # Vite bundler configuration
└── server/                 # Node/Express Backend
    ├── src/
    │   ├── index.ts        # Server entrypoint and middleware assembly
    │   ├── config/
    │   │   └── config.ts   # Dotenv configurations loader
    │   ├── helpers/
    │   │   ├── customresponse.ts # Standard success/error envelopes
    │   │   ├── httpexception.ts # Custom HTTP exception class
    │   │   └── responsecode.ts  # HTTP & Custom error codes mapping
    │   ├── integrations/
    │   │   └── github/
    │   │       ├── github.api.ts # Directly calls GitHub API
    │   │       └── github.dao.ts # Caching layer with 5-minute TTL Map
    │   ├── middleware/
    │   │   └── error.middleware.ts # Global error-handling middleware
    │   └── modules/
    │       ├── health/
    │       │   ├── health.controller.ts # Uptime / server checks controller
    │       │   └── health.routes.ts     # Health routes mapping
    │       └── repositories/
    │           ├── repositories.controller.ts # Route actions for commits & diffs
    │           ├── repositories.service.ts    # Diff file mapping & patch parsing
    │           ├── repositories.route.ts      # Routes definition
    │           └── repositories.test.ts       # Jest/Supertest integration specs
    ├── package.json        # Server configuration and scripts
    ├── tsconfig.json       # TypeScript configuration
    ├── jest.config.js      # Jest configuration
    ├── postman_collection.json # Downloadable Postman collection
    └── .env.example        # Environment variables configuration template
```

---

## 5. Getting Started

### Prerequisites
- Node.js (v20 or higher)
- NPM

### Clone the Repository
```bash
git clone https://github.com/uvaprasaath/FleetStudio.git
cd FleetStudio
```

### Backend Setup
1. Move to the `server/` directory and install backend dependencies:
   ```bash
   cd server
   npm install
   ```
2. Configure environment:
   Copy `.env.example` to `.env` and set your preferred port (default `5000`) and optional `GITHUB_TOKEN`:
   ```bash
   cp .env.example .env
   ```
3. Start the Express API server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Move to the `frontend/` directory and install client dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite React client dev server:
   ```bash
   npm run dev
   ```
   The client application will run at `http://localhost:5173` (by default).

### Example URL
To view an example commit analysis and diff, navigate to:
[http://localhost:5173/repositories/uvaprasaath/google-form-clone-project/commit/c05e09040cfb46a4f89a76aa5f4f941f30f8cad8](http://localhost:5173/repositories/uvaprasaath/google-form-clone-project/commit/c05e09040cfb46a4f89a76aa5f4f941f30f8cad8)

Another Example :
[http://localhost:5173/repositories/uvaprasaath/FleetStudio/commit/9ec01f4474ea5ace4300f36f3be5d5aa828d296f](http://localhost:5173/repositories/uvaprasaath/FleetStudio/commit/9ec01f4474ea5ace4300f36f3be5d5aa828d296f)

### Backend Development Commands
- **Development**: Start the API server in watch mode: `npm run dev`
- **Build**: Compile TypeScript backend code: `npm run build`
- **Start**: Start the compiled production server: `npm run start`
- **Test**: Run the Jest test suite: `npm run test`

### Frontend Development Commands
- **Development**: Start Vite development dev server: `npm run dev`
- **Build**: Build static production assets to `dist/`: `npm run build`

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

- **Postman Collection**: Download the collection to test endpoints locally: [postman_collection.json](file:///d:/InterviewTasks/FleetStudio/server/postman_collection.json).
