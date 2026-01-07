# Supabase Auth Project

React application with authentication and user profile management, built on Supabase.

**Live Demo:** [https://supabase-project-phi.vercel.app/](https://supabase-project-phi.vercel.app/)

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
- View and edit profile with extended fields:
  - First name and last name
  - Username (unique)
  - Date of birth (age calculated automatically)
  - Phone number with validation
  - Bio/description
  - Location
  - Timezone
  - Avatar image (upload via Supabase Storage)
  - Cover image (background image)
  - Photo gallery (up to 9 images)
- Automatic profile creation on registration
- Data storage in Supabase
- Media storage in Supabase Storage

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

#### Create the `profiles` table:

```sql
create table profiles (
  user_id uuid references auth.users primary key,
  email text not null,
  first_name text,
  last_name text,
  username text unique,
  date_of_birth date,
  phone text,
  bio text,
  location text,
  timezone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index on username for faster lookups
create index profiles_username_idx on profiles(username) where username is not null;

-- Add media fields
alter table profiles
  add column if not exists avatar_url text,
  add column if not exists cover_url text,
  add column if not exists gallery text[];
```

**If you already have the old table**, run this migration to add new fields:

```sql
-- Add new columns
alter table profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists username text unique,
  add column if not exists date_of_birth date,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists timezone text;

-- Remove old age column (age is now calculated from date_of_birth)
alter table profiles
  drop column if exists age;

-- Add index on username
create index if not exists profiles_username_idx on profiles(username) where username is not null;

-- Add media fields
alter table profiles
  add column if not exists avatar_url text,
  add column if not exists cover_url text,
  add column if not exists gallery text[];
```

### 4. Storage Setup (for Media)

For avatar, cover image, and gallery functionality:

1. **Create Storage Bucket:**
   - Go to **Storage** in Supabase Dashboard
   - Click **"New bucket"**
   - Name: `profiles`
   - Set as **Public bucket**
   - Click **"Create bucket"**

2. **Set up RLS Policies:**
   - Open the `profiles` bucket
   - Go to **Policies** tab
   - Create policies (see `STORAGE_SETUP.md` for details)

3. **Run media migration:**
   ```sql
   alter table profiles
     add column if not exists avatar_url text,
     add column if not exists cover_url text,
     add column if not exists gallery text[];
   ```

See `STORAGE_SETUP.md` for detailed instructions.

### 5. Google OAuth Setup

1. **Supabase Dashboard:**
   - Authentication → URL Configuration
   - Add redirect URLs:
     - `http://localhost:5173` (development)
     - `http://localhost:5173/**` (development)
     - `https://supabase-project-phi.vercel.app` (production)
     - `https://supabase-project-phi.vercel.app/**` (production)
   - Authentication → Providers → Google
   - Enable Google provider

2. **Google Cloud Console:**
   - Create OAuth 2.0 Client ID
   - Add Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://supabase-project-phi.vercel.app` (production)
   - Add Authorized redirect URIs:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback` (required - Supabase callback)
     - `https://supabase-project-phi.vercel.app` (recommended for mobile devices)
   - Copy Client ID and Client Secret to Supabase

**Important for Mobile Devices:**
- The app uses PKCE flow for better mobile support
- Make sure to add your production URL to both Supabase redirect URLs AND Google Cloud Console redirect URIs
- OAuth callback is automatically handled for both hash fragments (desktop) and query parameters (mobile)

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



## Core Principles

- **Simplicity** — minimal dependencies, clean code
- **Type Safety** — full TypeScript support
- **Testing** — coverage of core functionality
- **Component Architecture** — reusable components
- **Feature-based Structure** — organization by functionality
