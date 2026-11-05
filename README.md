# Campus Lost-and-Found Retrieval System

A modern, web-based platform designed to streamline lost-and-found operations across campus. The system enables students to report missing and found items, search active listings, submit verified ownership claims, and communicate privately during claim resolution, while empowering campus administrators to moderate reports and manage item handovers securely.

---

## Technology Stack

- **Frontend:** ReactJS, React Router DOM, TanStack Query
- **Backend:** FastAPI (Python 3.11+), Pydantic v2, SQLAlchemy ORM
- **Database:** PostgreSQL (Neon Serverless)
- **Authentication & Identity:** Clerk
- **Media Storage:** AWS S3 (private bucket, backend-mediated presigned URLs)
- **Transactional Notifications:** Resend
- **API Style & Versioning:** RESTful JSON API (`/api/v1`)

---

## Repository Structure

```text
campus-lost-and-found/
│
├── docs/                               # Authoritative technical specifications & audit reports
│   ├── system-architecture.md          # End-to-end system topology and component interactions
│   ├── database-design.md              # 3NF relational PostgreSQL schema, constraints, and indexes
│   ├── api-design.md                   # REST API contract specification and Pydantic schemas
│   ├── module-design.md                # Modular software architecture and domain boundaries
│   ├── security-design.md              # Security controls, RBAC, BOLA/IDOR protection, and threat model
│   ├── implementation-plan.md          # 15-phase dependency-driven engineering roadmap
│   └── documentation-review.md         # Final technical audit and remediation report (v2.0)
│
├── frontend/                           # ReactJS frontend application directory
│   └── README.md                       # Frontend architectural placeholder & setup notes
│
├── backend/                            # FastAPI backend application directory
│   └── README.md                       # Backend architectural placeholder & setup notes
│
├── .gitignore                          # Git ignore rules for Python, Node, environment files, and IDEs
└── README.md                           # Project root documentation and overview
```

---

## Documentation Index

The complete system architecture and engineering specifications are documented in the [`docs/`](docs/) directory:

1. [**System Architecture**](docs/system-architecture.md): Overall system structure, external integrations, data flows, and concurrency handling.
2. [**Database Design**](docs/database-design.md): Normalized relational models, XOR check constraints on photos, partial unique indexes, and audit tables.
3. [**API Design**](docs/api-design.md): Endpoint specifications, request/response models, error envelopes, and permissions.
4. [**Module Design**](docs/module-design.md): Domain module boundaries, data ownership matrices, and service interactions.
5. [**Security Design**](docs/security-design.md): Authentication vs authorization, Clerk JWKS verification, IDOR mitigation, magic-byte media inspection, and STRIDE analysis.
6. [**Implementation Plan**](docs/implementation-plan.md): 15-phase roadmap with storage foundation preceding reporting, quality gates, and risk mitigations.
7. [**Documentation Audit & Remediation Report**](docs/documentation-review.md): Audit findings, remediation log, and implementation readiness sign-off.

---

## Project Status

- **Phase 1A (Repository Setup):** Completed. Folder structure, documentation centralization, and environment ignore rules are established.
- **Application Code:** Not yet initialized. Awaiting Phase 1B foundation kickoff.
