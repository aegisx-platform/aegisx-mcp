import { Injectable } from '@angular/core';

/**
 * Quick Insert Template Definition
 */
export interface InsertTemplate {
  name: string;
  category: 'basic' | 'table' | 'layout' | 'advanced';
  icon: string;
  description: string;
  template: string;
}

/**
 * Service for managing PDF template quick insert structures
 */
@Injectable({
  providedIn: 'root',
})
export class PdfTemplateInsertService {
  private readonly templates: InsertTemplate[] = [
    // Basic Templates
    {
      name: 'Text',
      category: 'basic',
      icon: 'notes',
      description: 'Simple text block',
      template: JSON.stringify(
        {
          text: 'Your text here',
          style: 'normal',
        },
        null,
        2,
      ),
    },
    {
      name: 'Header',
      category: 'basic',
      icon: 'title',
      description: 'Document header',
      template: JSON.stringify(
        {
          text: 'Document Title',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        null,
        2,
      ),
    },
    {
      name: 'Paragraph',
      category: 'basic',
      icon: 'subject',
      description: 'Text paragraph',
      template: JSON.stringify(
        {
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          alignment: 'justify',
          margin: [0, 5, 0, 5],
        },
        null,
        2,
      ),
    },

    // Table Templates
    {
      name: 'Simple Table',
      category: 'table',
      icon: 'table_chart',
      description: '2x3 basic table',
      template: JSON.stringify(
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              ['Header 1', 'Header 2'],
              ['Cell 1', 'Cell 2'],
              ['Cell 3', 'Cell 4'],
            ],
          },
        },
        null,
        2,
      ),
    },
    {
      name: 'Invoice Table',
      category: 'table',
      icon: 'receipt',
      description: 'Table for invoice items',
      template: JSON.stringify(
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'],
            body: [
              [
                { text: 'No.', style: 'tableHeader' },
                { text: 'Description', style: 'tableHeader' },
                { text: 'Qty', style: 'tableHeader' },
                { text: 'Amount', style: 'tableHeader' },
              ],
              ['1', 'Product A', '2', '1,000.00'],
              ['2', 'Product B', '1', '500.00'],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        null,
        2,
      ),
    },
    {
      name: 'Dynamic Table',
      category: 'table',
      icon: 'dynamic_feed',
      description: 'Table with Handlebars loop',
      template: `{
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
}`,
    },

    // Layout Templates
    {
      name: 'Two Columns',
      category: 'layout',
      icon: 'view_column',
      description: 'Split content into 2 columns',
      template: JSON.stringify(
        {
          columns: [
            {
              width: '50%',
              text: 'Left column content',
            },
            {
              width: '50%',
              text: 'Right column content',
            },
          ],
        },
        null,
        2,
      ),
    },
    {
      name: 'Three Columns',
      category: 'layout',
      icon: 'view_week',
      description: 'Split content into 3 columns',
      template: JSON.stringify(
        {
          columns: [
            {
              width: '33%',
              text: 'Left',
            },
            {
              width: '34%',
              text: 'Center',
            },
            {
              width: '33%',
              text: 'Right',
            },
          ],
        },
        null,
        2,
      ),
    },
    {
      name: 'Logo Center',
      category: 'layout',
      icon: 'image',
      description: 'Centered logo image',
      template: JSON.stringify(
        {
          columns: [
            {
              width: '*',
              text: '',
            },
            {
              image: '{{logo logo_file_id}}',
              width: 100,
              height: 100,
            },
            {
              width: '*',
              text: '',
            },
          ],
          margin: [0, 0, 0, 20],
        },
        null,
        2,
      ),
    },

    // Advanced Templates
    {
      name: 'Stack',
      category: 'advanced',
      icon: 'layers',
      description: 'Vertical stack of elements',
      template: JSON.stringify(
        {
          stack: [
            { text: 'First line', fontSize: 14 },
            { text: 'Second line', fontSize: 12 },
            { text: 'Third line', fontSize: 10 },
          ],
        },
        null,
        2,
      ),
    },
    {
      name: 'Unordered List',
      category: 'advanced',
      icon: 'format_list_bulleted',
      description: 'Bulleted list',
      template: JSON.stringify(
        {
          ul: ['First item', 'Second item', 'Third item'],
        },
        null,
        2,
      ),
    },
    {
      name: 'Ordered List',
      category: 'advanced',
      icon: 'format_list_numbered',
      description: 'Numbered list',
      template: JSON.stringify(
        {
          ol: ['First item', 'Second item', 'Third item'],
        },
        null,
        2,
      ),
    },
    {
      name: 'QR Code',
      category: 'advanced',
      icon: 'qr_code_2',
      description: 'QR code element',
      template: JSON.stringify(
        {
          qr: 'https://example.com',
          fit: 100,
        },
        null,
        2,
      ),
    },
    {
      name: 'Page Break',
      category: 'advanced',
      icon: 'add_box',
      description: 'Force page break',
      template: JSON.stringify(
        {
          text: '',
          pageBreak: 'after',
        },
        null,
        2,
      ),
    },
    {
      name: 'Invoice Header',
      category: 'advanced',
      icon: 'receipt_long',
      description: 'Complete invoice header with logo',
      template: `{
  "columns": [
    {
      "width": "*",
      "stack": [
        { "text": "From:", "bold": true, "margin": [0, 0, 0, 5] },
        { "text": "{{company.name}}" },
        { "text": "{{company.address}}" },
        { "text": "Tel: {{company.phone}}" }
      ]
    },
    {
      "image": "{{logo logo_file_id}}",
      "width": 80,
      "height": 80
    },
    {
      "width": "*",
      "stack": [
        { "text": "To:", "bold": true, "margin": [0, 0, 0, 5] },
        { "text": "{{customer.name}}" },
        { "text": "{{customer.address}}" },
        { "text": "Tel: {{customer.phone}}" }
      ]
    }
  ],
  "margin": [0, 0, 0, 20]
}`,
    },
  ];

  /**
   * Get all insert templates
   */
  getAllTemplates(): InsertTemplate[] {
    return this.templates;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(
    category: InsertTemplate['category'],
  ): InsertTemplate[] {
    return this.templates.filter((t) => t.category === category);
  }

  /**
   * Get template by name
   */
  getTemplateByName(name: string): InsertTemplate | undefined {
    return this.templates.find((t) => t.name === name);
  }

  /**
   * Get all categories
   */
  getCategories(): Array<{ value: InsertTemplate['category']; label: string }> {
    return [
      { value: 'basic', label: 'Basic' },
      { value: 'table', label: 'Tables' },
      { value: 'layout', label: 'Layout' },
      { value: 'advanced', label: 'Advanced' },
    ];
  }

  /**
   * Insert template into existing content at cursor position
   */
  insertTemplateAtCursor(
    existingContent: string,
    template: string,
    cursorPosition: number,
  ): string {
    const before = existingContent.substring(0, cursorPosition);
    const after = existingContent.substring(cursorPosition);

    // Add comma if needed (for array/object contexts)
    const needsCommaBefore =
      before.trim().endsWith('}') ||
      before.trim().endsWith(']') ||
      before.trim().endsWith('"');

    const needsCommaAfter =
      after.trim().startsWith('{') ||
      after.trim().startsWith('[') ||
      after.trim().startsWith('"');

    let insertion = template;
    if (needsCommaBefore && !before.trim().endsWith(',')) {
      insertion = ',\n' + insertion;
    }
    if (needsCommaAfter && !insertion.endsWith(',')) {
      insertion = insertion + ',';
    }

    return before + insertion + after;
  }

  /**
   * Wrap template in content array if needed
   */
  wrapInContentArray(template: string): string {
    try {
      const parsed = JSON.parse(template);
      if (!parsed.content) {
        return JSON.stringify(
          {
            content: [parsed],
          },
          null,
          2,
        );
      }
      return template;
    } catch {
      return template;
    }
  }
}
