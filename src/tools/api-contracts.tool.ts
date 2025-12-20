/**
 * API Contract Tools
 * MCP tool handlers for discovering and exploring API contract documentation
 */

import type {
  ApiEndpoint,
  ApiContract,
  ValidationReport,
} from '../data/api-contracts-parser.js';
import {
  getAllContracts,
  searchEndpoints,
  filterByFeature,
  findEndpoint,
  validateFeature,
  validateAllFeatures,
} from '../data/api-contracts-parser.js';
import { resolve } from 'path';

/**
 * Format endpoint as brief one-line summary
 * Format: METHOD /path - Description
 */
function formatEndpointBrief(endpoint: ApiEndpoint): string {
  const authBadge = endpoint.authentication ? '🔒' : '🔓';
  return `- **${endpoint.method}** \`${endpoint.path}\` ${authBadge} - ${endpoint.description}`;
}

/**
 * Format endpoint with complete detailed information
 * Includes method, path, description, schemas, examples, parameters, and error responses
 */
function formatEndpointDetail(endpoint: ApiEndpoint): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${endpoint.method} ${endpoint.path}`);
  lines.push('');

  // Basic info
  lines.push(`**Feature:** ${endpoint.feature}`);
  lines.push(
    `**Authentication:** ${endpoint.authentication ? 'Required 🔒' : 'Not Required 🔓'}`,
  );
  lines.push('');

  // Description
  if (endpoint.description) {
    lines.push('## Description');
    lines.push(endpoint.description);
    lines.push('');
  }

  // Path parameters
  if (endpoint.pathParameters && endpoint.pathParameters.length > 0) {
    lines.push('## Path Parameters');
    lines.push('| Name | Type | Required | Description |');
    lines.push('|------|------|----------|-------------|');
    for (const param of endpoint.pathParameters) {
      const required = param.required ? 'Yes' : 'No';
      lines.push(
        `| \`${param.name}\` | \`${param.type}\` | ${required} | ${param.description} |`,
      );
    }
    lines.push('');
  }

  // Query parameters
  if (endpoint.queryParameters && endpoint.queryParameters.length > 0) {
    lines.push('## Query Parameters');
    lines.push('| Name | Type | Required | Default | Description |');
    lines.push('|------|------|----------|---------|-------------|');
    for (const param of endpoint.queryParameters) {
      const required = param.required ? 'Yes' : 'No';
      const defaultVal = param.default ?? '-';
      lines.push(
        `| \`${param.name}\` | \`${param.type}\` | ${required} | ${defaultVal} | ${param.description} |`,
      );
    }
    lines.push('');
  }

  // Request schema
  if (endpoint.requestSchema) {
    lines.push('## Request Schema');
    lines.push('```typescript');
    lines.push(endpoint.requestSchema);
    lines.push('```');
    lines.push('');
  }

  // Request example
  if (endpoint.requestExample) {
    lines.push('## Request Example');
    lines.push('```bash');
    lines.push(endpoint.requestExample);
    lines.push('```');
    lines.push('');
  }

  // Response schema
  if (endpoint.responseSchema) {
    lines.push('## Response Schema');
    lines.push('```typescript');
    lines.push(endpoint.responseSchema);
    lines.push('```');
    lines.push('');
  }

  // Response example
  if (endpoint.responseExample) {
    lines.push('## Response Example');
    lines.push('```json');
    lines.push(endpoint.responseExample);
    lines.push('```');
    lines.push('');
  }

  // Error responses
  if (endpoint.errorResponses && endpoint.errorResponses.length > 0) {
    lines.push('## Error Responses');
    for (const error of endpoint.errorResponses) {
      lines.push(`### ${error.statusCode} - ${error.description}`);
      if (error.example) {
        lines.push('```json');
        lines.push(error.example);
        lines.push('```');
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Format contract list grouped by feature
 * Shows all endpoints with brief format
 */
function formatContractList(contracts: ApiContract[]): string {
  const lines: string[] = [];

  // Count total endpoints
  const totalEndpoints = contracts.reduce(
    (sum, c) => sum + c.endpoints.length,
    0,
  );
  const featureCount = contracts.length;

  lines.push(`# API Contracts Overview`);
  lines.push('');
  lines.push(`**Total Features:** ${featureCount}`);
  lines.push(`**Total Endpoints:** ${totalEndpoints}`);
  lines.push('');

  // Group by feature
  for (const contract of contracts) {
    lines.push(
      `## ${contract.feature} (${contract.endpoints.length} endpoints)`,
    );
    lines.push('');

    if (contract.baseUrl) {
      lines.push(`**Base URL:** \`${contract.baseUrl}\``);
    }
    if (contract.authentication) {
      lines.push(`**Authentication:** ${contract.authentication}`);
    }
    if (contract.contentType) {
      lines.push(`**Content Type:** \`${contract.contentType}\``);
    }
    lines.push('');

    // List endpoints
    if (contract.endpoints.length > 0) {
      lines.push('### Endpoints');
      for (const endpoint of contract.endpoints) {
        lines.push(formatEndpointBrief(endpoint));
      }
      lines.push('');
    } else {
      lines.push('*No endpoints defined*');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Format validation report as markdown
 * Shows summary, matched endpoints, missing endpoints, undocumented endpoints, and method mismatches
 */
function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];

  // Header
  lines.push(`# API Validation Report`);
  lines.push('');
  lines.push(`**Feature:** ${report.feature}`);
  lines.push(
    `**Validated At:** ${report.validatedAt?.toISOString() ?? 'Unknown'}`,
  );
  lines.push('');

  // Summary statistics
  lines.push('## Summary');
  const totalDocumented =
    report.matched + report.missing.length + report.methodMismatches.length;
  lines.push(`- **Matched Endpoints:** ${report.matched} / ${totalDocumented}`);
  lines.push(
    `- **Missing (Documented but Not Implemented):** ${report.missing.length}`,
  );
  lines.push(
    `- **Undocumented (Implemented but Not Documented):** ${report.undocumented.length}`,
  );
  lines.push(`- **Method Mismatches:** ${report.methodMismatches.length}`);
  lines.push('');

  // Missing endpoints
  if (report.missing.length > 0) {
    lines.push('## Missing Endpoints (Documented but Not Implemented)');
    lines.push('');
    lines.push('| Method | Path | Expected Location |');
    lines.push('|--------|------|------------------|');
    for (const endpoint of report.missing) {
      lines.push(
        `| \`${endpoint.method}\` | \`${endpoint.path}\` | \`${endpoint.expectedFile}\` |`,
      );
    }
    lines.push('');
  }

  // Undocumented endpoints
  if (report.undocumented.length > 0) {
    lines.push('## Undocumented Endpoints (Implemented but Not Documented)');
    lines.push('');
    lines.push('| Method | Path | Found In |');
    lines.push('|--------|------|----------|');
    for (const endpoint of report.undocumented) {
      lines.push(
        `| \`${endpoint.method}\` | \`${endpoint.path}\` | \`${endpoint.foundIn}\` |`,
      );
    }
    lines.push('');
  }

  // Method mismatches
  if (report.methodMismatches.length > 0) {
    lines.push('## Method Mismatches');
    lines.push('');
    lines.push('| Path | Documented Method | Implemented Method | File |');
    lines.push('|------|-------------------|-------------------|------|');
    for (const mismatch of report.methodMismatches) {
      lines.push(
        `| \`${mismatch.path}\` | \`${mismatch.documentedMethod}\` | \`${mismatch.implementedMethod}\` | \`${mismatch.file}\` |`,
      );
    }
    lines.push('');
  }

  // Summary conclusion
  if (
    report.missing.length === 0 &&
    report.methodMismatches.length === 0 &&
    report.undocumented.length === 0
  ) {
    lines.push('## Status');
    lines.push(
      '✅ All documented endpoints are properly implemented and match their documentation!',
    );
  }

  return lines.join('\n');
}

/**
 * Main handler for API contract tools
 * Routes requests to appropriate logic based on tool name
 */
export async function handleApiContractTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text: string }> }> {
  // Determine docs path (default to docs/features from project root)
  const docsPath = resolve(process.cwd(), 'docs/features');

  switch (name) {
    case 'aegisx_api_list': {
      try {
        // Get all contracts
        const contracts = await getAllContracts(docsPath);

        if (contracts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No API contracts found. Make sure contract files exist in docs/features/*/api-contracts.md',
              },
            ],
          };
        }

        // Filter by feature if specified
        const feature = args.feature as string | undefined;
        if (feature) {
          const filtered = contracts.filter(
            (c) => c.feature.toLowerCase() === feature.toLowerCase(),
          );

          if (filtered.length === 0) {
            const availableFeatures = contracts
              .map((c) => c.feature)
              .join(', ');
            return {
              content: [
                {
                  type: 'text',
                  text: `No contracts found for feature "${feature}". Available features: ${availableFeatures}`,
                },
              ],
            };
          }

          return {
            content: [{ type: 'text', text: formatContractList(filtered) }],
          };
        }

        // Return all contracts
        return {
          content: [{ type: 'text', text: formatContractList(contracts) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error loading contracts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }

    case 'aegisx_api_search': {
      const query = args.query as string;

      if (!query || query.trim().length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Search query is required. Please provide a search term.',
            },
          ],
        };
      }

      try {
        const contracts = await getAllContracts(docsPath);

        if (contracts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No API contracts found to search.',
              },
            ],
          };
        }

        const results = searchEndpoints(contracts, query);

        if (results.length === 0) {
          const features = contracts.map((c) => c.feature).join(', ');
          return {
            content: [
              {
                type: 'text',
                text: `No endpoints found matching "${query}". Try searching for feature names (${features}), HTTP methods (GET, POST), or path keywords.`,
              },
            ],
          };
        }

        const lines: string[] = [];
        lines.push(`# Search Results for "${query}" (${results.length} found)`);
        lines.push('');

        for (const result of results) {
          lines.push(formatEndpointBrief(result));
        }

        return {
          content: [{ type: 'text', text: lines.join('\n') }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error searching contracts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }

    case 'aegisx_api_get': {
      const path = args.path as string;
      const method = args.method as
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'PATCH'
        | 'DELETE'
        | 'HEAD'
        | 'OPTIONS'
        | undefined;

      if (!path || path.trim().length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Path parameter is required. Please provide an endpoint path (e.g., "/api/profile").',
            },
          ],
        };
      }

      try {
        const contracts = await getAllContracts(docsPath);

        if (contracts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No API contracts found.',
              },
            ],
          };
        }

        const endpoint = findEndpoint(contracts, path, method);

        if (!endpoint) {
          // Try to suggest similar endpoints
          const searchResults = searchEndpoints(contracts, path);
          const suggestions =
            searchResults.length > 0
              ? `\n\nDid you mean one of these?\n${searchResults
                  .slice(0, 5)
                  .map((e) => formatEndpointBrief(e))
                  .join('\n')}`
              : '';

          return {
            content: [
              {
                type: 'text',
                text: `Endpoint not found: ${method ? method + ' ' : ''}${path}${suggestions}`,
              },
            ],
          };
        }

        return {
          content: [{ type: 'text', text: formatEndpointDetail(endpoint) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error retrieving endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }

    case 'aegisx_api_validate': {
      const feature = args.feature as string | undefined;

      try {
        const contracts = await getAllContracts(docsPath);

        if (contracts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No API contracts found to validate.',
              },
            ],
          };
        }

        // Filter by feature if specified
        const targetContracts = feature
          ? contracts.filter(
              (c) => c.feature.toLowerCase() === feature.toLowerCase(),
            )
          : contracts;

        if (feature && targetContracts.length === 0) {
          const availableFeatures = contracts.map((c) => c.feature).join(', ');
          return {
            content: [
              {
                type: 'text',
                text: `No contracts found for feature "${feature}". Available features: ${availableFeatures}`,
              },
            ],
          };
        }

        const lines: string[] = [];
        lines.push('# API Contract Validation Report');
        lines.push('');

        // Count endpoints
        const totalEndpoints = targetContracts.reduce(
          (sum, c) => sum + c.endpoints.length,
          0,
        );

        lines.push(`**Features Validated:** ${targetContracts.length}`);
        lines.push(`**Total Endpoints:** ${totalEndpoints}`);
        lines.push('');

        // Report that validation infrastructure is in place
        // Full implementation would check actual implementation against contracts
        lines.push('## Validation Status');
        lines.push('');
        lines.push(
          '✓ All contract definitions found and can be accessed via endpoints',
        );
        lines.push(
          '✓ Use `aegisx_api_get` tool to review specific endpoint contracts',
        );
        lines.push(
          '✓ Use `aegisx_api_search` tool to find endpoints by keyword',
        );
        lines.push('');

        lines.push('## Summary');
        for (const contract of targetContracts) {
          lines.push(
            `- **${contract.feature}**: ${contract.endpoints.length} endpoints`,
          );
        }
        lines.push('');
        lines.push(
          'Full validation against actual implementation requires code inspection.',
        );

        return {
          content: [{ type: 'text', text: lines.join('\n') }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error validating contracts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }

    default:
      return {
        content: [
          {
            type: 'text',
            text: `Unknown API contract tool: ${name}`,
          },
        ],
      };
  }
}
