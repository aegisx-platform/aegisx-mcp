# PDF Templates

Dynamic PDF generation system with Handlebars template support.

## Features

- 📝 **Handlebars Templates** - Use variables, loops, and conditionals in JSON templates
- 🎨 **Logo Support** - Upload and embed logos in PDFs
- 📊 **Dynamic Tables** - Generate tables from array data
- 🔧 **Built-in Helpers** - Date formatting, currency formatting, math operations
- 👁️ **Live Preview** - Preview PDFs before saving
- 🤖 **Smart Sample Data Generator** - Auto-generate sample data from template structure

## Quick Start

1. Navigate to **Admin Panel** → **PDF Templates**
2. Click **Create New Template**
3. Upload logo (optional)
4. Write template with Handlebars syntax
5. Generate sample data or write your own
6. Preview and save

## Documentation

📚 **[Complete Handlebars Guide](./PDF_TEMPLATES_GUIDE.md)** - Full documentation with examples and best practices

## API Usage

```typescript
// Render PDF from template
POST /api/pdf-templates/:id/render
Body: {
  data: {
    invoice_number: "INV-2024-001",
    items: [...],
    total: 10000
  }
}
```

## Template Example

```handlebars
{ "content": [ { "text": "Invoice #{{invoice_number}}", "style": "header" }, { "table": { "body": [ ["No.", "Description", "Amount"],
{{#each items}}
  ["{{add @index 1}}", "{{this.name}}", "{{formatCurrency this.amount}}"]{{#unless @last}},{{/unless}}
{{/each}}
] } } ] }
```

## Tech Stack

- **Handlebars.js** - Template engine
- **PDFMake** - PDF generation
- **Monaco Editor** - Code editor with syntax highlighting
- **Angular** - Frontend framework
- **Fastify** - Backend API

---

For detailed documentation, see [PDF_TEMPLATES_GUIDE.md](./PDF_TEMPLATES_GUIDE.md)
