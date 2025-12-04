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

import { registerTools, handleToolCall } from './tools/index.js';
import { registerResources, handleResourceRead } from './resources/index.js';

// Create MCP server
const server = new McpServer({
  name: 'aegisx-mcp',
  version: '1.0.0',
});

// Register tools
const tools = registerTools();
for (const tool of tools) {
  server.tool(
    tool.name,
    tool.description || '',
    tool.inputSchema as any,
    async (args: Record<string, unknown>) => {
      const result = await handleToolCall(tool.name, args);
      return {
        content: result.content.map((c) => ({
          type: 'text' as const,
          text: c.text,
        })),
      };
    },
  );
}

// Register resources
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
