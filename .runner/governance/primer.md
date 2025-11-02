# Build Runner 2.0 - AI Behavior Contract

## ValuDock Project Primer

### Core Principles

You are an AI assistant working under Build Runner 2.0 governance for the ValuDock project. This document defines your behavior contract and operational guidelines.

---

## 1. Response Format Rules

### Progress Display (MANDATORY)
**EVERY response MUST start with:**
```
Phase <current> of <total_phases> - Step <current> of <total_steps>
```

**Example:**
```
Phase 2 of 5 - Step 3 of 12
```

**Rules:**
- Calculate totals dynamically from `docs/ValuDock-spec.md`
- NEVER hardcode totals (e.g., don't write "Step 44 of 44")
- Use `br-autophases` to extract current totals

---

## 2. Communication Modes

### Q&A Mode (Questions & Answers)
- **Format:** Plain text only
- **Use when:** User asks questions, needs clarification, or requests information
- **Example:**
  ```
  Phase 1 of 5 - Step 1 of 8

  The authentication system uses Supabase JWT tokens. Here's how it works:
  - Users sign in via email/password
  - Supabase returns a JWT token
  - Token is stored in localStorage
  ```

### Action Mode (Making Changes)
- **Format:** Fenced zsh code blocks
- **Use when:** Creating, editing, deleting files or running commands
- **Example:**
  ````
  Phase 1 of 5 - Step 2 of 8

  ```zsh
  # Create new component
  touch src/components/NewFeature.tsx

  # Open for editing
  open -e src/components/NewFeature.tsx
  ```
  ````

---

## 3. File Operations

### Opening Files
**ALWAYS emit before referencing a file:**
```zsh
open -e <file_path>
```

**Exception:** Skip if `BR_SKIP_OPEN=1` is set

### Editing Files
**MUST provide FULL file content** (not diffs)

**Correct:**
```zsh
cat > src/config.ts << 'EOF'
export const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  // ... (complete file)
};
EOF
```

**Incorrect:**
```zsh
# Don't do this:
sed -i 's/old/new/g' src/config.ts
```

---

## 4. Workflow & Validation

### After ANY Change
**MUST run in sequence:**
```zsh
# 1. Validate state matches spec
br-sync

# 2. Enforce governance rules
br-guard

# 3. Commit changes
git add .
git commit -m "feat: description of change"

# 4. Push to GitHub
git push
```

### State Synchronization
- `state.json` is the source of truth for current progress
- Spec file (`docs/ValuDock-spec.md`) defines all phases/steps
- These MUST always be in sync

---

## 5. Build Runner Commands

### Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `br-sync` | Validate state matches spec | After every change |
| `br-guard` | Enforce governance rules | After every change |
| `br-autophases` | Extract phase/step totals from spec | When displaying progress |
| `br-progress` | Print current progress string | To get formatted progress |

---

## 6. Git Workflow

### Auto-Commit Requirements
- **Every change** must be committed
- **Every commit** must be pushed to GitHub
- **Commit messages** should follow conventional commits format:
  - `feat:` - New features
  - `fix:` - Bug fixes
  - `docs:` - Documentation
  - `refactor:` - Code refactoring
  - `test:` - Tests
  - `chore:` - Maintenance

### Example Workflow
```zsh
# Make changes
cat > src/new-file.ts << 'EOF'
// File content here
EOF

# Validate
br-sync && br-guard

# Commit and push
git add .
git commit -m "feat: add new authentication module"
git push
```

---

## 7. Project-Specific Context

### ValuDock Architecture
- **Frontend:** React + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Authentication:** JWT tokens via Supabase Auth
- **Multi-tenancy:** Global Admin → Tenants → Organizations → Users

### Key Technologies
- React 18.3+
- TypeScript
- Vite 6.3+
- Supabase 2.x
- Radix UI (component library)
- Recharts (data visualization)
- TailwindCSS (styling)

### Important Files
- `state.json` - Current progress tracker
- `docs/ValuDock-spec.md` - Project specification
- `ValueDock/src/App.tsx` - Main application component
- `ValueDock/src/utils/auth.ts` - Authentication utilities

---

## 8. Error Handling

### When Things Go Wrong

**If a command fails:**
1. Display the error clearly
2. Suggest fixes
3. Don't proceed until resolved
4. Update state.json if needed

**If state.json and spec are out of sync:**
1. Run `br-sync` to identify mismatch
2. Correct the discrepancy
3. Validate with `br-guard`
4. Commit the fix

---

## 9. Behavioral Guidelines

### DO:
✅ Always display progress at the start of responses
✅ Validate after every change
✅ Commit and push all changes
✅ Provide full file contents when editing
✅ Use fenced zsh blocks for actions
✅ Calculate totals dynamically from spec

### DON'T:
❌ Skip progress display
❌ Make changes without validating
❌ Use diffs instead of full files
❌ Hardcode phase/step totals
❌ Forget to commit and push
❌ Mix Q&A and action formats

---

## 10. Spec File Structure

The `docs/ValuDock-spec.md` file must contain:

```markdown
# ValuDock Specification

## Phases

### Phase 1: [Phase Name]
**Objective:** [What this phase accomplishes]

#### Steps:
1. **Step 1:** [Description]
2. **Step 2:** [Description]
...

### Phase 2: [Phase Name]
...
```

---

## Summary

Remember: You are a **governed AI assistant**. Every action must:
1. Show progress
2. Follow format rules (plain text for Q&A, zsh blocks for actions)
3. Validate changes (br-sync, br-guard)
4. Commit and push to GitHub
5. Maintain sync between state.json and spec

**When in doubt, consult:**
- This primer (`.runner/governance/primer.md`)
- Governance rules (`.runner/governance/governance.yaml`)
- Project spec (`docs/ValuDock-spec.md`)
- Current state (`state.json`)
