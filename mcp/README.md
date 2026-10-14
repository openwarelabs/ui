# Openware UI MCP server

An [MCP](https://modelcontextprotocol.io) server for [Openware UI](https://github.com/openwarelabs/ui) (`@openwarelabs/ui`). It gives AI coding tools the library's setup, every component's examples and props, every block's code, and the design tokens, so they build with the real components instead of guessing at look-alikes.

Everything is bundled in: it runs offline, needs nothing but Node 18 or later, and answers for the release it matches.

## Add it

**Claude Code**

```sh
claude mcp add openware-ui -- npx -y @openwarelabs/ui-mcp
```

**Codex**

```sh
codex mcp add openware-ui -- npx -y @openwarelabs/ui-mcp
```

or in `~/.codex/config.toml`:

```toml
[mcp_servers.openware-ui]
command = "npx"
args = ["-y", "@openwarelabs/ui-mcp"]
```

**Cursor, Claude Desktop, Windsurf and most others**: in `.cursor/mcp.json` (or the client's MCP settings):

```json
{
  "mcpServers": {
    "openware-ui": {
      "command": "npx",
      "args": ["-y", "@openwarelabs/ui-mcp"]
    }
  }
}
```

**VS Code**: in `.vscode/mcp.json`:

```json
{
  "servers": {
    "openware-ui": { "type": "stdio", "command": "npx", "args": ["-y", "@openwarelabs/ui-mcp"] }
  }
}
```

## What it offers

| Tool | What it returns |
| --- | --- |
| `get_setup` | Install, the stylesheets to import once, the theme attributes, and the rules for writing code with Openware UI. |
| `list_components` | Every component with a line on what it's for, by category. |
| `get_component` | One component's reference: import, every example's code, keyboard, notes and props. |
| `list_blocks` | The ready-made page sections: headers, heroes, pricing, app shells, settings, sign-in, dashboards, chat and more. |
| `get_block` | A block's `.tsx` and `.css`, ready to copy. |
| `search` | Components and blocks that match what you describe ("date range", "file upload"). |
| `get_tokens` | The `--ow-…` CSS variables: colours in both themes, type, spacing, corners, shadows, weights, motion. |

The setup and the tokens are also resources, at `openware://setup` and `openware://tokens`.

Try asking: "Build a settings page with Openware UI", or "Add the Openware pricing block with three plans".

## Build

From the repository root: `npm run mcp:build` writes `mcp/dist/server.mjs` from the docs' examples, the components' props and the blocks. `npm run mcp:inspect` opens it in the MCP Inspector.
