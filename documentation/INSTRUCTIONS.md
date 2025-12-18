# Employee Management Portal – Build Guide

Clean, stepwise plan to build the portal.

## Tech Stack
- Frontend: React (Vite), Redux Toolkit or Zustand, React Router, Tailwind or MUI, Axios.
- Backend: Node.js + Express, MySQL (ORM/query builder), JWT auth.
- Auth: Microsoft Outlook OAuth, Google Gmail OAuth.
- Infra: Docker, Nginx reverse proxy, PM2.

## Environment Setup
1) Backend: `cd backend && npm install && npm run dev`.
2) Frontend: `cd frontend && npm install && npm run dev`.
3) Backend .env: `MYSQL_URL`, `JWT_SECRET`, OAuth client IDs/secrets, mail sender.
4) Production: `npm run build` then restart the app with PM2.

## Build Order (Status Update)
1) **Foundation** – [x] Env config, logging, error handler, DB connection, folder layout; Axios interceptors.
2) **Auth & Roles** – [x] Google/Microsoft OAuth (Simulated/Ready); JWT access+refresh tokens; RBAC (Admin/Manager/Employee).
3) **User & Role Admin** – [x] CRUD users; assign roles/designations. *(Pending: Advanced Filters, Team Hierarchy visualization)*.
4) **Attendance** – [x] Daily Check-in (WFO/WFH/Leave); 11 AM cutoff; Admin Dashboard. *(Pending: CSV Export)*.
5) **EOD Updates** – [x] Daily Task Logging; Manager Views. *(Pending: Attachments, Calendar View, CSV Export)*.
6) **Leaves, WFH & Permissions** – [x] Application & Approval Workflow; Email Notifications. *(Pending: Leave Balances, Conflict Checks)*.
7) **Notifications** – [x] In-App Bell; Email (SMTP) on Events. *(Pending: Cron Jobs/Scheduled Reminders)*.
8) **Dashboards & Reports** – [x] Analytics Cards; Monthly Attendance Heatmap.
9) **Polish & Hardening** – [x] Mobile Responsiveness; Semantic Colors; Profile Dropdown. *(Pending: Joi/Zod Validation, Audit Trails)*.

## Data Model (core tables)
- Users: name, email, role, department, manager_id, join_date, avatar, status.
- EOD Updates: user_id, date, project, description, attachments, submitted_at.
- Attendance: user_id, date, status (WFO/WFH/Leave), isLocked.
- Leave Requests: user_id, type, date_from, date_to, reason, status, manager_comments.

## UI Colors
- Primary `#E62F30`, Primary Dark `#dd4747`, Secondary `#0583d8`, Secondary Dark `#0575c1`.
- Dark `#000000`, Light `#ffffff`, Cream `#fff8eb`, Light Grey `#d3d3d3`, Dark Grey `#777777`, Half White `#f8f8f8`.
- Green `#45c998`, Transparent Red `#fff0f0`.
- Attendance: Green=WFO, Blue=WFH, Red=Leave.

## Coding Standards
- Backend: MVC, async/await, centralized errors, validated inputs, config via .env.
- Frontend: reusable components, global state for auth/user/session, React Router guards.
- Naming: flat translation keys; one language file per locale.
- Styles: use external CSS/Tailwind/MUI; avoid inline styles.

## Deployment Notes
- Dockerize; Nginx with HTTPS for OAuth.
- Run with PM2; restart after each build.
- Use managed MySQL; add backups and monitoring.

## Future Enhancements
- AI EOD summaries, attendance anomaly detection, productivity scoring.
- Mobile app (React Native), face-recognition attendance.

