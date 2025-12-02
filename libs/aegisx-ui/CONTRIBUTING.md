# Contributing to @aegisx/ui

Thank you for your interest in contributing to @aegisx/ui!

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- PNPM >= 8.0.0
- Angular CLI >= 17.0.0

### Getting Started

1. Clone the monorepo:

```bash
git clone git@github.com:aegisx-platform/aegisx-starter.git
cd aegisx-starter
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the library:

```bash
pnpm nx build aegisx-ui
```

4. Run tests:

```bash
pnpm nx test aegisx-ui
```

## Project Structure

```
libs/aegisx-ui/
├── src/
│   ├── lib/
│   │   ├── components/     # UI components
│   │   ├── core/          # Core services and utilities
│   │   ├── layouts/       # Layout components
│   │   ├── services/      # Shared services
│   │   ├── styles/        # SCSS styles and tokens
│   │   └── widgets/       # Widget components
│   └── index.ts           # Public API
├── package.json
├── ng-package.json
└── README.md
```

## Guidelines

### Code Style

- Use TypeScript strict mode
- Follow Angular style guide
- Use signals for state management (Angular 17+)
- Keep components standalone when possible

### Component Development

1. Create component in appropriate directory
2. Export from `index.ts`
3. Add documentation
4. Write unit tests

### Commit Messages

Use conventional commits:

```
feat(component): add new feature
fix(service): resolve bug
docs: update readme
style: format code
refactor: improve code structure
test: add tests
chore: update dependencies
```

## Publishing

### Build for Production

```bash
pnpm nx build aegisx-ui --configuration=production
```

### Publish to npm

```bash
cd dist/libs/aegisx-ui
npm publish --access public --otp=<your-otp>
```

### Sync to Standalone Repository

```bash
cd libs/aegisx-ui
./sync-to-repo.sh main
```

## License

MIT
