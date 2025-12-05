# AegisX CLI - Installation Guide

> Premium CRUD Generator for Angular + Fastify

---

## Quick Start

### 1. Install the CLI

```bash
npm install -g @aegisx/cli
```

### 2. Activate Your License

**If you have a license key:**

```bash
aegisx activate AEGISX-PRO-XXXXXXXX-XX
```

**If you want to try first (14-day trial):**

```bash
aegisx trial
```

### 3. Generate Your First Module

```bash
aegisx generate products --force
```

---

## License Tiers

| Tier         | Price        | Developers | Features                           |
| ------------ | ------------ | ---------- | ---------------------------------- |
| Professional | $49 one-time | 1          | All CLI features, 1yr updates      |
| Team         | $199/year    | Up to 10   | Priority support, custom templates |
| Enterprise   | Contact us   | Unlimited  | On-premise, SLA, dedicated support |
| Trial        | Free         | 1          | 14 days, limited features          |

**Purchase at:** https://aegisx.dev

---

## License Management

### Activate License

```bash
# Activate with your license key
aegisx activate AEGISX-PRO-A7X9K2M4-5C

# Output:
# ✅ License activated successfully!
#    Tier: Professional
#    Developers: 1
#    Features: generate, shell, templates, config
```

### Check License Status

```bash
aegisx license

# Output:
# 🔐 License Status: Active
#    Tier: Professional
#    Developers: 1
#    Features: generate, shell, templates, config
```

### Start Free Trial

```bash
aegisx trial

# Output:
# 🎉 Trial Started!
#    14-day trial activated
#    Available features: generate, shell
```

### Remove License

```bash
aegisx deactivate

# Output:
# ✅ License removed successfully
```

---

## License Key Format

License keys follow this format:

```
AEGISX-[TIER]-[SERIAL]-[CHECKSUM]
```

**Examples:**

- `AEGISX-PRO-A7X9K2M4-5C` - Professional license
- `AEGISX-TEAM-B8Y0L3N5-9D` - Team license
- `AEGISX-ENT-C9Z1M4P6-3E` - Enterprise license

---

## Environment Variables

You can also set your license key via environment variable:

```bash
export AEGISX_LICENSE_KEY="AEGISX-PRO-A7X9K2M4-5C"
```

**Priority order:**

1. Environment variable `AEGISX_LICENSE_KEY`
2. License file `~/.aegisx-license`

---

## License Storage

License keys are stored locally in:

```
~/.aegisx-license
```

This file contains only your license key and is used for offline validation.

---

## Offline Support

AegisX CLI works **completely offline** for all license tiers:

- ✅ Professional - Full offline support
- ✅ Team - Full offline support
- ✅ Enterprise - Full offline support
- ✅ Trial - Full offline support

No internet connection required for code generation.

---

## Available Commands

### Generation Commands

```bash
# Generate backend module
aegisx generate <table_name> [options]

# Options:
#   -t, --target <target>    Target: backend (default) or frontend
#   -f, --force              Overwrite existing files
#   -d, --dry-run            Preview without creating files
#   -e, --with-events        Include WebSocket events
#   --with-import            Include bulk import (Excel/CSV)
#   -a, --app <app>          Target app: api, web, admin
#   --flat                   Use flat structure
#   --no-register            Skip auto-registration
```

### Utility Commands

```bash
# List available database tables
aegisx list

# Interactive shell for database exploration
aegisx shell

# Generate shell/app scaffolding
aegisx shell-gen [options]

# View current configuration
aegisx config

# Show CLI version
aegisx --version

# Show help
aegisx --help
```

---

## Examples

### Basic CRUD Generation

```bash
# Generate backend for 'products' table
aegisx generate products --force

# Generate frontend component
aegisx generate products --target frontend --force
```

### With Import Functionality

```bash
# Backend with Excel/CSV import
aegisx generate budgets --with-import --force

# Frontend with import dialog
aegisx generate budgets --target frontend --with-import --force
```

### With Real-time Events

```bash
# Backend with WebSocket events
aegisx generate notifications --with-events --force

# Frontend with event handling
aegisx generate notifications --target frontend --with-events --force
```

### Dry Run (Preview)

```bash
# Preview what will be generated
aegisx generate products --dry-run
```

---

## Troubleshooting

### "No license key found"

```bash
# Activate your license
aegisx activate YOUR-LICENSE-KEY

# Or start a trial
aegisx trial
```

### "Invalid license key format"

Ensure your key follows the format: `AEGISX-[TIER]-[SERIAL]-[CHECKSUM]`

Example: `AEGISX-PRO-A7X9K2M4-5C`

### "Trial license expired"

Purchase a license at https://aegisx.dev

```bash
aegisx activate AEGISX-PRO-YOUR-NEW-KEY
```

### "Feature not available in your license tier"

Some features are only available in higher tiers. Check your license:

```bash
aegisx license
```

Upgrade at https://aegisx.dev

---

## Support

- **Community**: GitHub Issues (all tiers)
- **Email**: support@aegisx.dev (Team/Enterprise)
- **Discord**: Private channel (Team/Enterprise)

---

## Links

- **Website**: https://aegisx.dev
- **Documentation**: https://docs.aegisx.dev
- **GitHub**: https://github.com/aegisx-platform/cli
- **Purchase**: https://aegisx.gumroad.com

---

**Copyright (c) 2024 AegisX Team. All rights reserved.**
