# Navigation Management - User Guide

> **Complete guide for managing application menus and navigation items**

## Table of Contents

- [Overview](#overview)
- [Accessing Navigation Management](#accessing-navigation-management)
- [Understanding the Interface](#understanding-the-interface)
- [Basic Operations](#basic-operations)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Common Scenarios](#common-scenarios)
- [Tips & Tricks](#tips--tricks)

## Overview

The Navigation Management system allows administrators to control the application's menu structure and visibility. You can:

- ✅ Create, edit, and delete menu items
- ✅ Organize menus in hierarchical structures (parent-child)
- ✅ Control who can see each menu item (permission-based)
- ✅ Configure menu appearance (icons, badges, labels)
- ✅ Set visibility across different layouts (desktop, mobile, compact)
- ✅ Reorder menu items

## Accessing Navigation Management

### Prerequisites

To access Navigation Management, you need:

- ✅ User account with login credentials
- ✅ Permission: `navigation:read` or `*:*` (admin)

### Access Steps

1. **Login** to the application
2. Click **RBAC** in the main navigation menu
3. Click **Navigations** submenu
4. You will see the Navigation Management page

**Direct URL**: `http://your-domain/rbac/navigation`

## Understanding the Interface

### Main Components

```
┌────────────────────────────────────────────────────────────────┐
│  Navigation Management                                    [+]   │  ← Header with Create button
├────────────────────────────────────────────────────────────────┤
│  🔍 Search... [Type ▾] [Status ▾] [Visibility ▾] [Reset]      │  ← Filters
├────────────────────────────────────────────────────────────────┤
│  ☐ Key        Title      Parent    Type   Link    Order  ...  │  ← Table Header
├────────────────────────────────────────────────────────────────┤
│  ☐ dashboard  Dashboard  -         item   /dash   10    👁 ✏ 🗑│  ← Data Row
│  ☐ users      Users      -         item   /users  20    👁 ✏ 🗑│
│  ☐ rbac       RBAC       -         coll   -       30    👁 ✏ 🗑│
│    ↳ roles    Roles      RBAC      item   /roles  1     👁 ✏ 🗑│  ← Child Item (indented)
└────────────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column          | Description                      | Example                                   |
| --------------- | -------------------------------- | ----------------------------------------- |
| **Checkbox**    | Select for bulk operations       | ☐ / ☑                                    |
| **Key**         | Unique identifier (kebab-case)   | `dashboard`, `user-management`            |
| **Title**       | Display text shown in menu       | "Dashboard", "User Management"            |
| **Parent**      | Parent menu item (for hierarchy) | "RBAC", "-" (no parent)                   |
| **Type**        | Item type                        | `item`, `group`, `collapsible`, `divider` |
| **Link**        | Navigation route                 | `/dashboard`, `/users`                    |
| **Sort Order**  | Display order (lower = first)    | 10, 20, 30                                |
| **Permissions** | Required permissions             | `users.read`, `admin.*`                   |
| **Status**      | Enabled/Disabled state           | 🟢 Enabled / 🔴 Disabled                  |
| **Actions**     | Available operations             | 👁 View / ✏ Edit / 🗑 Delete             |

### Filter Panel

**Search Box**: Filter by key or title (case-insensitive)

**Type Filter**: Show specific types only

- All Types (default)
- Item - Regular menu links
- Group - Menu section headers
- Collapsible - Expandable menu groups
- Divider - Visual separators
- Spacer - Empty space

**Status Filter**: Filter by enabled/disabled

- All (default)
- Enabled only
- Disabled only

**Visibility Filter**: Filter by hidden status

- All (default)
- Visible only
- Hidden only

**Reset Button**: Clear all filters

## Basic Operations

### 1. Creating a New Menu Item

**Step-by-Step Guide**:

1. Click **"+ Create Navigation Item"** button (top right)
2. Dialog opens with 3 tabs

#### Tab 1: Basic Info

| Field          | Required | Description                       | Example                                      |
| -------------- | -------- | --------------------------------- | -------------------------------------------- |
| **Key**        | ✅ Yes   | Unique identifier (max 100 chars) | `user-profile`                               |
| **Title**      | ✅ Yes   | Display text (max 200 chars)      | "User Profile"                               |
| **Type**       | ✅ Yes   | Item type (see below)             | `item`                                       |
| **Icon**       | No       | Material icon name                | `person`, `dashboard`                        |
| **Link/Route** | No       | Navigation path                   | `/profile`, `/users`                         |
| **Target**     | No       | Link behavior                     | `_self` (same window), `_blank` (new window) |
| **Parent**     | No       | Parent navigation item            | Select from dropdown                         |

**Item Types**:

- **item** - Regular clickable menu link
  - Use for: Pages, routes, actions
  - Requires: link field

- **group** - Section header (non-clickable)
  - Use for: Organizing menu sections
  - Shows title only, no link needed

- **collapsible** - Expandable parent menu
  - Use for: Grouping related items
  - Contains children, can have link (optional)

- **divider** - Visual separator line
  - Use for: Separating menu sections
  - No text, no link

- **spacer** - Empty space
  - Use for: Adding vertical spacing
  - No text, no link

#### Tab 2: Configuration

| Field                 | Description                              | Default |
| --------------------- | ---------------------------------------- | ------- |
| **Sort Order**        | Display position (lower = first)         | 0       |
| **Disabled**          | Hide from all users                      | false   |
| **Hidden**            | Hide from menu (but route accessible)    | false   |
| **Exact Route Match** | Require exact URL match for active state | false   |

**Layout Visibility Flags**:

- ☑ Show in Default Layout - Standard desktop view
- ☐ Show in Compact Layout - Minimized sidebar
- ☐ Show in Horizontal Layout - Top navigation bar
- ☑ Show in Mobile - Mobile devices

**Badge Settings** (optional):

- **Badge Title** - Text to display (e.g., "New", "Beta", "5")
- **Badge Classes** - TailwindCSS classes (e.g., `bg-red-500 text-white`)
- **Badge Variant** - Preset style (e.g., `primary`, `warn`, `success`)

#### Tab 3: Permissions

Select which permissions are required to see this menu item.

**Features**:

- 🔍 **Search Box** - Filter permissions by name
- **Select All** / **Deselect All** buttons
- **Grouped by Resource** - Permissions organized by category
- **Selected Count** - Shows how many permissions selected

**How Permissions Work**:

- Empty = **Public** (everyone can see)
- Selected = **Restricted** (only users with ANY of these permissions)

**Example**:

```
Selected Permissions: [users.read, users.create]
→ User needs EITHER users.read OR users.create
→ User with users.read = ✅ Can see
→ User with users.create = ✅ Can see
→ User with both = ✅ Can see
→ User with neither = ❌ Cannot see
```

3. Click **"Create Item"** button
4. Dialog closes, table refreshes
5. Success notification appears

### 2. Editing a Menu Item

**Step-by-Step Guide**:

1. Find the item in the table
2. Click the **✏ Edit** icon (pencil)
3. Dialog opens (same as create)
4. Modify fields as needed
5. Click **"Update Item"** button
6. Changes saved and applied immediately

**What You Can Edit**:

- ✅ Title, icon, link
- ✅ Sort order, visibility flags
- ✅ Parent (move to different section)
- ✅ Permissions
- ✅ Badge settings
- ❌ Key (immutable after creation)

### 3. Viewing Item Details

**Step-by-Step Guide**:

1. Find the item in the table
2. Click the **👁 View** icon (eye)
3. Dialog opens in **read-only mode**
4. Review all settings across 3 tabs
5. Click **"Close"** when done

**Use Cases**:

- Quick reference for item configuration
- Verify permissions without editing
- Check badge and visibility settings

### 4. Deleting a Menu Item

**Step-by-Step Guide**:

1. Find the item in the table
2. Click the **🗑 Delete** icon (trash)
3. Confirmation dialog appears

**Confirmation Dialog**:

```
⚠️ Delete Navigation Item?

Are you sure you want to delete "User Management"?
This action cannot be undone.

[Cancel]  [Delete]
```

4. Click **"Delete"** to confirm
5. Item removed from database
6. Table refreshes

**Important Notes**:

- ⚠️ **Cannot delete items with children** - Delete children first
- ⚠️ **Cannot undo** - Deletion is permanent
- ⚠️ **Affects all users immediately** - Menu updates in real-time

**If Item Has Children**:

```
❌ Cannot Delete

This navigation item has child items.
Please delete all children first or move them to another parent.

[OK]
```

### 5. Reordering Menu Items

**Method 1: Edit Sort Order**

1. Click **✏ Edit** on the item
2. Go to **Configuration** tab
3. Change **Sort Order** number
   - Lower numbers appear first
   - Same numbers = alphabetical order
4. Click **"Update Item"**

**Example Sort Orders**:

```
Dashboard   sort_order: 10  → Appears 1st
Users       sort_order: 20  → Appears 2nd
Settings    sort_order: 30  → Appears 3rd
```

**Method 2: Bulk Reorder API** (Developer)

For bulk reordering, use the API endpoint:

```typescript
POST /api/navigation-items/reorder
{
  "orders": [
    { "id": "uuid-1", "sort_order": 10 },
    { "id": "uuid-2", "sort_order": 20 }
  ]
}
```

## Advanced Features

### Hierarchical Menus (Parent-Child)

**Creating a Menu Hierarchy**:

**Step 1**: Create parent item (collapsible type)

```
Type: collapsible
Key: admin-section
Title: Administration
Icon: admin_panel_settings
```

**Step 2**: Create child items

```
Parent: Administration (select from dropdown)
Key: admin-users
Title: User Management
Icon: people
Link: /admin/users
```

**Result in Menu**:

```
▼ Administration          ← Parent (collapsible)
  → User Management       ← Child
  → Role Management       ← Child
  → System Settings       ← Child
```

**Visual in Table**:

```
Key              Title              Parent         Type
admin            Administration     -              collapsible
  ↳ admin-users  User Management    Administration item
  ↳ admin-roles  Role Management    Administration item
```

### Adding Icons

**Icon Selection**:

1. Use Material Icons names
2. Browse icons: https://fonts.google.com/icons
3. Enter icon name (without `mat-icon` prefix)

**Common Icons**:

```
dashboard       - Dashboard/Home
people          - Users/Groups
settings        - Configuration
folder          - Files/Folders
bar_chart       - Analytics/Reports
shield          - Security/RBAC
notifications   - Alerts/Messages
help            - Help/Support
```

**Icon Preview**:

- Icon appears next to title in menu
- Preview shown in dialog while typing

### Adding Badges

**Use Cases**:

- "New" - Highlight new features
- "Beta" - Mark beta features
- "5" - Show notification counts
- "Admin" - Indicate special access

**Configuration Options**:

**Option 1: Predefined Variants**

```
Badge Title: New
Badge Variant: primary
→ Blue badge with "New" text
```

**Option 2: Custom Classes**

```
Badge Title: Beta
Badge Classes: bg-yellow-500 text-black
→ Yellow badge with "Beta" text
```

**Available Variants**:

- `primary` - Blue
- `secondary` - Gray
- `success` - Green
- `warning` - Yellow
- `error` - Red

### Multi-Layout Configuration

**Layout Types**:

1. **Default** - Standard desktop sidebar
   - Full-width sidebar
   - Icons + text
   - Collapsible groups

2. **Compact** - Minimized sidebar
   - Icons only
   - Tooltip on hover
   - No nested items visible

3. **Horizontal** - Top navigation bar
   - Horizontal menu
   - Dropdown submenus
   - Limited space

4. **Mobile** - Mobile devices
   - Hamburger menu
   - Full-screen overlay
   - Touch-optimized

**Configuration Strategy**:

```
Dashboard:
  ✅ Show in Default    → Always visible on desktop
  ✅ Show in Compact    → Icon-only in compact mode
  ✅ Show in Horizontal → Top bar menu
  ✅ Show in Mobile     → Mobile menu

Admin Panel:
  ✅ Show in Default    → Desktop only
  ❌ Show in Compact    → Hidden in compact
  ❌ Show in Horizontal → Not in top bar
  ❌ Show in Mobile     → Desktop only
```

## Best Practices

### 1. Naming Conventions

**Keys** (Technical IDs):

- Use kebab-case: `user-management`, `rbac-roles`
- Be descriptive: `admin-users` not `au`
- Prefix by section: `rbac-`, `admin-`, `report-`

**Titles** (Display Text):

- Use Title Case: "User Management"
- Be concise: Max 2-3 words
- Use clear labels: "Create User" not "New"

### 2. Sort Order Strategy

**Recommended Spacing**:

```
10  - First item
20  - Second item
30  - Third item
...
100 - Last item
```

**Why gaps of 10?**

- Easy to insert items later (15, 25, etc.)
- Clear visual organization
- Room for expansion

**Hierarchical Sorting**:

```
Parent:   sort_order: 100
  Child1: sort_order: 1
  Child2: sort_order: 2
  Child3: sort_order: 3
```

### 3. Permission Assignment

**Public Access** (No Permissions):

```
Use for:
- Dashboard
- Home page
- Public documentation
- Help pages
```

**Single Permission**:

```
Users Menu → Require: users.read
→ Only users who can read users see this menu
```

**Multiple Permissions** (OR logic):

```
Admin Menu → Require: [admin.read, super_admin.access]
→ Users with EITHER permission can see menu
```

**Admin-Only**:

```
System Settings → Require: *:*
→ Only admin users (wildcard permission) can see
```

### 4. Hierarchical Structure

**Good Hierarchy**:

```
✅ RBAC                  (collapsible)
   ├─ Dashboard          (item)
   ├─ Roles              (item)
   ├─ Permissions        (item)
   └─ User Assignments   (item)
```

**Bad Hierarchy**:

```
❌ RBAC                  (collapsible)
   ├─ RBAC Dashboard     (item) ← Redundant "RBAC" prefix
   ├─ RBAC Roles         (item) ← Redundant
   └─ Manage Permissions (item) ← Inconsistent naming
```

**Depth Limit**:

- Maximum 3 levels deep
- More = confusing navigation
- Use groups instead

### 5. Visibility Strategy

**Always Show**:

```
✅ Default
✅ Compact
✅ Horizontal
✅ Mobile
→ Core features everyone needs
```

**Desktop Only**:

```
✅ Default
✅ Compact
❌ Horizontal
❌ Mobile
→ Complex admin tools
```

**Mobile Friendly**:

```
✅ Default
❌ Compact
❌ Horizontal
✅ Mobile
→ Quick actions, dashboards
```

## Common Scenarios

### Scenario 1: Adding a New Module

**Goal**: Add "Inventory Management" module

**Steps**:

1. **Create parent collapsible**:

   ```
   Key: inventory
   Title: Inventory
   Type: collapsible
   Icon: inventory_2
   Sort Order: 50
   Permissions: inventory.read
   ```

2. **Create child items**:

   ```
   → Items List
      Key: inventory-items
      Parent: Inventory
      Link: /inventory/items
      Sort Order: 1
      Permissions: inventory.read

   → Add Item
      Key: inventory-add
      Parent: Inventory
      Link: /inventory/add
      Sort Order: 2
      Permissions: inventory.create

   → Reports
      Key: inventory-reports
      Parent: Inventory
      Link: /inventory/reports
      Sort Order: 3
      Permissions: inventory.reports
   ```

**Result**:

```
▼ Inventory
  → Items List
  → Add Item
  → Reports
```

### Scenario 2: Reorganizing Menu Structure

**Goal**: Move "User Management" under "Administration"

**Steps**:

1. **Edit "User Management" item**
2. Go to **Basic Info** tab
3. **Parent Navigation Item** → Select "Administration"
4. Adjust **Sort Order** within parent (e.g., 1)
5. Click **"Update Item"**

**Before**:

```
→ Dashboard
→ User Management  ← Standalone
→ Administration
```

**After**:

```
→ Dashboard
▼ Administration
  → User Management  ← Moved under Admin
```

### Scenario 3: Temporarily Hiding a Feature

**Goal**: Hide "Beta Feature" from production

**Steps**:

1. **Edit "Beta Feature" item**
2. Go to **Configuration** tab
3. Toggle **Disabled** → ON
4. Click **"Update Item"**

**Effect**:

- ❌ Menu item hidden from ALL users
- ❌ Route still works if accessed directly
- ✅ Easy to re-enable later

**Alternative**: Use **Hidden** toggle

- Hidden = Don't show in menu
- But route still accessible
- Good for "secret" admin pages

### Scenario 4: Adding Notification Count

**Goal**: Show unread message count on Messages menu

**Steps**:

1. **Edit "Messages" item**
2. Go to **Configuration** tab
3. **Badge Title** → `5` (or variable from backend)
4. **Badge Variant** → `primary`
5. Click **"Update Item"**

**Note**: Badge title is static in UI

- For dynamic counts, update via API
- Or implement real-time updates with WebSocket

### Scenario 5: Creating Mobile-Only Quick Actions

**Goal**: Add quick action bar for mobile users

**Steps**:

1. **Create items with mobile-only visibility**:

   ```
   Scan QR:
     Show in Default: ❌
     Show in Mobile: ✅

   Quick Add:
     Show in Default: ❌
     Show in Mobile: ✅
   ```

**Result**:

- Desktop: Not visible
- Mobile: Shows in menu

## Tips & Tricks

### 🔍 Quick Search

**Keyboard Shortcut**: Focus search box

- Press `/` key to jump to search
- Type to filter instantly
- ESC to clear search

### 📋 Bulk Selection

**Use Cases**:

- Export selected items
- Bulk permission update
- Mass enable/disable

**How to Select**:

1. Click checkboxes in first column
2. Or click header checkbox (select all)
3. Perform bulk action

**Note**: Currently view-only, bulk operations coming soon

### 🎨 Icon Tips

**Testing Icons**:

1. Enter icon name in dialog
2. See live preview in Icon field
3. If wrong icon shows, check spelling
4. Use Material Icons website for reference

**Popular Choices**:

- Navigation sections: `menu`, `apps`, `widgets`
- Admin: `admin_panel_settings`, `shield`, `security`
- Users: `people`, `person`, `group`
- Content: `article`, `description`, `folder`
- Actions: `add`, `edit`, `delete`, `refresh`

### ↕️ Reordering Tricks

**Quick Positioning**:

- First item: `sort_order = 0`
- Between items: Use average (15 between 10 and 20)
- Last item: `sort_order = 999`

**Batch Reorder**:

1. Export items with IDs
2. Update sort_order in spreadsheet
3. Use API to bulk update
4. Much faster than one-by-one

### 🔐 Permission Testing

**Verify Visibility**:

1. Assign test user with specific permissions
2. Login as test user
3. Check which menus are visible
4. Adjust permissions if needed

**Common Issues**:

- Item hidden but route accessible → Check route guard permissions match
- Item visible but route blocked → Add navigation item permissions

### 🐛 Troubleshooting Quick Fixes

**Menu Item Not Showing**:

1. Check **Disabled** toggle → Must be OFF
2. Check **Hidden** toggle → Must be OFF
3. Check **Layout Visibility** → Must be enabled for current layout
4. Check **Permissions** → User must have required permissions

**Changes Not Appearing**:

1. Refresh browser (Ctrl+R or Cmd+R)
2. Clear cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check cache invalidation logs
4. Wait 5 minutes for cache expiry

**Cannot Delete Item**:

- Error: "Has children" → Delete or move children first
- Error: "Permission denied" → Need `navigation:delete` permission

## Glossary

| Term                | Definition                                              |
| ------------------- | ------------------------------------------------------- |
| **Navigation Item** | A single entry in the menu (link, group, divider, etc.) |
| **Key**             | Unique technical identifier for an item                 |
| **Parent**          | Container item in hierarchical structure                |
| **Child**           | Item nested under a parent                              |
| **Collapsible**     | Expandable menu group that can contain children         |
| **Sort Order**      | Numeric value determining display position              |
| **Permission**      | Access control rule (format: `resource.action`)         |
| **Badge**           | Visual indicator (label, count) on menu item            |
| **Layout**          | Display context (default, compact, horizontal, mobile)  |
| **Cache**           | Temporary storage for faster menu loading               |

## Getting Help

**Need Assistance?**

1. **Check Troubleshooting Guide**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. **Review API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)
3. **Contact System Administrator**: Your internal helpdesk
4. **Developer Documentation**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-29
**Maintained By**: Development Team
