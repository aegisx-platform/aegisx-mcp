# Handlebars + PDFMake Loop Principles

## 📋 Overview

เอกสารนี้อธิบายหลักการทำงานของ Handlebars template engine กับ PDFMake JSON เมื่อใช้ร่วมกัน โดยเฉพาะการทำ loop สำหรับ table และ dynamic content

---

## 🔄 Core Concept: Template → Compile → PDF

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│ Template Data   │      │  Sample Data │      │   Result    │
│ (Handlebars)    │  +   │  (JSON)      │  →   │   (JSON)    │
└─────────────────┘      └──────────────┘      └─────────────┘
        ↓                        ↓                      ↓
   {{#each}}                  array              Expanded array
   placeholder                values              with values
```

### Workflow

1. **Template Data** (JSON with Handlebars)
   - มี Handlebars syntax (`{{variable}}`, `{{#each}}`, etc.)
   - เป็น "blueprint" ที่บอกว่า PDF จะมีหน้าตาอย่างไร

2. **Sample Data** (Plain JSON)
   - ข้อมูลจริงที่จะใส่เข้าไปใน template
   - เป็น array, object ธรรมดา

3. **Handlebars.compile()**
   - Compiles template + data → ได้ final JSON
   - Final JSON นี้ถูกส่งไปที่ PDFMake

4. **PDFMake**
   - รับ JSON ธรรมดา (ไม่มี Handlebars syntax แล้ว)
   - Generate PDF

---

## 🎯 Handlebars Loop: {{#each}}

### Basic Syntax

```handlebars
{{#each arrayName}}
  <!-- Access current item with {{this}} or {{this.property}} -->
  {{this.name}}
{{/each}}
```

### Example: Simple Array

**Template Data:**

```json
{
  "content": [
    {
      "text": "Fruits:",
      "bold": true
    },
    {
      "ul": [
        {{#each fruits}}
        "{{this}}"{{#unless @last}},{{/unless}}
        {{/each}}
      ]
    }
  ]
}
```

**Sample Data:**

```json
{
  "fruits": ["Apple", "Banana", "Cherry"]
}
```

**After Handlebars Compile:**

```json
{
  "content": [
    {
      "text": "Fruits:",
      "bold": true
    },
    {
      "ul": ["Apple", "Banana", "Cherry"]
    }
  ]
}
```

**Explanation:**

- `{{#each fruits}}` loops through `fruits` array
- `{{this}}` refers to current item (`"Apple"`, `"Banana"`, etc.)
- `{{#unless @last}},{{/unless}}` adds comma except for last item

---

## 📊 Table Loop: The Most Common Use Case

### Table Structure in PDFMake

```json
{
  "table": {
    "headerRows": 1,
    "widths": ["*", "*", "*"],
    "body": [
      ["Header 1", "Header 2", "Header 3"], // Row 0 (header)
      ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"], // Row 1
      ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"] // Row 2
    ]
  }
}
```

**Key Points:**

- `body` is an **array of arrays**
- Each inner array is one row
- First row(s) are headers if `headerRows` is set

### Adding Handlebars Loop to Table

**Template Data:**

```json
{
  "table": {
    "headerRows": 1,
    "widths": ["auto", "*", "auto"],
    "body": [
      [
        { "text": "No.", "style": "tableHeader" },
        { "text": "Name", "style": "tableHeader" },
        { "text": "Age", "style": "tableHeader" }
      ],
      {{#each people}}
      [
        "{{@index + 1}}",
        "{{this.name}}",
        "{{this.age}}"
      ]{{#unless @last}},{{/unless}}
      {{/each}}
    ]
  }
}
```

**Sample Data:**

```json
{
  "people": [
    { "name": "John", "age": "30" },
    { "name": "Jane", "age": "25" },
    { "name": "Bob", "age": "35" }
  ]
}
```

**After Compile:**

```json
{
  "table": {
    "headerRows": 1,
    "widths": ["auto", "*", "auto"],
    "body": [
      [
        { "text": "No.", "style": "tableHeader" },
        { "text": "Name", "style": "tableHeader" },
        { "text": "Age", "style": "tableHeader" }
      ],
      ["1", "John", "30"],
      ["2", "Jane", "25"],
      ["3", "Bob", "35"]
    ]
  }
}
```

---

## 🔑 Key Handlebars Features for Loops

### 1. **{{@index}}** - Current Index (0-based)

```handlebars
{{#each items}}
  Index:
  {{@index}}
  <!-- 0, 1, 2, ... -->
{{/each}}
```

**Common Use:** Auto-numbering

```handlebars
"{{@index + 1}}"  <!-- 1, 2, 3, ... -->
```

### 2. **{{@first}}** - First Item

```handlebars
{{#each items}}
  {{#if @first}}
    This is the first item!
  {{/if}}
{{/each}}
```

### 3. **{{@last}}** - Last Item

```handlebars
{{#each items}}
  {{this.value}}{{#unless @last}},{{/unless}}
{{/each}}
```

**Why use `{{#unless @last}},{{/unless}}`?**

Without it:

```json
["item1", "item2", "item3"] // ← Trailing comma! Invalid JSON
```

With it:

```json
["item1", "item2", "item3"] // ← Valid JSON
```

### 4. **{{@even}}** and **{{@odd}}** - Alternating Rows

```handlebars
{{#each items}}
  [ { "text": "{{this.name}}", "fillColor": "{{#if @even}}#f5f5f5{{else}}#ffffff{{/if}}" } ]{{#unless @last}},{{/unless}}
{{/each}}
```

**Result:** Zebra-striped table rows

### 5. **{{this}}** - Current Item

```handlebars
{{#each items}}
  {{this}}
  <!-- For simple values -->
  {{this.property}}
  <!-- For objects -->
  {{this.nested.prop}}
  <!-- For nested objects -->
{{/each}}
```

---

## 🎨 Advanced Patterns

### Pattern 1: Nested Loops

**Use Case:** Table with sub-items

**Template:**

```json
{
  "table": {
    "body": [
      ["Order", "Items"],
      {{#each orders}}
      [
        "{{this.orderNumber}}",
        {
          "ul": [
            {{#each this.items}}
            "{{this.name}}"{{#unless @last}},{{/unless}}
            {{/each}}
          ]
        }
      ]{{#unless @last}},{{/unless}}
      {{/each}}
    ]
  }
}
```

**Sample Data:**

```json
{
  "orders": [
    {
      "orderNumber": "ORD-001",
      "items": [{ "name": "Item A" }, { "name": "Item B" }]
    },
    {
      "orderNumber": "ORD-002",
      "items": [{ "name": "Item C" }]
    }
  ]
}
```

**Result:**

```
┌───────────┬──────────────┐
│ Order     │ Items        │
├───────────┼──────────────┤
│ ORD-001   │ • Item A     │
│           │ • Item B     │
├───────────┼──────────────┤
│ ORD-002   │ • Item C     │
└───────────┴──────────────┘
```

### Pattern 2: Conditional Content in Loop

**Template:**

```handlebars
{{#each products}}
  [ "{{this.name}}", { "text": "{{this.status}}", "color": "{{#if this.inStock}}green{{else}}red{{/if}}" }, "{{this.price}}" ]{{#unless @last}},{{/unless}}
{{/each}}
```

**Sample Data:**

```json
{
  "products": [
    { "name": "Product A", "status": "In Stock", "inStock": true, "price": "1,000" },
    { "name": "Product B", "status": "Out of Stock", "inStock": false, "price": "850" }
  ]
}
```

### Pattern 3: Dynamic Column Spans

**Template:**

```handlebars
{{#each sections}}
  [ { "text": "{{this.title}}", "colSpan":
  {{this.colspan}}, "bold": true }
  {{#each this.items}}
    , {}
    <!-- Empty cells for colspan -->
  {{/each}}
  ]{{#unless @last}},{{/unless}}
{{/each}}
```

### Pattern 4: Calculated Values

**Template:**

```handlebars
{{#each items}}
  [ "{{this.qty}}", "{{this.price}}", "{{multiply this.qty this.price}}"
  <!-- Using custom helper -->
  ]{{#unless @last}},{{/unless}}
{{/each}}
```

**Note:** Requires custom Handlebars helper `multiply`

---

## 🧩 How It Works Internally

### Step-by-Step Process

#### 1. Parse Template

```javascript
const template = `{
  "table": {
    "body": [
      ["Header"],
      {{#each items}}
      ["{{this.name}}"]{{#unless @last}},{{/unless}}
      {{/each}}
    ]
  }
}`;
```

#### 2. Compile Template

```javascript
const compiledTemplate = Handlebars.compile(template);
```

Handlebars parses and identifies:

- `{{#each items}}` → Loop start
- `{{this.name}}` → Property access
- `{{#unless @last}},{{/unless}}` → Conditional comma
- `{{/each}}` → Loop end

#### 3. Execute with Data

```javascript
const data = {
  items: [{ name: 'Item 1' }, { name: 'Item 2' }],
};

const result = compiledTemplate(data);
```

#### 4. Handlebars Processing

For each item in `items` array:

**Iteration 1:**

- `{{this.name}}` → `"Item 1"`
- `{{@last}}` → `false`
- `{{#unless @last}},{{/unless}}` → `,`
- Output: `["Item 1"],`

**Iteration 2:**

- `{{this.name}}` → `"Item 2"`
- `{{@last}}` → `true`
- `{{#unless @last}},{{/unless}}` → `` (empty)
- Output: `["Item 2"]`

#### 5. Final JSON

```json
{
  "table": {
    "body": [["Header"], ["Item 1"], ["Item 2"]]
  }
}
```

#### 6. Parse JSON

```javascript
const pdfMakeJSON = JSON.parse(result);
```

#### 7. Generate PDF

```javascript
pdfMake.createPdf(pdfMakeJSON).download();
```

---

## ⚠️ Common Pitfalls & Solutions

### Pitfall 1: Trailing Comma

**Problem:**

```handlebars
{{#each items}}
  ["{{this.name}}"],
  <!-- Always adds comma! -->
{{/each}}
```

**Result:**

```json
["Item 1"],
["Item 2"],  ← Invalid!
```

**Solution:**

```handlebars
{{#each items}}
  ["{{this.name}}"]{{#unless @last}},{{/unless}}
{{/each}}
```

### Pitfall 2: Missing Quotes

**Problem:**

```handlebars
[{{this.name}}] <!-- Missing quotes -->
```

**Result:**

```json
[Item 1]  ← Invalid! (should be string)
```

**Solution:**

```handlebars
["{{this.name}}"] <!-- With quotes -->
```

### Pitfall 3: JSON Objects Need Quotes

**Problem:**

```handlebars
{ text: "{{this.name}}"
<!-- Missing quotes on key -->
}
```

**Solution:**

```handlebars
{ "text": "{{this.name}}"
<!-- Valid JSON -->
}
```

### Pitfall 4: Empty Array

**Problem:** Loop over empty array

**Template:**

```handlebars
[ ["Header"],
{{#each items}}
  ["{{this.name}}"]{{#unless @last}},{{/unless}}
{{/each}}
]
```

**If `items: []`:**

```json
[
  ["Header"],

]  ← Trailing comma!
```

**Solution:** Use `{{#if items.length}}`

```handlebars
[ ["Header"]
{{#if items.length}}
  ,
  {{#each items}}
    ["{{this.name}}"]{{#unless @last}},{{/unless}}
  {{/each}}
{{/if}}
]
```

### Pitfall 5: Nested Property Access

**Problem:**

```handlebars
{{this.user.profile.name}} <!-- Deep nesting -->
```

**If any level is undefined:** Error!

**Solution:** Use safe navigation or default values

```handlebars
{{this.user.profile.name}}
<!-- May fail -->
{{#if this.user.profile}}{{this.user.profile.name}}{{else}}N/A{{/if}}
```

---

## 📚 Real-World Examples

### Example 1: Invoice Line Items

**Template:**

```json
{
  "table": {
    "headerRows": 1,
    "widths": ["auto", "*", "auto", "auto", "auto"],
    "body": [
      [
        { "text": "No.", "style": "tableHeader" },
        { "text": "Description", "style": "tableHeader" },
        { "text": "Qty", "style": "tableHeader" },
        { "text": "Price", "style": "tableHeader" },
        { "text": "Amount", "style": "tableHeader" }
      ],
      {{#each lineItems}}
      [
        "{{@index + 1}}",
        "{{this.description}}",
        { "text": "{{this.quantity}}", "alignment": "center" },
        { "text": "{{this.unitPrice}}", "alignment": "right" },
        { "text": "{{this.amount}}", "alignment": "right", "bold": true }
      ]{{#unless @last}},{{/unless}}
      {{/each}}
    ]
  },
  "layout": "lightHorizontalLines"
}
```

### Example 2: Employee Directory

**Template:**

```json
{
  "stack": [
    {{#each departments}}
    {
      "text": "{{this.name}}",
      "style": "header",
      "margin": [0, 10, 0, 5]
    },
    {
      "table": {
        "widths": ["*", 100, 80],
        "body": [
          ["Name", "Position", "Extension"],
          {{#each this.employees}}
          [
            "{{this.name}}",
            "{{this.position}}",
            "{{this.extension}}"
          ]{{#unless @last}},{{/unless}}
          {{/each}}
        ]
      },
      "layout": "noBorders",
      "margin": [0, 0, 0, 20]
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

### Example 3: Dynamic Columns

**Template:**

```json
{
  "columns": [
    {{#each columns}}
    {
      "width": "{{this.width}}",
      "stack": [
        { "text": "{{this.title}}", "bold": true },
        {{#each this.items}}
        { "text": "{{this}}" }{{#unless @last}},{{/unless}}
        {{/each}}
      ]
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

---

## 🎓 Best Practices

### 1. **Always Use `{{#unless @last}},{{/unless}}`**

✅ **Do:**

```handlebars
{{#each items}}
  ["{{this}}"]{{#unless @last}},{{/unless}}
{{/each}}
```

❌ **Don't:**

```handlebars
{{#each items}}
  ["{{this}}"],
{{/each}}
```

### 2. **Quote All JSON Keys and String Values**

✅ **Do:**

```json
{ "text": "{{value}}" }
```

❌ **Don't:**

```json
{ text: {{value}} }
```

### 3. **Use Meaningful Variable Names**

✅ **Do:**

```handlebars
{{#each invoiceLineItems}}
  {{this.productDescription}}
{{/each}}
```

❌ **Don't:**

```handlebars
{{#each items}}
  {{this.desc}}
{{/each}}
```

### 4. **Handle Empty Arrays**

✅ **Do:**

```handlebars
{{#if items.length}}
  {{#each items}}...{{/each}}
{{else}}
  [{ "text": "No items found", "italics": true }]
{{/if}}
```

### 5. **Use `@index + 1` for Human-Readable Numbers**

✅ **Do:**

```handlebars
"{{@index + 1}}"  <!-- 1, 2, 3, ... -->
```

❌ **Don't:**

```handlebars
"{{@index}}" <!-- 0, 1, 2, ... (confusing for users) -->
```

### 6. **Test with Edge Cases**

- Empty arrays: `[]`
- Single item: `[{...}]`
- Large arrays: `[{...}, {...}, ...]` (100+ items)
- Missing properties: `{ name: undefined }`
- Special characters: `"Item with \"quotes\""`

---

## 🔧 Debugging Tips

### 1. **View Compiled Output**

```javascript
const compiled = Handlebars.compile(template);
const result = compiled(data);
console.log(result); // Check if valid JSON
```

### 2. **Parse to Verify**

```javascript
try {
  const parsed = JSON.parse(result);
  console.log('Valid JSON!', parsed);
} catch (e) {
  console.error('Invalid JSON:', e.message);
}
```

### 3. **Check for Common Issues**

- Trailing commas
- Missing quotes
- Unescaped quotes in strings
- Undefined properties

### 4. **Use JSON Formatter**

Copy compiled output to: https://jsonformatter.org/

### 5. **Test Incrementally**

Start simple:

```handlebars
{{#each items}}
  "{{this}}"{{#unless @last}},{{/unless}}
{{/each}}
```

Then add complexity:

```handlebars
{{#each items}}
  { "text": "{{this}}", "bold": true }{{#unless @last}},{{/unless}}
{{/each}}
```

---

## 📊 Performance Considerations

### Loop Size Limits

| Array Size    | Performance  | Recommendation      |
| ------------- | ------------ | ------------------- |
| 1-50 items    | ✅ Excellent | Use freely          |
| 51-200 items  | ✅ Good      | Acceptable          |
| 201-500 items | ⚠️ Slow      | Consider pagination |
| 500+ items    | ❌ Very Slow | Avoid or optimize   |

### Optimization Tips

1. **Limit nested loops**

   ```handlebars
   <!-- ❌ Avoid -->
   {{#each level1}}
     {{#each level2}}
       {{#each level3}}  <!-- Too deep! -->
   ```

2. **Use fixed widths when possible**

   ```json
   "widths": [50, 200, 100]  // Faster
   // vs
   "widths": ["auto", "*", "auto"]  // Slower
   ```

3. **Minimize complex layouts in loops**
   ```handlebars
   <!-- ❌ Heavy -->
   {{#each items}}
     { "canvas": [ { "type": "rect", ... }, { "type": "line", ... } ] }
   {{/each}}
   ```

---

## 🎯 Summary

### Core Principles

1. **Handlebars = Template Engine**
   - Processes `{{}}` syntax
   - Generates final JSON
   - Runs BEFORE PDFMake

2. **PDFMake = PDF Generator**
   - Receives final JSON (no Handlebars)
   - Renders PDF
   - Doesn't know about loops

3. **{{#each}} = Array Loop**
   - Iterates over array
   - Access with `{{this}}`
   - Use `{{@index}}`, `{{@first}}`, `{{@last}}`

4. **Always Handle Commas**
   - Use `{{#unless @last}},{{/unless}}`
   - Prevents invalid JSON

5. **Test Early, Test Often**
   - Start simple
   - Add complexity gradually
   - Verify JSON validity

### Workflow Recap

```
Template Data (Handlebars)
         ↓
  Handlebars.compile()
         ↓
  Execute with Sample Data
         ↓
  Final JSON (no Handlebars)
         ↓
     JSON.parse()
         ↓
   PDFMake.createPdf()
         ↓
        PDF!
```

---

**Version**: 1.0.0  
**Last Updated**: October 13, 2025  
**Author**: AegisX Platform Team
