# AegisX CLI Documentation (Monorepo)

> **Internal documentation for monorepo developers & maintainers**

---

## Documentation Structure

| Location                | Purpose          | Publish to NPM? |
| ----------------------- | ---------------- | --------------- |
| `libs/aegisx-cli/docs/` | User-facing docs | ✅ Yes          |
| `docs/aegisx-cli/`      | Internal docs    | ❌ No           |

---

## User Documentation

**[Go to User Docs](../../libs/aegisx-cli/docs/README.md)** - Complete CLI usage documentation

| Document                                                             | Description                  |
| -------------------------------------------------------------------- | ---------------------------- |
| [Quick Reference](../../libs/aegisx-cli/docs/QUICK_REFERENCE.md)     | All commands at a glance     |
| [Workflow Overview](../../libs/aegisx-cli/docs/WORKFLOW_OVERVIEW.md) | CLI architecture & workflows |
| [Events Guide](../../libs/aegisx-cli/docs/EVENTS_GUIDE.md)           | WebSocket real-time events   |
| [Import Guide](../../libs/aegisx-cli/docs/IMPORT_GUIDE.md)           | Bulk Excel/CSV import        |

---

## Internal Documentation (This Folder)

These docs are for **maintainers only** and are NOT published to npm:

| Document                                                               | Description                       |
| ---------------------------------------------------------------------- | --------------------------------- |
| [COMPLETE_WORKFLOW.md](./COMPLETE_WORKFLOW.md)                         | **Full workflow: DB → API → UI**  |
| [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)                                   | Git release & npm publishing      |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md)                                 | Testing strategies for monorepo   |
| [TEST_PRODUCTS_REFERENCE.md](./TEST_PRODUCTS_REFERENCE.md)             | Test products schema reference    |
| [WEBSOCKET_IMPLEMENTATION_SPEC.md](./WEBSOCKET_IMPLEMENTATION_SPEC.md) | WebSocket implementation details  |
| [internal/](./internal/)                                               | Contributing & development guides |

---

## Monorepo-Specific Commands

For monorepo developers, use these pnpm shortcuts:

```bash
# Basic CRUD
pnpm run crud -- <table_name> --force

# With import
pnpm run crud:import -- <table_name> --force

# With events
pnpm run crud:events -- <table_name> --force

# Full package
pnpm run crud:full -- <table_name> --force

# List tables
pnpm run crud:list
```

---

**Last Updated:** 2025-12-07
