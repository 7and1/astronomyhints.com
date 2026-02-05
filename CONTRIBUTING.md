# Contributing to Orbit Command

Thank you for your interest in contributing to Orbit Command! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)
7. [Testing Requirements](#testing-requirements)
8. [Documentation](#documentation)
9. [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We pledge to:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what is best for the community and project

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

### Enforcement

Violations of the code of conduct may result in removal from the project. Report issues to hello@astronomyhints.com.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- A modern code editor (VS Code recommended)
- Basic knowledge of:
  - TypeScript
  - React
  - Three.js / React Three Fiber (for 3D contributions)

### Understanding the Project

1. **Read the Documentation**
   - [README.md](/README.md) - Project overview
   - [ARCHITECTURE.md](/ARCHITECTURE.md) - Technical architecture
   - [DEVELOPER_GUIDE.md](/docs/DEVELOPER_GUIDE.md) - Development guide

2. **Explore the Codebase**
   - `/app` - Next.js pages and layouts
   - `/components` - React components
   - `/lib` - Utilities and hooks
   - `/store` - State management

3. **Try the Application**
   - Visit [astronomyhints.com](https://astronomyhints.com)
   - Test all features
   - Note any issues or improvements

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/astronomyhints.com.git
cd astronomyhints.com
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your settings (if needed)
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### 6. Type Checking

```bash
npm run typecheck
```

### 7. Linting

```bash
npm run lint
```

---

## How to Contribute

### Types of Contributions

#### Bug Reports

Found a bug? Please open an issue with:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Screenshots if applicable

**Bug Report Template:**

```markdown
## Bug Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop

## Screenshots
If applicable, add screenshots.
```

#### Feature Requests

Have an idea? Open an issue with:

- Clear description of the feature
- Use case / problem it solves
- Proposed implementation (optional)
- Mockups or examples (optional)

**Feature Request Template:**

```markdown
## Feature Description
A clear description of the feature.

## Problem / Use Case
What problem does this solve?

## Proposed Solution
How might this be implemented?

## Alternatives Considered
Other approaches you've thought about.

## Additional Context
Any other information.
```

#### Code Contributions

Ready to code? Here's what we're looking for:

**Good First Issues:**
- Documentation improvements
- Bug fixes
- Test coverage
- Accessibility improvements
- Performance optimizations

**Larger Contributions:**
- New features (discuss first)
- Major refactoring (discuss first)
- New planet/celestial body additions
- UI/UX improvements

### Contribution Workflow

```
1. Find/Create Issue
        │
        ▼
2. Fork Repository
        │
        ▼
3. Create Branch
        │
        ▼
4. Make Changes
        │
        ▼
5. Write Tests
        │
        ▼
6. Update Docs
        │
        ▼
7. Submit PR
        │
        ▼
8. Code Review
        │
        ▼
9. Merge!
```

---

## Pull Request Process

### Before Submitting

1. **Create an Issue First**
   - Discuss the change before implementing
   - Get feedback on approach
   - Avoid duplicate work

2. **Branch Naming**
   ```
   feature/add-asteroid-belt
   fix/planet-selection-bug
   docs/update-readme
   refactor/camera-controller
   ```

3. **Commit Messages**
   ```
   feat: add asteroid belt visualization
   fix: resolve planet selection on mobile
   docs: update installation instructions
   refactor: simplify camera animation logic
   test: add tests for time controls
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/).

### Submitting a Pull Request

1. **Update Your Fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push Your Branch**
   ```bash
   git push origin feature/your-feature
   ```

3. **Create Pull Request**
   - Use the PR template
   - Link related issues
   - Describe changes clearly
   - Include screenshots for UI changes

**Pull Request Template:**

```markdown
## Description
Brief description of changes.

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring
- [ ] Performance improvement

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Screenshots
If applicable.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated Checks**
   - Tests must pass
   - Linting must pass
   - Type checking must pass

2. **Code Review**
   - At least one maintainer approval
   - Address all feedback
   - Keep discussion constructive

3. **Merge**
   - Squash and merge preferred
   - Delete branch after merge

---

## Coding Standards

### TypeScript

```typescript
// Use explicit types
function calculatePosition(date: Date, body: string): Vector3 {
  // ...
}

// Use interfaces for objects
interface PlanetProps {
  name: string;
  data: PlanetData;
}

// Avoid `any` type
// Bad
const data: any = fetchData();

// Good
const data: PlanetData = fetchData();
```

### React Components

```typescript
// Functional components with hooks
export default function Planet({ name, data }: PlanetProps) {
  // Hooks at top
  const [state, setState] = useState(initial);
  const ref = useRef<THREE.Mesh>(null);

  // Effects
  useEffect(() => {
    // ...
  }, [dependencies]);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <mesh ref={ref} onClick={handleClick}>
      {/* ... */}
    </mesh>
  );
}
```

### File Organization

```
// Component file structure
ComponentName/
├── ComponentName.tsx      # Main component
├── ComponentName.test.tsx # Tests
├── ComponentName.module.css # Styles (if needed)
└── index.ts               # Export

// Or single file for simple components
ComponentName.tsx
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `PlanetInfo.tsx` |
| Hooks | camelCase with `use` | `usePlanetData.ts` |
| Utilities | camelCase | `calculateOrbit.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_TIME_SPEED` |
| Types/Interfaces | PascalCase | `PlanetData` |

### Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 2. Third-party
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

// 3. Internal components
import Planet from '@/components/Planet';

// 4. Internal utilities
import { useStore } from '@/store/useStore';

// 5. Types
import type { PlanetData } from '@/types';

// 6. Styles
import styles from './Component.module.css';
```

---

## Testing Requirements

### What to Test

1. **Unit Tests**
   - Utility functions
   - Store actions
   - Hooks
   - Validation logic

2. **Component Tests**
   - Rendering
   - User interactions
   - State changes

3. **Integration Tests**
   - Feature workflows
   - Component interactions

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  describe('feature', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = doSomething(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Coverage Requirements

- New code should have tests
- Aim for 80%+ coverage on new features
- Critical paths must be tested

---

## Documentation

### When to Update Docs

- Adding new features
- Changing existing behavior
- Fixing bugs that affect usage
- Adding new dependencies

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `docs/USER_GUIDE.md` | User documentation |
| `docs/DEVELOPER_GUIDE.md` | Developer documentation |
| `docs/FAQ.md` | Frequently asked questions |
| `CONTRIBUTING.md` | This file |
| `CHANGELOG.md` | Version history |

### Code Comments

```typescript
// Good: Explains WHY
// Scale position from AU to scene units for visibility
const scenePosition = auPosition * 10;

// Bad: Explains WHAT (obvious from code)
// Multiply by 10
const scenePosition = auPosition * 10;
```

### JSDoc for Public APIs

```typescript
/**
 * Calculates the heliocentric position of a planet.
 *
 * @param body - The planet name (e.g., 'Mars')
 * @param date - The date for calculation
 * @returns Vector3 position in AU
 *
 * @example
 * const position = calculatePosition('Mars', new Date());
 */
function calculatePosition(body: string, date: Date): Vector3 {
  // ...
}
```

---

## Community

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Questions and ideas
- **Email**: hello@astronomyhints.com

### Recognition

Contributors are recognized in:
- CHANGELOG.md for significant contributions
- README.md contributors section
- Release notes

### Maintainers

Current maintainers:
- Astronomy Hints Team

### Decision Making

- Minor changes: Single maintainer approval
- Major changes: Discussion and consensus
- Breaking changes: Full team review

---

## Quick Reference

### Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run linter
npm run typecheck    # Type checking
npm test             # Run tests
npm run test:watch   # Tests in watch mode
```

### Checklist for PRs

- [ ] Issue created/linked
- [ ] Branch named correctly
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All checks pass
- [ ] Self-review completed

### Resources

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [Three.js Docs](https://threejs.org/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Thank you for contributing to Orbit Command! Your efforts help make astronomy more accessible to everyone.

*Last updated: February 2026*
