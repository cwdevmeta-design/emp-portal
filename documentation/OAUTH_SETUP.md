# OAuth Configuration Guide

## 1. Google OAuth Client ID & Secret
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "Employee Portal").
3. Navigate to **APIs & Services** > **OAuth consent screen**.
   - Select **External** (unless you have a Google Workspace organization).
   - Fill in the App Name, User Support Email, and Developer Contact Info.
   - Click "Save and Continue".
4. Navigate to **Credentials**.
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: "Employee Portal Web".
   - **Authorized JavaScript origins**: `http://localhost:5173` (Frontend).
   - **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback` (Backend).
5. Copy the **Client ID** and **Client Secret**.

## 2. Microsoft OAuth Client ID & Secret
1. Go to the [Azure Portal](https://portal.azure.com/).
2. Search for **App registrations** and select it.
3. Click **+ New registration**.
   - Name: "Employee Portal".
   - Supported account types: **Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts** (e.g. Skype, Xbox).
   - Redirect URI (Select **Web**): `http://localhost:5000/api/auth/microsoft/callback`.
   - Click **Register**.
4. Copy the **Application (client) ID** from the Overview page.
5. Navigate to **Certificates & secrets** (left sidebar).
   - Click **+ New client secret**.
   - Description: "App Secret".
   - Expires: Select roughly how long you want it valid (e.g. 6 months).
   - Click **Add**.
6. **IMPORTANT**: Copy the **Value** of the client secret immediately (you won't see it again).

## Note on Redirect URIs
These URIs assume the default ports:
- Frontend: `5173` (Vite)
- Backend: `5000` (Express)

If you change ports later, you must update these in the respective consoles.
