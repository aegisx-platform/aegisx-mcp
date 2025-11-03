# Authentication

> **Enterprise-grade authentication system with JWT, role-based access control, and intelligent rate limiting**

**Status:** 🟢 Production Ready
**Version:** 1.0.0
**Last Updated:** 2025-11-01 (Session 57)
**Module Type:** Core
**Dependencies:** PostgreSQL, Redis, JWT

---

## 📋 Quick Start

```bash
# Backend authentication routes available at:
http://localhost:3333/api/auth/*

# Frontend authentication pages:
http://localhost:4200/login
http://localhost:4200/register
http://localhost:4200/forgot-password
http://localhost:4200/reset-password
```

**For end users:** See [User Guide](./USER_GUIDE.md)
**For developers:** See [Developer Guide](./DEVELOPER_GUIDE.md)
**For deployment:** See [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

## 🎯 Key Features

- ✅ **User Registration** - New user signup with email verification
- ✅ **Login System** - Secure JWT-based authentication
- ✅ **Password Reset** - Token-based password reset flow
- ✅ **Email Verification** - Account activation via email
- ✅ **Intelligent Rate Limiting** - UX-friendly rate limits that prevent abuse
- ✅ **Permission-Based Access** - Fine-grained resource access control
- ✅ **Token Refresh** - Seamless session renewal
- ✅ **Account Lockout** - Protection against brute force attacks

---

## 📚 Documentation

### For End Users

- [User Guide](./USER_GUIDE.md) - Complete guide for using authentication features
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

### For Developers

- [Developer Guide](./DEVELOPER_GUIDE.md) - Technical implementation details
- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Architecture](./ARCHITECTURE.md) - System design and rate limiting decisions

### Implementation Details (Deep Dive)

**📁 [implementations/](./implementations/)** - Comprehensive technical documentation for each feature

- **[Overview](./implementations/README.md)** - Complete system architecture, all flows, diagrams
- **[Login](./implementations/LOGIN_IMPLEMENTATION.md)** - JWT tokens, account lockout, rate limiting
- **[Registration](./implementations/REGISTRATION_IMPLEMENTATION.md)** - Auto-login, validation, email verification
- **[Email Verification](./implementations/EMAIL_VERIFICATION_IMPLEMENTATION.md)** - Token generation, SMTP, resend
- **[Password Reset](./implementations/PASSWORD_RESET_IMPLEMENTATION.md)** - 2-step flow, token expiration
- **[Refresh Token](./implementations/REFRESH_TOKEN_IMPLEMENTATION.md)** - Token rotation, HTTP interceptor
- **[Rate Limiting](./implementations/RATE_LIMITING_IMPLEMENTATION.md)** - Redis-based, per-endpoint limits
- **[Account Lockout](./implementations/ACCOUNT_LOCKOUT_IMPLEMENTATION.md)** - Dual storage, auto-unlock

**~9,000 lines** of detailed technical documentation with code references, troubleshooting, and testing guides.

### For DevOps

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment instructions

### Navigation

- [Documentation Index](./DOCUMENTATION_INDEX.md) - Complete documentation map

---

## 🔗 Quick Links

### Backend

- **Module:** `apps/api/src/core/auth/`
- **Routes:** `apps/api/src/core/auth/auth.routes.ts`
- **Controller:** `apps/api/src/core/auth/auth.controller.ts`
- **Service:** `apps/api/src/core/auth/services/auth.service.ts`
- **Schemas:** `apps/api/src/core/auth/auth.schemas.ts`

### Frontend

- **Pages:** `apps/web/src/app/pages/auth/`
  - `login.page.ts` - Login page
  - `register.page.ts` - Registration page (Session 57)
  - `forgot-password.page.ts` - Password reset request
  - `reset-password.page.ts` - Password reset with token
- **Services:** `apps/web/src/app/core/auth/services/`
- **Guards:** `apps/web/src/app/core/auth/guards/`

### Database

- **Migrations:** `apps/api/src/database/migrations/*_users*`
- **Seeds:** `apps/api/src/database/seeds/001_users.ts`

---

## 🚦 Status & Roadmap

### Current Status (v1.0.0) - Session 57

- ✅ **Register Page** - Complete user registration with validation
- ✅ **Intelligent Rate Limiting** - Generous limits that allow fixing validation errors
- ✅ **Error Standardization** - All rate limit errors include statusCode field
- ✅ **Security & UX Balance** - Prevents abuse while maintaining good user experience
- ✅ **Production Ready** - All tests passing, documentation complete

### Recent Improvements (Session 57)

**Registration UX Enhancement:**

- Increased rate limit from 3/hour to 100/5min
- Allows users to fix validation errors (username/email already exists)
- Still prevents spam and enumeration attacks

**Login Experience Improvement:**

- Increased from 5/1min to 15/5min
- Allows for typos and forgotten passwords
- Maintains brute force protection

**Password Reset Flexibility:**

- Increased from 5/1min to 10/5min
- Allows multiple password attempts when validating requirements
- Prevents abuse with reasonable limits

### Roadmap

**v1.1.0** (Future)

- [ ] Two-Factor Authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Device tracking and management
- [ ] Login history and audit logs

**v1.2.0** (Future)

- [ ] Biometric authentication support
- [ ] Advanced session management
- [ ] IP-based access restrictions

---

## 📊 Technical Overview

| Aspect       | Details                                         |
| ------------ | ----------------------------------------------- |
| **Backend**  | Fastify 4+, TypeBox validation, JWT tokens      |
| **Frontend** | Angular 19+, Signals, Reactive Forms            |
| **Database** | PostgreSQL 15+ (users, user_roles, permissions) |
| **Caching**  | Redis (permission caching, rate limiting)       |
| **Security** | JWT, bcrypt password hashing, RBAC              |

### Rate Limiting Strategy (Session 57)

| Endpoint           | Rate Limit               | Reasoning                                             |
| ------------------ | ------------------------ | ----------------------------------------------------- |
| **Register**       | 100 requests / 5 minutes | Allows fixing validation errors while preventing spam |
| **Login**          | 15 attempts / 5 minutes  | Per IP+email combo, prevents brute force              |
| **Reset Password** | 10 attempts / 5 minutes  | Allows password validation retries                    |
| **Request Reset**  | 3 requests / 1 hour      | Prevents email enumeration                            |
| **Refresh Token**  | 10 requests / 1 minute   | Normal token refresh rate                             |

**Design Philosophy:** Generous limits that exceed normal user behavior but remain well below attacker patterns.

---

## 🤝 Related Features

- [RBAC Management](../rbac/README.md) - Role and permission management
- [User Profile](../user-profile/README.md) - User profile customization
- [Settings](../settings/README.md) - Account settings management

---

## 📝 Notes

**Important Implementation Details:**

1. **Rate Limiting** - Uses `@fastify/rate-limit` v10.3.0
   - Generous limits allow users to fix validation errors
   - All endpoints return standardized 429 errors
   - Key generation includes IP address for tracking

2. **Password Security**
   - Bcrypt hashing with salt rounds
   - Password requirements enforced client and server-side
   - Secure token generation for reset flow

3. **Permission System**
   - Database-backed permissions
   - Redis caching for performance
   - Supports wildcard permissions (`*:*`)

4. **Session Management**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Automatic token refresh before expiry

**Known Limitations:**

- Email verification requires SMTP configuration
- Rate limits are per-IP (consider proxy/VPN users)
- No social login support yet

**Future Considerations:**

- Add device fingerprinting
- Implement adaptive rate limiting based on user behavior
- Consider geo-location based security

---

**Need help?** See [Troubleshooting Guide](./TROUBLESHOOTING.md) or contact the development team.
