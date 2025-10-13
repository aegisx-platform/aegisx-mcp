# Hybrid Validation Approach - Implementation Summary

## 🎯 What Was Implemented

Added **Hybrid Validation** to Monaco Editor component with two new flags:

1. `skipValidation` - Skip all validation (for special cases)
2. `allowHandlebars` - Smart validation that allows Handlebars syntax

## ✅ Changes Made

### 1. Monaco Editor Component (`monaco-editor.component.ts`)

#### Added Input Properties

```typescript
@Input() skipValidation = false;      // Skip validation entirely
@Input() allowHandlebars = false;     // Allow Handlebars syntax
```

#### Updated `validateJson()` Method

```typescript
validateJson(): void {
  // 1. Skip validation entirely if skipValidation is true
  if (this.skipValidation) {
    // No validation, no errors
    return;
  }

  // 2. Handle empty value
  if (!this.value || this.value.trim() === '') {
    // Check required field
    return;
  }

  // 3. If allowHandlebars is true, detect Handlebars
  if (this.allowHandlebars) {
    const hasHandlebars = this.detectHandlebars(this.value);
    if (hasHandlebars) {
      // Has Handlebars - skip JSON validation, no error
      return;
    }
    // No Handlebars - continue to JSON validation
  }

  // 4. Normal JSON validation
  try {
    JSON.parse(this.value);
    // Valid JSON - no error
  } catch (error) {
    // Invalid JSON - show error
  }
}
```

#### Added `detectHandlebars()` Method

```typescript
private detectHandlebars(content: string): boolean {
  const handlebarsPatterns = [
    /\{\{[^}]+\}\}/,           // Variables: {{variable}}
    /\{\{#each\s+[^}]+\}\}/,   // Each loop: {{#each items}}
    /\{\{\/each\}\}/,          // End each: {{/each}}
    /\{\{#if\s+[^}]+\}\}/,     // If statement: {{#if condition}}
    /\{\{\/if\}\}/,            // End if: {{/if}}
    /\{\{#unless\s+[^}]+\}\}/, // Unless: {{#unless condition}}
    /\{\{\/unless\}\}/,        // End unless: {{/unless}}
    /\{\{else\}\}/,            // Else: {{else}}
    /\{\{@[^}]+\}\}/,          // Special: {{@index}}, {{@first}}, etc.
  ];

  return handlebarsPatterns.some(pattern => pattern.test(content));
}
```

### 2. PDF Templates Form (`pdf-templates-form.component.ts`)

#### Updated Template Data Editor

```html
<app-monaco-editor
  #templateDataEditor
  label="Template Data (JSON/Handlebars)"
  [allowHandlebars]="true"  <!-- ✅ Added this line -->
  formControlName="template_data_raw">
</app-monaco-editor>
```

## 🎮 How It Works

### Validation Flow

```
User types in editor
         ↓
   validateJson()
         ↓
┌─────────────────────┐
│ skipValidation?     │ → Yes → ✅ No error (skip all)
└─────────────────────┘
         ↓ No
┌─────────────────────┐
│ Is empty?           │ → Yes → Check if required
└─────────────────────┘
         ↓ No
┌─────────────────────┐
│ allowHandlebars?    │ → No → Validate JSON normally
└─────────────────────┘
         ↓ Yes
┌─────────────────────┐
│ Has Handlebars?     │ → Yes → ✅ No error (valid template)
└─────────────────────┘
         ↓ No
┌─────────────────────┐
│ Validate JSON       │ → Valid → ✅ No error
└─────────────────────┘    Invalid → ❌ Show error
```

## 📊 Use Cases

### Use Case 1: Template Data (with Handlebars)

```html
<app-monaco-editor [allowHandlebars]="true" formControlName="template_data_raw"> </app-monaco-editor>
```

**Input:**

```json
{
  "table": {
    "body": [
      ["Header"],
      {{#each items}}
      ["{{this.name}}"]{{#unless @last}},{{/unless}}
      {{/each}}
    ]
  }
}
```

**Result:** ✅ No error (Handlebars detected, validation skipped)

---

### Use Case 2: Sample Data (pure JSON)

```html
<app-monaco-editor formControlName="sample_data_raw"> </app-monaco-editor>
```

**Input:**

```json
{
  "items": [{ "name": "Item 1" }, { "name": "Item 2" }]
}
```

**Result:** ✅ No error (valid JSON)

**Invalid Input:**

```json
{
  "items": [
    { "name": "Item 1" }  // Missing closing bracket
}
```

**Result:** ❌ Error shown (invalid JSON)

---

### Use Case 3: Mixed Content (Template with some JSON)

```html
<app-monaco-editor [allowHandlebars]="true" formControlName="mixed_content"> </app-monaco-editor>
```

**Scenario A - Has Handlebars:**

```json
{
  "name": "{{userName}}",
  "items": [...]
}
```

**Result:** ✅ No error (Handlebars detected)

**Scenario B - No Handlebars but valid JSON:**

```json
{
  "name": "John",
  "items": []
}
```

**Result:** ✅ No error (valid JSON)

**Scenario C - No Handlebars and invalid JSON:**

```json
{
  "name": "John"
  "items": []  // Missing comma
}
```

**Result:** ❌ Error shown (invalid JSON)

---

### Use Case 4: Special Field (no validation)

```html
<app-monaco-editor [skipValidation]="true" formControlName="special_field"> </app-monaco-editor>
```

**Input:** (anything)

```
This is not JSON at all!
{{#each}} without closing
Random text...
```

**Result:** ✅ No error (all validation skipped)

## 🎯 Benefits

### 1. Better User Experience

- ❌ **Before:** Red error messages on valid Handlebars templates
- ✅ **After:** No false positive errors

### 2. Smart Validation

- ✅ Validates JSON when no Handlebars present
- ✅ Skips validation when Handlebars detected
- ✅ Catches real JSON errors

### 3. Flexibility

- ✅ `allowHandlebars` for templates
- ✅ Default behavior for pure JSON
- ✅ `skipValidation` for special cases

### 4. Maintainability

- ✅ Clear intent with named flags
- ✅ Easy to understand
- ✅ Backward compatible (both flags default to `false`)

## 🔍 Detection Patterns

The `detectHandlebars()` method checks for these patterns:

| Pattern                   | Example             | Description  |
| ------------------------- | ------------------- | ------------ |
| `\{\{[^}]+\}\}`           | `{{name}}`          | Variables    |
| `\{\{#each\s+[^}]+\}\}`   | `{{#each items}}`   | Loop start   |
| `\{\{\/each\}\}`          | `{{/each}}`         | Loop end     |
| `\{\{#if\s+[^}]+\}\}`     | `{{#if condition}}` | If start     |
| `\{\{\/if\}\}`            | `{{/if}}`           | If end       |
| `\{\{#unless\s+[^}]+\}\}` | `{{#unless @last}}` | Unless start |
| `\{\{\/unless\}\}`        | `{{/unless}}`       | Unless end   |
| `\{\{else\}\}`            | `{{else}}`          | Else         |
| `\{\{@[^}]+\}\}`          | `{{@index}}`        | Special vars |

## 📝 Configuration Examples

### PDF Template System

```html
<!-- Template Data - Allow Handlebars -->
<app-monaco-editor label="Template Data (JSON/Handlebars)" [allowHandlebars]="true" [required]="true" height="700px" formControlName="template_data_raw"> </app-monaco-editor>

<!-- Sample Data - Strict JSON validation -->
<app-monaco-editor label="Sample Data (JSON)" height="300px" formControlName="sample_data_raw"> </app-monaco-editor>

<!-- JSON Schema - Strict JSON validation -->
<app-monaco-editor label="JSON Schema" height="300px" formControlName="schema_raw"> </app-monaco-editor>

<!-- Styles - Strict JSON validation -->
<app-monaco-editor label="Styles (JSON)" height="200px" formControlName="styles_raw"> </app-monaco-editor>
```

## 🧪 Testing Checklist

- [x] Template with Handlebars → No error shown
- [x] Pure JSON → Validates correctly
- [x] Invalid JSON (no Handlebars) → Shows error
- [x] Empty field with required → Shows error
- [x] Empty field without required → No error
- [x] skipValidation=true → Never shows error
- [x] allowHandlebars=false (default) → Validates JSON strictly

## 🎉 Summary

✅ **Implemented Hybrid Validation Approach**

- Added `skipValidation` flag (complete bypass)
- Added `allowHandlebars` flag (smart validation)
- Added Handlebars detection with 9 patterns
- Updated PDF Templates form to use `allowHandlebars`
- Zero breaking changes (backward compatible)
- Better UX for template editing

**Result:** Users can now edit Handlebars templates without seeing annoying validation errors! 🚀

---

**Version**: 1.0.0  
**Date**: October 13, 2025  
**Status**: ✅ Implemented & Working
