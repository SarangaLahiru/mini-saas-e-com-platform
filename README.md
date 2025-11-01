# Electronics Store - E-Commerce Platform

A modern, full-stack e-commerce platform built with React (Frontend) and Go/Gin (Backend).

## Features

- 🔐 User Authentication (Email/Password + Google OAuth)
- 🛍️ Product Management (Categories, Brands, Variants)
- 📦 Order Management with Payment Tracking
- 👥 Admin Dashboard with Analytics
- 🛒 Shopping Cart & Wishlist
- 📱 Fully Responsive Design
- 🎨 Modern UI/UX with Framer Motion

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- Framer Motion
- React Query
- React Router

### Backend
- Go 1.21+
- Gin Framework
- GORM
- MySQL
- JWT Authentication
- Google OAuth

## Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- MySQL 8.0+
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "mini saas - e-com test"
```

### 2. Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE electronics_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Run schema:
```bash
mysql -u root -p electronics_store < backend/database/schema.sql
```

3. Run migrations:
```bash
mysql -u root -p electronics_store < backend/database/migrations/001_fix_google_id_null.sql
```

4. (Optional) Seed sample data:
```bash
mysql -u root -p electronics_store < backend/database/seed.sql
```

**Default Admin Credentials** (from seed.sql):
- Email: `admin@electronicsstore.com`
- Password: `password123`

### 3. Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy environment file:
```bash
copy env.example .env  # Windows
# OR
cp env.example .env    # Linux/Mac
```

3. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=electronics_store

JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Install dependencies:
```bash
go mod download
```

5. Create uploads directories:
```bash
mkdir -p uploads/product uploads/category uploads/user
```

6. Run the server:
```bash
go run cmd/server/main.go
```

Backend will run on `http://localhost:8080`

### 4. Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Copy environment file:
```bash
copy env.example .env  # Windows
# OR
cp env.example .env    # Linux/Mac
```

3. Update `.env` with your backend URL:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

4. Install dependencies:
```bash
npm install
```

5. Run development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Project Structure

```
.
├── backend/
│   ├── cmd/
│   │   └── server/          # Application entry point
│   ├── database/
│   │   ├── schema.sql       # Database schema
│   │   ├── seed.sql         # Sample data
│   │   └── migrations/      # Database migrations
│   ├── internal/
│   │   ├── api/             # HTTP handlers
│   │   ├── config/          # Configuration
│   │   ├── domain/          # Domain models
│   │   ├── dto/             # Data transfer objects
│   │   ├── repository/      # Data access layer
│   │   └── usecase/         # Business logic
│   ├── uploads/             # Uploaded files (images)
│   └── env.example          # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── contexts/        # React contexts
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   └── utils/           # Utility functions
    └── env.example          # Environment variables template
```

## Important Files

### Database Files
- `backend/database/schema.sql` - Complete database schema
- `backend/database/seed.sql` - Sample data for development
- `backend/database/migrations/` - Database migration scripts

### Configuration Files
- `backend/env.example` - Backend environment variables template
- `frontend/env.example` - Frontend environment variables template
- `.gitignore` - Git ignore rules (includes uploads exclusion)

### Upload Directories
- `backend/uploads/product/` - Product images
- `backend/uploads/category/` - Category images
- `backend/uploads/user/` - User avatars

**Note:** Uploaded files are ignored by git, but directory structure is preserved via `.gitkeep` files.

## Development Workflow

1. **Database Changes**: Update `schema.sql` and create migration scripts in `backend/database/migrations/`
2. **Backend Changes**: Modify handlers, repositories, or usecases in `backend/internal/`
3. **Frontend Changes**: Update components or pages in `frontend/src/`

## API Documentation

API endpoints are available at:
- Base URL: `http://localhost:8080/api/v1`
- Admin endpoints: `http://localhost:8080/api/v1/admin/*`

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check `.env` database credentials
- Ensure database `electronics_store` exists

### Image Upload Issues
- Ensure `backend/uploads/` directories exist with write permissions
- Check file upload size limits in backend config

### Google OAuth Issues
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Check redirect URIs match in Google Console

## License

[Your License Here]

## Contributing

[Contributing Guidelines Here]