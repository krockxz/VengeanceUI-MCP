/**
 * VengeanceUI MCP Server
 *
 * Allows AI assistants to browse, search, and retrieve VengeanceUI components
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  loadComponentsFromGitHub,
  getCategories,
} from "./componentLoader.js";
import type {
  ComponentMetadata,
  ComponentSummary,
  SearchResult,
  CategoryInfo,
} from "./types.js";

// In-memory component cache
let componentsCache: ComponentMetadata[] = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Initialize MCP Server
 */
const server = new McpServer({
  name: "VengeanceUI MCP Server",
  version: "1.0.0",
});

/**
 * Load components (with caching)
 */
async function loadComponents(forceRefresh = false): Promise<ComponentMetadata[]> {
  const now = Date.now();

  if (!forceRefresh && componentsCache.length > 0 && (now - lastCacheUpdate) < CACHE_DURATION) {
    return componentsCache;
  }

  console.error("Loading components from VengeanceUI GitHub repository...");
  componentsCache = await loadComponentsFromGitHub();
  lastCacheUpdate = now;
  console.error(`Loaded ${componentsCache.length} components`);

  return componentsCache;
}

/**
 * Format component for display
 */
function formatComponentSummary(component: ComponentMetadata): ComponentSummary {
  return {
    name: component.name,
    category: component.category,
    description: component.description,
    tags: component.tags,
    sourceUrl: component.sourceUrl,
  };
}

/**
 * Format search results with highlighting
 */
function formatSearchResults(results: SearchResult[], query: string): string {
  if (results.length === 0) {
    return `No components found matching "${query}"`;
  }

  const output: string[] = [];
  output.push(`Found ${results.length} component${results.length > 1 ? "s" : ""} matching "${query}":\n`);

  for (const result of results) {
    const { component, score } = result;
    output.push(`**${component.name}** (Relevance: ${Math.round(score * 100)}%)`);
    output.push(`  Category: ${component.category}`);
    output.push(`  Description: ${component.description}`);
    if (component.tags.length > 0) {
      output.push(`  Tags: ${component.tags.join(", ")}`);
    }
    output.push(`  Source: ${component.sourceUrl}`);
    output.push("");
  }

  return output.join("\n");
}

// ====================================================================
// MCP Tools
// ====================================================================

/**
 * Tool 1: List all components
 */
server.tool(
  "list_components",
  "List all available VengeanceUI components with their categories and descriptions",
  {
    category: z.string().optional().describe("Filter by category (e.g., 'Buttons', 'Cards', 'Forms')"),
    limit: z.number().optional().describe("Maximum number of components to return"),
  },
  async (params) => {
    const components = await loadComponents();
    let filtered = components;

    // Filter by category if specified
    if (params.category) {
      const category = params.category.toLowerCase();
      filtered = components.filter((c) => c.category.toLowerCase() === category);
    }

    // Apply limit if specified
    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    const summaries = filtered.map(formatComponentSummary);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              total: filtered.length,
              components: summaries,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * Tool 2: Search components by name, category, tags, or description
 */
server.tool(
  "search_components",
  "Search for VengeanceUI components by name, category, tags, or description with fuzzy matching",
  {
    query: z.string().describe("Search term (component name, category, tag, or description)"),
    limit: z.number().optional().describe("Maximum number of results to return (default: 10)"),
  },
  async (params) => {
    const query = params.query.toLowerCase().trim();
    const limit = params.limit ?? 10;

    if (!query) {
      return {
        content: [
          {
            type: "text",
            text: "Please provide a search query",
          },
        ],
      };
    }

    const components = await loadComponents();
    const results: SearchResult[] = [];

    for (const component of components) {
      let score = 0;
      const matchedFields: string[] = [];

      // Check name match (highest weight)
      if (component.name.toLowerCase().includes(query)) {
        score += 50;
        matchedFields.push("name");
      }

      // Check category match (high weight)
      if (component.category.toLowerCase().includes(query)) {
        score += 30;
        matchedFields.push("category");
      }

      // Check tags (medium weight)
      for (const tag of component.tags) {
        if (tag.toLowerCase().includes(query)) {
          score += 20;
          matchedFields.push("tags");
          break;
        }
      }

      // Check description (lower weight)
      if (component.description.toLowerCase().includes(query)) {
        score += 10;
        matchedFields.push("description");
      }

      // Add bonus for exact matches
      if (component.name.toLowerCase() === query) {
        score += 30;
      }

      if (score > 0) {
        results.push({ component, score, matchedFields });
      }
    }

    // Sort by score (descending) and limit results
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, limit);

    return {
      content: [
        {
          type: "text",
          text: formatSearchResults(topResults, query),
        },
      ],
    };
  }
);

/**
 * Tool 3: Get component source code
 */
server.tool(
  "get_component_code",
  "Get the complete source code for a specific VengeanceUI component",
  {
    component_name: z.string().describe("Name of the component (e.g., 'AnimatedButton', 'GradientCard')"),
    include_metadata: z.boolean().optional().describe("Include component metadata (tags, dependencies, etc.)"),
  },
  async (params) => {
    const componentName = params.component_name.trim();
    const includeMetadata = params.include_metadata ?? true;

    if (!componentName) {
      return {
        content: [
          {
            type: "text",
            text: "Please provide a component name",
          },
        ],
      };
    }

    const components = await loadComponents();
    const component = components.find(
      (c) => c.name.toLowerCase() === componentName.toLowerCase()
    );

    if (!component) {
      // Try to find similar components
      const similar = components
        .filter((c) => c.name.toLowerCase().includes(componentName.toLowerCase()))
        .slice(0, 5);

      if (similar.length > 0) {
        const suggestions = similar.map((c) => `  - ${c.name}`).join("\n");
        return {
          content: [
            {
              type: "text",
              text: `Component "${componentName}" not found. Did you mean:\n${suggestions}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Component "${componentName}" not found. Use 'search_components' to find available components.`,
          },
        ],
      };
    }

    let output = `# ${component.name}\n\n`;

    if (includeMetadata) {
      output += `**Description:** ${component.description}\n\n`;
      output += `**Category:** ${component.category}\n\n`;
      output += `**Tags:** ${component.tags.join(", ") || "None"}\n\n`;
      output += `**Source:** ${component.sourceUrl}\n\n`;

      if (component.dependencies && component.dependencies.length > 0) {
        output += `**Dependencies:**\n${component.dependencies.map((d) => `  - ${d}`).join("\n")}\n\n`;
      }
    }

    output += `## Code:\n\n\`\`\`tsx\n${component.code}\n\`\`\``;

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  }
);

/**
 * Tool 4: Get components by category
 */
server.tool(
  "get_components_by_category",
  "Get all components in a specific category",
  {
    category: z.string().describe("Component category (e.g., 'Buttons', 'Cards', 'Forms', 'Navigation')"),
  },
  async (params) => {
    const category = params.category.trim();

    if (!category) {
      return {
        content: [
          {
            type: "text",
            text: "Please provide a category name",
          },
        ],
      };
    }

    const components = await loadComponents();
    const results = components.filter(
      (c) => c.category.toLowerCase() === category.toLowerCase()
    );

    if (results.length === 0) {
      // Get available categories for suggestion
      const categories = getCategories(components);
      const availableCategories = categories.map((c) => `  - ${c.name}`).join("\n");

      return {
        content: [
          {
            type: "text",
            text: `No components found in category "${category}".\n\nAvailable categories:\n${availableCategories}`,
          },
        ],
      };
    }

    const output: string[] = [];
    output.push(`## ${category} Category (${results.length} component${results.length > 1 ? "s" : ""})\n`);

    for (const component of results) {
      output.push(`### ${component.name}`);
      output.push(`**Description:** ${component.description}`);
      if (component.tags.length > 0) {
        output.push(`**Tags:** ${component.tags.join(", ")}`);
      }
      output.push(`**Source:** ${component.sourceUrl}`);
      output.push("");
    }

    return {
      content: [
        {
          type: "text",
          text: output.join("\n"),
        },
      ],
    };
  }
);

/**
 * Tool 5: Get component metadata
 */
server.tool(
  "get_component_info",
  "Get detailed information about a component including metadata, dependencies, and stats",
  {
    component_name: z.string().describe("Name of the component"),
  },
  async (params) => {
    const componentName = params.component_name.trim();

    if (!componentName) {
      return {
        content: [
          {
            type: "text",
            text: "Please provide a component name",
          },
        ],
      };
    }

    const components = await loadComponents();
    const component = components.find(
      (c) => c.name.toLowerCase() === componentName.toLowerCase()
    );

    if (!component) {
      return {
        content: [
          {
            type: "text",
            text: `Component "${componentName}" not found. Use 'search_components' to find available components.`,
          },
        ],
      };
    }

    const metadata = {
      name: component.name,
      category: component.category,
      description: component.description,
      sourceUrl: component.sourceUrl,
      demoUrl: component.demoUrl || null,
      tags: component.tags,
      dependencies: component.dependencies || [],
      path: component.path || null,
      size: component.size || 0,
      sizeFormatted: component.size ? `${(component.size / 1024).toFixed(2)} KB` : "Unknown",
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(metadata, null, 2),
        },
      ],
    };
  }
);

/**
 * Tool 6: List all categories
 */
server.tool(
  "list_categories",
  "List all component categories with counts and descriptions",
  {},
  async () => {
    const components = await loadComponents();
    const categories = getCategories(components);

    if (categories.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No categories found",
          },
        ],
      };
    }

    const output: string[] = [];
    output.push(`## VengeanceUI Categories (${categories.length} total)\n`);

    for (const category of categories) {
      output.push(`### ${category.name}`);
      output.push(`**Count:** ${category.count} component${category.count !== 1 ? "s" : ""}`);
      output.push(`**Description:** ${category.description}`);
      output.push("");
    }

    return {
      content: [
        {
          type: "text",
          text: output.join("\n"),
        },
      ],
    };
  }
);

/**
 * Tool 7: Refresh component cache
 */
server.tool(
  "refresh_cache",
  "Force refresh the component cache from the GitHub repository",
  {},
  async () => {
    const components = await loadComponents(true);

    return {
      content: [
        {
          type: "text",
          text: `Successfully refreshed component cache. Loaded ${components.length} components from VengeanceUI.`,
        },
      ],
    };
  }
);

// ====================================================================
// Server Startup
// ====================================================================

async function main() {
  // Pre-load components on startup
  await loadComponents();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("VengeanceUI MCP Server running on stdio");
  console.error(`Loaded ${componentsCache.length} components`);
}

main().catch((error) => {
  console.error("Failed to start VengeanceUI MCP Server:", error);
  process.exit(1);
});
