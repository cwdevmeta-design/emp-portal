# Employee Portal Backend

The backend API for the Employee Management Portal, built with Node.js, Express, and Sequelize.

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Authentication**: Passport.js (Google & Microsoft OAuth), JWT
- **Email**: Nodemailer

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MySQL Server running

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Setup:
   - Copy `.env.production.example` to `.env`
   - Fill in your database credentials and OAuth keys:
     - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
     - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
     - `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
     - `JWT_SECRET`
     - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

4. Run the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📂 Structure

- `controllers/`: Request handlers and business logic.
- `models/`: Sequelize database models.
- `routes/`: API endpoint definitions.
- `services/`: External integrations (e.g., Email).
- `config/`: Configuration for database and passport.

## 📄 License
Internal use only.
