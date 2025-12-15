---
title: Archive
description: Historical documentation, outdated guides, and archived session notes
category: reports
tags: [archive, historical]
order: 8
---

# Archive

Historical documentation and archived materials.

## 📁 Archive Structure

```
archive/
├── 2024-Q4/
│   ├── sessions-archive.md      # Consolidated session notes
│   └── investigations/          # One-off investigations
└── 2025-Q1/
    └── sessions-archive.md      # Consolidated session notes
```

## 📚 What Gets Archived?

### 1. **Session Notes**

Development session notes are archived quarterly.

- **Location**: `archive/{YEAR}-Q{N}/sessions-archive.md`
- **Format**: Chronological consolidation by quarter
- **Retention**: Indefinitely (for historical reference)

### 2. **Outdated Documentation**

Documentation superseded by newer versions.

- **Includes**: Deprecated guides, old architecture docs
- **Note**: Archived files include frontmatter `status: archived` and redirect notice
- **Retention**: At least 1 year for reference

### 3. **Investigation Documents**

One-off technical investigations and spike analyses.

- **Location**: `archive/{YEAR}-Q{N}/investigations/`
- **Examples**: Proof-of-concepts, technology evaluations, debugging sessions
- **Retention**: Based on historical value

### 4. **Legacy Analysis**

Completed analysis documents after implementation.

- **Trigger**: Once analysis → implementation → report cycle completes
- **Reference**: Link to final report in `docs/reports/`

## 🔄 Archival Process

### When to Archive

| Document Type | Archive Trigger                            |
| ------------- | ------------------------------------------ |
| Session notes | End of quarter                             |
| Guides        | Replaced by new version                    |
| Analysis      | Implementation complete + report published |
| Investigation | No longer relevant                         |
| Feature docs  | Feature deprecated/removed                 |

### How to Archive

1. **Add deprecation notice**:

   ```yaml
   ---
   title: Document Title
   status: archived
   archivedDate: '2025-12-14'
   replacedBy: '../new-location/new-doc.md'
   ---
   ```

2. **Move to archive**:

   ```bash
   git mv docs/old-doc.md docs/archive/2025-Q1/old-doc.md
   ```

3. **Update links**:
   - Add redirect in `.redirects` or web config
   - Update cross-references

4. **Commit with context**:

   ```bash
   git commit -m "docs(archive): archive old-doc.md

   Replaced by new-doc.md. Archived for historical reference."
   ```

## 📖 Quarterly Archives

### 2025-Q1 (Jan-Mar 2025)

- [Sessions Archive](./2025-Q1/sessions-archive.md)

### 2024-Q4 (Oct-Dec 2024)

- [Sessions Archive](./2024-Q4/sessions-archive.md)
- [Investigations](./2024-Q4/investigations/)

## 🔍 Finding Archived Content

### Full-Text Search

```bash
# Search across all archives
grep -r "search term" docs/archive/

# Search specific quarter
grep -r "search term" docs/archive/2025-Q1/
```

### Web Documentation

Archived documents appear in web documentation with:

- 🗄️ Archive badge
- Deprecation notice banner
- Link to replacement (if exists)

## ⚠️ Important Notes

### DO Archive

- ✅ Outdated guides with newer versions
- ✅ Completed session notes (quarterly)
- ✅ One-off investigations
- ✅ Analysis after implementation

### DON'T Archive

- ❌ Current/active documentation
- ❌ Unique information with no replacement
- ❌ In-progress work
- ❌ Evergreen reference material

## 🔗 Related Documentation

- **[Analysis](../analysis/README.md)** - Current analysis documents
- **[Reports](../reports/README.md)** - Current reports
- **[Sessions](../../sessions/)** - Active session notes

---

Archives preserve history. Active docs go in main sections.
