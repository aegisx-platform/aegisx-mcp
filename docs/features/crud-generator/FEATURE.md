# CRUD Generator

**Status**: 🟡 In Progress  
**Priority**: High  
**Branch**: feature/crud-generator  
**Started**: 2025-09-22  
**Target**: 2025-09-25

## 📋 Requirements

**User Story**: As a developer, I want to automatically generate complete CRUD APIs from database schema so that I can quickly create standard API modules following AegisX patterns without manual coding

### Functional Requirements

- [ ] CLI command to read database table schema
- [ ] Generate complete CRUD module (controller, service, repository, routes, schemas)
- [ ] Support TypeBox schema generation with validation
- [ ] Generate TypeScript types from database columns
- [ ] Auto-detect primary keys, foreign keys, and relationships
- [ ] Template system with customizable code generation
- [ ] Module auto-registration in Fastify plugins
- [ ] Preview mode (dry-run) before file creation
- [ ] Support for custom naming conventions
- [ ] Generate basic unit tests for all layers

### Non-Functional Requirements

- [ ] Performance: Generate complete CRUD module in <5 seconds
- [ ] Security: Follow AegisX security patterns (JWT auth, RBAC)
- [ ] Code Quality: Generated code passes linting, type checking, and follows conventions
- [ ] Maintainability: Clean, readable generated code with proper documentation
- [ ] Reliability: 100% success rate for standard table schemas

## 🎯 Success Criteria

### Backend

- [ ] CLI tool generates controller, service, repository, routes files
- [ ] TypeBox schemas generated with proper validation
- [ ] Generated code follows AegisX patterns (BaseRepository, etc.)
- [ ] Database introspection working for PostgreSQL
- [ ] Template engine rendering correctly
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests for generator functionality

### CLI Tool

- [ ] Command-line interface working
- [ ] Help documentation complete
- [ ] Error handling and validation
- [ ] Progress indicators for generation
- [ ] Dry-run mode functional

### Integration

- [ ] Generated modules integrate with existing codebase
- [ ] Auto-registration in main plugin working
- [ ] Generated API endpoints accessible via OpenAPI
- [ ] Generated tests pass in CI/CD pipeline
- [ ] No conflicts with existing modules

## 🚨 Conflict Prevention

### Database Changes

- [ ] Tables/columns reserved: generator_templates, generator_configs (optional)
- [ ] Migration 012_generator_tables reserved
- [ ] No conflicts with existing RBAC and user-profile features

### API Changes

- [ ] Endpoints reserved: /api/generator/_, /api/generator/templates/_, /api/generator/preview/\*
- [ ] TypeBox schemas for generator configuration
- [ ] No impact on existing API endpoints

### CLI & Admin Interface

- [ ] Routes reserved: /admin/generator, /admin/generator/templates, /admin/generator/history
- [ ] CLI commands: npm run generate:crud [table-name]
- [ ] Shared utilities: CodeGeneratorService, TemplateEngine, DatabaseIntrospector

## 📊 Dependencies

### Depends On

- [ ] **Feature: Real-time Event System** - For generation progress updates and WebSocket notifications
- [ ] Feature: Universal Full-Stack Standard - Generator must follow established patterns
- [ ] Library: Handlebars - ^4.7.8 for template processing
- [ ] Library: pg - Existing PostgreSQL driver for schema introspection
- [ ] Library: Knex.js - Existing query builder for database access

### Blocks

- [ ] Future feature development - Will accelerate CRUD API creation
- [ ] Manual coding of repetitive CRUD patterns

## 🎨 Design Decisions

### Architecture

- **Pattern**: CLI-based code generation with template engine
- **Database**: PostgreSQL introspection via existing Knex connection
- **Code Generation**: Template-based approach using Handlebars
- **Integration**: Plugin-based auto-registration in Fastify

### Technology Choices

- **CLI Framework**: Commander.js for argument parsing
- **Template Engine**: Handlebars for code template processing
- **Database Introspection**: pg + information_schema queries
- **File Generation**: Node.js fs module with template rendering
- **Testing**: Jest for unit tests, generated code integration tests

## 🔄 Implementation Plan

### Phase 1: Planning & Design

- [ ] Requirements analysis complete
- [ ] CLI interface contracts defined
- [ ] Database introspection strategy designed
- [ ] Template system architecture planned
- [ ] File generation workflow designed

### Phase 2: Core Implementation

- [ ] Database schema reader utility
- [ ] Type mapping (PostgreSQL → TypeScript/TypeBox)
- [ ] Template engine with Handlebars
- [ ] File generation system
- [ ] CLI command structure
- [ ] Unit tests for generator components
- [ ] Integration tests for generated code

### Phase 3: Template System

- [ ] Controller template (TypeScript + Fastify)
- [ ] Service template (Business logic layer)
- [ ] Repository template (BaseRepository pattern)
- [ ] Routes template (Fastify + TypeBox schemas)
- [ ] Schemas template (TypeBox validation)
- [ ] Types template (TypeScript interfaces)
- [ ] Plugin template (Auto-registration)
- [ ] Test templates (Jest unit tests)

### Phase 4: Integration & Polish

- [ ] CLI integration with project structure
- [ ] Auto-registration in main application
- [ ] Error handling and validation
- [ ] Performance optimization for large schemas
- [ ] Complete documentation and examples
- [ ] End-to-end testing with real database tables

## 📝 Notes & Decisions

### Technical Decisions

- 2025-09-22 Decision: Use Handlebars for templates instead of custom string templating for better maintainability and feature richness
- 2025-09-22 Decision: CLI-first approach rather than API-based generation for better developer experience
- 2025-09-22 Decision: Focus on PostgreSQL initially, extend to other databases later

### Challenges & Solutions

- 2025-09-22 Challenge: Complex TypeScript type mapping from PostgreSQL schema
- 2025-09-22 Proposed Solution: Create comprehensive type mapping utility with PostgreSQL information_schema
- 2025-09-22 Challenge: Ensuring generated code follows all AegisX conventions
- 2025-09-22 Proposed Solution: Template-based approach using existing code as reference

### Review Feedback

- 2025-09-22 Self-Review: Feature documentation completed, ready to proceed with implementation
- 2025-09-22 Action Items: Start with database schema reader, then template system
- 2025-09-22 Analysis Complete: WebSocket system analysis completed, Event System dependency identified
- 2025-09-22 Status Update: Feature paused pending Real-time Event System foundation
