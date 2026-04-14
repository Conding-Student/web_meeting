# Next.js Enterprise Frontend Template

## Getting Started

### Installation

```bash
# Clone the template
git clone <repository-url> next-template
cd next-template

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

### Development Commands
```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
```
---

## Architecture Overview
This template follows Next.js App Router conventions with route grouping for authentication-based access control:

- **`(auth)`** - Authentication-required routes (e.g., dashboard, settings)
- **`(private)`** - Private routes with shared layout (sidebar, header)
- **`(public)`** - Publicly accessible routes (landing page, about, login)
- Rule: Each route group must have its own layout.tsx for consistent UI/authentication handling.

### Layout Scoping
 
Each route group can have its own `layout.tsx`. The `(private)/layout.tsx` is where you should add session guards, auth checks, or role-based access control. Example:
 
```tsx
// app/(private)/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/services/integration/auth/getSession';
 
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return <>{children}</>;
}
```
 
---

## Development Guidelines

# Creating New Features
Choose the appropriate route group:
- (auth) - For login/register flows
- (private) - For authenticated features
- (public) - For landing pages, etc.

Each feature should follow this pattern:
```bash
featureName/
├── components/    # Feature-specific components
├── hooks/        # Feature-specific hooks
├── models/        # Feature-specific models/types
├── services/        # Feature-specific services/actions
└── index.ts      # Public API exports

```

## Services Layer
 
All API communication lives on folder `services/`. This enforces a clean separation between UI logic and data-fetching concerns.
 
### `services/api/` — Core Utilities
 
| File | Responsibility |

| `ApiEndpoint.ts` | Centralized map of all API endpoint URLs |
| `ApiError.ts` | Typed error class for handling API failures uniformly |
| `ApiWrapper.ts` | Base fetch/Axios wrapper — add auth headers, error handling, retries here |
| `GlobalApiResponse.ts` | Shared TypeScript types for API responses (e.g., `ApiResponse<T>`) |
 
**Convention:** Never call `fetch` directly from a component or page. Always route through `ApiWrapper`.
 
### `services/integration/` — Feature Integrations
 
Each feature or domain has its own subfolder under `services/`. Files here use `ApiWrapper` and `ApiEndpoint` to make typed, reusable API calls.
 
```ts
// services/integration/auth/login.ts
import { ApiWrapper } from '@/services/api/ApiWrapper';
import { ApiEndpoint } from '@/services/api/ApiEndpoint';
import { GlobalApiResponse } from '@/services/api/GlobalApiResponse';
 
export async function login(email: string, password: string): Promise<GlobalApiResponse<{ token: string }>> {
  return ApiWrapper.post(ApiEndpoint.AUTH.LOGIN, { email, password });
}
```


### Adding a New Integration
 
1. Create a subfolder in feature folder: `app/(auth)/featureOne/services`
2. Add typed function files (e.g., `getItems.ts`, `createItem.ts`)
3. Register any new endpoints in `ApiEndpoint.ts`
4. Add any new response shapes to `GlobalApiResponse.ts`
 
---

## Shared Components
Components used across multiple features live in `shared/`.
 
### `shared/layout/`
App-wide structural components: `Header`, `Footer`, `Sidebar`. These are composed in root or group-level layouts. Avoid putting feature-specific logic here.
 
### `shared/ui/`
Reusable, stateless (or lightly stateful) UI primitives: `Modal`, `Toast`. These should be generic and accept props for customization rather than encoding business logic.
 
**Convention:** If a component is used in only one feature, keep it inside that feature's `component/` folder. Only promote it to `shared/ui/` once it is reused in two or more features.
 
---

## Developer Guidelines
 
### Code Conventions
 
- **TypeScript** is required everywhere. Avoid `any`; use proper types or generics.
- Use **named exports** for components and functions. Default exports are reserved for Next.js page and layout files.
- Co-locate feature code (components, hooks) with the route it belongs to. Promote to `shared/` only when truly reused.
- Prefix custom hooks with `use` (e.g., `useAuth`, `useDashboard`).

## AGENTS & CLAUDE Docs
 
| File | Purpose |

| `CLAUDE.md` | Context and conventions for AI coding assistants (Claude, Cursor, etc.). Describes project structure, patterns, and constraints the AI should follow. |
| `AGENTS.md` | Definitions for agentic tasks — automated workflows, code generation patterns, or multi-step instructions for AI agents working on this codebase. |