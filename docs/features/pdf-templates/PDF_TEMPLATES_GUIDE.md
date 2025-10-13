# PDF Templates - Handlebars Guide

คู่มือการใช้งาน PDF Template System พร้อม Handlebars สำหรับสร้าง PDF แบบ Dynamic

---

## 🎯 How It Works

```
Template String (JSON + Handlebars)
  → Handlebars.compile()
  → render(data)
  → JSON.parse()
  → PDFMake
  → PDF
```

**Key Points:**

- เก็บ Template เป็น **String** ในฐานข้อมูล (ไม่ใช่ JSON Object)
- ใช้ Handlebars เพื่อสร้าง Dynamic Content
- Render แล้วต้องได้ **Valid JSON** เท่านั้น
- `logo_file_id` จะถูกใส่ให้อัตโนมัติ (ไม่ต้องใส่ใน Sample Data)

---

## ✅ Template Structure

### Basic Template with Loop

```json
{
  "content": [
    {
      "text": "Invoice #{{invoice_number}}",
      "style": "header",
      "alignment": "center"
    },
    {
      "text": "Date: {{formatDate invoice_date 'DD/MM/YYYY'}}",
      "margin": [0, 5, 0, 10]
    },
    {
      "table": {
        "headerRows": 1,
        "widths": ["auto", "*", "auto", "auto"],
        "body": [
          [
            { "text": "No.", "style": "tableHeader" },
            { "text": "Description", "style": "tableHeader" },
            { "text": "Qty", "style": "tableHeader" },
            { "text": "Amount", "style": "tableHeader" }
          ],
          {{#each items}}
          [
            "{{add @index 1}}",
            "{{this.description}}",
            "{{this.qty}}",
            "{{formatCurrency this.amount}}"
          ]{{#unless @last}},{{/unless}}
          {{/each}}
        ]
      },
      "layout": "lightHorizontalLines"
    },
    {
      "text": "Total: {{formatCurrency total}}",
      "style": "total",
      "alignment": "right",
      "margin": [0, 10, 0, 0]
    }
  ],
  "styles": {
    "header": {
      "fontSize": 22,
      "bold": true,
      "color": "#2196F3"
    },
    "tableHeader": {
      "bold": true,
      "fontSize": 12,
      "color": "white",
      "fillColor": "#2196F3"
    },
    "total": {
      "fontSize": 14,
      "bold": true
    }
  },
  "defaultStyle": {
    "fontSize": 10,
    "font": "Sarabun"
  }
}
```

### Sample Data

```json
{
  "invoice_number": "INV-2024-001",
  "invoice_date": "2024-01-15",
  "items": [
    {
      "description": "Product A",
      "qty": 2,
      "amount": 1500
    },
    {
      "description": "Product B",
      "qty": 1,
      "amount": 2500
    }
  ],
  "total": 4000
}
```

---

## 🔧 Built-in Helpers

### 1. `add` - บวกเลข

```handlebars
{{add @index 1}}
→ 1, 2, 3, ...
{{add total tax}}
→ total + tax
```

### 2. `formatDate` - จัดรูปแบบวันที่

```handlebars
{{formatDate order_date 'DD/MM/YYYY'}}
→ 15/01/2024
{{formatDate created_at 'DD MMM YYYY HH:mm'}}
→ 15 Jan 2024 14:30
```

### 3. `formatCurrency` - จัดรูปแบบเงิน

```handlebars
{{formatCurrency total}}
→ 1,500.00
{{formatCurrency price 'USD' 'en-US'}}
→ $1,500.00
```

### 4. `logo` - แทรกรูป Logo

```handlebars
{ "image": "{{logo logo_file_id}}", "width": 100, "height": 100 }
```

**Note:** `logo_file_id` จะถูก inject อัตโนมัติจาก Template System (จาก upload form)

---

## 💡 Common Patterns

### Pattern 1: Array Loop with Comma (Valid JSON)

```handlebars
"body": [ ["Header 1", "Header 2"],
{{#each items}}
  ["{{this.col1}}", "{{this.col2}}"]{{#unless @last}},{{/unless}}
{{/each}}
]
```

**Why?** ต้องใส่ comma (`,`) ระหว่าง array elements ยกเว้น element สุดท้าย

### Pattern 2: Logo with Fallback

```handlebars
{ "columns": [ { "width": "*", "text": "" },
{{#if logo_file_id}}
  { "image": "{{logo logo_file_id}}", "width": 80, "height": 80 },
{{else}}
  { "text": "No Logo", "alignment": "center" },
{{/if}}
{ "width": "*", "text": "" } ] }
```

### Pattern 3: Nested Objects

```handlebars
{ "text": "Customer: {{customer.name}}", "margin": [0, 0, 0, 5] }, { "text": "Address: {{customer.address}}", "fontSize": 10 }
```

Sample Data:

```json
{
  "customer": {
    "name": "John Doe",
    "address": "123 Main St"
  }
}
```

### Pattern 4: Conditional Sections

```handlebars
{{#if discount}}
  { "text": "Discount: -{{formatCurrency discount}}", "color": "red" },
{{/if}}
{ "text": "Total:
{{formatCurrency total}}", "bold": true }
```

---

## ⚠️ Common Mistakes

### ❌ Wrong: Missing Comma

```handlebars
{{#each items}}
  ["{{this.name}}", "{{this.price}}"]
{{/each}}
```

**Error:** Missing comma between array elements

### ✅ Correct: Use `{{#unless @last}},{{/unless}}`

```handlebars
{{#each items}}
  ["{{this.name}}", "{{this.price}}"]{{#unless @last}},{{/unless}}
{{/each}}
```

---

### ❌ Wrong: Math Operations

```handlebars
{{@index + 1}}
```

**Error:** Handlebars doesn't support inline math

### ✅ Correct: Use Helper

```handlebars
{{add @index 1}}
```

---

### ❌ Wrong: Multiple Statements in Helper

```handlebars
{{formatDate formatCurrency amount}}
```

**Error:** Cannot chain helpers

### ✅ Correct: Nested Calls

```handlebars
{{formatCurrency (add price tax)}}
```

**Note:** ใช้ parentheses สำหรับ nested helpers

---

### ❌ Wrong: logo_file_id in Sample Data

```json
{
  "logo_file_id": "some-uuid",
  "items": [...]
}
```

**Problem:** logo_file_id ถูก inject อัตโนมัติจากระบบ (จาก file upload form)

### ✅ Correct: Don't include logo_file_id

```json
{
  "items": [...]
}
```

---

## 📝 Complete Example: Invoice with Logo

### Template

```json
{
  "content": [
    {
      "columns": [
        {
          "width": "*",
          "text": ""
        },
        {
          "image": "{{logo logo_file_id}}",
          "width": 80,
          "height": 80
        },
        {
          "width": "*",
          "text": ""
        }
      ],
      "margin": [0, 0, 0, 20]
    },
    {
      "text": "TAX INVOICE",
      "style": "header",
      "alignment": "center",
      "margin": [0, 0, 0, 10]
    },
    {
      "columns": [
        {
          "width": "50%",
          "stack": [
            { "text": "From:", "bold": true, "margin": [0, 0, 0, 5] },
            { "text": "{{company.name}}" },
            { "text": "{{company.address}}" },
            { "text": "Tel: {{company.phone}}" }
          ]
        },
        {
          "width": "50%",
          "stack": [
            { "text": "To:", "bold": true, "margin": [0, 0, 0, 5] },
            { "text": "{{customer.name}}" },
            { "text": "{{customer.address}}" },
            { "text": "Tel: {{customer.phone}}" }
          ]
        }
      ],
      "margin": [0, 0, 0, 20]
    },
    {
      "columns": [
        {
          "width": "50%",
          "text": "Invoice No: {{invoice_number}}",
          "bold": true
        },
        {
          "width": "50%",
          "text": "Date: {{formatDate invoice_date 'DD/MM/YYYY'}}",
          "alignment": "right"
        }
      ],
      "margin": [0, 0, 0, 10]
    },
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
          {{#each items}}
          [
            "{{add @index 1}}",
            "{{this.description}}",
            "{{this.qty}}",
            "{{formatCurrency this.price}}",
            "{{formatCurrency this.amount}}"
          ]{{#unless @last}},{{/unless}}
          {{/each}}
        ]
      },
      "layout": "lightHorizontalLines",
      "margin": [0, 0, 0, 10]
    },
    {
      "columns": [
        {
          "width": "*",
          "text": ""
        },
        {
          "width": "auto",
          "table": {
            "widths": ["auto", "auto"],
            "body": [
              [
                { "text": "Subtotal:", "alignment": "right", "border": [false, false, false, false] },
                { "text": "{{formatCurrency subtotal}}", "alignment": "right", "border": [false, false, false, false] }
              ],
              [
                { "text": "VAT 7%:", "alignment": "right", "border": [false, false, false, false] },
                { "text": "{{formatCurrency vat}}", "alignment": "right", "border": [false, false, false, false] }
              ],
              [
                { "text": "Total:", "bold": true, "fontSize": 14, "alignment": "right", "border": [false, true, false, false] },
                { "text": "{{formatCurrency total}}", "bold": true, "fontSize": 14, "alignment": "right", "border": [false, true, false, false] }
              ]
            ]
          },
          "layout": {
            "hLineWidth": function(i, node) { return (i === 1) ? 1 : 0; },
            "vLineWidth": function() { return 0; },
            "paddingTop": function() { return 5; },
            "paddingBottom": function() { return 5; }
          }
        }
      ]
    }
  ],
  "styles": {
    "header": {
      "fontSize": 24,
      "bold": true,
      "color": "#2196F3"
    },
    "tableHeader": {
      "bold": true,
      "fontSize": 12,
      "color": "white",
      "fillColor": "#2196F3"
    }
  },
  "defaultStyle": {
    "fontSize": 10,
    "font": "Sarabun"
  }
}
```

### Sample Data

```json
{
  "company": {
    "name": "ACME Corporation Ltd.",
    "address": "123 Business Street, Bangkok 10110",
    "phone": "02-123-4567"
  },
  "customer": {
    "name": "John Doe",
    "address": "456 Customer Road, Bangkok 10120",
    "phone": "02-987-6543"
  },
  "invoice_number": "INV-2024-001",
  "invoice_date": "2024-01-15",
  "items": [
    {
      "description": "Web Development Service",
      "qty": 40,
      "price": 1500,
      "amount": 60000
    },
    {
      "description": "UI/UX Design",
      "qty": 20,
      "price": 2000,
      "amount": 40000
    },
    {
      "description": "Consulting",
      "qty": 10,
      "price": 3000,
      "amount": 30000
    }
  ],
  "subtotal": 130000,
  "vat": 9100,
  "total": 139100
}
```

---

## 🚀 Usage in Admin Panel

### 1. Create Template

1. ไปที่ **PDF Templates** → **Create New**
2. กรอก Template Name และ Description
3. Upload Logo (optional) - `logo_file_id` จะถูกสร้างอัตโนมัติ

### 2. Edit Template Data

1. คลิก **Template Data** tab
2. เขียน JSON พร้อม Handlebars syntax ใน Monaco Editor
3. ใช้ Syntax Highlighting และ Auto-completion

### 3. Generate Sample Data

1. คลิก **"Generate Sample Data from Template"**
2. ระบบจะ:
   - วิเคราะห์ `{{variables}}` ทั้งหมด
   - ตรวจจับ `{{#each loops}}`
   - สร้าง sample data structure อัตโนมัติ
   - **ข้าม** `logo_file_id` (เพราะถูก inject อัตโนมัติ)

### 4. Preview PDF

1. กรอก Sample Data (หรือใช้ Generated Sample Data)
2. คลิก **Preview**
3. ดู PDF ที่ render แล้วใน popup

### 5. Save & Use

1. คลิก **Save**
2. Template พร้อมใช้งานผ่าน API:
   ```
   POST /api/pdf-templates/:id/render
   Body: { data: {...} }
   ```

---

## 🔍 Debugging Tips

### Check Rendered JSON

Backend จะ log rendered JSON ก่อน parse:

```
[HandlebarsTemplateService] Rendered content (string template):
{
  "content": [
    ...
  ]
}
```

### Validate JSON

ถ้า Preview error ให้เช็ค:

1. ✅ Comma ครบทุก element (ยกเว้นตัวสุดท้าย)
2. ✅ Quotes (`"`) ครบทุกตัว
3. ✅ Brackets (`[]`, `{}`) ปิดครบ
4. ✅ ไม่มี trailing comma

### Common Errors

```
SyntaxError: Unexpected token
```

→ JSON format ผิด (ขาด comma หรือ bracket ไม่ครบ)

```
Failed to parse rendered content as JSON
```

→ Handlebars render ไม่ได้ valid JSON (ตรวจสอบ logs)

---

## 📚 References

- **Handlebars.js:** https://handlebarsjs.com/
- **PDFMake:** https://pdfmake.github.io/docs/
- **Monaco Editor:** https://microsoft.github.io/monaco-editor/

---

## 🎓 Best Practices

1. **Always test with Preview** ก่อน Save
2. **Use Generate Sample Data** เพื่อสร้าง structure อั่ตโนมัติ
3. **Don't include logo_file_id** ใน Sample Data
4. **Use helpers** สำหรับ formatting (formatDate, formatCurrency)
5. **Keep templates readable** - ใช้ indentation และ line breaks
6. **Test edge cases** - empty arrays, null values, missing fields

---

**Last Updated:** 2024-01-15
**Version:** 1.0
