# ============================================================================

# COFIRA - Contributing Guidelines

# ============================================================================

## 🤝 How to Contribute

We love your input! We want to make contributing to COFIRA as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 📋 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 🔧 Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/proyecto_angular_DWEC_alejandrobravo.git
cd proyecto_angular_DWEC_alejandrobravo

# Add upstream remote
git remote add upstream https://github.com/Alejandro-Bravo2/proyecto_angular_DWEC_alejandrobravo.git

# Create a branch
git checkout -b feature/amazing-feature

# Install dependencies
cd cofira-app && npm install
cd ../backend && ./gradlew build

# Make your changes and commit
git add .
git commit -m "✨ Add amazing feature"

# Push to your fork
git push origin feature/amazing-feature
```

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- ✨ `feat`: A new feature
- 🐛 `fix`: A bug fix
- 📝 `docs`: Documentation only changes
- 🎨 `style`: Changes that don't affect code meaning (formatting, etc.)
- ♻️ `refactor`: Code change that neither fixes a bug nor adds a feature
- ⚡ `perf`: Performance improvements
- ✅ `test`: Adding missing tests or correcting existing tests
- 🔧 `chore`: Changes to build process or auxiliary tools
- 🔒 `security`: Security improvements

### Examples

```bash
git commit -m "✨ feat(auth): add JWT authentication"
git commit -m "🐛 fix(training): resolve exercise loading issue"
git commit -m "📝 docs: update installation guide"
git commit -m "♻️ refactor(nutrition): improve meal service structure"
```

## 🧪 Testing Guidelines

### Frontend Tests

```bash
cd cofira-app

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# E2E tests
npm run e2e
```

**Requirements:**

- All new features must include unit tests
- Maintain coverage above 50%
- E2E tests for critical user flows

### Backend Tests

```bash
cd backend

# Run tests
./gradlew test

# Run with coverage
./gradlew test jacocoTestReport
```

**Requirements:**

- Unit tests for services and repositories
- Integration tests for controllers
- Maintain coverage above 70%

## 📐 Code Style

### Frontend (TypeScript/Angular)

- Follow [Angular Style Guide](https://angular.dev/style-guide)
- Use ESLint for linting
- Format with Prettier
- Use TypeScript strict mode

```bash
# Lint
npm run lint

# Format (if configured)
npm run format
```

### Backend (Java/Spring Boot)

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use Lombok for boilerplate reduction
- DTOs for data transfer
- Service layer for business logic

## 🌲 Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation
- `refactor/what-changed` - Code refactoring
- `test/what-tested` - Test additions
- `chore/what-changed` - Maintenance tasks

## 🔍 Code Review Process

1. Create a Pull Request with a clear title and description
2. Link related issues
3. Add screenshots/videos for UI changes
4. Wait for CI/CD checks to pass
5. Request review from maintainers
6. Address review comments
7. Squash commits if needed
8. Merge when approved

## 📊 Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] CI/CD passes

## Screenshots

(if applicable)

## Related Issues

Closes #issue-number
```

## 🐛 Bug Reports

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

**Great Feature Requests** include:

- Problem statement
- Proposed solution
- Alternative solutions considered
- Additional context

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features considered.

**Additional context**
Any other context, screenshots, or mockups.
```

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🎯 Areas for Contribution

We especially welcome contributions in:

- 📱 Mobile responsiveness improvements
- ♿ Accessibility enhancements
- 🌍 Internationalization (i18n)
- 🎨 UI/UX improvements
- 📊 Performance optimizations
- 📚 Documentation improvements
- 🧪 Test coverage increases
- 🔒 Security enhancements

## 🆘 Getting Help

- 📖 Read the [documentation](./README.md)
- 💬 Join discussions in [GitHub Discussions](https://github.com/Alejandro-Bravo2/proyecto_angular_DWEC_alejandrobravo/discussions)
- 🐛 Report bugs in [Issues](https://github.com/Alejandro-Bravo2/proyecto_angular_DWEC_alejandrobravo/issues)
- 📧 Contact maintainers

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation

Thank you for making COFIRA better! 🎉
