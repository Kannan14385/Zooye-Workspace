# Zooye Workspace

Zooye Workspace is an internal web application built for **Zooye Info Technologies**, a company focused on building and maintaining WordPress websites.

The application gives the company one place to manage website projects, daily work, team members, reports, notifications, and role-based responsibilities.

## What It Includes

- Login-first access for Admin, HR, and Employee accounts
- Individual role-based dashboards
- WordPress project creation and management
- Daily task creation, assignment, status updates, and work logs
- Admin and HR project and task operations
- User onboarding with email OTP verification and admin approval
- User profile preferences and personal image upload
- Admin user management and credential approval requests
- Inbox notifications for assignments, deadlines, and status updates
- Email notification dispatch integration
- Thozha AI assistant for workspace questions and supported task commands
- Light and dark theme support
- SQLite workspace persistence foundation

## Roles

### Admin

The Admin has full workspace control, including projects, tasks, users, approvals, account credentials, and company oversight.

### HR Manager

HR can manage employees, create and assign daily work, manage projects and tasks, and review overall operational progress.

### Employee

Employees see their own dashboard, assigned daily work, progress updates, work logs, notifications, and account preferences.

## Technology

- React 19
- TypeScript
- Vite
- Express
- SQLite
- Tailwind CSS
- Recharts
- Google Gemini API integration for Thozha

## Run Locally

### Requirements

- Node.js 20 or newer
- npm

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and configure the optional Gemini API key. SMTP settings can also be added when real email delivery is enabled.

```env
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-company-email@example.com
SMTP_PASSWORD=your_smtp_app_password
SMTP_FROM=your-company-email@example.com
```

Never commit `.env`, API keys, SMTP passwords, or other credentials.

### Start the development server

```bash
npm run dev
```

The application runs at `http://localhost:3000`.

### Validate the project

```bash
npm run lint
npm run build
```

## Data Storage

The Express server initializes a SQLite database at `data/notion.sqlite`. Browser local storage currently keeps the active workspace snapshot, user state, notifications, and preferences for the local prototype.

## Company Purpose

This application was created as a practical internal operations system for Zooye Info Technologies. It is designed to help the team move from a client website request to project planning, daily assignment, employee execution, review, reporting, and completion in one organized workflow.
