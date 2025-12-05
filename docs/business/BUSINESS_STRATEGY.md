# AegisX Business Strategy

> Complete business plan for AegisX Platform monetization

---

## Executive Summary

AegisX uses an **Open Core** business model:

- **FREE**: @aegisx/ui - Angular component library (MIT license)
- **PREMIUM**: @aegisx/cli - CRUD Generator CLI ($49-$199)

This approach builds community with free UI components while monetizing the developer productivity tool.

---

## Product Tiers

### FREE Tier - @aegisx/ui

| Feature                | Status    | URL                                                    |
| ---------------------- | --------- | ------------------------------------------------------ |
| Angular 17+ Components | Published | [npm](https://www.npmjs.com/package/@aegisx/ui)        |
| Material Design 3      | Published | [GitHub](https://github.com/aegisx-platform/aegisx-ui) |
| Theme System           | Published | MIT License                                            |
| Documentation          | Planned   | docs.aegisx.dev                                        |

**Purpose**: Build trust, community adoption, organic marketing

### PREMIUM Tier - @aegisx/cli

| Feature          | Version  | Description                  |
| ---------------- | -------- | ---------------------------- |
| CRUD Generator   | 2.3.0    | Full-stack API generation    |
| 60+ Templates    | Included | Backend + Frontend templates |
| Shell Generator  | NEW      | App shell scaffolding        |
| TypeBox Schemas  | Included | Auto-generated validation    |
| Import/Export    | Included | Excel/CSV bulk operations    |
| WebSocket Events | Included | Real-time event emission     |

**Revenue Target**: Primary income source

---

## Pricing Strategy

### Professional License - $49 (one-time)

- Single developer
- All CLI features
- 1 year updates
- Community support via GitHub

### Team License - $199/year

- Up to 10 developers
- All Professional features
- Priority email support
- Private Slack channel
- Custom template requests

### Enterprise - Contact Sales

- Unlimited developers
- On-premise installation
- Custom integrations
- Dedicated support
- SLA agreements

---

## Domain Architecture

### aegisx.dev (Primary)

```
aegisx.dev              -> Landing/Marketing (apps/landing)
├── /                   -> Homepage
├── /pricing            -> Pricing tiers
├── /features           -> Feature showcase
├── /purchase           -> Gumroad checkout
├── /privacy            -> Privacy policy
└── /terms              -> Terms of service
```

**Deployment**: Vercel/Netlify (static)

### docs.aegisx.dev (Documentation)

```
docs.aegisx.dev         -> Documentation hub
├── /ui                 -> @aegisx/ui docs (FREE)
├── /cli                -> @aegisx/cli docs (Preview)
├── /guides             -> Tutorials
└── /api                -> API reference
```

**Deployment**: VitePress/Docusaurus (static)

### app.aegisx.dev (Customer Portal) - Phase 2

```
app.aegisx.dev          -> License management
├── /login              -> Authenticate with license
├── /dashboard          -> Download, manage license
├── /updates            -> Version history
└── /support            -> Support tickets
```

**Deployment**: Vercel Functions / Simple Node.js

---

## Distribution Strategy

### Phase 1: Gumroad Distribution (Launch)

```
User Flow:
1. aegisx.dev -> View landing page
2. /pricing -> Select tier
3. Gumroad checkout -> Payment
4. Email -> Receive license key + download link
5. npm install @aegisx/cli-[license-hash]
```

**Pros**: No infrastructure needed, handles payments, simple
**Cons**: 10% fee, limited customization

### Phase 2: GitHub Packages (Scale)

```
# Private package on GitHub
npm login --registry=https://npm.pkg.github.com
npm install @aegisx/cli

# License validation in postinstall
```

**Pros**: Familiar to developers, integrates with CI/CD
**Cons**: Requires license validation service

### Phase 3: Self-Hosted Registry (Enterprise)

```
npm.aegisx.dev -> Verdaccio private registry
```

**Pros**: Full control, no third-party fees
**Cons**: Infrastructure overhead

---

## License Key System

### Key Format

```
AEGISX-[TIER]-[RANDOM]-[CHECKSUM]

Examples:
AEGISX-PRO-A7X9K2M4-5C
AEGISX-TEAM-B8Y0L3N5-9D
AEGISX-ENT-C9Z1M4P6-3E
```

### Validation Flow

```typescript
// libs/aegisx-cli/src/license/validator.ts
export async function validateLicense(key: string): Promise<LicenseInfo> {
  // 1. Parse key format
  const [prefix, tier, serial, checksum] = key.split('-');

  // 2. Validate checksum locally (offline-first)
  if (!isValidChecksum(serial, checksum)) {
    throw new LicenseError('Invalid license key format');
  }

  // 3. Optional: Online validation for enterprise features
  if (tier === 'ENT' || tier === 'TEAM') {
    const response = await fetch('https://api.aegisx.dev/license/validate', {
      method: 'POST',
      body: JSON.stringify({ key }),
    });
    return response.json();
  }

  // 4. Return license info
  return {
    tier,
    valid: true,
    expiresAt: calculateExpiry(tier),
    features: getFeaturesByTier(tier),
  };
}
```

### Activation Points

1. **CLI Install (postinstall)**: Prompt for license key
2. **First Generation**: Validate before generating files
3. **Version Update**: Re-validate on major updates

---

## Implementation Phases

### Phase 1: MVP Launch (Current Focus)

| Task                         | Priority | Status  |
| ---------------------------- | -------- | ------- |
| Fix landing page CTA         | CRITICAL | Pending |
| Add legal pages              | HIGH     | Pending |
| Set up Gumroad product       | HIGH     | Pending |
| Add basic license validation | HIGH     | Pending |
| Deploy to aegisx.dev         | HIGH     | Pending |

### Phase 2: Documentation & Marketing

| Task                   | Priority | Status  |
| ---------------------- | -------- | ------- |
| Deploy docs.aegisx.dev | HIGH     | Pending |
| Create video tutorials | MEDIUM   | Pending |
| Write blog posts       | MEDIUM   | Pending |
| Set up analytics       | MEDIUM   | Pending |

### Phase 3: Scale & Automation

| Task                             | Priority | Status  |
| -------------------------------- | -------- | ------- |
| Customer portal (app.aegisx.dev) | MEDIUM   | Pending |
| Automated license delivery       | MEDIUM   | Pending |
| Self-service subscription        | LOW      | Pending |
| Enterprise sales process         | LOW      | Pending |

---

## Marketing Strategy

### Organic Growth (FREE)

1. **Open Source UI Library**
   - GitHub stars and forks
   - npm downloads
   - Community contributions

2. **Content Marketing**
   - Blog posts on Angular development
   - YouTube tutorials
   - Twitter/X presence

3. **Community Building**
   - Discord server
   - GitHub discussions
   - Stack Overflow answers

### Paid Acquisition (After Validation)

1. **Developer Ads**
   - Carbon Ads (developer sites)
   - Reddit r/angular
   - Dev.to sponsorships

2. **Conference Presence**
   - ngConf sponsorship
   - Local Angular meetups
   - Online webinars

---

## Revenue Projections

### Year 1 Goals

| Metric                 | Target | Notes           |
| ---------------------- | ------ | --------------- |
| Pro licenses sold      | 100    | $4,900 revenue  |
| Team licenses          | 10     | $1,990 revenue  |
| Monthly downloads (UI) | 1,000  | Brand awareness |
| GitHub stars (UI)      | 500    | Social proof    |

### Break-Even Analysis

```
Initial Investment:
- Development time: Already done
- Domain: ~$12/year
- Hosting: ~$0 (Vercel free tier)
- Gumroad fee: 10% of sales

To break even on time spent (assuming 200 hours):
- At $50/hour value = $10,000
- Need 204 Pro licenses OR 51 Team licenses
```

---

## Risk Mitigation

### Technical Risks

| Risk               | Mitigation                                  |
| ------------------ | ------------------------------------------- |
| License key leaked | Rate limiting, key rotation                 |
| CLI piracy         | Offline-first with optional online features |
| Breaking changes   | Semantic versioning, migration guides       |

### Business Risks

| Risk           | Mitigation                          |
| -------------- | ----------------------------------- |
| Low conversion | Free trial, money-back guarantee    |
| Competition    | Focus on Angular niche, superior DX |
| Support burden | Documentation, community forum      |

---

## Success Metrics

### Key Performance Indicators (KPIs)

| Metric                    | How to Measure             | Target    |
| ------------------------- | -------------------------- | --------- |
| Conversion Rate           | Purchases / Landing visits | 2%        |
| Customer Lifetime Value   | Total revenue per customer | $75       |
| Monthly Active Users (UI) | npm downloads              | 1,000     |
| Support Ticket Volume     | Email/GitHub issues        | < 10/week |
| Net Promoter Score        | Post-purchase survey       | > 8       |

---

## Appendix

### Competitor Analysis

| Product                | Price | Differentiator                          |
| ---------------------- | ----- | --------------------------------------- |
| Angular CLI Schematics | Free  | Generic, not enterprise-focused         |
| NestJS CRUD            | Free  | Backend only                            |
| Jhipster               | Free  | Heavy, opinionated                      |
| **AegisX CLI**         | $49   | Angular-native, full-stack, lightweight |

### Technology Stack

- **Landing**: Angular 17+ (apps/landing)
- **Docs**: VitePress/Docusaurus (planned)
- **Payments**: Gumroad (Phase 1), Stripe (Phase 2)
- **License API**: Cloudflare Workers (minimal)
- **Analytics**: Plausible (privacy-first)

---

**Document Version**: 1.0.0
**Last Updated**: December 3, 2025
**Status**: Draft - Ready for Review
