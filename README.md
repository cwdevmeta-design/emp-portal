# Employee Management Portal

A comprehensive portal for managing employee attendance, EOD (End of Day) updates, leave requests, and reports. Built with a modern tech stack and designed for reliability and ease of deployment.

## 🚀 Features

- **Attendance Management**: Track daily check-ins and check-outs.
- **EOD Updates**: Simple interface for employees to submit daily progress reports.
- **Leave Management**: Submit and track leave requests with manager approval workflows.
- **Notifications**: Stay updated with important announcements and status changes.
- **Reporting**: Generate and export reports for administrative use.
- **OAuth Integration**: Secure login using Google and Microsoft accounts.

## 🛠 Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS, Lucide React, Vite.
- **Backend**: Node.js, Express, Sequelize (MySQL), Passport.js (OAuth).
- **Database**: MySQL.
- **Process Management**: PM2 with Ecosystem config.
- **Web Server**: Nginx.

## 📦 Project Structure

```text
├── backend/            # Express.js API
├── frontend/           # React SPA
├── nginx.conf          # Nginx production configuration
├── deploy.sh           # Automated deployment script for VPS
├── ecosystem.config.js # PM2 process management configuration
└── troubleshoot.sh     # Diagnostic tool for VPS issues
```

## 🛠 Local Setup

### Prerequisites
- Node.js (v18+)
- MySQL

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/employee-portal.git
   cd employee-portal
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Environment Configuration**:
   - Create a `.env` file in the `backend/` directory based on `.env.production.example`.
   - Create a `.env` file in the `frontend/` directory based on `.env.production`.

4. **Run in development mode**:
   ```bash
   npm start
   ```

## 🌐 Deployment (Hostinger/VPS)

This project is optimized for deployment to a VPS using Nginx and PM2.

### Quick Deploy
1. Ensure your Nginx Vhost is configured to point to the `frontend/dist` directory.
2. Run the deployment script:
   ```bash
   bash deploy.sh
   ```

See [DEPLOYMENT_README.md](./DEPLOYMENT_README.md) for detailed step-by-step instructions.

## 📄 License
Internal use only.
# emp-portal
