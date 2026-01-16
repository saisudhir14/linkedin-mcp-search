# LinkedIn Job Search MCP

A Model Context Protocol (MCP) server for LinkedIn job search. Search jobs, filter by location, experience level, remote work, and more. Works with Claude Desktop, Cursor, and other MCP clients.

[![npm version](https://badge.fury.io/js/linkedin-mcp-search.svg)](https://www.npmjs.com/package/linkedin-mcp-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Using npx (Recommended)

Add to your MCP client config:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

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

**Cursor** (`.cursor/mcp.json`):

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

Then restart your client.

### Global Installation

```bash
npm install -g linkedin-mcp-search
```

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "linkedin-mcp"
    }
  }
}
```

## Features

- **Keyword search** - "Software Engineer", "Data Scientist Python", etc.
- **Location filtering** - City, state, country, or "Remote"
- **Job type** - Full-time, Part-time, Contract, Internship
- **Experience level** - Entry-level, Mid-Senior, Director, Executive
- **Workplace type** - Remote, Hybrid, On-site
- **Date posted** - Last 24 hours, week, or month
- **Easy Apply filter** - Only LinkedIn Easy Apply jobs
- **Real-time results** - Find jobs posted minutes ago

## Available Tools

| Tool | Description |
|------|-------------|
| `search_jobs` | Full job search with all filters |
| `search_remote_jobs` | Quick remote job search |
| `search_entry_level_jobs` | Entry-level & internship search |
| `get_job_details` | Get full job description |
| `get_company` | Get company information |
| `search_companies` | Search for companies |
| `get_company_jobs` | Jobs at a specific company |
| `get_popular_locations` | Locations with LinkedIn geo IDs |
| `get_industries` | Industry categories |
| `get_job_functions` | Job function categories |
| `build_job_search_url` | Generate LinkedIn search URL |

## Example Prompts

```
"Search for remote Golang jobs posted today"

"Find entry-level data science positions in New York"

"Show me Python developer jobs posted in the last 24 hours"

"Get details for LinkedIn job 4328991043"

"Search for product manager jobs at Google"

"Find senior DevOps positions with Easy Apply"
```

## Search Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `keywords` | string | Search terms |
| `location` | string | City, state, or country |
| `geoId` | string | LinkedIn geographic ID |
| `distance` | number | Radius in miles (5, 10, 25, 50, 100) |
| `jobType` | array | `full-time`, `part-time`, `contract`, `temporary`, `internship`, `volunteer` |
| `experienceLevel` | array | `internship`, `entry-level`, `associate`, `mid-senior`, `director`, `executive` |
| `workplaceType` | array | `remote`, `hybrid`, `on-site` |
| `datePosted` | string | `past-24-hours`, `past-week`, `past-month`, `any-time` |
| `easyApply` | boolean | Only Easy Apply jobs |
| `sortBy` | string | `most-relevant`, `most-recent` |
| `limit` | number | Max results (default: 25, max: 50) |

## Config File Locations

| Platform | Location |
|----------|----------|
| Claude Desktop (Mac) | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` |
| Cursor | `.cursor/mcp.json` |

## Troubleshooting

**"MCP server not found"**
- Ensure Node.js 18+ is installed
- Restart client after config changes

**"No jobs found"**
- Try broader search terms
- Remove some filters

**"Rate limited"**
- Wait a few minutes between searches

## License

MIT

## Disclaimer

Not affiliated with LinkedIn. Uses LinkedIn's public job search. Use responsibly.
