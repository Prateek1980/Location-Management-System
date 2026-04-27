# Location Management System Documentation

## 1. Project Overview

The Location Management System is a small full-stack web application for storing, organizing, and visualizing geographic locations by category.

It is split into two main parts:

- A Python backend built with FastAPI, SQLAlchemy, and PostgreSQL
- A static frontend built with plain HTML, CSS, and JavaScript

The project supports two main user experiences:

- An admin-facing interface for authentication, category management, location management, and user administration
- A public or operational map interface for viewing saved locations on an interactive map

This architecture is intentionally simple. The backend exposes REST-style endpoints, and the frontend consumes them using the browser `fetch()` API. There is no frontend build step, no JavaScript framework, and no server-side rendered UI.

## 2. Main Goals of the Project

The project is designed to solve a straightforward operational problem:

- Store named locations with latitude, longitude, and category information
- Allow authenticated users to manage location records
- Allow a superadmin to manage user roles and account status
- Display saved records on a map for browsing and search

Because the scope is focused, the implementation favors clarity and low setup complexity over enterprise-level abstraction.

## 3. Technology Stack

### Backend

- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Alembic
- Passlib with bcrypt
- Pydantic
- Python standard library modules such as `smtplib`, `secrets`, and `datetime`

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `fetch()` API
- `localStorage` for simple client-side session state

### Third-Party UI and Mapping Libraries

- Leaflet for interactive map rendering
- Font Awesome for dashboard icons
- GeoServer WMTS tile layers for map imagery

## 4. Why This Stack Is Being Used

### Why FastAPI

FastAPI is a strong fit for this project because it makes it easy to build JSON APIs quickly with clear route definitions and automatic request parsing.

Why it is useful here:

- The application is API-first
- The routes are relatively small and CRUD-oriented
- Request bodies map naturally to Pydantic schemas
- FastAPI keeps the backend readable for learners and small teams

Why this specifically instead of Django or Flask:

- Compared with Django, FastAPI is lighter for a project that does not need Django's full template system, admin panel, or monolithic structure
- Compared with Flask, FastAPI provides stronger built-in request validation and a more modern developer experience out of the box
- For a location CRUD system with JSON endpoints, FastAPI keeps the backend concise without losing structure

### Why SQLAlchemy

SQLAlchemy is used as the ORM layer between Python objects and PostgreSQL tables.

Why it is useful here:

- It allows the project to define `User`, `Category`, `Location`, and `PasswordResetToken` as Python classes
- It keeps database access more maintainable than writing raw SQL everywhere
- It supports relationships, such as `Location -> Category`

Why this specifically instead of raw SQL:

- The project has several related tables and repetitive CRUD operations
- ORM usage reduces boilerplate for inserts, updates, and queries
- It makes the code easier to understand for developers who are more comfortable with Python objects than SQL statements

### Why PostgreSQL

PostgreSQL is the database configured for the system.

Why it is useful here:

- It is reliable and production-capable
- It handles structured relational data well
- It works well with SQLAlchemy and Alembic
- It is a natural choice when storing entities like users, categories, and locations with foreign keys

Why this specifically instead of SQLite:

- SQLite is excellent for prototypes, but PostgreSQL is better when multi-user access, stronger data integrity, and more realistic deployment are expected
- The use of categories, user roles, and concurrent admin operations makes PostgreSQL the more scalable choice

### Why Alembic

Alembic is used for database schema migrations.

Why it is useful here:

- It provides a versioned history of schema changes
- It helps keep different developer environments aligned
- It is the standard migration tool for SQLAlchemy-based projects

Why this specifically instead of manual SQL scripts:

- Manual schema updates are error-prone
- Alembic supports repeatable, trackable database evolution
- It simplifies team collaboration once the schema starts changing over time

### Why Passlib with bcrypt

Passwords are hashed with Passlib using the bcrypt scheme.

Why it is useful here:

- Plain-text password storage would be insecure
- bcrypt is a widely accepted password hashing algorithm
- Passlib makes hashing and verification straightforward

Why this specifically instead of writing a custom hashing function:

- Password security should rely on proven libraries, not custom cryptography
- Passlib abstracts hashing details and reduces implementation mistakes

### Why Vanilla HTML/CSS/JavaScript

The frontend is built without React, Angular, Vue, or another SPA framework.

Why it is useful here:

- The UI flows are relatively simple and page-oriented
- Static files are easy to host
- There is no build pipeline to manage
- It is easier for beginners to read and edit

Why this specifically instead of React or Vue:

- For a small internal dashboard, a framework may add more setup overhead than value
- The current pages are form-heavy and CRUD-focused, which vanilla JavaScript can handle well
- This approach keeps deployment simple because the frontend can run from any static file server

The tradeoff is that the frontend code becomes more manual over time, especially for state management, routing, and reusable UI behavior.

### Why Leaflet

Leaflet is used in the map-view application.

Why it is useful here:

- It is lightweight
- It is easy to integrate into static pages
- It supports markers, layers, and viewport control with minimal setup

Why this specifically instead of Google Maps SDK or Mapbox GL:

- Leaflet is simple, open, and works well for 2D marker-based map experiences
- It avoids platform lock-in and licensing complexity for a basic map viewer
- The project already has access to external WMTS tile services, so a lightweight map client is enough

## 5. High-Level Architecture

The application follows a classic separated frontend/backend structure.

```text
Browser UI (static HTML/CSS/JS)
        |
        | fetch() over HTTP
        v
FastAPI backend
        |
        | SQLAlchemy ORM
        v
PostgreSQL database
```

There are two frontend surfaces:

- `frontend/admin`: authentication, dashboard, user management, category management, location management
- `frontend/map-view`: interactive map display of stored locations

The backend is the single source of truth for application data. The frontend does not keep authoritative data beyond temporary UI state and browser storage.

## 6. Repository Structure

```text
Location_Mgmt_System/
  backend/
    alembic/
    app/
      core/
      routers/
      main.py
      models.py
      schemas.py
    scripts/
    alembic.ini
  frontend/
    admin/
      assets/
      pages/
    map-view/
      assets/
      pages/
  README.md
  PROJECT_DOCUMENTATION.md
```

### What Each Major Folder Is For

#### `backend/app`

Contains the application code for the API server.

- `main.py`: FastAPI app creation and router registration
- `models.py`: database table models
- `schemas.py`: request and response validation classes
- `routers/`: grouped endpoint definitions by feature
- `core/database.py`: SQLAlchemy engine, session factory, and base model class

#### `backend/alembic`

Contains database migration infrastructure.

- `env.py`: Alembic runtime configuration
- `versions/`: migration history files

#### `backend/scripts`

Contains utility scripts used outside the main runtime. Right now this includes superadmin bootstrapping.

#### `frontend/admin`

Contains the static admin application.

- `pages/`: page-level HTML files
- `assets/js/`: behavior scripts for each page
- `assets/css/`: page-specific styling
- `assets/data/`: sample JSON import files

#### `frontend/map-view`

Contains the map viewing interface.

- `pages/index.html`: map UI entry page
- `assets/js/map.js`: map initialization, search, filtering, and tile switching
- `assets/css/`: layout and component styling

## 7. Backend Architecture

### 7.1 Application Entry Point

The main backend entry point is [backend/app/main.py](./backend/app/main.py).

Responsibilities:

- Create the FastAPI app instance
- Configure CORS
- Register API routers
- Expose a root health-style endpoint

The app reads allowed CORS origins from the `ALLOWED_ORIGINS` environment variable. The example configuration allows the local static frontend during development.

Why this is used:

- The frontend is not served by the backend
- Static development often runs on a different port
- Simple cross-origin access is needed immediately

Tradeoff:

- Local development origins must be listed explicitly before browser requests will work

### 7.2 Database Layer

The database setup lives in [backend/app/core/database.py](./backend/app/core/database.py).

It defines:

- `DATABASE_URL` read from environment variables
- SQLAlchemy `engine`
- `SessionLocal`
- `Base`

Why this structure is used:

- It centralizes DB connectivity
- All routers can use the same session factory pattern
- Models inherit from one shared declarative base

Tradeoff:

- The connection string must be provided through local `.env` or deployment environment variables

### 7.3 Data Models

The main entities are defined in [backend/app/models.py](./backend/app/models.py).

#### User

Purpose:

- Stores application users
- Supports different roles
- Supports account activation and deactivation

Fields:

- `id`
- `name`
- `phone`
- `email`
- `password`
- `role`
- `is_active`

Why this model exists:

- The system needs authenticated users
- It distinguishes normal users from superadmins
- It supports operational controls such as disabling accounts

#### Category

Purpose:

- Organizes locations into logical groups

Fields:

- `id`
- `name`

Why this model exists:

- Category-based filtering is important in both admin and map views
- It avoids hardcoding category names into frontend code

#### Location

Purpose:

- Stores the actual geospatial records managed by the system

Fields:

- `id`
- `name`
- `latitude`
- `longitude`
- `category_id`

Relationship:

- `category = relationship("Category")`

Why this model exists:

- It is the core business entity of the entire project
- Category linkage enables filtering and cleaner display logic

Why `Numeric(9,6)` is used for coordinates:

- It preserves decimal precision at six fractional places
- Six decimals are usually enough for fine-grained geographic positioning
- It avoids some floating-point inconsistency issues at the storage layer

#### PasswordResetToken

Purpose:

- Supports password reset flows

Fields:

- `id`
- `user_id`
- `token`
- `expires_at`
- `is_used`

Why this model exists:

- Password reset should be time-bound and tokenized
- Tokens should be trackable and invalidated after use

### 7.4 Schema Layer

Validation models live in [backend/app/schemas.py](./backend/app/schemas.py).

These schemas are used to define request payloads for:

- login
- forgot password
- reset password
- category creation
- location creation and update
- user registration

Why schemas are used:

- They validate incoming JSON
- They document expected request shape in code
- They reduce manual parsing logic inside routes

Why this specifically matters in FastAPI:

- FastAPI works best when inputs are defined explicitly with Pydantic
- Validation errors can be handled consistently

### 7.5 Router Layer

The backend organizes endpoints into focused route modules.

#### Auth Routes

File: [backend/app/routers/auth_routes.py](./backend/app/routers/auth_routes.py)

Responsibilities:

- register users
- log users in
- initiate password reset
- complete password reset

Important implementation details:

- Passwords are hashed with bcrypt through Passlib
- Reset tokens are generated with `secrets.token_urlsafe(32)`
- Reset emails are sent using Gmail SMTP via Python `smtplib`

Why this route grouping is good:

- Authentication logic is naturally grouped in one place
- Security-related flows stay easier to reason about

Tradeoffs in the current implementation:

- Login returns a placeholder token value (`"logged_in"`) instead of a signed JWT or session token
- SMTP credentials are read from environment variables
- Authorization is therefore lightweight and mostly trust-based

#### Category Routes

File: [backend/app/routers/category_routes.py](./backend/app/routers/category_routes.py)

Responsibilities:

- list categories
- create category
- update category
- delete category

Why this module exists:

- Categories are a separate business entity
- Both admin and map features depend on them

This route set is intentionally minimal because category behavior is simple CRUD.

#### Location Routes

File: [backend/app/routers/location_routes.py](./backend/app/routers/location_routes.py)

Responsibilities:

- list locations
- create location
- update location
- delete location

Important implementation details:

- Coordinates are quantized to six decimal places before storage
- The list endpoint returns both `category_id` and `category_name`

Why returning `category_name` is useful:

- It reduces frontend lookup work
- The map UI and admin tables can display category labels directly

Why this specifically is a practical choice:

- It keeps frontend code simpler
- It avoids forcing a second category lookup for every row

#### User Routes

File: [backend/app/routers/user_routes.py](./backend/app/routers/user_routes.py)

Responsibilities:

- list users
- change user role
- toggle active status
- delete user

Why this route set exists:

- User governance is treated as a superadmin concern
- It keeps operational controls separate from regular authentication

Current authorization approach:

- The frontend sends a `role` header
- Some routes also use a `current-user-email` header
- The backend uses these header values to restrict actions

Why this may have been chosen:

- It is easy to implement during early development
- It avoids the complexity of a full auth system

Why this should be replaced later:

- Request headers are client-controlled
- This is not secure enough for production
- Proper token-based identity validation is a better long-term design

## 8. Database Migration Strategy

Alembic is configured in the backend and reads SQLAlchemy metadata from [backend/alembic/env.py](./backend/alembic/env.py).

Current migration history includes:

- `e4fe5032e2a7_initial_setup.py`
- `47d2d37a4ec6_add_description.py`
- `78c9e629ff33_remove_description.py`

What this tells us:

- The project has already started tracking schema changes
- The `Location` table briefly included a `description` column and later removed it

Important observation:

- The initial migration file currently contains `pass` and does not create tables

Why that matters:

- A fresh database may not be created correctly from migration history alone
- This suggests the migration chain needs cleanup if the project will be shared or deployed in a repeatable way

## 9. Backend API Summary

### Authentication and Account Routes

- `POST /register`
- `POST /login`
- `POST /forgot-password`
- `POST /reset-password`

### Category Routes

- `GET /categories`
- `POST /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`

### Location Routes

- `GET /locations`
- `POST /locations`
- `PUT /locations/{id}`
- `DELETE /locations/{id}`

### User Administration Routes

- `GET /users`
- `PUT /users/{id}/role`
- `PUT /users/{id}/status`
- `DELETE /users/{id}`

### Root Route

- `GET /`

## 10. Frontend Architecture

The frontend is organized as static multi-page applications rather than a single bundled SPA.

This means:

- Each page has its own HTML file
- Each page usually has its own JavaScript file
- Styling is split by page or feature area

Why this structure is used:

- It is easy to reason about
- It works well with plain JavaScript
- Each feature can be opened directly from a static server

Why this specifically instead of a client router:

- The project scope is small
- Navigation between pages is simple
- No build tooling is required

## 11. Admin Frontend

### 11.1 Login Page

Files:

- [frontend/admin/pages/login/login.html](./frontend/admin/pages/login/login.html)
- [frontend/admin/assets/js/login.js](./frontend/admin/assets/js/login.js)

Responsibilities:

- collect email and password
- call `/login`
- store response data in `localStorage`
- redirect to the home page

Why `localStorage` is being used:

- It is very easy to access from plain JavaScript
- It avoids needing cookies or a more complex auth layer during early development

Why this specifically may have been chosen:

- The project favors simplicity and low ceremony
- The frontend is fully static, so client-side storage is the fastest path to basic session persistence

Tradeoff:

- It is not secure enough for sensitive auth tokens in production

### 11.2 Registration Page

Files:

- `frontend/admin/pages/registration/registration.html`
- [frontend/admin/assets/js/registration.js](./frontend/admin/assets/js/registration.js)

Responsibilities:

- validate user inputs
- confirm password match
- call `/register`
- redirect to login on success

Why validation is done on the frontend:

- It improves user experience
- Users get immediate feedback without waiting for the backend

Why backend validation still matters:

- Frontend validation can be bypassed
- The backend must remain authoritative

### 11.3 Password Reset Pages

Files:

- `frontend/admin/pages/reset/forgot.html`
- `frontend/admin/pages/reset/reset.html`
- [frontend/admin/assets/js/reset.js](./frontend/admin/assets/js/reset.js)

Responsibilities:

- submit password reset request by email
- read reset token from the URL
- send a new password to `/reset-password`

Why this is useful:

- It provides a basic account recovery flow
- It reduces the need for manual admin intervention when users forget passwords

### 11.4 Home Dashboard

Files:

- [frontend/admin/pages/home/home.html](./frontend/admin/pages/home/home.html)
- [frontend/admin/assets/js/home.js](./frontend/admin/assets/js/home.js)

Responsibilities:

- greet the logged-in user
- fetch summary statistics
- show counts for locations and categories
- show category distribution
- show recent locations
- show superadmin-only user overview data

Why this page exists:

- It gives users an operational summary before they enter management screens
- It separates overview from direct CRUD work

### 11.5 Main Admin Dashboard

Files:

- [frontend/admin/pages/dashboard.html](./frontend/admin/pages/dashboard.html)
- [frontend/admin/assets/js/dashboard.js](./frontend/admin/assets/js/dashboard.js)

This is the core admin workspace.

Responsibilities:

- add locations
- edit locations
- delete locations
- search locations
- add categories
- edit categories
- delete categories
- import categories from JSON
- import locations from JSON

Why this page is the operational center:

- Most business actions happen here
- It combines category management with location management in one place

Why JSON import is included:

- Bulk entry through forms is slow
- Importing structured records is useful when location datasets already exist

Why this specifically is helpful for this type of system:

- Location systems often start with spreadsheet or JSON-based data preparation
- Imports speed up initial onboarding of data

### 11.6 User Management

Files:

- `frontend/admin/pages/manage-users/manage-users.html`
- [frontend/admin/assets/js/manage-users.js](./frontend/admin/assets/js/manage-users.js)

Responsibilities:

- list all users
- promote and demote users
- activate and deactivate users
- delete users

Why this page is limited to superadmins:

- Role and account controls are high-impact actions
- They should not be available to standard users

## 12. Map View Frontend

Files:

- [frontend/map-view/pages/index.html](./frontend/map-view/pages/index.html)
- [frontend/map-view/assets/js/map.js](./frontend/map-view/assets/js/map.js)

Responsibilities:

- initialize the Leaflet map
- switch between road and satellite tile layers
- fetch locations from the API
- render markers
- build category filter buttons dynamically
- search for locations by name
- zoom to matching locations

Why this is separated from the admin UI:

- Viewing and managing data are different workflows
- A map interface often needs a cleaner, less form-heavy experience
- Separation makes it easier to expose the map without exposing admin tools

### Why GeoServer WMTS Layers Are Used

The map uses WMTS tiles from a GeoServer endpoint for both satellite and road views.

Why this is useful:

- It allows integration with organization-specific geospatial imagery
- It avoids depending entirely on public basemap providers
- It can reflect a custom geospatial stack already used elsewhere

Why this specifically instead of default OpenStreetMap tiles:

- It suggests the project is intended to work with controlled or domain-specific spatial data sources
- It gives more flexibility if the organization already hosts its own layers

## 13. Authentication and Authorization Design

The current implementation separates authentication from authorization in a very lightweight way.

### Authentication

- Users log in with email and password
- Passwords are verified against bcrypt hashes
- The login response includes basic identity data

### Session Handling

- The frontend stores `token`, `name`, `email`, and `role` in `localStorage`
- Pages check whether expected values exist and redirect if not

### Authorization

- Superadmin routes rely on client-supplied headers such as `role: superadmin`
- Some actions also use `current-user-email`

Why this approach might have been used:

- It is simple
- It helps prototype user separation quickly
- It avoids adding JWT handling before core CRUD flows are working

Why this is not sufficient for production:

- The browser can modify headers and local storage values
- There is no cryptographic verification of identity
- The backend trusts the client more than it should

## 14. Data Flow Through the System

### Example: Add Location

1. A user fills the location form in the admin dashboard.
2. The frontend validates latitude and longitude range.
3. The frontend sends a `POST /locations` request.
4. FastAPI validates the request body with `LocationSchema`.
5. SQLAlchemy creates a new `Location` row.
6. PostgreSQL stores the row.
7. The frontend reloads the location list.

### Example: Show Locations on the Map

1. The map page loads.
2. Leaflet initializes the map container.
3. The page calls `GET /locations`.
4. The backend returns locations with category names.
5. The frontend converts each record into a Leaflet marker.
6. Markers are grouped by category for filtering.

### Example: Password Reset

1. The user submits their email on the forgot-password page.
2. The backend checks whether the email exists.
3. A token is created and stored in `password_reset_tokens`.
4. An email is sent with a reset URL containing the token.
5. The user opens the reset page and submits a new password.
6. The backend verifies the token and expiration, then updates the stored password hash.

## 15. Project Strengths

The current design has several practical strengths.

- The separation between backend and frontend is clear
- The feature set is easy to understand
- The codebase is beginner-friendly
- CRUD workflows are implemented directly without unnecessary abstraction
- The map-view and admin-view separation is a smart product decision
- Category-based filtering is handled consistently across admin and map surfaces
- Password hashing is implemented using a recognized library rather than plain text

## 16. Current Limitations and Technical Debt

This section is important because detailed documentation should describe not only intended design, but also the current state honestly.

### Security Limitations

- Database credentials are read from environment variables
- SMTP credentials are read from environment variables
- The login token is a placeholder string, not a real signed access token
- Authorization relies on client-controlled headers and browser storage
- CORS must be configured carefully for deployed environments

### Configuration Limitations

- Runtime secrets depend on local `.env` values or deployment environment variables
- API URLs are hardcoded in frontend JavaScript
- Deployment environments require appropriate environment-variable configuration

### Migration Limitations

- The initial Alembic migration does not create tables
- Migration history is not yet sufficient for guaranteed clean setup from scratch

### Maintainability Limitations

- Python dependencies are listed in `backend/requirements.txt`
- No automated test suite is present
- Some backend response shapes are ad hoc dictionaries rather than consistent response schemas
- Database session dependency code is repeated across router files

### Frontend Limitations

- State management is manual and page-local
- Shared UI behavior is not abstracted
- Error handling is basic
- There is no frontend routing, bundling, or modular component system

### Data Integrity Limitations

- Category deletion does not visibly enforce safeguards around linked locations
- Some validation is duplicated in frontend and backend rather than centralized in reusable patterns

## 17. Why These Tradeoffs Still Make Sense for an Early-Stage Project

Even though the current implementation has limitations, many of the choices are reasonable in an early-stage or educational project.

Why these choices make sense:

- A simple architecture helps features get built faster
- Plain JavaScript keeps the learning curve lower
- Simple environment-based configuration is enough for local development
- A lightweight login model can be enough to validate the UX before building secure auth infrastructure

In other words, the project is optimized more for working functionality and understandable code than for hardened production readiness.

## 18. Recommended Next Improvements

If this system is going to evolve further, these are the highest-value improvements.

### Security

- Keep database and SMTP credentials in environment variables
- Replace placeholder login tokens with JWT-based authentication
- Enforce authorization from server-side verified identity, not request headers
- Keep CORS restricted to trusted origins

### Deployment and Configuration

- Continue using `.env` locally and platform environment variables in deployment
- Keep `backend/requirements.txt` updated when dependencies change
- Centralize API base URLs for frontend environments

### Database and Data Modeling

- Repair the initial Alembic migration so a fresh database can be created cleanly
- Add foreign key deletion rules intentionally
- Consider created-at timestamps for auditability

### Backend Maintainability

- Centralize the database dependency
- Add shared response models
- Add service layers if the codebase grows significantly
- Add tests for auth, locations, categories, and user management

### Frontend Maintainability

- Extract shared utilities for API calls and session handling
- Improve error states and loading states
- Consider moving to a component-based frontend if UI complexity grows

## 19. How to Run the Project

### Backend Setup

From `backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### Database Configuration

Create a local `.env` file from the example file and set `DATABASE_URL`:

```powershell
cd ..
Copy-Item .env.example .env
notepad .env
cd backend
```

### Apply Migrations

From `backend`:

```powershell
alembic upgrade head
```

Important note:

- Because the initial migration is currently empty, migration behavior for a brand-new database may need correction before this is fully reliable

### Run the Backend

From `backend`:

```powershell
uvicorn app.main:app --reload
```

### Create the Initial Superadmin

From `backend`:

```powershell
python scripts/create_superadmin.py
```

Create local superadmin credentials in your `.env` file:

- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`

### Run the Frontend

From the repository root:

```powershell
python -m http.server 5500
```

Then open the relevant pages:

- Admin login: `http://127.0.0.1:5500/frontend/admin/pages/login/login.html`
- Admin home: `http://127.0.0.1:5500/frontend/admin/pages/home/home.html`
- Admin dashboard: `http://127.0.0.1:5500/frontend/admin/pages/dashboard.html`
- User management: `http://127.0.0.1:5500/frontend/admin/pages/manage-users/manage-users.html`
- Map view: `http://127.0.0.1:5500/frontend/map-view/pages/index.html`

## 20. File-by-File Purpose Summary

### Backend Core Files

- `backend/app/main.py`: FastAPI bootstrap and router registration
- `backend/app/models.py`: SQLAlchemy table definitions
- `backend/app/schemas.py`: request body validation
- `backend/app/core/database.py`: database engine and session creation

### Backend Router Files

- `backend/app/routers/auth_routes.py`: registration, login, password reset
- `backend/app/routers/category_routes.py`: category CRUD
- `backend/app/routers/location_routes.py`: location CRUD
- `backend/app/routers/user_routes.py`: superadmin user management

### Backend Utility Files

- `backend/scripts/create_superadmin.py`: seed initial superadmin account
- `backend/alembic/env.py`: Alembic migration environment
- `backend/alembic/versions/*.py`: schema history files

### Admin Frontend Files

- `frontend/admin/pages/login/login.html`: login screen
- `frontend/admin/pages/registration/registration.html`: account registration
- `frontend/admin/pages/home/home.html`: overview dashboard
- `frontend/admin/pages/dashboard.html`: location and category management
- `frontend/admin/pages/manage-users/manage-users.html`: superadmin user controls
- `frontend/admin/pages/reset/*.html`: forgot/reset password flows
- `frontend/admin/assets/js/*.js`: page-specific behavior
- `frontend/admin/assets/css/*.css`: page-specific styling
- `frontend/admin/assets/data/*.json`: sample import files

### Map Frontend Files

- `frontend/map-view/pages/index.html`: map page
- `frontend/map-view/assets/js/map.js`: map behavior and filters
- `frontend/map-view/assets/css/*.css`: map layout and UI styling

## 21. Final Assessment

This project is a practical, understandable location management platform built with a stack that is appropriate for a small-to-medium internal application or an academic/project demonstration.

What it does well:

- clean separation of concerns
- sensible relational data model
- lightweight admin workflows
- map visualization of stored records
- straightforward development experience

Why the chosen technologies fit:

- FastAPI keeps backend development fast and explicit
- SQLAlchemy and PostgreSQL fit the relational CRUD nature of the data
- Alembic supports schema evolution
- Vanilla JavaScript keeps the frontend simple
- Leaflet is an efficient choice for map rendering

What needs attention before production:

- secure auth and authorization
- environment-based configuration
- reproducible dependency management
- migration reliability
- automated testing
