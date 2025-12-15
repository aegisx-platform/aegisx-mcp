# Drug Management System

> **Comprehensive drug and drug generic management with TMT integration**

**Status:** 🔵 Planned
**Version:** 1.0.0
**Last Updated:** 2025-12-12
**Priority:** High
**Owner:** Inventory Team

---

## 📋 Overview

Drug Management System provides a unified interface for managing hospital pharmaceutical inventory including trade-name drugs, generic drugs, drug components, packaging ratios, and TMT (Thai Medical Terminology) mappings.

### Key Features

- ✅ **Unified Drug Management** - Manage drugs and generics in one place
- ✅ **TMT Integration** - Map drugs to TMT concepts using existing TMT Lookup component
- ✅ **Component Management** - Handle drug compositions (e.g., Paracetamol + Caffeine)
- ✅ **Pack Ratio Configuration** - Define packaging units (1 box = 100 tablets)
- ✅ **Focus Lists** - Manage ED List, NLEM, Hospital formulary
- ✅ **Bulk Operations** - Mass updates, imports, exports
- ✅ **Smart Filters** - Search by generic, manufacturer, TMT status, categories

### Business Value

- **Regulatory Compliance** - NLEM tracking, ED classification, TMT mapping for ministry reporting
- **Inventory Efficiency** - Better drug organization and tracking
- **Cost Control** - Pack ratio management for accurate costing
- **Data Quality** - Duplicate detection, TMT validation

---

## 🎯 Quick Start

### For Users

1. Navigate to **Inventory → Drug Management**
2. Use filters to find drugs or generics
3. View drug details with generic info and TMT mapping
4. Create/Edit drugs with autocomplete for generics and manufacturers
5. Map drugs to TMT concepts using TMT Lookup component

### For Developers

```bash
# Check existing CRUD implementations
ls apps/api/src/modules/inventory/master-data/drugs
ls apps/web/src/app/features/inventory/modules/drugs

# Database tables
inventory.drugs
inventory.drug_generics
inventory.drug_components
inventory.drug_pack_ratios
inventory.drug_focus_lists
```

---

## 📊 Current Status

### Existing (✅)

- Backend API: drugs CRUD, drug_generics CRUD
- Frontend: Separate drugs and drug-generics modules
- Database: 11 drug-related tables with relationships
- TMT Components: `ax-tmt-lookup`, `ax-tmt-hierarchy`, `ax-tmt-badge`

### Missing (❌)

- Unified management page
- TMT mapping UI
- Component/Pack ratio management UI
- Bulk operations UI
- Smart autocomplete for generic/manufacturer selectors

---

## 📚 Documentation

- [Technical Specification](./spec.md) - Architecture, database schema, relationships
- [API Contracts](./API.md) - Endpoint specifications
- [UI Mockup](./UI-MOCKUP.md) - Interface design and UX flows

---

## 🔗 Related Features

- [TMT Lookup](../tmt-lookup/README.md) - TMT autocomplete component (EXISTING)
- [Inventory App](../inventory-app/README.md) - Overall inventory system

---

## 🗺️ Roadmap

### Phase 1: Foundation (Week 1)

- [ ] Fix drugs form with autocomplete selectors
- [ ] Improve filters with generic/manufacturer search
- [ ] Add TMT mapping UI using ax-tmt-lookup component

### Phase 2: Unified Interface (Week 2)

- [ ] Create unified drug-management page with tabs
- [ ] Master-detail layout for drugs
- [ ] Expandable rows for generics with components

### Phase 3: Advanced Features (Week 3)

- [ ] Pack ratio management UI
- [ ] Bulk operations (update, import, export)
- [ ] Duplicate detection
- [ ] TMT coverage dashboard

---

**Last Updated:** 2025-12-12
**Next Review:** 2025-12-19
