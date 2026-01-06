# Supabase Auth Project

React application with authentication and user profile management, built on Supabase.

## Technologies

- **React 19** — UI library
- **TypeScript** — type system
- **Vite** — build tool and dev server
- **Supabase** — backend (authentication, database)
- **Tailwind CSS** — styling
- **Vitest** — testing
- **React Testing Library** — component testing

## Features

### Authentication
- Email and password registration
- Email and password login
- Google OAuth authentication
- Sign out
- Automatic session persistence

### User Profile
- View profile
- Edit age
- Automatic profile creation on registration
- Data storage in Supabase

## Project Structure

```
src/
├── app/              # Main application component
├── features/         # Business logic
│   ├── auth/         # Authentication
│   │   ├── auth.api.ts      # API calls for auth
│   │   ├── auth.types.ts    # Types for auth
│   │   └── useAuth.ts       # React hook for auth
│   └── profiles/     # User profiles
│       ├── profiles.api.ts  # API calls for profiles
│       ├── profiles.types.ts # Types for profiles
├── lib/              # Utilities
│   ├── supabase.ts   # Supabase client
│   └── utils.ts      # Helper functions
├── pages/            # Pages
│   ├── LoginPage.tsx # Login/registration page
│   └── ProfilePage.tsx # Profile page
├── shared/           # Shared components
│   └── ui/           # UI components
│       ├── Button.tsx
│       └── Input.tsx
└── test/             # Test setup
    └── setup.ts
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from Supabase dashboard: **Settings → API**.

### 3. Database Setup

Create the `profiles` table in Supabase:

```sql
create table profiles (
  user_id uuid references auth.users primary key,
  email text not null,
  age integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 4. Google OAuth Setup

1. **Supabase Dashboard:**
   - Authentication → URL Configuration
   - Add redirect URLs: `http://localhost:5173` and `http://localhost:5173/**`
   - Authentication → Providers → Google
   - Enable Google provider

2. **Google Cloud Console:**
   - Create OAuth 2.0 Client ID
   - Add Authorized JavaScript origins: `http://localhost:5173`
   - Add Authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## Running

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## Testing

### Running Tests

```bash
# Watch mode
npm test

# One-time run
npm run test:run

# UI for viewing results
npm run test:ui
```

### Test Coverage

- **utils.ts** — tests for class merging function
- **Button.tsx** — tests for button (rendering, clicks, disabled)
- **Input.tsx** — tests for input (rendering, onChange, types)
- **auth.api.ts** — tests for auth API (Supabase mocks)

Total: **27 tests**

## Linting

```bash
npm run lint
```

## Coding Guidelines

See [docs/rules/coding-guidelines.md](docs/rules/coding-guidelines.md) for complete coding rules and best practices for the project.

## Core Principles

- **Simplicity** — minimal dependencies, clean code
- **Type Safety** — full TypeScript support
- **Testing** — coverage of core functionality
- **Component Architecture** — reusable components
- **Feature-based Structure** — organization by functionality
