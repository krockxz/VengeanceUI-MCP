# VengeanceUI MCP Server

An [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for [VengeanceUI](https://github.com/Ashutoshx7/VengeanceUI) components. This server enables AI assistants like Claude, Cursor, and other MCP-enabled tools to browse, search, and retrieve VengeanceUI components directly from the GitHub repository.

## Features

- **Browse Components**: List all available VengeanceUI components with categories and descriptions
- **Smart Search**: Search components by name, category, tags, or description with fuzzy matching
- **Source Code Access**: Get complete component source code with metadata
- **Category Filtering**: Explore components by category (Buttons, Cards, Forms, etc.)
- **Component Metadata**: View detailed information including dependencies, tags, and source URLs
- **Caching**: Built-in component cache for faster responses (5-minute refresh)

## Installation

### From Source

1. Clone this repository:
```bash
git clone <your-repo-url>
cd "mcp VengeanceUI"
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vengeanceui": {
      "command": "node",
      "args": ["/absolute/path/to/mcp VengeanceUI/dist/server.js"],
      "env": {
        "GITHUB_TOKEN": "your-github-token-optional"
      }
    }
  }
}
```

### Cursor IDE

Create or edit `.cursor/mcp-servers.json` in your project:

```json
{
  "mcpServers": {
    "vengeanceui": {
      "command": "node",
      "args": ["/absolute/path/to/mcp VengeanceUI/dist/server.js"],
      "env": {
        "GITHUB_TOKEN": "your-github-token-optional"
      }
    }
  }
}
```

### Environment Variables

- `GITHUB_TOKEN` (optional): GitHub personal access token for higher API rate limits
- `NODE_ENV`: Set to `production` for production use

## Available Tools

### `list_components`
List all available VengeanceUI components.

**Parameters:**
- `category` (optional): Filter by category
- `limit` (optional): Maximum number of components to return

### `search_components`
Search for components by name, category, tags, or description.

**Parameters:**
- `query` (required): Search term
- `limit` (optional): Maximum number of results (default: 10)

### `get_component_code`
Get the complete source code for a specific component.

**Parameters:**
- `component_name` (required): Name of the component
- `include_metadata` (optional): Include component metadata (default: true)

### `get_components_by_category`
Get all components in a specific category.

**Parameters:**
- `category` (required): Component category name

### `get_component_info`
Get detailed information about a component.

**Parameters:**
- `component_name` (required): Name of the component

### `list_categories`
List all component categories with counts.

### `refresh_cache`
Force refresh the component cache from GitHub.

## Usage Examples

Once configured, you can use natural language prompts like:

- "Show me all available VengeanceUI components"
- "Find animated button components"
- "Get the code for the GradientCard component"
- "What components are in the Buttons category?"
- "List all available categories"
- "Get component info for AnimatedButton"

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

## Project Structure

```
.
├── src/
│   ├── server.ts           # Main MCP server implementation
│   ├── componentLoader.ts  # GitHub component fetcher
│   └── types.ts            # TypeScript type definitions
├── dist/                   # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **Component Loading**: The server fetches component information directly from the [VengeanceUI GitHub repository](https://github.com/Ashutoshx7/VengeanceUI)
2. **Smart Parsing**: Analyzes component code to extract metadata, tags, dependencies, and categories
3. **Caching**: Components are cached for 5 minutes to reduce API calls
4. **MCP Protocol**: Uses the Model Context Protocol to expose tools to AI assistants

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Acknowledgments

- [VengeanceUI](https://github.com/Ashutoshx7/VengeanceUI) for the amazing component library
- [Model Context Protocol](https://modelcontextprotocol.io) for the server framework
- Inspired by [shadcn-ui-mcp-server](https://github.com/sherifbutt/shadcn-ui-mcp-server)
