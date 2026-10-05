# LinkedIn Job Search MCP

A Model Context Protocol (MCP) server for LinkedIn jobs, companies, and posts. Search jobs with LinkedIn's filters, read full job descriptions, look up companies, and find hiring posts from recruiters and managers. Works with Claude Desktop, Cursor, and other MCP clients.

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

- **Job search** with LinkedIn's filters: keywords, location/geoId/radius, company, job type, experience level, workplace type, date posted (down to the past hour), industry, job function, minimum salary, Easy Apply, and fewer than 10 applicants
- **Pagination** up to 100 results per call, with `nextStart` to continue
- **Job details** including full description, seniority, employment type, and industries
- **Company lookup** by name or vanity ID, and a company's open jobs
- **Post search** for public LinkedIn posts (e.g. "we're hiring" announcements), plus full post text, publish date, and engagement
- **No login required**

## Available Tools

| Tool | Description |
|------|-------------|
| `search_jobs` | Full job search with all filters |
| `search_remote_jobs` | Quick remote job search |
| `search_entry_level_jobs` | Entry-level & internship search |
| `get_job_details` | Full job description and criteria |
| `get_company` | Company profile |
| `search_companies` | Find companies and their LinkedIn IDs |
| `get_company_jobs` | Open jobs at a company (name, vanity ID, or numeric ID) |
| `search_posts` | Search public LinkedIn posts, e.g. hiring announcements |
| `get_post_details` | Full text, author, date, and engagement of a post |
| `build_post_search_url` | LinkedIn post search link for a signed-in browser |
| `get_popular_locations` | Locations with LinkedIn geo IDs |
| `get_industries` | Industry IDs for the `industryIds` filter |
| `get_job_functions` | Function codes for the `jobFunctions` filter |
| `build_job_search_url` | LinkedIn job search link with filters |

## Example Prompts

```
"Search for remote Golang jobs posted in the past hour"

"Find Forward Deployed Engineer jobs at Kyndryl"

"Show mid-senior engineering jobs in Seattle paying $160k+ with fewer than 10 applicants"

"Get details for LinkedIn job 4328991043"

"Find LinkedIn posts from people hiring Forward Deployed Engineers this week"

"Read this LinkedIn post: https://www.linkedin.com/posts/..."
```

## Search Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `keywords` | string | Search terms |
| `location` | string | City, state, or country |
| `geoId` | string | LinkedIn geographic ID |
| `distance` | number | Radius in miles (5, 10, 25, 50, 100) |
| `company` | string | Company name; only matching companies are returned |
| `companyIds` | array | Numeric LinkedIn company IDs |
| `jobType` | array | `full-time`, `part-time`, `contract`, `temporary`, `internship`, `volunteer` |
| `experienceLevel` | array | `internship`, `entry-level`, `associate`, `mid-senior`, `director`, `executive` |
| `workplaceType` | array | `remote`, `hybrid`, `on-site` |
| `datePosted` | string | `past-hour`, `past-24-hours`, `past-week`, `past-month`, `any-time` |
| `industryIds` | array | Industry IDs from `get_industries` |
| `jobFunctions` | array | Function codes from `get_job_functions` (e.g. `eng`, `it`) |
| `minSalary` | string | `40k` to `200k` in 20k steps (US jobs) |
| `easyApply` | boolean | Only Easy Apply jobs |
| `fewApplicants` | boolean | Only jobs with fewer than 10 applicants |
| `sortBy` | string | `most-relevant`, `most-recent` |
| `start` | number | Offset; pass `nextStart` from the previous result |
| `limit` | number | Max results (default: 25, max: 100) |

### How post search works

LinkedIn only allows post search when signed in, so `search_posts` finds public posts through DuckDuckGo (`site:linkedin.com/posts`). Results depend on what the search engine has indexed, so very recent posts may be missing. Each result includes `linkedInSearchUrl`, which opens LinkedIn's own post search in a browser where you're signed in.

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

Not affiliated with LinkedIn. Uses LinkedIn's public (logged-out) pages and DuckDuckGo search. Use responsibly.
