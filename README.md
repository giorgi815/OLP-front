# OLP Frontend

A standalone, Angular 20 + TypeScript frontend, built against the provided **Online-learning-platform-master (3).zip** ASP.NET Core 10 backend. It uses the backend's actual controllers and DTOs; there is **no mock API and no seeded fake course data**.

## What's included

| Area | Included workflows |
| --- | --- |
| Public | Landing page, searchable courses, category filters, course details, public reviews |
| Authentication | Student/teacher registration, login, email confirmation, resend confirmation API, forgot/reset password (links via backend), JWT refresh and logout |
| Student | Enroll in free course, simulated paid checkout and confirmation, dashboard, enrolled lessons, teacher-checked progress, assignments, submission uploads, grades, reviews, certificate issuance |
| Teacher | View owned courses, create/edit course, publish, add/edit/delete lessons and assignments, upload lesson attachments, see enrolled students, mark specific students' lessons completed, grade and review submissions |
| Admin | View statistics and user profiles, create/edit/delete categories, grant teacher role by **Identity User GUID**, send notifications |
| Shared | Profile editing, change password, avatar upload, notifications, printable certificate view, responsive layout, error messages, navigation guards |

## Requirements

- Node.js 22 LTS+ and npm
- Your OLP API running and reachable at `http://localhost:8088` (the Docker Compose mapping from the OLP discussion)
- Redis and SQL Server configured for the ASP.NET Core API

## Quick start (Windows / Visual Studio Code)

1. Extract this package into your **OLP solution root**, so your solution has a sibling folder `olp-frontend` next to `OLP`, `OLP.Application`, `OLP.Domain`, and `OLP.Infrastructure`.
2. Open the `olp-frontend` folder in VS Code.
3. Run:

   ```powershell
   npm install
   npm start
   ```

4. Open **http://localhost:4200**.
5. Verify the API is running at **http://localhost:8088/swagger**. The `proxy.conf.json` forwards requests from Angular's `/api` to Docker's API, avoiding browser CORS problems during development.

If your API runs on another port, change `target` in **proxy.conf.json**, not every service.

**New Docker database note:** If your Docker SQL Server has only newly seeded users and roles, the course catalog may be empty until you create/publish courses or restore your existing Windows database. The frontend never fabricates catalog data.

## Check the frontend

After `npm install`, run `npm run check` for TypeScript checking and an Angular production build. The full build was not possible in the generation environment because the npm registry was unreachable.

## Frontend inside Docker (optional)

After extracting `olp-frontend` to the solution root, with Docker Compose already running your OLP API, SQL Server and Redis:

```powershell
# From the main OLP solution directory
# Existing compose files + additional frontend service:
docker compose -f docker-compose.yml -f docker-compose.override.yml -f olp-frontend/docker-compose.frontend.yml up -d --build
```

Open http://localhost:4200. Nginx serves the compiled app and forwards `/api/` to the OLP API service at `http://olp:8080`. It requires no public CORS relaxation. For real hosting, put both frontend and API behind HTTPS and a trusted reverse proxy.

### Important: keep your existing Docker secrets safe

The Angular frontend must **never** contain `MSSQL_SA_PASSWORD`, admin passwords, JWT signing keys, email passwords, or any other `.env` secrets. Those belong only to the backend Compose configuration. Don't commit the backend `.env` to Git.

## Authentication flow

- `POST /api/auth/register/student` and `/register/teacher` create the role-bearing account; confirmation email comes from the backend.
- Login stores the access/refresh tokens in **browser sessionStorage**, not source files or localStorage. Role navigation is derived from the JWT role claim, while the real backend handles all authorization.
- When a protected request returns HTTP 401, the HTTP interceptor makes one refresh attempt with `POST /api/auth/refresh` and retries the request.
- `GET /api/users/me` resolves the logged-in person's **Domain User ID**. This is deliberately different from the ASP.NET Identity ID in `AspNetUsers`.
- The confirmation route `/confirm-email?userId=...&token=...` uses an explicit POST to your backend. This avoids frontend links confirming on passive page loads. **However, your current backend emails a direct GET link to `/api/auth/confirm-email` on the API host**. That existing link still works; see the backend integration note below if you want emails to land on the Angular confirmation page.
- The `/reset-password?userId=...&token=...` route sends POST to the backend on form submission.

**Production security:** browser JavaScript-held tokens are vulnerable to XSS. Consider moving to Secure/HttpOnly/SameSite cookies with a backend-for-frontend if production exposure or risk warrants it. Use HTTPS everywhere.

## Backend-specific design details

- Course `duration` is an integer with no unit specified in the provided DTO; this frontend displays it as minutes as a presentation convention. Change labels if your project defines another unit.
- Course `status` is numeric: `1` Draft and `2` Published.
- A teacher's **Domain User ID** is used in `/api/courses/by-teacher/{teacherId}`. This isn't `/api/courses/mine` because that endpoint doesn't exist in the source.
- Only an admin can send notifications (`POST /api/notifications`).
- Students may **read** their progress but cannot mark completion. Teachers use `POST /api/progress/complete-by-teacher` with `{ lessonId, studentId }` (both domain IDs).
- Teacher course enrollment list comes from `/api/enrollments/courses/{courseId}/students`. `studentId` is a Domain User GUID.
- Admin teacher-role endpoint instead needs the Identity account GUID: `/api/admin/users/{targetUserId}/teacher-role`. The backend's user listing exposes Domain User IDs only, so the UI explicitly asks for the Identity GUID and explains how to get it in SSMS.
- A paid-course checkout is **mock only** in development; this frontend calls checkout, then confirmation, then enrollment. No real funds move.
- Certificate records are fetched by ID after issuing; the backend has no `/certificates/mine` endpoint.
- Lesson and submission attachment uploads send multipart form field `file`, and downloads use the attachment `key` query parameter.
- The backend's admin `GET /api/users` returns profile information without emails, so the admin table does not fabricate email fields.

## Suggested local test journey

1. Open course catalog. Published courses should be visible.
2. Register a student, confirm the email via link and log in.
3. Enroll in a free course; paid courses use **development mock checkout** only.
4. Open **My dashboard → Continue** to view lessons and assignments.
5. Submit an assignment; switch to teacher to review submissions and add a grade.
6. With teacher login, open **Teaching studio** to add lessons, mark a specific enrolled student's lesson complete, and publish a course.
7. Back as student, refresh learning progress and request a certificate after every lesson is complete.
8. With admin login, manage course categories and send a notification.

## Project map

```text
olp-frontend/
  src/
    app/
      core/       api.service.ts, auth.service.ts, interceptor, guards, typed DTOs
      shared/     course-card, side-nav, HTTP error/download helpers
      pages/      matching .ts logic + .html templates for each feature page
      app.routes.ts
      app.component.ts
    styles.css     design system and responsive CSS
  proxy.conf.json  local Angular -> Docker API proxy
  Dockerfile       Angular build to Nginx
  nginx.conf       SPA + /api reverse proxy
  docker-compose.frontend.yml   optional Compose addition
```

## Notes and limitations

- The supplied backend archive had controllers and DTOs but **no separate Angular UI design specification**. The visual design is an original responsive implementation guided by its features and API.
- A full `npm install`/`ng build` verification was **not possible in the generation environment**, which could not access npm registry. Install packages locally; if your Angular CLI reports a version compatibility warning, use the package versions defined in `package.json` or adjust them together to a compatible Angular release.
- **Critical email-link integration:** `AuthService.BuildEmailLink()` in the supplied backend actually uses `Api:BaseUrl`, not `Frontend:BaseUrl`. Confirmation email links currently point directly to the backend GET `/api/auth/confirm-email`. Reset email links point to `<Api:BaseUrl>/reset-password` (which is **not an API endpoint**, so it can 404). To route both flows through Angular, update `AuthService` to use `Frontend:BaseUrl` for Angular `/confirm-email` and `/reset-password` pages and keep the Angular form invoking the POST endpoints. Set `Frontend__BaseUrl=http://localhost:4200` in your backend Compose configuration, and ensure the backend receives it. See `backend-integration.md` for an exact suggested patch.
- The teacher management view gets draft courses via `GET /api/courses/by-teacher/{domainTeacherId}` because the public `GET /api/courses/{id}` only returns published courses.
- For grading, course creation, and completion to work, accounts must have correct seeded roles and be confirmed.
- Angular guards are convenience only. The API's `[Authorize]` remains the security boundary.
