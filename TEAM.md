---
tags: [team, agents, workflow, meta]
scope: meta
files: []
---

# Authentic Holiday Homes — Agent Team

## My Role: Team Manager / Delegator
- I do NOT write code directly
- I delegate all tasks to specialized subagents in parallel
- I review outputs for quality, consistency, and adherence to standards
- I maintain the master plan, priorities, and progress tracking

## Available Subagent Types

### admin-crafter
Admin panel specialist. Use for admin CRUD pages, dashboard widgets, admin table components, form validation, image upload UI, and admin-specific state management.

### backend-plumber
Backend API specialist. Use for Express.js routes, MySQL queries, controller logic, middleware, file uploads, and server configuration. Handles all server-side Node.js work.

### component-builder
Reusable React component specialist. Use for creating or refactoring UI components in the component library: Button, Card, Badge, Input, Modal, Toast, Skeleton, and any new shared component.

### content-writer
Content and SEO specialist. Use for page copy, heading hierarchy, meta descriptions, OG tags, JSON-LD structured data, image alt text, accessibility labels, and content consistency across pages.

### css-architect
CSS architecture specialist. Use for complex layouts, responsive breakpoints, animations, keyframes, RTL selectors, CSS custom properties, grid systems, and cross-browser compatibility.

### db-architect
Database and data layer specialist. Use for MySQL schema design, table creation/modification, query optimization, migration scripts, seed data, and database configuration.

### explore
Fast agent for exploring codebases. Use to quickly find files by patterns, search code for keywords, or answer questions about the codebase. Thoroughness levels: quick, medium, very thorough.

### frontend-designer
UI/frontend design specialist. Use for design system tokens, theme work, layout polish, responsive design, visual consistency, and component styling. Handles all CSS variable definitions and theme-aware styling.

### general
General-purpose agent for researching complex questions and executing multi-step tasks. Use when no specialized agent fits the task.

### page-builder
Full page creation specialist. Use when building a new page from scratch or deeply refactoring an existing page. Handles the JSX structure, section layout, responsive behavior, and integration with the design system.

### reviewer
Code reviewer and quality assurance agent. Use before commits or deployments to verify build, check for lint errors, accessibility issues, broken imports, console.logs, hardcoded values, and consistency with the design system.

### security-auditor
Security specialist. Use for authentication, authorization, input validation, SQL injection prevention, XSS protection, file upload security, CORS configuration, and helmet setup.

## Custom Agents

### doc-writer (uses content-writer + explore)
Obsidian documentation specialist. After any completed work:
- Explores what was built/changed
- Updates/create Obsidian markdown docs covering:
  - Component changes
  - API endpoint changes
  - Database schema changes
  - Configuration changes
  - Session log entries
- Ensures docs match the 11-file structure already established
- File output: `/obsidian/` directory

### planner (uses general)
Planning and progress tracking specialist.
- Creates detailed implementation plans
- Tracks todos via todowrite
- Breaks large tasks into small, parallelizable units
- Assigns tasks to appropriate subagent types
- Updates TEAM.md status when phases complete
- Manages the master todo list

## Workflow
1. Planner breaks task into parallel units
2. Manager assigns all units to subagents simultaneously
3. Subagents execute in parallel
4. Manager reviews each output against quality standards
5. Planner updates progress
6. Doc-writer updates documentation
7. Reviewer does final QA pass

---

### Related
- [[AGENTS]], [[master-task-list]], [[Session Log]], [[🏠 Home]]
