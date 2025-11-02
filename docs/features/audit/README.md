# Audit System

**Enterprise-Grade Security Audit & Compliance Tracking**

Version: 1.0.0
Last Updated: 2025-11-02

## Overview

The Audit System provides comprehensive security monitoring and compliance tracking by recording and analyzing:

- **Login Attempts** - Track authentication events (successful/failed logins)
- **File Activity** - Monitor all file operations (upload, download, delete, view, update)

This system enables security teams to:

- Detect suspicious authentication patterns
- Track file access and modifications
- Meet compliance requirements (SOC 2, ISO 27001, GDPR)
- Generate audit reports for regulatory reviews
- Respond quickly to security incidents

## Quick Start

### For End Users

1. **Access the Audit System**
   - Navigate to **Audit** in the main menu
   - Choose **Login Attempts** or **File Activity**

2. **View Login Attempts**
   - See all authentication attempts (successful and failed)
   - Filter by user email, status, date range
   - Export data for compliance reports

3. **View File Activity**
   - Monitor file uploads, downloads, and deletions
   - Track who accessed which files and when
   - Filter by operation type, user, or filename

4. **Export Audit Data**
   - Click **Export** button to download CSV reports
   - Use **Cleanup** to delete old audit logs

For detailed usage instructions, see [USER_GUIDE.md](./USER_GUIDE.md)

### For Developers

```bash
# Database Migration (already run in Session 60)
pnpm run db:migrate

# Seed Test Data (already seeded)
pnpm run db:seed

# Access Endpoints
GET /api/login-attempts        # List login attempts
GET /api/login-attempts/stats  # Get statistics
GET /api/file-audit            # List file operations
GET /api/file-audit/stats      # Get file activity stats
```

For integration details, see [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Audit System Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend (Angular)          Backend (Fastify)        Database   │
│  ┌──────────────────┐       ┌────────────────┐      ┌─────────┐ │
│  │ Login Attempts   │────►  │ Login Attempts │────► │ login_  │ │
│  │ Component        │       │ Plugin         │      │ attempts│ │
│  │                  │       │                │      └─────────┘ │
│  │ - Table View     │       │ - Authentication      │          │ │
│  │ - Filters        │       │   Tracking            │          │ │
│  │ - Export         │       │ - Rate Limiting       │          │ │
│  │ - Cleanup        │       │ - IP Detection        │          │ │
│  └──────────────────┘       └────────────────┘                  │
│                                                                   │
│  ┌──────────────────┐       ┌────────────────┐      ┌─────────┐ │
│  │ File Activity    │────►  │ File Audit     │────► │ file_   │ │
│  │ Component        │       │ Plugin         │      │ audit_  │ │
│  │                  │       │                │      │ logs    │ │
│  │ - Table View     │       │ - File Operation      │          │ │
│  │ - Filters        │       │   Tracking            │          │ │
│  │ - Export         │       │ - Error Logging       │          │ │
│  │ - Cleanup        │       │ - Metadata Capture    │          │ │
│  └──────────────────┘       └────────────────┘      └─────────┘ │
│                                                                   │
│  Signal-Based State          RESTful API             PostgreSQL  │
│  + RxJS Observables          + TypeBox Validation    + Indexes   │
└─────────────────────────────────────────────────────────────────┘
```

For detailed architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## Key Features

### Login Attempts Tracking

- **Comprehensive Logging** - Records every authentication attempt
- **Failure Analysis** - Categorizes failure reasons (invalid_password, user_not_found, etc.)
- **IP Address Tracking** - Detects suspicious access patterns
- **User Agent Detection** - Identifies browsers and devices
- **Real-Time Statistics** - Dashboard metrics for security monitoring

### File Activity Monitoring

- **Operation Tracking** - Upload, download, delete, view, update
- **Metadata Capture** - File size, MIME type, path information
- **Error Logging** - Detailed error messages for failed operations
- **User Attribution** - Links file operations to specific users
- **Comprehensive Search** - Filter by filename, operation type, status

### Security & Compliance

- **Audit Trail** - Immutable records for compliance requirements
- **Data Export** - CSV export for regulatory reviews
- **Data Retention** - Configurable cleanup policies
- **Access Control** - Role-based permissions via RBAC system
- **GDPR Compliant** - Supports data retention and deletion policies

## Technology Stack

- **Frontend**: Angular 19 + Angular Material + TailwindCSS
- **Backend**: Fastify 4 + TypeBox validation
- **Database**: PostgreSQL 15 with optimized indexes
- **State Management**: Angular Signals + RxJS
- **Testing**: Jest (unit) + Playwright (E2E)

## Documentation Structure

| Document                                           | Purpose                 | Audience      |
| -------------------------------------------------- | ----------------------- | ------------- |
| [README.md](./README.md)                           | Overview & quick start  | Everyone      |
| [USER_GUIDE.md](./USER_GUIDE.md)                   | End-user instructions   | End Users     |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)         | Integration guide       | Developers    |
| [API_REFERENCE.md](./API_REFERENCE.md)             | API endpoints & schemas | Developers    |
| [ARCHITECTURE.md](./ARCHITECTURE.md)               | System design           | Architects    |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)       | Production setup        | DevOps        |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)         | Common issues           | Support Teams |
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) | Navigation guide        | Everyone      |

## Quick Reference

### Common Tasks

**View Recent Failed Logins:**

```typescript
// Navigate to: /audit/login-attempts
// Filter: Status = Failed
// Sort: By timestamp (newest first)
```

**Export Last 30 Days of File Activity:**

```typescript
// Navigate to: /audit/file-audit
// Click: Export button
// File: file-audit-YYYY-MM-DD.csv
```

**Cleanup Old Audit Logs:**

```typescript
// Click: Cleanup button
// Confirm: Delete logs older than X days
// System: Removes historical data
```

### API Endpoints

| Endpoint                      | Method | Description         |
| ----------------------------- | ------ | ------------------- |
| `/api/login-attempts`         | GET    | List login attempts |
| `/api/login-attempts/stats`   | GET    | Get statistics      |
| `/api/login-attempts/:id`     | GET    | Get single attempt  |
| `/api/login-attempts/:id`     | DELETE | Delete attempt      |
| `/api/login-attempts/cleanup` | DELETE | Bulk cleanup        |
| `/api/login-attempts/export`  | GET    | Export CSV          |
| `/api/file-audit`             | GET    | List file logs      |
| `/api/file-audit/stats`       | GET    | Get statistics      |
| `/api/file-audit/:id`         | GET    | Get single log      |
| `/api/file-audit/:id`         | DELETE | Delete log          |
| `/api/file-audit/cleanup`     | DELETE | Bulk cleanup        |
| `/api/file-audit/export`      | GET    | Export CSV          |

For complete API documentation, see [API_REFERENCE.md](./API_REFERENCE.md)

## Security Considerations

### Data Protection

- **Access Control** - Only authorized users can view audit logs
- **Data Integrity** - Audit records are immutable (no updates, only create/delete)
- **Sensitive Data** - Passwords are NEVER logged (only failure reasons)
- **IP Privacy** - IP addresses stored for security analysis only

### Compliance

- **GDPR Article 30** - Records of processing activities
- **SOC 2** - Security monitoring and access control
- **ISO 27001** - Audit trail requirements
- **HIPAA** - Access logging for protected health information

## Performance

- **Database Indexes** - Optimized for fast queries on common filters
- **Pagination** - Efficient handling of millions of records
- **Signal-Based UI** - Reactive updates without full page reloads
- **Lazy Loading** - Components loaded on-demand

## Getting Help

- **User Questions**: See [USER_GUIDE.md](./USER_GUIDE.md)
- **Developer Questions**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Issues/Bugs**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **API Details**: See [API_REFERENCE.md](./API_REFERENCE.md)

## Related Features

- **RBAC System** - Role-based access control for audit access
- **User Management** - User authentication and authorization
- **File Upload** - File operations that trigger audit logs
- **Monitoring Dashboard** - Real-time system health metrics

## License

Copyright © 2025 AegisX Platform. All rights reserved.

---

**Next Steps:**

- 📖 Read the [USER_GUIDE.md](./USER_GUIDE.md) for detailed usage instructions
- 👨‍💻 See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for integration examples
- 🏗️ Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
