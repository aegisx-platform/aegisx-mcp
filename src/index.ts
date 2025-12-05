#!/usr/bin/env node
/**
 * AegisX MCP Server
 * Model Context Protocol server for AegisX platform
 *
 * Features:
 * - UI Components reference
 * - CRUD Generator commands
 * - Development patterns
 * - Documentation lookup
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import {
  handleComponentTool,
  componentCategories,
} from './tools/components.tool.js';
import { handleCrudTool } from './tools/crud.tool.js';
import { handlePatternTool } from './tools/patterns.tool.js';
import { registerResources, handleResourceRead } from './resources/index.js';

// Create MCP server
const server = new McpServer({
  name: 'aegisx-mcp',
  version: '1.0.0',
});

// ============ COMPONENT TOOLS ============

server.tool(
  'aegisx_components_list',
  'List all AegisX UI components or filter by category. Returns component names, selectors, and brief descriptions.',
  {
    category: z
      .enum(componentCategories as unknown as [string, ...string[]])
      .optional()
      .describe(`Filter by category: ${componentCategories.join(', ')}`),
  },
  async (args) => {
    const result = handleComponentTool('aegisx_components_list', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

server.tool(
  'aegisx_components_get',
  'Get detailed information about a specific AegisX UI component including all inputs, outputs, usage examples, and best practices.',
  {
    name: z
      .string()
      .describe(
        'Component name (e.g., "Badge", "Drawer") or selector (e.g., "ax-badge", "ax-drawer")',
      ),
  },
  async (args) => {
    const result = handleComponentTool('aegisx_components_get', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

server.tool(
  'aegisx_components_search',
  'Search AegisX UI components by name, description, or functionality.',
  {
    query: z
      .string()
      .describe('Search query (e.g., "loading", "form", "chart")'),
  },
  async (args) => {
    const result = handleComponentTool('aegisx_components_search', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

// ============ CRUD TOOLS ============

server.tool(
  'aegisx_crud_build_command',
  'Build a CRUD generator command with the specified options. Returns the exact command to run.',
  {
    tableName: z
      .string()
      .describe(
        'Database table name in snake_case (e.g., "products", "user_profiles")',
      ),
    target: z
      .enum(['backend', 'frontend'])
      .optional()
      .describe('Generation target (default: backend)'),
    package: z
      .enum(['standard', 'enterprise', 'full'])
      .optional()
      .describe(
        'Feature package: standard (basic CRUD), enterprise (+ import), full (+ events)',
      ),
    withImport: z
      .boolean()
      .optional()
      .describe('Include Excel/CSV import functionality'),
    withEvents: z
      .boolean()
      .optional()
      .describe('Include WebSocket events for real-time updates'),
    force: z
      .boolean()
      .optional()
      .describe('Overwrite existing files without prompt'),
    dryRun: z
      .boolean()
      .optional()
      .describe('Preview files without creating them'),
  },
  async (args) => {
    const result = handleCrudTool('aegisx_crud_build_command', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

server.tool(
  'aegisx_crud_packages',
  'Get information about available CRUD generator packages and their features.',
  {
    packageName: z
      .enum(['standard', 'enterprise', 'full'])
      .optional()
      .describe('Specific package to get details for (optional)'),
  },
  async (args) => {
    const result = handleCrudTool('aegisx_crud_packages', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

server.tool(
  'aegisx_crud_files',
  'Show what files will be generated for a CRUD module.',
  {
    target: z
      .enum(['backend', 'frontend', 'both'])
      .optional()
      .describe('Which target to show files for'),
    tableName: z
      .string()
      .optional()
      .describe('Table name to show file paths for (optional)'),
  },
  async (args) => {
    const result = handleCrudTool('aegisx_crud_files', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

server.tool(
  'aegisx_crud_troubleshoot',
  'Get troubleshooting help for common CRUD generator issues.',
  {
    problem: z
      .string()
      .optional()
      .describe('Describe the problem you are experiencing'),
  },
  async (args) => {
    const result = handleCrudTool('aegisx_crud_troubleshoot', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

server.tool(
  'aegisx_crud_workflow',
  'Get the recommended workflow for generating a complete CRUD feature (backend + frontend).',
  {
    tableName: z.string().describe('Table name for the feature'),
    withImport: z.boolean().optional().describe('Include import functionality'),
    withEvents: z.boolean().optional().describe('Include real-time events'),
  },
  async (args) => {
    const result = handleCrudTool('aegisx_crud_workflow', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

// ============ PATTERN TOOLS ============

server.tool(
  'aegisx_patterns_list',
  'List available development patterns and code templates. Filter by category: backend, frontend, database, testing.',
  {
    category: z
      .enum(['backend', 'frontend', 'database', 'testing'])
      .optional()
      .describe('Filter patterns by category'),
  },
  async (args) => {
    const result = handlePatternTool('aegisx_patterns_list', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

server.tool(
  'aegisx_patterns_get',
  'Get a specific development pattern with complete code example and best practices.',
  {
    name: z
      .string()
      .describe(
        'Pattern name (e.g., "TypeBox Schema Definition", "Angular Signal-based Component")',
      ),
  },
  async (args) => {
    const result = handlePatternTool('aegisx_patterns_get', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

server.tool(
  'aegisx_patterns_search',
  'Search development patterns by keyword (e.g., "auth", "validation", "signal").',
  {
    query: z.string().describe('Search query'),
  },
  async (args) => {
    const result = handlePatternTool('aegisx_patterns_search', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

server.tool(
  'aegisx_patterns_suggest',
  'Get pattern suggestions for a specific use case or task.',
  {
    task: z
      .string()
      .describe(
        'Describe what you want to do (e.g., "create API endpoint", "build form component")',
      ),
  },
  async (args) => {
    const result = handlePatternTool('aegisx_patterns_suggest', args);
    return {
      content: result.content.map((c) => ({
        type: 'text' as const,
        text: c.text,
      })),
    };
  },
);

// ============ RESOURCES ============

const resources = registerResources();
for (const resource of resources) {
  server.resource(resource.uri, resource.name, async () => {
    const result = handleResourceRead(resource.uri);
    return {
      contents: result.contents.map((c) => ({
        uri: c.uri,
        mimeType: c.mimeType as 'text/markdown',
        text: c.text,
      })),
    };
  });
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AegisX MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
