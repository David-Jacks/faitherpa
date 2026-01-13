# Engineering Rules & Standards

## 1. Mandatory Practices

### Architecture & Code Quality

- Explain every important step and function using comments.
- Use modular programming: every action must be a standalone function.
- Enforce the Single Responsibility Principle: each component, function, or service must do exactly one thing.
- Ensure the system is scalable by design (no shortcuts that block growth).

### Component & State Design

- Build UI using small, reusable, component-first design.
- Lift shared state to the nearest common ancestor or a central store.
- Maintain one-way data flow using props, callbacks, or a single source of truth.
- Define clear state boundaries (local vs global).

### Styling & Design System

- Use centralised design tokens for:
  - Colours
  - Spacing
  - Typography
  - Breakpoints
- Consume tokens consistently across all components.
- Keep styling scoped and modular (per component).

### Performance

- Prevent unnecessary re-renders by:
  - Using `memo`
  - Using `useCallback`
- Code-split routes and components.
- Lazy-load heavy dependencies.
- Optimise assets.
- Measure performance using profiling tools.

### Accessibility

- Use semantic HTML.
- Provide proper labels and keyboard navigation.
- Maintain sufficient colour contrast.
- Use ARIA only when necessary.
- Include accessibility checks in CI.

### Quality Enforcement

- Enforce standards using:
  - Linters
  - Formatters
  - Type checking
  - Unit tests
  - Visual tests
- Gate merges using CI pipelines.
- Prefer small, testable units.

### Clean and Readable Code

- Ensure to comment on every function and component.
- Use names that explain the purpose of variables and functions.

---

## 2. Strict Prohibitions

### Styling

- ❌ Do not use inline styles under any circumstances.
- ❌ Do not hardcode colours or fonts.
- ❌ Do not leak styles globally.

### Performance & Design

- ❌ Do not introduce unnecessary re-renders.
- ❌ Do not duplicate styles instead of reusing utilities.
- ❌ Do not create large, multi-purpose components.
- ❌ Do not mix responsibilities inside a single component or service.

### UX & Accessibility

- ❌ Do not use icons or buttons without proper labels.
- ❌ Do not ignore keyboard or screen-reader users.
- ❌ Do not rely on ARIA where semantic HTML suffices.

---

## 3. Frontend Regulations

### Naming Conventions

- CSS classes → use `-`  
  Example: `button-primary`, `card-header`
- CSS IDs → use `_`  
  Example: `main_container`, `auth_modal`

### Styling Rules

- Always prefer CSS variables over hardcoded values.
- Never use inline styles.
- Use CSS Modules, styled-components, or other scoped styling solutions.
- Avoid global CSS except for minimal resets.

### Layout & Responsiveness

- Use mobile-first design.
- Use relative units (`rem`, `em`, `%`) — never pixels.
- Use Flexbox/Grid.
- Define clear breakpoints using tokens.
- Test across screen sizes.

### Accessibility & UX

- Add `aria-label`s to icons and buttons where needed.
- Ensure focus management for keyboard navigation.
- Follow accessibility-first UI decisions.

---

## 4. Server Regulations (Backend Architecture)

### Required Folder Structure

```

src/
├─ config/
├─ controllers/
├─ routes/
├─ utils/
├─ middlewares/
├─ services/
├─ models/
server.ts
\*.json

```

### Responsibility Boundaries

- Routes → define endpoints only.
- Controllers → handle request/response logic.
- Services → contain business logic.
- Models → define data schemas and persistence logic.
- Middlewares → handle cross-cutting concerns (auth, logging, validation).
- Utils → pure helper functions.
- Config → environment and system configuration.

### Backend Principles

- Each layer does one job only.
- No business logic inside routes.
- No database logic inside controllers.
- Design for scalability and maintainability.

## System Context (Authoritative)

The file `docs/system-overview.md` defines:

- The system’s primary purpose
- Core functional requirements
- Non-functional requirements
- Explicit out-of-scope items
- Design priorities
