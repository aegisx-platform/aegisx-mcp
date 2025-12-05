/**
 * AegisX UI Components Tools
 */

import type { ToolDefinition } from './index.js';
import {
  getAllComponents,
  getComponentsByCategory,
  getComponentByName,
  searchComponents,
  componentCategories,
  ComponentInfo,
} from '../data/components.js';

// Re-export for use in index.ts
export { componentCategories };

export const componentTools: ToolDefinition[] = [
  {
    name: 'aegisx_components_list',
    description:
      'List all AegisX UI components or filter by category. Returns component names, selectors, and brief descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: `Filter by category: ${componentCategories.join(', ')}`,
          enum: [...componentCategories],
        },
      },
    },
  },
  {
    name: 'aegisx_components_get',
    description:
      'Get detailed information about a specific AegisX UI component including all inputs, outputs, usage examples, and best practices.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description:
            'Component name (e.g., "Badge", "Card") or selector (e.g., "ax-badge")',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'aegisx_components_search',
    description:
      'Search AegisX UI components by name, description, or functionality.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "loading", "form", "chart")',
        },
      },
      required: ['query'],
    },
  },
];

function formatComponentBrief(component: ComponentInfo): string {
  return `- **${component.name}** (\`${component.selector}\`) - ${component.description}`;
}

function formatComponentDetail(component: ComponentInfo): string {
  const lines: string[] = [];

  lines.push(`# ${component.name}`);
  lines.push(`**Selector:** \`${component.selector}\``);
  lines.push(`**Category:** ${component.category}`);
  lines.push('');
  lines.push(`## Description`);
  lines.push(component.description);
  lines.push('');

  if (component.inputs.length > 0) {
    lines.push('## Inputs');
    lines.push('| Name | Type | Default | Description |');
    lines.push('|------|------|---------|-------------|');
    for (const input of component.inputs) {
      const defaultVal = input.default ?? '-';
      const required = input.required ? ' *(required)*' : '';
      lines.push(
        `| \`${input.name}\` | \`${input.type}\` | ${defaultVal} | ${input.description}${required} |`,
      );
    }
    lines.push('');
  }

  if (component.outputs.length > 0) {
    lines.push('## Outputs');
    lines.push('| Name | Type | Description |');
    lines.push('|------|------|-------------|');
    for (const output of component.outputs) {
      lines.push(
        `| \`${output.name}\` | \`${output.type}\` | ${output.description} |`,
      );
    }
    lines.push('');
  }

  lines.push('## Usage Example');
  lines.push('```html');
  lines.push(component.usage);
  lines.push('```');
  lines.push('');

  if (component.bestPractices && component.bestPractices.length > 0) {
    lines.push('## Best Practices');
    for (const practice of component.bestPractices) {
      lines.push(`- ${practice}`);
    }
    lines.push('');
  }

  if (component.relatedComponents && component.relatedComponents.length > 0) {
    lines.push('## Related Components');
    lines.push(component.relatedComponents.map((c) => `\`${c}\``).join(', '));
  }

  return lines.join('\n');
}

export function handleComponentTool(
  name: string,
  args: Record<string, unknown>,
): { content: Array<{ type: string; text: string }> } {
  switch (name) {
    case 'aegisx_components_list': {
      const category = args.category as string | undefined;
      const components = category
        ? getComponentsByCategory(category as any)
        : getAllComponents();

      const grouped = new Map<string, ComponentInfo[]>();
      for (const comp of components) {
        const cat = comp.category;
        if (!grouped.has(cat)) {
          grouped.set(cat, []);
        }
        grouped.get(cat)!.push(comp);
      }

      const lines: string[] = [];
      lines.push(`# AegisX UI Components (${components.length} total)`);
      lines.push('');

      for (const [cat, comps] of grouped) {
        lines.push(
          `## ${cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}`,
        );
        for (const comp of comps) {
          lines.push(formatComponentBrief(comp));
        }
        lines.push('');
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    case 'aegisx_components_get': {
      const componentName = args.name as string;
      const component = getComponentByName(componentName);

      if (!component) {
        return {
          content: [
            {
              type: 'text',
              text: `Component "${componentName}" not found. Use aegisx_components_list to see available components.`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: formatComponentDetail(component) }],
      };
    }

    case 'aegisx_components_search': {
      const query = args.query as string;
      const results = searchComponents(query);

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No components found matching "${query}". Try a different search term.`,
            },
          ],
        };
      }

      const lines: string[] = [];
      lines.push(`# Search Results for "${query}" (${results.length} found)`);
      lines.push('');
      for (const comp of results) {
        lines.push(formatComponentBrief(comp));
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown component tool: ${name}` }],
      };
  }
}
