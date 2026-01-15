# LinkedIn Job Search MCP

A Model Context Protocol (MCP) server for LinkedIn job search. Search jobs, filter by location, experience level, remote work, and more. Works with any MCP-compatible client including Claude Desktop, Cursor, VS Code, and other AI assistants.

[![npm version](https://badge.fury.io/js/linkedin-mcp-search.svg)](https://www.npmjs.com/package/linkedin-mcp-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Option 1: Using npx (Recommended - No Installation)

Add to your MCP client configuration (Claude Desktop, Cursor, VS Code, etc.):

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "linkedin-mcp-search"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json` in your project or global config):

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "linkedin-mcp-search"]
    }
  }
}
```

### Option 2: Global Installation

```bash
npm install -g linkedin-mcp-search
```

Then configure:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "linkedin-mcp"
    }
  }
}
```

### Option 3: Local Installation

```bash
git clone https://github.com/yourusername/linkedin-mcp-search.git
cd linkedin-mcp-search
npm install
npm run build
```

Then configure with full path:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "node",
      "args": ["C:/path/to/linkedin-mcp-search/dist/index.js"]
    }
  }
}
```

## Config File Locations

| Platform | Config File Location |
|----------|---------------------|
| **Claude Desktop (macOS)** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Claude Desktop (Windows)** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Cursor (Project)** | `.cursor/mcp.json` in your project root |
| **Cursor (Global)** | `~/.cursor/mcp.json` |
| **VS Code** | Via MCP extension settings |
| **Other MCP Clients** | Check your client's documentation for MCP server configuration |

## MCP Compatibility

MCP (Model Context Protocol) is an open standard that works with various AI assistants and tools:

- **Claude Desktop** - Free desktop app from Anthropic
- **Cursor** - AI-powered code editor
- **VS Code** - Via MCP extensions
- **Custom MCP Clients** - Any tool that implements the MCP protocol
- **Programmatic Use** - Can be used directly via stdio transport

You don't need a paid subscription to use MCP servers. The protocol is open and free to use with any compatible client.

## Features

### Job Search (No Authentication Required)
- **Keyword search** - "Software Engineer", "Data Scientist Python", etc.
- **Location filtering** - City, state, country, or "Remote"
- **Job type** - Full-time, Part-time, Contract, Internship
- **Experience level** - Entry-level, Mid-Senior, Director, Executive
- **Workplace type** - Remote, Hybrid, On-site
- **Date posted** - Last 24 hours, week, or month
- **Easy Apply filter** - Only jobs with LinkedIn Easy Apply
- **Sorting** - Most relevant or most recent
- **Pagination** - Browse through all results

### Optional: OAuth Authentication
For future features like saved jobs (requires LinkedIn Partner API):

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "linkedin-mcp-search"],
      "env": {
        "LINKEDIN_CLIENT_ID": "your_client_id",
        "LINKEDIN_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

## Available Tools

### Job Search Tools

| Tool | Description |
|------|-------------|
| `search_jobs` | Comprehensive job search with all filters |
| `get_job_details` | Get full job description and details |
| `search_remote_jobs` | Quick search for remote positions |
| `search_entry_level_jobs` | Search entry-level & internship jobs |

### Company Tools

| Tool | Description |
|------|-------------|
| `get_company` | Get company information |
| `search_companies` | Search for companies |
| `get_company_jobs` | Get all jobs from a specific company |

### Helper Tools

| Tool | Description |
|------|-------------|
| `get_popular_locations` | List locations with LinkedIn geo IDs |
| `get_industries` | List industry categories |
| `get_job_functions` | List job function categories |
| `build_job_search_url` | Generate shareable LinkedIn search URL |

### Authentication Tools

| Tool | Description |
|------|-------------|
| `linkedin_login` | Start OAuth flow (opens browser) |
| `linkedin_logout` | Clear stored credentials |
| `linkedin_status` | Check authentication status |

## Example Prompts

Once configured, you can use it with any MCP-compatible client:

```
"Search for remote software engineer jobs"

"Find entry-level data science positions in New York"

"Show me Python developer jobs posted in the last 24 hours"

"Get details for this LinkedIn job"

"Search for product manager jobs at Google"

"Find senior DevOps positions with remote work options"
```

## Search Parameters

### search_jobs

| Parameter | Type | Description |
|-----------|------|-------------|
| `keywords` | string | Search terms (e.g., "React Developer") |
| `location` | string | City, state, or country |
| `geoId` | string | LinkedIn geographic ID (more precise) |
| `distance` | number | Radius in miles (5, 10, 25, 50, 100) |
| `jobType` | array | `full-time`, `part-time`, `contract`, `temporary`, `internship`, `volunteer` |
| `experienceLevel` | array | `internship`, `entry-level`, `associate`, `mid-senior`, `director`, `executive` |
| `workplaceType` | array | `remote`, `hybrid`, `on-site` |
| `datePosted` | string | `past-24-hours`, `past-week`, `past-month`, `any-time` |
| `easyApply` | boolean | Only show Easy Apply jobs |
| `companyIds` | array | Filter by company IDs |
| `sortBy` | string | `most-relevant`, `most-recent` |
| `start` | number | Pagination offset |
| `limit` | number | Max results (default: 25, max: 50) |

## Privacy & Rate Limiting

- **No data stored** - All searches are stateless
- **Public API only** - Uses LinkedIn's guest job search (no scraping of private data)
- **Rate limiting** - LinkedIn may temporarily block if too many requests are made. Add delays between searches if needed.

## Using Without Claude/Cursor

### Programmatic Use

You can use the MCP server directly in your own applications:

```javascript
import { jobService } from 'linkedin-mcp-search';

const results = await jobService.searchJobs({
  keywords: 'Software Engineer',
  location: 'San Francisco',
  limit: 10
});
```

### Other MCP Clients

MCP is an open protocol. Any client that supports MCP can use this server:

- **VS Code** - Install an MCP extension and configure the server
- **Custom Clients** - Implement MCP client protocol to connect
- **CLI Tools** - Use via stdio transport

The server communicates via stdio using JSON-RPC, following the MCP specification.

## Development

```bash
# Clone the repository
git clone https://github.com/saisudhir14/linkedin-mcp-search.git
cd linkedin-mcp-search

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start

# Development with auto-rebuild
npm run watch
```

## Publishing to npm

```bash
# Login to npm
npm login

# Update version in package.json
npm version patch  # or minor/major

# Publish
npm publish
```

## Troubleshooting

### "MCP server not found"
- Ensure Node.js 18+ is installed: `node --version`
- Check the config file path is correct
- Restart Claude Desktop / Cursor after config changes

### "No jobs found"
- Try broader search terms
- Remove some filters
- Check if LinkedIn is accessible in your region

### "Rate limited"
- Wait a few minutes between searches
- Reduce the number of requests

## License

MIT - See [LICENSE](LICENSE) file

## Disclaimer

This project is not affiliated with LinkedIn. It uses LinkedIn's public guest API for job searching. Use responsibly and in accordance with LinkedIn's terms of service.

---

**Made for job seekers everywhere**