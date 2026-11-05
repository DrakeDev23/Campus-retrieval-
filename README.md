# Campus Lost-and-Found Retrieval System

A centralized web-based platform designed to make reporting, finding, and retrieving lost belongings easier within the campus community.

The Campus Lost-and-Found Retrieval System provides students with a convenient way to report missing or found items, browse available listings, submit ownership claims, and communicate securely during the retrieval process. It also provides campus administrators with tools to review reports, verify claims, and manage the return of lost belongings.

## Purpose

Traditional campus lost-and-found processes can be difficult to manage when reports are scattered across different offices, social media groups, or informal communication channels.

This system aims to address these challenges by providing a centralized platform where lost-and-found information can be organized, searched, and managed efficiently.

Its primary goals are to:

- Simplify the reporting of missing and found belongings.
- Help students discover items reported by other members of the campus community.
- Provide a structured and secure ownership verification process.
- Improve communication between students and administrators.
- Promote accountability and transparency throughout item retrieval.
- Reduce the time and effort required to reunite students with their belongings.

## Target Users

### Students

The primary users of the platform are students within the campus community.

Students can use the system to:

- Report belongings they have lost.
- Submit reports for items they have found.
- Browse and search currently available found-item listings.
- Submit claims when they believe an item belongs to them.
- Communicate privately with administrators during claim verification.
- Track their submitted reports and ownership claims.
- Receive notifications about relevant updates.

### Campus Administrators

Campus administrators are responsible for managing and overseeing lost-and-found operations.

Administrators can use the system to:

- Review and moderate submitted reports.
- Verify found-item information before making listings available.
- Manage active item listings.
- Review, approve, or reject ownership claims.
- Communicate with students during verification.
- Confirm item handovers and maintain retrieval records.

## How to Use the System

### For Students

1. **Access the platform** — Register or sign in using your account.
2. **Report an item** — Submit a missing-item or found-item report with the required information and photographs, when applicable.
3. **Search for belongings** — Browse active found-item listings and search for items that may belong to you.
4. **Submit an ownership claim** — Select the item and provide the information requested to establish ownership.
5. **Complete verification** — Communicate with the administrator and provide additional information when requested.
6. **Retrieve your item** — Follow the administrator's instructions and wait for the handover to be confirmed.

### For Campus Administrators

1. **Sign in** — Access the administrative interface using an authorized administrator account.
2. **Review reports** — Examine submitted missing-item and found-item reports.
3. **Manage listings** — Verify information and manage eligible found-item listings.
4. **Process claims** — Evaluate ownership claims and request additional information when necessary.
5. **Coordinate retrieval** — Communicate with students and arrange item handovers.
6. **Confirm handover** — Record the completed retrieval in the system.

## Technology Stack

- **Frontend:** React.js, Vite, React Router DOM, TanStack Query, Tailwind CSS
- **Backend:** FastAPI, Python, Pydantic, SQLAlchemy
- **Database:** PostgreSQL (Neon)
- **Authentication:** Clerk
- **Image Storage:** AWS S3
- **Email Notifications:** Resend
- **API:** RESTful JSON API

## Project Status

The project is currently in its foundation and implementation stage. Technical specifications and initial frontend and backend foundations have been established. Further features will be developed incrementally according to the approved implementation plan.

## Project Scope

The system is intended for campus-based lost-and-found operations. It focuses on improving how students report, discover, claim, and retrieve belongings while providing administrators with a structured way to manage the process.

It is not intended to replace physical campus lost-and-found facilities. Instead, it serves as a digital platform that supports and organizes their operations.

## Database

The system uses **PostgreSQL** as its exclusive relational database, hosted through Neon. SQLite is not used.

## Project Goal

To establish a more organized, accessible, and reliable campus lost-and-found process by connecting students and administrators through a centralized digital platform.