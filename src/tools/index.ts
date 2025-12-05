/**
 * AegisX MCP Tools
 * Re-exports tool handlers for use by main server
 */

export { handleComponentTool, componentCategories } from './components.tool.js';
export { handleCrudTool } from './crud.tool.js';
export { handlePatternTool } from './patterns.tool.js';

// Legacy interface for backward compatibility
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}
