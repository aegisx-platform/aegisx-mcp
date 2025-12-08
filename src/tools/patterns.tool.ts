/**
 * AegisX Development Patterns Tools
 */

import type { ToolDefinition } from './index.js';
import {
  getAllPatterns,
  getPatternsByCategory,
  getPatternByName,
  searchPatterns,
  CodePattern,
} from '../data/patterns.js';

export const patternTools: ToolDefinition[] = [
  {
    name: 'aegisx_patterns_list',
    description:
      'List available development patterns and code templates. Filter by category: backend, frontend, database, testing.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['backend', 'frontend', 'database', 'testing'],
          description: 'Filter patterns by category',
        },
      },
    },
  },
  {
    name: 'aegisx_patterns_get',
    description:
      'Get a specific development pattern with complete code example and best practices.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description:
            'Pattern name (e.g., "TypeBox Schema Definition", "Angular Signal-based Component")',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'aegisx_patterns_search',
    description:
      'Search development patterns by keyword (e.g., "auth", "validation", "signal").',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'aegisx_patterns_suggest',
    description: 'Get pattern suggestions for a specific use case or task.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description:
            'Describe what you want to do (e.g., "create API endpoint", "build form component")',
        },
      },
      required: ['task'],
    },
  },
];

function formatPatternBrief(pattern: CodePattern): string {
  return `- **${pattern.name}** (${pattern.category}) - ${pattern.description}`;
}

function formatPatternDetail(pattern: CodePattern): string {
  const lines: string[] = [];

  lines.push(`# ${pattern.name}`);
  lines.push(`**Category:** ${pattern.category}`);
  lines.push('');
  lines.push(`## Description`);
  lines.push(pattern.description);
  lines.push('');
  lines.push('## Code Example');
  lines.push(`\`\`\`${pattern.language}`);
  lines.push(pattern.code);
  lines.push('```');
  lines.push('');

  if (pattern.notes && pattern.notes.length > 0) {
    lines.push('## Important Notes');
    for (const note of pattern.notes) {
      lines.push(`- ${note}`);
    }
    lines.push('');
  }

  if (pattern.relatedPatterns && pattern.relatedPatterns.length > 0) {
    lines.push('## Related Patterns');
    lines.push(pattern.relatedPatterns.map((p) => `- ${p}`).join('\n'));
  }

  return lines.join('\n');
}

function suggestPatterns(task: string): CodePattern[] {
  const taskLower = task.toLowerCase();
  const allPatterns = getAllPatterns();
  const suggestions: CodePattern[] = [];

  // Keyword matching
  const keywords: Record<string, string[]> = {
    'TypeBox Schema Definition': [
      'schema',
      'validation',
      'typebox',
      'request',
      'response',
      'api',
    ],
    'Fastify Route Definition': ['route', 'endpoint', 'api', 'fastify', 'http'],
    'Auth Middleware Pattern': [
      'auth',
      'authentication',
      'authorization',
      'jwt',
      'middleware',
      'role',
    ],
    'Repository with UUID Validation': [
      'repository',
      'database',
      'uuid',
      'query',
      'crud',
    ],
    'Service Layer Pattern': ['service', 'business logic', 'layer'],
    'Angular Signal-based Component': [
      'component',
      'angular',
      'signal',
      'frontend',
      'ui',
    ],
    'Angular HTTP Service': ['http', 'api call', 'service', 'fetch', 'request'],
    'AegisX UI Integration': [
      'ui',
      'component',
      'aegisx',
      'material',
      'design',
    ],
    'Knex Migration': [
      'migration',
      'database',
      'table',
      'schema',
      'create table',
    ],
    'Knex Query Optimization': [
      'query',
      'performance',
      'pagination',
      'filter',
      'search',
    ],
    'API Integration Test': ['test', 'integration', 'api', 'vitest'],
  };

  for (const [patternName, patternKeywords] of Object.entries(keywords)) {
    const matches = patternKeywords.some((kw) => taskLower.includes(kw));
    if (matches) {
      const pattern = allPatterns.find((p) => p.name === patternName);
      if (pattern && !suggestions.includes(pattern)) {
        suggestions.push(pattern);
      }
    }
  }

  // If no matches, search
  if (suggestions.length === 0) {
    return searchPatterns(task).slice(0, 3);
  }

  return suggestions.slice(0, 5);
}

export function handlePatternTool(
  name: string,
  args: Record<string, unknown>,
): { content: Array<{ type: string; text: string }> } {
  switch (name) {
    case 'aegisx_patterns_list': {
      const category = args.category as string | undefined;
      const patterns = category
        ? getPatternsByCategory(category)
        : getAllPatterns();

      const grouped = new Map<string, CodePattern[]>();
      for (const pattern of patterns) {
        const cat = pattern.category;
        if (!grouped.has(cat)) {
          grouped.set(cat, []);
        }
        grouped.get(cat)!.push(pattern);
      }

      const lines: string[] = [];
      lines.push(`# AegisX Development Patterns (${patterns.length} total)`);
      lines.push('');

      for (const [cat, pats] of grouped) {
        lines.push(`## ${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
        for (const pat of pats) {
          lines.push(formatPatternBrief(pat));
        }
        lines.push('');
      }

      lines.push(
        'Use `aegisx_patterns_get` with pattern name to see full code example.',
      );

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    case 'aegisx_patterns_get': {
      const patternName = args.name as string;
      const pattern = getPatternByName(patternName);

      if (!pattern) {
        // Try fuzzy search
        const results = searchPatterns(patternName);
        if (results.length > 0) {
          const suggestions = results
            .slice(0, 3)
            .map((p) => `- ${p.name}`)
            .join('\n');
          return {
            content: [
              {
                type: 'text',
                text: `Pattern "${patternName}" not found. Did you mean:\n${suggestions}`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Pattern "${patternName}" not found. Use aegisx_patterns_list to see available patterns.`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: formatPatternDetail(pattern) }],
      };
    }

    case 'aegisx_patterns_search': {
      const query = args.query as string;
      const results = searchPatterns(query);

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No patterns found matching "${query}". Try different keywords.`,
            },
          ],
        };
      }

      const lines: string[] = [];
      lines.push(`# Search Results for "${query}" (${results.length} found)`);
      lines.push('');
      for (const pat of results) {
        lines.push(formatPatternBrief(pat));
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    case 'aegisx_patterns_suggest': {
      const task = args.task as string;
      const suggestions = suggestPatterns(task);

      if (suggestions.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No specific patterns found for "${task}". Use aegisx_patterns_list to browse all patterns.`,
            },
          ],
        };
      }

      const lines: string[] = [];
      lines.push(`# Suggested Patterns for: "${task}"`);
      lines.push('');
      lines.push('Based on your task, here are the recommended patterns:');
      lines.push('');

      for (let i = 0; i < suggestions.length; i++) {
        const pattern = suggestions[i];
        lines.push(`## ${i + 1}. ${pattern.name}`);
        lines.push(`**Category:** ${pattern.category}`);
        lines.push('');
        lines.push(pattern.description);
        lines.push('');
        lines.push('```' + pattern.language);
        // Show first 20 lines of code
        const codeLines = pattern.code.split('\n');
        lines.push(codeLines.slice(0, 20).join('\n'));
        if (codeLines.length > 20) {
          lines.push('// ... (use aegisx_patterns_get for full code)');
        }
        lines.push('```');
        lines.push('');
      }

      lines.push('---');
      lines.push(
        'Use `aegisx_patterns_get` with the pattern name to see the complete code example.',
      );

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown pattern tool: ${name}` }],
      };
  }
}
