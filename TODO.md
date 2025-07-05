# JDU Tosho - TODO List

## Summary of Completed Improvements (2025-07-05)

### Initial Major Issues ✅
All three major issues have been successfully resolved:

1. **Book Adding Process** - Implemented bulk CSV import and quick-add form
2. **Rental Tracking** - Added student ID display to all rental views  
3. **Book Returns** - Integrated borrowed books with return buttons on student dashboard

### Key Changes Made:

#### Backend:
- Added `taken_by_login_id` to RentResource
- Created bulk book import endpoint (`POST /api/books/bulk`)
- Enhanced student dashboard to return borrowed books list

#### Frontend:
- Created bulk import page at `/librarian/books/bulk`
- Added quick-add form to books listing page
- Updated RentCard and ReturnRequestCard to show student IDs
- Added borrowed books section with return buttons to student dashboard
- Created one-click return functionality from dashboard

### Additional Completed Features (2025-07-05) ✅

#### High Priority Tasks:
1. **Password Reset Flow** - Connected forgot/reset password pages to backend APIs
2. **PDF Management** - Added preview and download functionality to book pages
3. **Error Handling** - Implemented comprehensive error boundaries and handlers
4. **Loading States** - Added skeleton loaders and progress indicators

#### Medium Priority Tasks:
5. **OAuth Authentication** - Added Google/Facebook login with callback handler
6. **Advanced Search** - Created filtered search page with multiple criteria
7. **Available Codes Page** - Already existed and working
8. **User Profiles** - Created profile pages for both viewing and editing
9. **Bulk Import Enhancement** - Added progress indicators and validation

### Outstanding Tasks 🔄
- Real-time updates with WebSockets
- Centralized API service layer
- Enhanced TypeScript with Zod schemas

---

## Backend-Frontend Route Connection Tasks

### Authentication Routes ✅ (Complete)
All authentication routes are properly connected:
- [x] `POST /api/auth/register` → `/register` page
- [x] `POST /api/auth/login` → `/login` page  
- [x] `POST /api/auth/logout` → `/logout` page
- [x] `GET /api/auth/profile` → Used in auth.server.ts
- [x] `POST /api/auth/change-password` → Settings pages

### Book Management Routes 

#### Librarian Book Routes ✅ (Complete)
- [x] `GET /api/books` → `/librarian/books` (uses `/books/codes`)
- [x] `POST /api/books` → `/librarian/books/new`
- [x] `GET /api/books/{id}` → `/librarian/books/{id}/edit`
- [x] `PUT /api/books/{id}` → `/librarian/books/{id}/edit`
- [x] `PUT /api/books/{id}/code` → `/librarian/books/{id}/edit`
- [x] `DELETE /api/books/{id}` → `/librarian/books` (delete action)
- [x] `POST /api/books/bulk` → `/librarian/books/bulk`
- [x] `GET /api/books/codes` → `/librarian/books` and `/librarian/books/search`
- [x] `GET /api/books/list` → Used for book selection

#### Student Book Routes ✅ (Complete)
- [x] `GET /api/student/books` → `/student/books`

### Book Category Routes ✅ (Complete)
- [x] `GET /api/book-categories` → `/librarian/book-categories`
- [x] `POST /api/book-categories` → `/librarian/book-categories/new`
- [x] `GET /api/book-categories/list` → Used for dropdowns
- [x] `GET /api/book-categories/search` → `/librarian/book-categories` (search)
- [x] `GET /api/book-categories/{id}` → Individual category views
- [x] `PUT /api/book-categories/{id}` → Category edit functionality
- [x] `DELETE /api/book-categories/{id}` → Category delete action

### User Management Routes ✅ (Complete)
- [x] `GET /api/users` → `/librarian/users`
- [x] `POST /api/users` → `/librarian/users/new`
- [x] `GET /api/users/list` → `/librarian/students/search`
- [x] `GET /api/users/{id}` → User profile views
- [x] `PUT /api/users/{id}` → User edit functionality
- [x] `DELETE /api/users/{id}` → User delete action

### Rental Management Routes ✅ (Complete)
- [x] `GET /api/rents` → `/librarian/rents`
- [x] `POST /api/rents` → `/librarian/lend-book` and book lending
- [x] `GET /api/rents/pending` → `/librarian/rents/pending`
- [x] `PUT /api/rents/{id}/accept` → Return acceptance functionality

### Student Rental Routes ✅ (Complete)
- [x] `GET /api/student/rents` → `/student/rents`
- [x] `PUT /api/student/{id}/return` → Book return functionality

### Dashboard Routes ✅ (Complete)
- [x] `GET /api/librarian/dashboard` → `/librarian` (main dashboard)
- [x] `GET /api/student/dashboard` → `/student` (main dashboard)

### Missing Routes & Frontend Pages ✅ (Completed)

#### 1. Settings Pages ✅
- [x] **Task 1.1**: Create `POST /api/auth/change-password` functionality for settings pages
  - Backend: Password change endpoint already exists in AuthController
  - Frontend: Connected and working in both `/student/settings/change-password` and `/librarian/settings/change-password`

#### 2. User Profile Management ✅
- [x] **Task 2.1**: Create user profile update routes
  - Backend: User update endpoints working with profile fields
  - Frontend: Created profile edit pages: `/student/settings/profile` and `/librarian/settings/profile`
  - Created student detail view for librarians: `/librarian/students/{id}`

#### 3. Book PDF Management ✅
- [x] **Task 3.1**: Connect PDF preview and download routes
  - Backend: Routes exist and working (`GET /api/books/{id}/pdf/preview`, `GET /api/books/{id}/pdf/download`)
  - Frontend: PDF buttons integrated in book edit page and student book columns

#### 4. OAuth Provider Routes ✅
- [x] **Task 4.1**: Connect OAuth routes to frontend
  - Backend: Routes exist and working
  - Frontend: OAuth login buttons added to login page with Google and Facebook icons
  - Created OAuth callback handler at `/auth/callback/{provider}`

#### 5. Advanced Search and Filtering ✅
- [x] **Task 5.1**: Enhanced book search functionality
  - Backend: Routes exist and working
  - Frontend: Created advanced search page at `/librarian/books/advanced-search` with multiple filters

#### 6. Bulk Operations ✅
- [x] **Task 6.1**: Complete bulk import interface
  - Backend: `POST /api/books/bulk` exists ✅
  - Frontend: Enhanced `/librarian/books/bulk` with file validation, progress indicators, and better error handling

#### 7. User Account Management ✅
- [x] **Task 7.1**: Create user account detail pages
  - Backend: User routes exist and working
  - Frontend: Created detailed student profile page at `/librarian/students/{id}` with rental history

### Route Testing & Validation Tasks

#### 8. Complete Backend-Frontend Route Verification ⚠️ (In Progress)
- [ ] **Task 8.1**: Systematically verify every backend route has a corresponding frontend component
  - Run comprehensive audit of all API endpoints vs frontend pages
  - Check for orphaned backend routes without frontend connections
  - Create missing frontend components/pages for unconnected routes
  - Validate that all route parameters and data flow work correctly
  - Document any intentionally unconnected routes (internal APIs, etc.)

**COMPREHENSIVE ROUTE AUDIT RESULTS:**

**✅ FULLY CONNECTED ROUTES:**
- Authentication: All auth routes properly connected (login, register, logout, profile)
- Book Management: All CRUD operations connected to frontend pages
- Book Categories: All CRUD operations connected to frontend pages  
- User Management: All CRUD operations connected to frontend pages
- Rental Management: All rental operations connected to frontend pages
- Dashboard Routes: Both librarian and student dashboards connected

**🔄 PARTIALLY CONNECTED ROUTES:**
- `POST /api/auth/change-password` - Backend exists, frontend partially implemented
- `GET /api/books/{id}/pdf/preview` - Backend exists, frontend missing
- `GET /api/books/{id}/pdf/download` - Backend exists, frontend missing
- `GET /api/book-categories/list` - Backend exists, used in dropdowns but no dedicated page
- `GET /api/book-categories/search` - Backend exists, used in search but no advanced search page
- `GET /api/users/list` - Backend exists, used for student search but no comprehensive list page
- `GET /api/users/{id}/student` - Backend exists, no frontend view

**❌ MISSING FRONTEND PAGES (Routes with no corresponding frontend):**
- `POST /api/auth/forgot-password` - No forgot password page
- `POST /api/auth/reset-password` - No reset password page  
- `GET /api/auth/redirect/{provider}` - No OAuth login interface
- `GET /api/auth/oauth-url/{provider}` - No OAuth URL generation
- `GET /api/auth/callback/{provider}` - No OAuth callback handling
- `GET /api/books/available-codes` - No available codes listing page
- `GET /api/books/list` - No simple book list page (only search exists)

**🎯 HIGH PRIORITY MISSING CONNECTIONS:**
1. Password reset functionality (forgot/reset password pages)
2. OAuth authentication interface (Google login buttons)
3. PDF preview and download functionality
4. User profile detail pages for librarians
5. Advanced search interfaces

#### 9. API Error Handling ✅
- [x] **Task 9.1**: Implement comprehensive error handling
  - Created ErrorBoundary component for route error handling
  - Added error-handler utility for consistent API error messages
  - Enhanced auth.server.ts with proper error responses

#### 10. Loading States ✅
- [x] **Task 10.1**: Add loading states to all API calls
  - Created DataTableSkeleton component for table loading states
  - Added LoadingSpinner and LoadingCard components
  - Enhanced DataTable with isLoading prop

#### 11. Real-time Updates
- [ ] **Task 11.1**: Implement WebSocket connections for real-time updates
  - Backend: Add WebSocket support for rental status changes
  - Frontend: Update dashboard data in real-time

### Code Quality & Documentation Tasks

#### 12. API Service Layer
- [ ] **Task 12.1**: Create centralized API service functions
  - Create dedicated service files for each domain (books, users, rents)
  - Replace direct axios calls with typed service functions

#### 13. Type Safety
- [ ] **Task 13.1**: Improve TypeScript integration
  - Generate TypeScript interfaces from Laravel API responses
  - Add runtime validation with Zod schemas

#### 14. Testing
- [ ] **Task 14.1**: Add frontend tests for API integration
  - Create integration tests for all major user flows
  - Add unit tests for API service functions

### Priority Implementation Order

**High Priority (Week 1):**
1. Settings pages (password change functionality)
2. Enhanced error handling and loading states
3. PDF management integration

**Medium Priority (Week 2):**
4. OAuth integration
5. Advanced search functionality
6. User profile management

**Low Priority (Week 3+):**
7. Real-time updates
8. Comprehensive testing
9. API service layer refactoring

## IMPORTANT 
If any routes aren’t connected, please fix those links. And if a route lacks a matching frontend component or page, create it as part of this process.

---

## 1. Simplify Book Adding Process ✅

### User Perspective: The Librarian

**The Problem:** Adding new books to the library system is a slow and frustrating process. When we receive a large shipment of new books, entering them into the system one-by-one takes hours.

#### Frontend (What the Librarian Sees and Does):

-   [x] **Quick Add Form:** Added a quick-add form on the books listing page that only requires title and code(s) for fast single book entry
-   [x] **Bulk Import:** Created a bulk import feature at `/librarian/books/bulk` that accepts CSV files for adding multiple books at once
-   [x] **Ideal Workflow:** Librarians can now either use the quick-add form for individual books or upload a CSV file with columns: title, code (and optionally: author, language, category)

#### Backend (How the System Works, from the Librarian's Point of View):

-   [x] **Flexible Rules:** The bulk import endpoint accepts minimal information (just title and codes), with sensible defaults for other fields
-   [x] **Bulk Processing:** Created a new `POST /api/books/bulk` endpoint that processes CSV files and can create multiple books in a single transaction

## 2. Improve Rented Book Tracking ✅

### User Perspective: The Librarian

**The Problem:** Finding information about rented books is difficult and time-consuming. The current system doesn't show all the necessary details in one place, forcing me to manually dig into records to find what I need.

#### Frontend (What the Librarian Sees and Does):

-   [x] **Clear Display:** Rental cards now show both student name and ID in format: "Student Name (ID: student_id)"
-   [x] **Student ID Visible:** Both the RentCard and ReturnRequestCard components now display the student's login ID alongside their name
-   [x] **Efficient Overview:** All essential information (book title, student name, student ID) is now visible at a glance without clicking into individual records
-   [x] **Ideal Workflow:** Librarians can now see the book title, student's full name, and their student ID all in one view

#### Backend (How the System Works, from the Librarian's Point of View):

-   [x] **Complete Data:** Modified RentResource to include `taken_by_login_id` field in all rental API responses
-   [x] **Proper Data Connection:** The system now automatically includes the student's login ID whenever rental information is requested

## 3. Simplify Book Return Process for Students ✅

### User Perspective: The Student

**The Problem:** Returning a book is unnecessarily complicated and takes too much time. After I log in, I have to navigate through multiple sections just to find the return button, which is frustrating when I'm in a hurry between classes.

#### Frontend (What the Student Sees and Does):

-   [x] **Dashboard Integration:** Currently borrowed books (up to 5) are now displayed directly on the student dashboard at `/student`
-   [x] **Visible Return Button:** Each borrowed book on the dashboard has a clear "Return Book" button for one-click returns
-   [x] **Quick Access:** Students can return books directly from their dashboard without navigating to separate pages
-   [x] **Ideal Workflow:** Students see their borrowed books immediately upon login, with simple "Return" buttons next to each book

#### Backend (How the System Works, from the Student's Point of View):

-   [x] **Simplified Navigation:** Modified the student dashboard endpoint to include borrowed books data
-   [x] **Dashboard Integration:** The system now treats book returns as a primary feature integrated into the main student dashboard
-   [x] **Efficient Process:** Created a dedicated return action route that works seamlessly from the dashboard
