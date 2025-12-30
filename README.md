# VengeanceUI MCP Server

[![MCP](https://img.shields.io/badge/MCP-Server-blue)](https://modelcontextprotocol.io)
[![VengeanceUI](https://img.shields.io/badge/VengeanceUI-Components-purple)](https://github.com/Ashutoshx7/VengeanceUI)

An [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that brings **129 beautiful VengeanceUI components** directly to your AI assistant! Browse, search, and retrieve component source code from the [VengeanceUI GitHub repository](https://github.com/Ashutoshx7/VengeanceUI) seamlessly within Claude Desktop, Cursor, or any MCP-enabled tool.

## ✨ Features

- 🎨 **129+ Components**: Access the complete VengeanceUI component library
- 🔍 **Smart Search**: Search by name, category, tags, or description with fuzzy matching
- 📦 **Full Source Code**: Get complete component code with metadata
- 🗂️ **Category Filtering**: Browse by Buttons, Cards, Forms, Navigation, and more
- 📊 **Component Metadata**: View dependencies, tags, file size, and source URLs
- ⚡ **Smart Caching**: Built-in 5-minute cache for faster responses
- 🔄 **Real-time Sync**: Components loaded directly from the latest GitHub repository

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18 or higher (tested with v22.17.0)
- **npm**: Latest version
- **Claude Desktop** or **Cursor IDE** (or any MCP-compatible client)

### Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/krockxz/VengeanceUI-MCP.git
   cd VengeanceUI-MCP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

   You should see:
   ```
   > vengeanceui-mcp-server@1.0.0 build
   > tsc
   ```

4. **Verify the build:**
   ```bash
   ls -lh dist/server.js
   ```

## ⚙️ Configuration

### For Claude Desktop

1. **Locate your configuration file:**
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add the VengeanceUI server configuration:**

   ```json
   {
     "mcpServers": {
       "vengeanceui": {
         "command": "node",
         "args": ["/absolute/path/to/mcp VengeanceUI/dist/server.js"]
       }
     }
   }
   ```

   > **⚠️ Important**: Replace `/absolute/path/to/` with your actual absolute path!
   >
   > **Example on Linux:**
   > ```json
   > "args": ["/home/kunal/Documents/mcp VengeanceUI/dist/server.js"]
   > ```

3. **Restart Claude Desktop:**
   - **Linux**: Press `Ctrl + R` or fully restart the application
   - **macOS/Windows**: Fully quit and restart Claude Desktop

4. **Verify the server is running:**
   - Look for the **🔨 tool icon** in the bottom-right corner of Claude Desktop
   - Click it to see available MCP servers
   - You should see **"VengeanceUI MCP Server"** listed

### For Cursor IDE

1. **Create or edit** `.cursor/mcp-servers.json` in your project:

   ```json
   {
     "mcpServers": {
       "vengeanceui": {
         "command": "node",
         "args": ["/absolute/path/to/mcp VengeanceUI/dist/server.js"]
       }
     }
   }
   ```

2. **Restart Cursor IDE**

### Optional: GitHub Token for Higher Rate Limits

Adding a GitHub token increases API rate limits from **60 to 5000 requests/hour**.

1. **Create a GitHub Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scope: `public_repo` (read access to public repositories)
   - Copy the generated token (starts with `ghp_`)

2. **Update your configuration:**

   ```json
   {
     "mcpServers": {
       "vengeanceui": {
         "command": "node",
         "args": ["/absolute/path/to/mcp VengeanceUI/dist/server.js"],
         "env": {
           "GITHUB_TOKEN": "ghp_your_token_here"
         }
       }
     }
   }
   ```

3. **Restart your MCP client**

## 🛠️ Available Tools

The server provides **7 powerful tools** for working with VengeanceUI components:

### 1. `list_components`
List all available VengeanceUI components with their categories and descriptions.

**Parameters:**
- `category` (optional): Filter by category (e.g., "Buttons", "Cards", "Forms")
- `limit` (optional): Maximum number of components to return

**Example prompts:**
- *"List all VengeanceUI components"*
- *"Show me the first 20 components"*
- *"List all components in the Buttons category"*

---

### 2. `search_components`
Search for components using fuzzy matching across names, categories, tags, and descriptions.

**Parameters:**
- `query` (required): Search term
- `limit` (optional): Maximum results to return (default: 10)

**Example prompts:**
- *"Search for button components"*
- *"Find animated card components"*
- *"Search for gradient effects"*

---

### 3. `get_component_code`
Retrieve the complete source code for a specific component with metadata.

**Parameters:**
- `component_name` (required): Exact or partial component name
- `include_metadata` (optional): Include metadata like tags, dependencies (default: true)

**Example prompts:**
- *"Get the code for AnimatedButton"*
- *"Show me the source code for GradientCard"*
- *"Get button.tsx code"*

---

### 4. `get_components_by_category`
Get all components in a specific category.

**Parameters:**
- `category` (required): Component category name

**Example prompts:**
- *"Show all components in the Forms category"*
- *"What's in the Navigation category?"*

---

### 5. `get_component_info`
Get detailed metadata about a component including dependencies, file size, and tags.

**Parameters:**
- `component_name` (required): Component name

**Example prompts:**
- *"Get info for AnimatedButton"*
- *"What are the dependencies for GradientCard?"*

---

### 6. `list_categories`
List all component categories with component counts.

**Example prompts:**
- *"List all categories"*
- *"What categories are available in VengeanceUI?"*

---

### 7. `refresh_cache`
Force refresh the component cache from the GitHub repository.

**Example prompts:**
- *"Refresh the VengeanceUI component cache"*
- *"Update the component list"*

## 💡 Usage Examples

Once configured in Claude Desktop, try these natural language prompts:

### Discovery
```
"What VengeanceUI components are available?"
"List all categories in VengeanceUI"
"How many components are there in total?"
```

### Search
```
"Find all button components"
"Search for gradient or animated components"
"Show me navigation components"
```

### Get Code
```
"Get the code for button.tsx"
"Show me the AnimatedButton component"
"I need the source code for GradientCard"
```

### Browse by Category
```
"Show all components in the Buttons category"
"What forms components are available?"
"List all navigation components"
```

### Component Details
```
"Get detailed info for AnimatedButton"
"What dependencies does the GradientCard component have?"
"Show me the metadata for button.tsx"
```

## 🔧 Development

### Development Mode

Run the server in watch mode:

```bash
npm run dev
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Watch Mode

Automatically rebuild on file changes:

```bash
npm run watch
```

## 📖 How It Works

1. **Component Discovery**: The server connects to the VengeanceUI GitHub repository and scans the following directories:
   - `registry/new-york/` - Main component registry
   - `src/components/` - Source components

2. **Intelligent Parsing**: 
   - Extracts component names from filenames
   - Parses code to detect categories, tags, and dependencies
   - Analyzes JSDoc comments for descriptions
   - Identifies animation, styling, and interaction patterns

3. **Smart Caching**: 
   - Components are cached for 5 minutes
   - Reduces GitHub API calls
   - Automatic refresh on cache expiration

4. **MCP Integration**: 
   - Implements the Model Context Protocol
   - Exposes 7 tools via stdio transport
   - Provides structured responses with metadata

## 🐛 Troubleshooting

### Server doesn't appear in Claude Desktop

1. **Check configuration file syntax:**
   ```bash
   cat ~/.config/Claude/claude_desktop_config.json | jq .
   ```
   If `jq` shows an error, your JSON is malformed.

2. **Verify the server file exists:**
   ```bash
   ls -lh "/absolute/path/to/mcp VengeanceUI/dist/server.js"
   ```

3. **Check Claude Desktop logs:**
   ```bash
   # Find log directory
   find ~ -name "*Claude*" -type d 2>/dev/null | grep -i log
   
   # View logs
   tail -f ~/.config/Claude/logs/mcp*.log
   ```

4. **Test the server manually:**
   ```bash
   cd "mcp VengeanceUI"
   node dist/server.js
   ```

### No components are loading

1. **Check GitHub API rate limits:**
   - Without token: Limited to 60 requests/hour
   - Solution: Add a GitHub token (see Configuration section)

2. **Force refresh the cache:**
   - Use the prompt: *"Refresh the VengeanceUI component cache"*

### Components are outdated

The cache refreshes every 5 minutes. To force an immediate refresh, use the `refresh_cache` tool via this prompt:

```
"Refresh the VengeanceUI component cache"
```

## 🙏 Acknowledgments

- **[VengeanceUI](https://github.com/Ashutoshx7/VengeanceUI)** - For the incredible component library featuring beautiful, animated components
- **[Model Context Protocol](https://modelcontextprotocol.io)** - For the server framework enabling AI assistant integration
- **[shadcn-ui-mcp-server](https://github.com/sherifbutt/shadcn-ui-mcp-server)** - Inspiration for this project

## 🔗 Links

- **VengeanceUI Repository**: https://github.com/Ashutoshx7/VengeanceUI
- **MCP Documentation**: https://modelcontextprotocol.io
- **Issues & Support**: Open an issue in this repository

