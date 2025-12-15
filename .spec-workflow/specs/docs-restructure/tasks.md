# Tasks Document

## Phase 1: Foundation - Create Structure and Standards

- [x] 1.1. Create metadata schema and controlled vocabulary
  - File: docs/metadata-schema.md
  - Define YAML frontmatter schema for all documentation types
  - Define controlled vocabulary for categories and tags
  - Create examples for each documentation type (getting-started, guides, reference, architecture, features)
  - Purpose: Establish metadata standard for web documentation generation
  - _Leverage: None (new standard document)_
  - _Requirements: 3 (Web Documentation Metadata)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with expertise in information architecture and metadata schemas | Task: Create comprehensive metadata schema document (docs/metadata-schema.md) following requirement 3, defining YAML frontmatter structure, controlled vocabulary for categories/tags, and examples for each documentation type | Restrictions: Do not use proprietary formats, ensure compatibility with VitePress/Docusaurus/MkDocs, maintain simplicity for contributors | \_Leverage: None (new standard)_ | _Requirements: 3_ | Success: Schema is well-documented with clear examples, controlled vocabulary covers all use cases, compatible with major static site generators | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record what was created with detailed artifacts, then mark as complete ([x])\_

- [x] 1.2. Create new directory structure (empty)
  - Files: Create all directories from design.md structure
  - Create empty directories: getting-started/, guides/, reference/, architecture/, features/, analysis/, reports/, archive/
  - Create subdirectories according to design document
  - Purpose: Establish target directory structure for migration
  - _Leverage: design.md (directory tree section)_
  - _Requirements: 1 (Standardized Directory Structure)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with expertise in file system organization | Task: Create complete directory structure following requirement 1 and design.md specifications, establishing all target directories for migration | Restrictions: Do not create placeholder files yet, only directories; ensure proper permissions; follow exact naming from design | \_Leverage: design.md directory tree_ | _Requirements: 1_ | Success: All directories created matching design.md structure, proper permissions set, no placeholder files | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record directory structure created, then mark as complete ([x])\_

- [x] 1.3. Create section index templates (README.md)
  - Files: docs/README.md, docs/getting-started/README.md, docs/guides/README.md, docs/reference/README.md, docs/architecture/README.md, docs/features/README.md, docs/analysis/README.md, docs/reports/README.md, docs/archive/README.md
  - Create master index (docs/README.md) with navigation to all sections
  - Create section indexes with brief descriptions and document lists (placeholders initially)
  - Add frontmatter to all index files
  - Purpose: Provide navigation structure and context for each section
  - _Leverage: metadata-schema.md, design.md (Components and Interfaces section)_
  - _Requirements: 6 (Documentation Index and Navigation)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with expertise in documentation navigation and information architecture | Task: Create comprehensive section index files (README.md) following requirement 6, using metadata schema from docs/metadata-schema.md and navigation structure from design.md | Restrictions: Use placeholder lists initially (will be populated after migration), ensure consistent frontmatter format, maintain clear navigation hierarchy | \_Leverage: metadata-schema.md, design.md_ | _Requirements: 6_ | Success: All section indexes created with proper frontmatter, navigation is logical and complete, master index provides clear entry points | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record all index files created with artifacts, then mark as complete ([x])\_

- [x] 1.4. Create feature documentation template files
  - Files: docs/features/templates/README.md, docs/features/templates/api-reference.md, docs/features/templates/architecture.md, docs/features/templates/developer-guide.md, docs/features/templates/user-guide.md, docs/features/templates/troubleshooting.md, docs/features/templates/deployment-guide.md
  - Create standardized templates for feature documentation
  - Include frontmatter examples and section structure
  - Add usage instructions in templates/README.md
  - Purpose: Provide consistent structure for all feature documentation
  - _Leverage: metadata-schema.md, existing templates from docs/features/api-keys/, docs/features/authentication/_
  - _Requirements: 1 (Standardized Directory Structure), 3 (Web Documentation Metadata)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with expertise in documentation templates and standards | Task: Create comprehensive feature documentation templates following requirements 1 and 3, leveraging existing patterns from docs/features/api-keys/ and docs/features/authentication/, using metadata schema from docs/metadata-schema.md | Restrictions: Ensure templates are easy to fill out, include clear instructions, maintain consistency across all template types | \_Leverage: metadata-schema.md, docs/features/api-keys/, docs/features/authentication/_ | _Requirements: 1, 3_ | Success: All template files created with proper structure, examples are clear and helpful, templates are easy for contributors to use | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record template files created with artifacts, then mark as complete ([x])\_

## Phase 2: Migration Planning and Scripts

- [x] 2.1. Create file mapping configuration
  - File: .spec-workflow/specs/docs-restructure/file-mapping.json
  - Map all current docs/ files to new locations
  - Include frontmatter metadata for each file
  - Identify files to archive vs. migrate
  - Purpose: Define complete migration plan with source and destination paths
  - _Leverage: design.md (directory structure), metadata-schema.md, current docs/ tree output_
  - _Requirements: 1 (Standardized Directory Structure), 2 (Consistent Naming Conventions), 5 (Deprecation and Archive Strategy)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with expertise in file migration and data mapping | Task: Create comprehensive file mapping configuration following requirements 1, 2, and 5, mapping all 476 markdown files from current locations to new structure, using design.md directory tree and metadata-schema.md for frontmatter | Restrictions: Must handle all existing files (no orphans), normalize naming to lowercase-with-dashes.md, identify archives vs. active docs | \_Leverage: design.md, metadata-schema.md, tree output_ | _Requirements: 1, 2, 5_ | Success: All files mapped to new locations, naming normalized, archives identified, frontmatter metadata defined for each file | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record mapping created with artifacts, then mark as complete ([x])\_

- [x] 2.2. Create migration script with dry-run mode
  - File: scripts/migrate-docs.sh
  - Implement bash script to read file-mapping.json and execute git mv commands
  - Add dry-run mode to preview changes without executing
  - Add validation to ensure target directories exist
  - Add logging for each file move
  - Purpose: Automate file migration while preserving git history
  - _Leverage: file-mapping.json, existing bash scripting patterns_
  - _Requirements: 1 (Standardized Directory Structure), 2 (Consistent Naming Conventions)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with expertise in bash scripting and git operations | Task: Create migration script (scripts/migrate-docs.sh) following requirements 1 and 2, reading file-mapping.json and executing git mv commands with dry-run mode for safe preview | Restrictions: Must use git mv to preserve history, must validate all paths before execution, must provide clear logging and error handling | \_Leverage: file-mapping.json, bash scripting patterns_ | _Requirements: 1, 2_ | Success: Script executes dry-run successfully showing all planned moves, actual execution mode works correctly, git history preserved, clear error messages | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record script created with artifacts, then mark as complete ([x])\_

- [x] 2.3. Create frontmatter injection utility
  - File: scripts/inject-frontmatter.sh
  - Implement script to add/update YAML frontmatter in markdown files
  - Read metadata from file-mapping.json
  - Preserve existing content while adding/updating frontmatter
  - Add validation for frontmatter syntax
  - Purpose: Automate frontmatter injection for web documentation
  - _Leverage: file-mapping.json, yq (YAML processor), metadata-schema.md_
  - _Requirements: 3 (Web Documentation Metadata)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with expertise in YAML processing and bash scripting | Task: Create frontmatter injection script (scripts/inject-frontmatter.sh) following requirement 3, using yq to add/update YAML frontmatter from file-mapping.json while preserving content | Restrictions: Must not corrupt existing content, must validate YAML syntax, must handle files with existing frontmatter gracefully | \_Leverage: file-mapping.json, yq, metadata-schema.md_ | _Requirements: 3_ | Success: Script correctly injects frontmatter without corrupting content, existing frontmatter is updated properly, YAML validation works | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record script created with artifacts, then mark as complete ([x])\_

- [x] 2.4. Create link validation script
  - File: scripts/validate-links.sh
  - Implement script to check all markdown internal links
  - Detect broken links and suggest corrections
  - Generate report of link health
  - Purpose: Ensure link integrity after migration
  - _Leverage: find, grep, markdown-link-check (or custom implementation)_
  - _Requirements: Reliability (link integrity)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with expertise in link validation and automated testing | Task: Create link validation script (scripts/validate-links.sh) following reliability requirements, detecting broken internal links and generating health report | Restrictions: Must handle relative links correctly, must detect both absolute and relative paths, should provide actionable suggestions for fixes | \_Leverage: find, grep, markdown tools_ | _Requirements: Reliability NFR_ | Success: Script correctly identifies all broken links, report is clear and actionable, performance is acceptable for 476 files | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record script created with artifacts, then mark as complete ([x])\_

## Phase 3: Execute Migration

- [x] 3.1. Run migration dry-run and validate
  - Execute: bash scripts/migrate-docs.sh --dry-run
  - Review all planned file moves
  - Validate no files are orphaned
  - Check for naming conflicts
  - Purpose: Validate migration plan before execution
  - _Leverage: scripts/migrate-docs.sh, file-mapping.json_
  - _Requirements: 1 (Standardized Directory Structure), 2 (Consistent Naming Conventions)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with expertise in migration testing and validation | Task: Execute migration dry-run following requirements 1 and 2, reviewing all planned moves from scripts/migrate-docs.sh and validating no orphans or conflicts exist | Restrictions: Do not execute actual moves yet, thoroughly review output, document any issues found | \_Leverage: scripts/migrate-docs.sh, file-mapping.json_ | _Requirements: 1, 2_ | Success: Dry-run completes successfully, all files accounted for, no naming conflicts, migration plan validated | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record validation results, then mark as complete ([x])\_

- [x] 3.2. Execute actual file migration
  - Execute: bash scripts/migrate-docs.sh
  - Move all files using git mv commands
  - Verify all moves completed successfully
  - Commit migration with descriptive message
  - Purpose: Execute planned migration preserving git history
  - _Leverage: scripts/migrate-docs.sh, file-mapping.json_
  - _Requirements: 1 (Standardized Directory Structure), 2 (Consistent Naming Conventions), Reliability (git history preservation)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with expertise in git operations and file migrations | Task: Execute actual file migration following requirements 1, 2, and reliability NFR, using scripts/migrate-docs.sh to move all files with git mv and committing with descriptive message | Restrictions: Ensure git history is preserved, verify all moves succeeded, do not lose any files | \_Leverage: scripts/migrate-docs.sh, file-mapping.json_ | _Requirements: 1, 2, Reliability NFR_ | Success: All 476 files migrated successfully, git history preserved, clean commit created, no files lost | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record migration results with file counts, then mark as complete ([x])\_

- [x] 3.3. Inject frontmatter into all migrated files
  - Execute: bash scripts/inject-frontmatter.sh
  - Add YAML frontmatter to all markdown files based on mapping
  - Verify frontmatter syntax is valid
  - Commit frontmatter additions
  - Purpose: Add web documentation metadata to all files
  - _Leverage: scripts/inject-frontmatter.sh, file-mapping.json, metadata-schema.md_
  - _Requirements: 3 (Web Documentation Metadata)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with expertise in YAML and automation | Task: Inject frontmatter into all migrated files following requirement 3, using scripts/inject-frontmatter.sh with metadata from file-mapping.json and validating against metadata-schema.md | Restrictions: Ensure YAML syntax is valid, do not corrupt file content, verify all files processed | \_Leverage: scripts/inject-frontmatter.sh, file-mapping.json, metadata-schema.md_ | _Requirements: 3_ | Success: All files have valid frontmatter, syntax validated, content preserved, commit created | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record frontmatter injection results, then mark as complete ([x])\_

- [x] 3.4. Fix broken links after migration
  - Execute: bash scripts/validate-links.sh
  - Review link validation report
  - Fix all broken internal links
  - Update cross-references to new file paths
  - Purpose: Restore link integrity after file moves
  - _Leverage: scripts/validate-links.sh, file-mapping.json (for path translations)_
  - _Requirements: Reliability (link integrity)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with expertise in documentation maintenance and link management | Task: Fix all broken links following reliability requirements, using scripts/validate-links.sh to identify issues and file-mapping.json to translate old paths to new paths | Restrictions: Ensure all internal links work, external links are checked, cross-references updated correctly | \_Leverage: scripts/validate-links.sh, file-mapping.json_ | _Requirements: Reliability NFR_ | Success: All internal links working, link validation report shows 0 broken links, cross-references updated | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record link fixes with count, then mark as complete ([x])\_

## Phase 4: Cleanup and Consolidation

- [x] 4.1. Consolidate duplicate documentation
  - Review analysis/, reports/, sessions/ for duplicates
  - Merge duplicate content into single authoritative documents
  - Archive outdated versions
  - Update links to point to consolidated documents
  - Purpose: Eliminate duplication and establish single source of truth
  - _Leverage: file-mapping.json, design.md (archive strategy)_
  - _Requirements: 5 (Deprecation and Archive Strategy)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with expertise in content consolidation and information architecture | Task: Consolidate duplicate documentation following requirement 5, reviewing all sections for duplicates, merging content, and archiving outdated versions using design.md archive strategy | Restrictions: Do not delete content without archiving, ensure merged documents are comprehensive, update all references | \_Leverage: file-mapping.json, design.md_ | _Requirements: 5_ | Success: All duplicates identified and consolidated, outdated versions archived, single source of truth established, links updated | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record consolidation results, then mark as complete ([x])\_

- [x] 4.2. Archive old session notes quarterly
  - Review docs/sessions/daily/ directory
  - Consolidate session notes by quarter into archive files (ARCHIVE_2024_Q4.md, ARCHIVE_2025_Q1.md)
  - Move consolidated archives to docs/archive/{year-quarter}/
  - Clean up docs/sessions/daily/ (keep current quarter only)
  - Purpose: Reduce clutter while preserving historical context
  - _Leverage: design.md (archive strategy), existing ARCHIVE files_
  - _Requirements: 5 (Deprecation and Archive Strategy)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Documentation Manager with expertise in archival and knowledge management | Task: Archive session notes following requirement 5, consolidating docs/sessions/daily/ by quarter into archive files and moving to docs/archive/ using design.md archive strategy | Restrictions: Preserve all historical content, ensure chronological organization, keep current quarter accessible | \_Leverage: design.md, existing ARCHIVE files_ | _Requirements: 5_ | Success: All session notes consolidated by quarter, archives moved to proper location, current quarter clean and accessible | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record archival results, then mark as complete ([x])\_

- [x] 4.3. Create redirect map for legacy URLs
  - File: docs/.redirects or similar configuration
  - Map old documentation URLs to new locations
  - Add deprecation notices to archived files
  - Document redirect strategy for web documentation
  - Purpose: Maintain backward compatibility for bookmarks and external links
  - _Leverage: file-mapping.json (old → new path mapping)_
  - _Requirements: Reliability (backward compatibility)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with expertise in web redirects and backward compatibility | Task: Create redirect map following reliability requirements, using file-mapping.json to generate old → new URL mappings and adding deprecation notices to archived files | Restrictions: Ensure redirects work with chosen static site generator, provide clear deprecation messages, document redirect configuration | \_Leverage: file-mapping.json_ | _Requirements: Reliability NFR_ | Success: Redirect map created and tested, deprecation notices added, redirect strategy documented | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record redirect configuration created, then mark as complete ([x])\_

- [x] 4.4. Update root README.md as master index
  - File: docs/README.md
  - Update with final navigation structure
  - Add quick links for common tasks
  - Document contribution guidelines for documentation
  - Add badges and status information
  - Purpose: Provide comprehensive entry point to all documentation
  - _Leverage: Section indexes, metadata-schema.md, design.md (navigation structure)_
  - _Requirements: 6 (Documentation Index and Navigation)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with expertise in documentation navigation and user experience | Task: Update docs/README.md as comprehensive master index following requirement 6, using section indexes and design.md navigation structure to provide clear entry points and contribution guidelines | Restrictions: Ensure all sections are linked, quick links are helpful, contribution guide is clear and actionable | \_Leverage: Section indexes, metadata-schema.md, design.md_ | _Requirements: 6_ | Success: Master index is comprehensive and intuitive, all sections linked, contribution guidelines clear, user-friendly navigation | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record README updates with artifacts, then mark as complete ([x])\_

## Phase 5: Web Documentation Setup

- [x] 5.1. Choose and install static site generator (VitePress recommended)
  - File: package.json (add VitePress dependency)
  - Research and compare VitePress vs Docusaurus vs MkDocs
  - Install VitePress (or chosen generator)
  - Initialize basic configuration
  - Purpose: Set up foundation for web documentation generation
  - _Leverage: metadata-schema.md, package.json_
  - _Requirements: 3 (Web Documentation Metadata), Performance (build performance)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with expertise in static site generators and documentation platforms | Task: Choose and install static site generator (VitePress recommended) following requirements 3 and performance NFR, researching options, installing chosen tool, and initializing basic configuration | Restrictions: Ensure compatibility with metadata-schema.md frontmatter, maintain build performance <60s, choose well-maintained tool | \_Leverage: metadata-schema.md, package.json_ | _Requirements: 3, Performance NFR_ | Success: Static site generator installed and initialized, basic configuration working, compatible with metadata schema | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record tool choice and installation, then mark as complete ([x])\_

- [x] 5.2. Configure web documentation (navigation, theme, plugins)
  - File: docs/.vitepress/config.js (or equivalent for chosen generator)
  - Configure navigation based on directory structure
  - Set up theme and styling
  - Configure plugins for search, syntax highlighting, Mermaid diagrams
  - Purpose: Create production-ready web documentation site
  - _Leverage: metadata-schema.md, docs/README.md (navigation), section indexes_
  - _Requirements: 6 (Documentation Index and Navigation), Usability (visual hierarchy, code examples)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with expertise in VitePress/Docusaurus configuration and UX | Task: Configure web documentation following requirements 6 and usability NFRs, setting up navigation from directory structure, theme, and plugins for search/syntax highlighting/Mermaid using metadata-schema.md and section indexes | Restrictions: Ensure navigation auto-generates from frontmatter, theme is professional and accessible, all plugins work correctly | \_Leverage: metadata-schema.md, section indexes_ | _Requirements: 6, Usability NFRs_ | Success: Navigation works automatically, theme is polished, search functional, code highlighting and Mermaid diagrams working | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record configuration with artifacts, then mark as complete ([x])\_

- [x] 5.3. Set up GitHub Pages deployment with CI/CD
  - File: .github/workflows/docs-deploy.yml
  - Create GitHub Actions workflow for documentation build
  - Configure automatic deployment to GitHub Pages
  - Set up preview deployments for pull requests
  - Purpose: Automate documentation deployment
  - _Leverage: Existing CI/CD patterns from .github/workflows/, docs/.vitepress/config.js_
  - _Requirements: Performance (build performance), Reliability (automated validation)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with expertise in GitHub Actions and deployment automation | Task: Set up GitHub Pages deployment following performance and reliability requirements, creating workflow for docs build and deployment with PR previews using existing CI/CD patterns | Restrictions: Ensure build completes <60s, include link validation in CI, secure deployment credentials | \_Leverage: .github/workflows/ patterns, VitePress config_ | _Requirements: Performance NFR, Reliability NFR_ | Success: Workflow builds and deploys docs automatically, PR previews working, build performance <60s, link validation in CI | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record workflow created with artifacts, then mark as complete ([x])\_

- [x] 5.4. Add search functionality (Algolia or local search)
  - Configure search in VitePress/chosen generator
  - Index all documentation content
  - Test search functionality and relevance
  - Purpose: Enable fast documentation search
  - _Leverage: docs/.vitepress/config.js, metadata-schema.md (for search metadata)_
  - _Requirements: Performance (search performance), Usability_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with expertise in search implementation and indexing | Task: Add search functionality following performance and usability requirements, configuring search in VitePress, indexing content, and testing relevance using metadata-schema.md for search metadata | Restrictions: Ensure search is fast and accurate, index all relevant content, provide good UX for search results | \_Leverage: VitePress config, metadata-schema.md_ | _Requirements: Performance NFR, Usability NFR_ | Success: Search is functional and fast, all content indexed, search results are relevant and useful | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record search configuration with artifacts, then mark as complete ([x])\_

## Phase 6: Validation and Launch

- [ ] 6.1. Run comprehensive link validation
  - Execute: bash scripts/validate-links.sh
  - Verify 0 broken internal links
  - Check external link health (warnings only)
  - Generate final link health report
  - Purpose: Ensure documentation link integrity before launch
  - _Leverage: scripts/validate-links.sh_
  - _Requirements: Reliability (link integrity)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with expertise in documentation validation and quality assurance | Task: Run comprehensive link validation following reliability requirements, using scripts/validate-links.sh to verify 0 broken internal links and checking external link health | Restrictions: Must achieve 0 broken internal links, external links are informational only, generate clear report | \_Leverage: scripts/validate-links.sh_ | _Requirements: Reliability NFR_ | Success: Link validation shows 0 broken internal links, external links checked, final report generated and clean | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record validation results, then mark as complete ([x])\_

- [ ] 6.2. Test web documentation build end-to-end
  - Execute full build: npm run docs:build (or equivalent)
  - Test local preview: npm run docs:preview
  - Verify all pages render correctly
  - Test navigation, search, and all interactive features
  - Purpose: Validate complete web documentation functionality
  - _Leverage: VitePress build scripts, docs/.vitepress/config.js_
  - _Requirements: Performance (build performance), Usability (all NFRs)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with expertise in web testing and documentation validation | Task: Test web documentation build end-to-end following performance and usability requirements, running full build, previewing locally, and testing all features (navigation, search, rendering) | Restrictions: Must test all major pages, verify interactive features work, ensure build completes <60s | \_Leverage: VitePress build scripts, config_ | _Requirements: Performance NFR, Usability NFRs_ | Success: Build completes successfully <60s, all pages render correctly, navigation and search working, no errors or warnings | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record test results with artifacts, then mark as complete ([x])\_

- [ ] 6.3. Review navigation completeness and accuracy
  - Review all section indexes (README.md files)
  - Verify all documents are properly categorized
  - Check frontmatter completeness (90%+ coverage target)
  - Test user journeys (new developer, feature developer, infrastructure engineer)
  - Purpose: Ensure documentation is discoverable and complete
  - _Leverage: Section indexes, metadata-schema.md, design.md (user workflows)_
  - _Requirements: 4 (Clear Information Architecture), 6 (Documentation Index and Navigation)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with expertise in information architecture and user experience | Task: Review navigation completeness following requirements 4 and 6, verifying section indexes, categorization, frontmatter coverage (90%+ target), and testing user journeys from design.md | Restrictions: Must achieve 90%+ frontmatter coverage, ensure all user journeys work smoothly, verify categorization accuracy | \_Leverage: Section indexes, metadata-schema.md, design.md_ | _Requirements: 4, 6_ | Success: All section indexes complete, 90%+ frontmatter coverage achieved, all user journeys tested successfully, navigation is intuitive | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record review results with metrics, then mark as complete ([x])\_

- [ ] 6.4. Update contribution guide and CLAUDE.md
  - Files: docs/getting-started/contributing.md, CLAUDE.md
  - Document new documentation structure and standards
  - Update CLAUDE.md to reference new docs/ structure
  - Add documentation contribution workflow (create, review, merge)
  - Document metadata schema usage for contributors
  - Purpose: Enable team to maintain and contribute to documentation
  - _Leverage: metadata-schema.md, docs/features/templates/, design.md_
  - _Requirements: 1-6 (all requirements for maintainability)_
  - _Prompt: Implement the task for spec docs-restructure, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with expertise in documentation governance and contribution workflows | Task: Update contribution guide and CLAUDE.md following all requirements, documenting new structure, standards, workflow, and metadata schema usage using metadata-schema.md, templates, and design.md | Restrictions: Ensure instructions are clear and actionable, update CLAUDE.md references accurately, make contribution easy for team | \_Leverage: metadata-schema.md, docs/features/templates/, design.md_ | _Requirements: All (1-6)_ | Success: Contribution guide is comprehensive and clear, CLAUDE.md updated correctly, documentation standards documented, team can easily contribute | Instructions: Before starting, mark this task as in-progress ([-]) in tasks.md. After completion, use log-implementation tool to record guide updates with artifacts, then mark as complete ([x])\_
