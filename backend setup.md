# SafeWalk Backend API

Node.js + Express + MySQL backend with JWT authentication and Multer-based profile photo uploads.

## Tech Stack

- Node.js
- Express.js
- MySQL (using `mysql2` pool)
- JWT authentication
- Multer for profile photos
- bcrypt for password hashing

## Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Create MySQL database and tables**

   - Open `database.sql` in your MySQL client.
   - Run the script to create the `safewalk` database, `users`, and `contacts` tables.

3. **Configure environment variables**

   - Copy `.env.example` to `.env`.
   - Update values (especially `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET`).

4. **Run the server**

   ```bash
   npm run dev
   # or
   npm start
   ```

   The API will run on `http://localhost:5000` (or the `PORT` you set).

## API Overview

Base URL: `http://localhost:5000`

### Auth

- **Register**
  - `POST /api/auth/register`
  - `multipart/form-data`
  - Fields: `name`, `email`, `mobile`, `password`, `profile_photo` (file, optional)

- **Login**
  - `POST /api/auth/login`
  - JSON body: `{ "email": "...", "password": "..." }`
  - Response includes a JWT token.

### Contacts (Protected)

All contact routes require `Authorization: Bearer <token>` header from login.

- **Add contact**
  - `POST /api/contacts/add`
  - JSON body: `{ "contact_name": "...", "contact_number": "..." }`

- **Get contacts**
  - `GET /api/contacts`

All responses are JSON with shape:

```json
{
  "success": true,
  "message": "Some message",
  "data": {}
}
```

