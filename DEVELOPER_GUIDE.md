# Developer Guide — Project Setup & Architecture Standards

## 1. Local Development Setup

### Frontend Setup (`apps/web`)
```bash
cd apps/web
npm install
npm run dev
```

### Backend Setup (`apps/api`)
```bash
cd apps/api
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

---

## 2. Code Quality & Type Safety Verification

Run TypeScript compilation check:
```bash
cd apps/web
npm run type-check
```

Run Python backend pytest test suite:
```bash
cd apps/api
.\venv\Scripts\pytest
```

---

## 3. Engineering Guidelines
- **DESIGN_SYSTEM.md**: Single source of truth for all UI components, colors, spacing, typography, and card geometry.
- **React Decoupled Engines**: Keep all business logic, RBAC, state machines, event buses, and AI prompt libraries inside `lib/` as pure TypeScript functions.
- **Service Abstraction**: Never invoke `fetch()` directly in React components. All network requests belong in `services/`.
