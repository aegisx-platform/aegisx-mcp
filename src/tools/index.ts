/**
 * AegisX MCP Tools Registration
 */

import { componentTools, handleComponentTool } from './components.tool.js';
import { crudTools, handleCrudTool } from './crud.tool.js';
import { patternTools, handlePatternTool } from './patterns.tool.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Register all available tools
 */
export function registerTools(): ToolDefinition[] {
  return [...componentTools, ...crudTools, ...patternTools] as ToolDefinition[];
}

/**
 * Handle tool calls
 */
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text: string }> }> {
  // Component tools
  if (name.startsWith('aegisx_components_')) {
    return handleComponentTool(name, args);
  }

  // CRUD tools
  if (name.startsWith('aegisx_crud_')) {
    return handleCrudTool(name, args);
  }

  // Pattern tools
  if (name.startsWith('aegisx_patterns_')) {
    return handlePatternTool(name, args);
  }

  return {
    content: [
      {
        type: 'text',
        text: `Unknown tool: ${name}`,
      },
    ],
  };
}
