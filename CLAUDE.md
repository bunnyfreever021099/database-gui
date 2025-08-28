# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Database GUI Application** built with SvelteKit, PostgreSQL, TailwindCSS, and DaisyUI. It provides a web-based interface for database management with features like SQL querying, table viewing, and CRUD operations.

## Development Commands

```bash
# Development server
npm run dev
npm run dev -- --open  # Open in browser

# Type checking and linting
npm run check           # Type check
npm run check:watch     # Type check in watch mode
npm run lint           # Lint code
npm run format         # Format code

# Testing
npm run test           # Run all tests
npm run test:e2e       # Run E2E tests with Playwright

# Build for production
npm run build
npm run preview        # Preview production build
```

## Architecture & Tech Stack

### Core Technologies
- **Framework**: SvelteKit (with TypeScript)
- **Database**: PostgreSQL with `pg` driver
- **UI Framework**: TailwindCSS v4 + DaisyUI
- **SQL Editor**: Monaco Editor (VSCode editor for web)
- **Testing**: Playwright for E2E testing

### Project Structure
```
src/
├── lib/                    # Shared utilities and components
│   ├── components/         # Reusable Svelte components
│   ├── stores/            # Svelte stores for state management
│   ├── utils/             # Database utilities and helpers
│   └── types/             # TypeScript type definitions
├── routes/                # SvelteKit routes (pages and API)
│   ├── api/               # API endpoints
│   │   └── query/         # SQL query execution endpoint
│   ├── auth/              # Authentication pages
│   ├── tables/            # Table management pages
│   └── +layout.svelte     # Root layout
└── app.css               # Global styles (TailwindCSS imports)
```

### Key Features
1. **SQL Query Editor**: Monaco Editor with syntax highlighting and autocompletion
2. **Table Viewer**: Interactive data tables with pagination, sorting, and filtering
3. **CRUD Operations**: Create, Read, Update, Delete with modal forms
4. **Authentication**: Role-based access control (Admin/Read-only)
5. **Export/Import**: CSV and JSON export, CSV import functionality
6. **Theme Support**: Dark/Light mode toggle using DaisyUI themes

## Environment Setup

Required environment variables in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-jwt-secret-key"
```

## Database Integration

### Connection Management
- Database connections handled in `src/lib/utils/db.ts`
- Connection pooling configured for production
- Error handling for connection failures

### SQL Security
- Parameterized queries to prevent SQL injection
- Read-only mode option for restricted users
- Query timeout and result size limits

## UI Components & Styling

### DaisyUI Components Used
- `table table-zebra` - Data tables
- `btn btn-primary` - Action buttons
- `modal` - CRUD forms and confirmations
- `alert` - Error and success messages
- `dropdown` - Theme selector
- `textarea` - SQL query input (before Monaco integration)

### Theme Configuration
- TailwindCSS v4 with DaisyUI plugin
- Support for multiple themes (light, dark, etc.)
- Theme persistence in localStorage

## Development Notes

### Adding New Features
1. Create components in `src/lib/components/`
2. Add types to `src/lib/types/`
3. Create API endpoints in `src/routes/api/`
4. Update stores if state management needed

### Database Schema Access
- Table metadata fetched via `information_schema`
- Column information used for autocompletion
- Constraints and relationships displayed in schema view

### Security Considerations
- All user inputs validated and sanitized
- SQL queries limited by user permissions
- HTTPS enforced in production
- CSP headers configured

## Testing Strategy

### E2E Tests (Playwright)
- Test database connections
- Verify SQL query execution
- Test CRUD operations
- Check authentication flows

### Component Testing
- Test individual components in isolation
- Mock database responses
- Verify UI interactions