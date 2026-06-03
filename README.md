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

- **`(auth)`** - Authentication group folder (requires login)	Dashboard, Profile, Settings
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

### Directory Structure
We follow a Modular Feature pattern. Logic is co-located with routes until it needs to be shared.
app/
├── (auth)/          # Authentication flow
├── (private)/       # Authenticated dashboard & internal tools
│   ├── staff/       # Feature: Staff Management
│   └── ui-test/     # Component Playground / Sandbox
└── (public)/        # Landing pages & Unauthorized fallbacks

shared/
├── layout/          # Global structural components (Sidebar, Header)
├── ui/              # Reusable Primitives (DataTable, SearchableDropdown, Toast)
└── types/           # Global TypeScript definitions

### UI Component Standards
This template uses **lucide-react** for icons. 
**Why lucide-react?**
- Tree-shakeable: Only icons you use are bundled
- Consistent design system
- TypeScript support out of the box
- Customizable size and styling via props
### Icon Usage Example
 
```tsx
import { ArrowRight, Menu, User, Settings } from 'lucide-react';
 
// Basic usage
<ArrowRight size={20} />
 
// With styling
<ArrowRight 
  size={20} 
  className="text-blue-500" 
/>
 
// With animations
<ArrowRight
  size={20}
  className="group-hover:translate-x-1 transition-transform"
/>
 
// Common patterns
<Menu className="w-5 h-5" />
<User size={24} strokeWidth={1.5} />
```


Component Promotion Rule
- Local: If a component is used in only one page, keep it in that route's components/ folder.

- Shared: If a component is used across two or more features, move it to shared/ui/.

DataTable - Handles complex datasets with built-in pagination and sorting logic.
SearchableDropdown - Enhanced select input with fuzzy-search and brand-specific styling.
ToastGlobal -  feedback system managed via Zustand state.
Modal - Portal-based overlay system to avoid z-index conflicts.
SegmentedTabs - High-fidelity navigation for switching views within a single route.

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