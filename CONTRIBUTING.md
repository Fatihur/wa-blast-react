# Contributing to WA Blast App

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features
1. Check existing feature requests
2. Create a new issue with tag `enhancement`
3. Describe the feature and its benefits
4. Provide use cases

### Pull Requests

#### Before Submitting
1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Update documentation if needed

#### Commit Guidelines
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add image upload support for blast messages
fix: resolve QR code generation timeout
docs: update deployment guide with Railway steps
```

#### Pull Request Process
1. Update README.md if needed
2. Update CHANGELOG.md
3. Ensure code passes all tests
4. Request review from maintainers
5. Address review comments

## 💻 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/your-username/wa-blast-react.git
cd wa-blast-react

# Install dependencies
npm run install:all

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run migrations
cd backend && npm run prisma:migrate

# Start development
cd .. && npm run dev
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Code Style

### Backend (TypeScript)
- Use TypeScript strict mode
- Follow Airbnb style guide
- Use Prettier for formatting
- Use ESLint for linting

### Frontend (React + TypeScript)
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety
- Keep components small and focused

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Components**: PascalCase
- **Functions**: camelCase

## 🔒 Security

### Reporting Security Issues
**DO NOT** open public issues for security vulnerabilities.
Instead, email: [your-email@example.com]

### Security Guidelines
- Never commit sensitive data (.env files, API keys)
- Use environment variables for secrets
- Validate all user inputs
- Sanitize data before database queries
- Use HTTPS in production
- Keep dependencies updated

## 📋 Code Review Checklist

Before submitting PR, ensure:
- [ ] Code follows project style
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Error handling implemented
- [ ] Type safety maintained
- [ ] Performance optimized
- [ ] Security best practices followed

## 🎯 Priority Areas

We especially welcome contributions in:
- 📱 Mobile responsiveness improvements
- 🧪 Test coverage
- 📚 Documentation
- 🌐 Internationalization
- ⚡ Performance optimization
- 🔒 Security enhancements

## 💬 Communication

- **Issues**: GitHub Issues for bugs and features
- **Discussions**: GitHub Discussions for questions
- **Email**: For security issues only

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to WA Blast App! 🚀
