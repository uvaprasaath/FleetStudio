# Solution Architecture & Design Decisions

This document outlines the architectural decisions, technology choices, structural benefits, and known limitations of the FleetStudio Git Commit API & Client solution.

---

## 1. Module-Based Architecture

Both the client (frontend) and server (backend) follow a **module-based (feature-based)** folder structure. This approach organizes files by functional domains (features) rather than technical roles (global folders for all controllers, all components, etc.).

```text
frontend/src/pages/CommitPage/        # Frontend Feature Module
├── commit.page.tsx                   # Page container/router endpoint
└── commitpage.components.tsx         # Feature-specific UI components

server/src/modules/repositories/      # Backend Feature Module
├── repositories.controller.ts        # HTTP Request handler
├── repositories.service.ts           # Business/Parsing logic
├── repositories.route.ts             # Route configuration
└── repositories.test.ts              # Unit and integration tests
```

### Benefits for Maintainability & Scalability

#### Frontend (React Client)
*   **Maintainability (Locality of Reference)**: Developers working on the commit page will find all relevant layout, sub-components, and logic inside the `CommitPage` folder. They do not need to hunt through a global `components/` folder, reducing cognitive load.
*   **Encapsulation**: Components that are only used in the Commit view are kept private to that page, preventing other features from accidentally importing and creating coupled dependencies.
*   **Scalability**: Different product teams can own different feature directories (e.g., `CommitPage`, `ProfilePage`, `SettingsPage`) and develop them in parallel with minimal merge conflicts in git.

#### Backend (Express Server)
*   **Maintainability (Decoupled Layers)**: By grouping the controller, service, and routes within the `repositories` module, domain boundaries are clearly defined. If backend validation or database structures change for commits, changes are isolated strictly to this module.
*   **Testability**: Test files are placed right next to the code they verify. This promotes writing comprehensive integration tests and makes it easy to run module-specific test suites.
*   **Scalability**: The code stays clean and manageable even as the server adds hundreds of endpoints. New features are simply added as new modules without touching or risking regression in existing code.

---

## 2. Migration Pathways

The current module-based architecture is purposely designed to make future scaling and migrations seamless:

### A. Migrating to a Monorepo
*   **What/Why**: As teams grow, sharing components and services across multiple repositories becomes difficult. A monorepo (using tools like **Nx**, **Turborepo**, or **Yarn Workspaces**) consolidates projects under one repository while keeping them modular.
*   **How the Architecture Helps**: 
    *   **Frontend**: The modular `CommitPage` folder can be extracted directly into a standalone UI package (e.g., `@fleetstudio/ui-commit`) and imported by multiple applications in the monorepo.
    *   **Backend**: Common configurations (`config/`), error helpers (`helpers/`), and middlewares can be extracted into a `@fleetstudio/common` package, allowing independent microservices or CLI tools to share them.

### B. Migrating to Micro Frontends
*   **What/Why**: To allow multiple frontend teams to deploy their features independently without redeploying the entire website.
*   **How the Architecture Helps**: Because `CommitPage` acts as a self-contained module, it is already a prime candidate for **Webpack Module Federation** or **single-spa**. We can expose the `CommitPage` module as a remote container, allowing a shell/host application to download and render it at runtime.

### C. Migrating to Microservices
*   **What/Why**: To scale the backend horizontally by running specific high-load services independently.
*   **How the Architecture Helps**: The `repositories` module contains its own routing, controller, and services. Migrating this to a microservice involves moving the `repositories/` directory into its own small project, exposing the routes directly, and connecting it to the API gateway. No complex code-splitting or dependency-unraveling is required.

---

## 3. Limitations & Trade-offs

### A. Pagination is Not Implemented
*   **What**: The endpoints return all files and unified diff hunks modified in a commit at once.
*   **Why (Rationale & Trade-offs)**:
    *   **Typical Git Commit Size**: In average software workflows, git commits contain a relatively small number of file modifications (usually under 50 files). By default, GitHub's API returns up to 300 changed files.
    *   **Performance Overhead**: Querying pages sequentially would consume more of our GitHub API rate limit (due to multiple page requests) compared to retrieving all details in a single cached API call.
    *   **Simplicity**: Omitting pagination kept both client rendering and server caching extremely simple and fast for standard development workflows.
*   **How to Implement in the Future**:
    *   **Backend**: Add `page` and `limit` query parameters to the `/diff` endpoint. Slice the files array on the server and return metadata like `totalPages`, `currentPage`, and `totalItems`.
    *   **Frontend**: Introduce virtualized lists (`react-window`) to only render diffs currently visible on the screen, and implement an infinite scroll or "Load More Diffs" button to load files lazily.

### B. In-Memory Cache (Local Map)
*   **What**: The caching layer (`github.dao.ts`) uses a local JS `Map` to cache GitHub API responses for 5 minutes.
*   **Why**: Quick to implement, operates entirely in-memory with zero external dependencies (no database or Redis required to run locally).
*   **Limitation**: If we scale the server horizontally (run multiple instances behind a load balancer), the local caches will desynchronize, leading to redundant GitHub API requests.
*   **Future Fix**: Replace the local `Map` with a centralized cache store like **Redis**.

### C. No File Search/Filtering in the UI
*   **What**: The frontend UI displays all diff files in order but does not provide a search bar to filter by filename.
*   **Why**: With small commits, scrolling through the list of modified files in the sidebar is fast.
*   **Future Fix**: Add a text input in the sidebar that filters the sidebar files list and diff list based on substring matches of file paths.
