# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JDU Tosho is a library management system for JDU (Jizzakh State University) that handles book rentals for students and librarians. The project uses a modern web stack with separate frontend and backend applications.

## Technology Stack

### Backend
- **Framework**: Laravel 12.0 with PHP 8.4
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum (JWT-based)
- **Testing**: Pest PHP
- **API Documentation**: HTTPie collection at `backend/httpie-collection-jdutosho.json`

### Frontend
- **Framework**: Remix 2.13.1 with React 18.2
- **Build Tool**: Vite with TypeScript
- **Package Manager**: Bun (NOT npm - always use `bun` commands)
- **UI Components**: Radix UI primitives with custom components
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation

## Essential Commands

### Backend Development
```bash
cd backend
composer install              # Install PHP dependencies
cp .env.example .env         # Setup environment (configure database)
php artisan key:generate     # Generate app key
php artisan migrate          # Run database migrations
php artisan db:seed          # Seed with sample data
php artisan serve            # Start server (http://localhost:8000)
php artisan test             # Run all tests
php artisan test --filter=BookControllerTest  # Run specific test
```

### Frontend Development
```bash
cd frontend
bun install                  # Install dependencies (USE BUN, NOT NPM)
bun run dev                  # Start dev server (http://localhost:5173)
bun run build               # Build for production
bun run typecheck           # Run TypeScript checks
bun run fix                 # Format and lint code
```

## Architecture Overview

### Backend Structure
```
backend/
├── app/
│   ├── Http/Controllers/    # API endpoints (Auth, Book, Rent, Student, etc.)
│   ├── Models/             # Eloquent models (User, Book, Rent, Category)
│   ├── Http/Requests/      # Form validation classes
│   └── Http/Resources/     # API response transformers
├── routes/api.php          # All API routes
├── database/migrations/    # Database schema
└── tests/Feature/         # Comprehensive API tests
```

### Frontend Structure
```
frontend/
├── app/
│   ├── routes/            # Remix route files (file-based routing)
│   ├── components/        # Reusable components
│   │   ├── ui/           # Base UI primitives (button, dialog, etc.)
│   │   └── book-table/   # Complex table components
│   ├── lib/              # Utilities and API client
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
```

## Key Development Patterns

### API Endpoints
All API routes are prefixed with `/api` and use Laravel Sanctum authentication:
- `POST /api/login` - User authentication
- `GET /api/books` - List books (with filters, search, pagination)
- `POST /api/books` - Create book (librarian only)
- `POST /api/books/bulk` - Bulk import via CSV
- `POST /api/rents` - Create rental
- `PUT /api/rents/{id}/return` - Return book

### Frontend Routing
Remix uses file-based routing in `app/routes/`:
- `_index.tsx` - Home page
- `dashboard.tsx` - Layout wrapper
- `dashboard.books.tsx` - Book management
- `dashboard.students.tsx` - Student management

### State Management
- Server state: TanStack Query for caching and synchronization
- Form state: React Hook Form with Zod schemas
- UI state: Local React state and context

### Authentication Flow
1. User logs in via `/api/login`
2. Backend returns JWT token
3. Frontend stores token in session storage
4. Token included in all API requests via `Authorization: Bearer {token}`

## Important Configuration

### Environment Variables
Backend `.env` must include:
```
DB_CONNECTION=mysql
DB_DATABASE=jdutosho
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
FRONTEND_URL=http://localhost:5173
```

### OAuth Setup (Optional)
The system supports OAuth providers but credentials should NEVER be committed:
- Google OAuth configured in `.env`
- Facebook OAuth configured in `.env`
- Provider URLs configured in `config/services.php`

## Testing Guidelines

### Backend Testing
```bash
php artisan test                    # Run all tests
php artisan test --parallel        # Run tests in parallel
php artisan test tests/Feature/BookControllerTest.php  # Specific file
```

Test structure follows Laravel conventions:
- Feature tests for API endpoints
- Unit tests for models and services
- Database transactions for test isolation

### Frontend Testing
Type checking is the primary testing method:
```bash
bun run typecheck
```

## Common Development Tasks

### Adding a New API Endpoint
1. Create controller method in `backend/app/Http/Controllers/`
2. Add route in `backend/routes/api.php`
3. Create form request validator if needed
4. Add feature test in `backend/tests/Feature/`
5. Update HTTPie collection

### Adding a New Page
1. Create route file in `frontend/app/routes/`
2. Add navigation link if needed
3. Create necessary components
4. Add API integration using TanStack Query
5. Update TypeScript types

### Working with Books
- Books have unique codes for inventory tracking
- PDF uploads stored in `backend/storage/app/public/pdfs/`
- Bulk import accepts CSV with: title, author, isbn, category, quantity, codes

### Role-Based Access
Three user roles with different permissions:
- **Admin**: Full system access
- **Librarian**: Manage books, students, rentals
- **Student**: View books, manage own rentals

## Recent Feature Additions

1. **Book Code Management**: Individual inventory tracking with unique codes
2. **Bulk Import**: CSV upload for multiple books
3. **Quick Add Form**: Streamlined book entry
4. **PDF Management**: Upload and preview book PDFs
5. **Enhanced Returns**: Improved rental return workflow
6. **Available Codes View**: Track unassigned book codes

## HTTPie API Collection

A comprehensive API testing collection is available at `backend/httpie-collection-jdutosho.json`. Import this into HTTPie Desktop for easy API testing with pre-configured:
- Environment variables for local/production
- Authentication headers
- Sample request bodies
- All API endpoints documented

## Development Tips

1. Always use `bun` instead of `npm` for frontend commands
2. Run `bun run fix` before committing frontend changes
3. Keep the HTTPie collection updated when adding new endpoints
4. Test role-based access for new features
5. Use the existing UI components in `frontend/app/components/ui/`
6. Follow the established patterns for data tables and forms