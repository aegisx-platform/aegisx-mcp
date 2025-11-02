# Feature Documentation Templates

> **Standard templates for documenting features in AegisX Platform**

## 📚 Available Templates

### 1. FEATURE_IMPLEMENTATION_TEMPLATE.md

**Purpose:** Comprehensive technical documentation for feature implementations

**Use When:**

- Documenting a new feature implementation
- Creating technical reference for complex features
- Standardizing documentation across the platform

**What It Includes:**

- ✅ Complete architecture and flow diagrams
- ✅ File structure with line number references
- ✅ Detailed implementation examples
- ✅ Troubleshooting guide (5-10 common issues)
- ✅ Security considerations
- ✅ Testing checklist (manual + automated)
- ✅ Database schema documentation
- ✅ Environment variables reference
- ✅ Quick fixes and debugging commands
- ✅ FAQ section (10-15 questions)

**Size:** ~1,450 lines (38KB)

**Reference Examples:**

- [LOGIN_IMPLEMENTATION.md](../authentication/implementations/LOGIN_IMPLEMENTATION.md)
- [ARCHITECTURE.md](../authentication/ARCHITECTURE.md)

---

## 🚀 Quick Start

### Step 1: Copy the Template

```bash
# Copy template to your feature directory
cp docs/features/templates/FEATURE_IMPLEMENTATION_TEMPLATE.md \
   docs/features/[your-feature]/[FEATURE_NAME]_IMPLEMENTATION.md
```

### Step 2: Replace Placeholders

Search and replace all placeholders:

- `[FEATURE NAME]` → Your feature name (e.g., "User Profile Management")
- `[BRIEF DESCRIPTION]` → Short description of the feature
- `[ServiceName]` → Actual service names
- `[module-name]` → Actual module/directory names
- `[table_name]` → Actual database table names
- `[XX-YY]` → Actual line numbers from implementation

### Step 3: Complete Metadata

Fill out the metadata section at the top:

```markdown
| Property             | Value                   |
| -------------------- | ----------------------- |
| **Feature Name**     | User Profile Management |
| **Status**           | Complete                |
| **Version**          | 1.0.0                   |
| **Last Updated**     | 2025-11-03              |
| **Author**           | Development Team        |
| **Module**           | User Management         |
| **Related Features** | Authentication, RBAC    |
```

### Step 4: Document Implementation

Work through each section:

1. **Overview** - What the feature does and why
2. **Architecture & Flow** - ASCII diagrams showing complete flow
3. **File Structure** - List all files with line numbers
4. **Implementation Details** - Code snippets with explanations
5. **Troubleshooting** - Common problems and solutions
6. **Security** - Authentication, authorization, validation
7. **Testing** - Manual steps and automated tests
8. **Database Schema** - Tables, indexes, relationships
9. **Environment Variables** - Required and optional configs
10. **Quick Fixes** - Common debugging commands
11. **FAQ** - Frequently asked questions

### Step 5: Review Checklist

Before committing, verify:

- [ ] All `[PLACEHOLDERS]` replaced
- [ ] Code snippets tested and working
- [ ] File paths and line numbers accurate
- [ ] Diagrams match current architecture
- [ ] Links to related docs work
- [ ] Examples use realistic data
- [ ] Security considerations documented
- [ ] Testing instructions complete

---

## 📋 Documentation Standards

### File Naming Convention

```
[FEATURE_NAME]_IMPLEMENTATION.md
```

Examples:

- `LOGIN_IMPLEMENTATION.md`
- `PASSWORD_RESET_IMPLEMENTATION.md`
- `USER_PROFILE_IMPLEMENTATION.md`
- `REAL_TIME_SYNC_IMPLEMENTATION.md`

### Directory Structure

```
docs/features/[feature-name]/
├── README.md                           # Feature overview
├── USER_GUIDE.md                       # End-user guide
├── DEVELOPER_GUIDE.md                  # Developer guide
├── API_REFERENCE.md                    # API documentation
├── ARCHITECTURE.md                     # System architecture
├── DEPLOYMENT_GUIDE.md                 # Deployment instructions
├── TROUBLESHOOTING.md                  # Troubleshooting guide
├── DOCUMENTATION_INDEX.md              # Navigation guide
└── implementations/
    ├── [FEATURE_1]_IMPLEMENTATION.md   # Detailed implementation
    └── [FEATURE_2]_IMPLEMENTATION.md   # Detailed implementation
```

### ASCII Diagram Guidelines

**Flow Diagrams:**

```
Use boxes (┌─┐ └─┘) and arrows (│ ▼ →) for clarity
Number each step clearly
Include decision points and branches
```

**Component Diagrams:**

```
Show relationships between components
Use consistent symbols for different types
Keep it simple and readable
```

### Code Snippet Guidelines

**Include:**

- ✅ File path relative to project root
- ✅ Line number references
- ✅ Comments explaining key points
- ✅ Both correct and incorrect patterns (when helpful)

**Format:**

```markdown
**File:** `apps/api/src/[module]/[file].ts`

**Lines [XX-YY]:**

\`\`\`typescript
// Code with explanatory comments
\`\`\`
```

### Cross-Reference Guidelines

**Internal Links:**

```markdown
- [Related Feature](../[feature]/[FILE].md)
- [Section Name](#section-name)
```

**External Links:**

```markdown
- [TypeBox Documentation](https://github.com/sinclairzx81/typebox)
- [Fastify Rate Limiting](https://github.com/fastify/fastify-rate-limit)
```

---

## 🎯 Best Practices

### 1. Keep It Updated

Update documentation when:

- Implementation changes
- New edge cases discovered
- API contracts modified
- Security considerations change
- New troubleshooting issues found

### 2. Use Real Examples

- ✅ Use actual code from implementation
- ✅ Include real API responses
- ✅ Show realistic test data
- ❌ Don't use pseudo-code or "TODO" examples

### 3. Document Edge Cases

Include:

- Error scenarios
- Validation failures
- Race conditions
- Performance bottlenecks
- Security vulnerabilities

### 4. Provide Context

Explain:

- **What** the code does
- **Why** design decisions were made
- **How** components interact
- **When** to use different approaches
- **Where** to find related information

### 5. Make It Searchable

Use:

- Clear section headers
- Table of contents
- Keywords in examples
- Consistent terminology
- Error codes and messages

---

## 🛠️ Tools for Documentation

### Generate Table of Contents

```bash
# Using markdown-toc (install: npm i -g markdown-toc)
markdown-toc -i [FILE].md
```

### Validate Markdown

```bash
# Using markdownlint (install: npm i -g markdownlint-cli)
markdownlint [FILE].md
```

### Find Broken Links

```bash
# Using markdown-link-check (install: npm i -g markdown-link-check)
markdown-link-check [FILE].md
```

### Check Spelling

```bash
# Using cspell (install: npm i -g cspell)
cspell [FILE].md
```

---

## 📚 Additional Resources

### Reference Documentation

**Excellent Examples in This Project:**

- [Authentication Feature Docs](../authentication/) - Complete feature documentation set
- [LOGIN_IMPLEMENTATION.md](../authentication/implementations/LOGIN_IMPLEMENTATION.md) - Detailed implementation guide

**External Resources:**

- [Write the Docs](https://www.writethedocs.org/) - Documentation best practices
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [GitLab Documentation Guidelines](https://docs.gitlab.com/ee/development/documentation/)

### AegisX Documentation Standards

See project documentation guides:

- [Feature Development Standard](../../development/feature-development-standard.md)
- [Documentation Policy](../../../CLAUDE.md#feature-documentation-policy-mandatory)

---

## 🤝 Contributing

### Adding New Templates

If you create a new documentation template:

1. Add it to this directory
2. Document its purpose and usage in this README
3. Provide reference examples
4. Update the table of contents

### Improving Templates

To improve existing templates:

1. Create an issue describing the improvement
2. Update the template
3. Update this README if needed
4. Reference real-world usage examples

---

## 💬 Feedback

Found a problem with the templates or have suggestions?

- Create an issue in the project repository
- Contact the development team
- Submit a pull request with improvements

---

**Last Updated:** 2025-11-03
**Maintained By:** AegisX Platform Team
**Version:** 1.0.0
