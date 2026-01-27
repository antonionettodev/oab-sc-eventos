---
title: Development Standards
description: Mandatory development conventions and architectural patterns for Next.js and Payload CMS projects, covering file structure, component organization, hooks, data operations, and UI standards using Tailwind and shadcn/ui.
tags: [standards, architecture, nextjs, payload-cms, conventions, ui-patterns, tailwind, shadcn]
---

# Development Standards

## General Convention (mandatory)

### Folder and file names

- Folders and files must use **lowercase + kebab-case** (hyphen-separated).
- Avoid redundant names when the context is already defined by the folder.

### Organization by module/domain

- Components of a module/page must live in: `components/<module>/`
  - Example: `posts` → `components/posts/`

### Avoid redundancy in file names

- If a component is specific to `posts`, do not repeat `post` in the file name, because the folder already defines the scope.
  - ✅ `components/posts/card.tsx`
  - ✅ `components/posts/header.tsx`
  - ❌ `components/posts/post-card.tsx`

### When to extract into a reusable file

- If a piece of code/function is used **many times and in different contexts**, extract it into something reusable.
- If it is used **only in a single context**, keep it local (avoid creating files/folders just for “organization”).

---

## Next + Payload (operations)

### Mutations (create / update / auth / delete)

- Must be done using the local `payload` instance inside **Server Actions**.

### Gets

- Must be done using the native `payload` instance inside **Server Components**.
- They do not necessarily need to be Server Actions.

---

## Components (Next / React)

### File vs component function

- File: **lowercase + kebab-case**.
- The file **must not repeat** the module scope when the folder already defines it.
- The **exported component function** must be **PascalCase** and **include scope**.
  - `components/posts/card.tsx` → exports `PostCard` (or `CardPost`)
  - `components/posts/header.tsx` → exports `PostHeader`

### Non-component functions

- Utilities, handlers, etc.: **camelCase** (lowercase first letter).

### Client vs Server

- Use `use client` only when necessary (state/effect/event handlers/browser APIs).
- Prefer Server Components whenever possible.

### Modularized pages

- Except for very small pages, split pages into section-based components.
- Correctly mark each component as client or server.

---

## Hooks

### Hook files (avoid redundancy)

- Avoid names like `validate-hook.ts` inside `/hooks`.
  - ✅ `hooks/validate.ts`
  - ❌ `hooks/validate-hook.ts`

### Frontend hooks

- Must always start with `use` (React convention):
  - ✅ `useDebounce`
  - ✅ `useSomething`

### Backend hooks (Payload / collection hooks)

- Do not need to start with `use`, but must end with `Hook` (or `Hooks` if plural):
  - ✅ `removeNumbersHook`
  - ✅ `sendNotificationHook`

### Scope in exported names

- If the hook/function will be used outside its module, include scope in the export:
  - ✅ `usePostFilters`
  - ✅ `sendPostNotificationHook`

---

## Payload – Admin UI / Labels / Fields

### Panel grouping

- Related collections must share the same `admin.group` value to be grouped in the admin panel.

### Labels and language

- All fields must have `label` in Portuguese.
- All collections must have Portuguese labels:
  - `labels.singular`
  - `labels.plural`

### Placeholders and descriptions

- Whenever possible:
  - define `placeholder` (high priority)
  - define `description` (optional but recommended)

### Field organization in large collections

- Use `tabs`, `group`, and `row` to improve organization.

---

## Payload – Collections

### Base structure

- Collections must live in `collections/<collection>/index.ts` (configuration file).
  - ✅ `collections/posts/index.ts`

### Collection-specific items

- If hooks/fields/access/endpoints grow large, split them inside the collection:
  - `collections/<collection>/hooks/<name>.ts`
  - `collections/<collection>/fields/<name>.ts`
  - `collections/<collection>/access/<name>.ts`
  - `collections/<collection>/endpoints/<name>.ts`

### Shared items

- Hooks reused by multiple collections: `src/hooks/`
- Fields reused by multiple collections: `src/fields/`

### Grouping by domain

- If multiple collections belong to the same domain/context, group them in a folder:
  - `collections/subsections/index.ts`
  - `collections/subsections/members/index.ts`
- If `members` has its own hooks/fields, apply the same rules inside `members/`.

---

## Mandatory UI Standard (Next.js + Tailwind + shadcn/ui)

> This rule complements (and must obey) all conventions already defined in the project:
>
> - folders/files in **lowercase + kebab-case**
> - components per module in `components/<module>/` without redundant file names
> - exported component names in **PascalCase** with **scope**
> - hooks following conventions (frontend `use*`, backend `*Hook`)
> - Payload operations: **GET in Server Components** and **mutations in Server Actions**

### Mandatory stack

- All UI code must be written in **Next.js (App Router)**.
- **Never generate generic React** (CRA, Vite React, loose JSX).
- Styling must be done **exclusively with TailwindCSS**.
- Base UI components must **prioritize shadcn/ui** (Button, Card, Dialog, Sheet, Tabs, Dropdown, Input, Select, Table, etc.).
- Icons: prefer `lucide-react`.

### Always applies

These rules apply **at all times**, including when:

- Creating UI from scratch
- Rewriting/refactoring existing UI
- Pasting external code (Figma, examples, plain React)
- Adjusting layout/styles/structure

Always adapt everything to the project stack and conventions.

### Design preservation

- Faithfully preserve layout, spacing, typography, visual hierarchy, and colors.
- Implement states: hover, focus, active, disabled (Tailwind).
- Ensure responsiveness using Tailwind breakpoints.

### Modularization and file organization (mandatory)

- Avoid monolithic files.
- Split UI into section/block-based components (e.g. `hero`, `features`, `cta`, `pricing`, `faq`).
- Page/module-specific components must live in: `components/<module>/`.

#### File name vs component name (no redundancy)

- File: **lowercase + kebab-case**, without repeating scope when the folder already defines it.
  - ✅ `components/posts/header.tsx`
  - ✅ `components/posts/card.tsx`
  - ❌ `components/posts/post-card.tsx`
- Component export: **PascalCase** with **scope** (because it may be used outside the folder).
  - `components/posts/header.tsx` → `export function PostHeader() {}`
  - `components/posts/card.tsx` → `export function PostCard() {}`

### Server vs Client Components (Next)

- Components must be **Server Components by default**.
- Use `use client` **only when necessary**:
  - state
  - effects
  - event handlers
  - client-only / browser-only APIs
- Never mark components as client “by default”.

### Data integration (Next + Payload)

- Reads (GET): prefer **Server Components** using the local Payload instance.
- Mutations (create/update/delete/auth): use **Server Actions** with the local Payload instance.
- Avoid unnecessary client-side fetching.

### Reuse vs local code

- If a piece of code is used in many contexts, extract it to a reusable module.
- If it is used only in a single component/context, keep it local to avoid unnecessary files/folders.

### Expected output when generating/adapting UI

When creating or adapting UI, always deliver:

- Suggested file structure (paths in kebab-case)
- Modularized components in `components/<module>/`
- Next.js page composing the components (`app/<route>/page.tsx`)
- Explicit indication of which components use `use client` (only when necessary)
