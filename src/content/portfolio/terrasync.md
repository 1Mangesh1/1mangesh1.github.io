---
title: "TerraSync - Infrastructure as Code Visualizer"
description: "Visualize and diff your Terraform/OpenTofu plans with an interactive graph showing resource dependencies and changes"
image: "/images/portfolio/terrasync.jpg"
tech: ["Rust", "WebAssembly", "Svelte", "Cytoscape.js", "Terraform"]
github: "https://github.com/1Mangesh1/terrasync"
demo: "https://terrasync.mangeshbide.tech"
featured: false
date: 2025-12-05T00:00:00Z
---

## Motivation

Running `terraform plan` on a large infrastructure codebase produces walls of text that are difficult to parse. You get a flat list of resources being created, modified, or destroyed — but no sense of how those changes relate to each other. Will destroying this security group cascade to those EC2 instances? Does modifying this IAM policy affect the Lambda function's permissions?

TerraSync turns Terraform and OpenTofu plan output into an interactive dependency graph where you can visually trace the impact of every change. Green nodes for creates, yellow for updates, red for destroys — with edges showing exactly how resources depend on each other.

## Architecture

TerraSync has two main components: a Rust-based plan parser compiled to WebAssembly, and a Svelte frontend with Cytoscape.js for graph rendering.

### Rust + WASM Parser

The plan parser is written in Rust for performance and correctness. Terraform plan JSON output can be massive — enterprise configurations regularly produce 10MB+ plan files with thousands of resources. Parsing and graph construction need to be fast to feel interactive.

The parser handles:
- **JSON Plan Parsing**: Deserializes Terraform's JSON plan output (`terraform show -json tfplan`) into typed Rust structs using serde
- **Dependency Graph Construction**: Builds a directed acyclic graph (DAG) from resource dependencies, including implicit dependencies inferred from attribute references
- **Change Classification**: Categorizes each resource as create, update, destroy, replace (destroy + create), or no-op based on the plan's action set
- **Impact Analysis**: Traverses the dependency graph to compute the transitive impact of each change — if resource A is being destroyed, which downstream resources are affected?
- **Diff Generation**: For updated resources, produces a structured diff of changed attributes with before/after values

The Rust code compiles to WebAssembly via `wasm-pack`, producing a ~400KB WASM binary that runs entirely in the browser. No plan data ever leaves the user's machine — a critical feature for organizations with sensitive infrastructure configurations.

### Svelte Frontend

The UI is built with Svelte for its minimal overhead and reactive programming model. The main view is a Cytoscape.js-powered graph canvas with several interaction modes:

**Graph View** — The default view renders all resources as nodes with directed edges showing dependencies. Nodes are color-coded by change type and sized by the number of dependent resources. The layout uses Cytoscape's `dagre` algorithm for a clean hierarchical arrangement.

**Impact View** — Click any node to highlight its dependency chain. Upstream dependencies (what this resource depends on) are highlighted in blue, and downstream dependents (what depends on this resource) are highlighted in orange. This instantly answers "what breaks if I change this?"

**Diff View** — Clicking a modified resource opens a side panel with an inline diff of changed attributes. Sensitive values are automatically redacted based on Terraform's sensitivity markers.

**Filter Controls** — Toggle visibility by change type (show only destroys), resource type (show only `aws_iam_*`), or module path. A search bar provides fuzzy matching across resource names and types.

## Diff Visualization

The diff view was one of the trickiest parts to get right. Terraform attribute changes can be deeply nested — a change to a single security group rule affects a nested list inside a map inside the resource. TerraSync recursively diffs nested structures and renders them as a tree diff:

```
aws_security_group.main
  └─ ingress
      └─ [2]
          ├─ from_port: 8080 → 8443
          ├─ to_port:   8080 → 8443
          └─ description: "HTTP" → "HTTPS"
```

For list attributes, the differ uses LCS (Longest Common Subsequence) to minimize visual noise — reordering a list doesn't show every element as changed.

## Key Features

- **Client-Side Only**: All parsing and visualization happens in the browser via WASM. No data ever sent to a server
- **Multi-Provider Support**: Understands AWS, GCP, Azure, and Kubernetes provider resource types for enhanced visualization
- **Module Grouping**: Resources are visually grouped by their Terraform module, with collapsible module boundaries
- **Plan Comparison**: Upload two plan files to see what changed between them — useful for reviewing the impact of a code change
- **Export**: Export the graph as SVG or PNG for documentation, or as a shareable URL with the plan embedded (base64-encoded in the URL hash)
- **CI Integration**: A CLI mode (`terrasync --ci`) outputs a Markdown summary with an embedded graph image, suitable for posting as a PR comment

## Performance

Parsing and rendering a plan with 2,000 resources completes in under 800ms on a modern laptop. The WASM parser handles the JSON deserialization and graph construction in ~200ms, and Cytoscape.js renders the graph in ~500ms with the `dagre` layout.

For extremely large plans (5,000+ resources), TerraSync supports progressive rendering — the graph populates incrementally with the most-changed resources appearing first, while the rest fill in over the next few frames.

## Technical Decisions

**Rust + WASM over JavaScript** — The initial prototype parsed plans in JavaScript, but performance degraded significantly past 500 resources. Rust's zero-cost abstractions and efficient memory layout made the WASM version 15x faster for large plans, while also catching several parsing edge cases at compile time that would have been runtime errors in JS.

**Svelte over React** — For a visualization-heavy app, Svelte's compiled reactivity model produces less JavaScript overhead than React's virtual DOM diffing. The entire Svelte bundle is 45KB gzipped vs an estimated 120KB+ with React.

**Cytoscape.js over D3** — Cytoscape.js is purpose-built for graph visualization with features like compound nodes (for module grouping), built-in layout algorithms, and efficient canvas rendering. D3 would have required building these graph-specific features from scratch.
