# Requirements Document - AegisX UI Type System Improvements

## Introduction

This specification addresses the need for comprehensive TypeScript type coverage across the @aegisx/ui library. Currently, the library has:

- **26 instances of `any` type usage** that should be replaced with proper types
- **196 inline type definitions** scattered across component files that should be extracted and centralized
- **20+ dedicated .types.ts files** that may have incomplete or inconsistent definitions
- Missing type exports in some public APIs

The goal is to establish a robust, type-safe foundation that:

- Eliminates all `any` types
- Centralizes type definitions in dedicated files
- Ensures complete type coverage for all public APIs
- Provides comprehensive JSDoc documentation for all exported types
- Maintains backward compatibility with existing code

This improves developer experience through better IDE autocomplete, compile-time safety, and self-documenting code.

## Alignment with Product Vision

This enhancement aligns with the AegisX platform's commitment to:

- **Enterprise-Grade Quality**: Strong typing ensures reliability and reduces runtime errors
- **Developer Experience**: Comprehensive types enable better IDE support and faster development
- **Maintainability**: Centralized type definitions make the codebase easier to understand and evolve
- **Documentation**: Well-typed APIs serve as living documentation

## Requirements

### Requirement 1: Eliminate All `any` Type Usage

**User Story:** As a library consumer, I want all components and APIs to have proper type definitions instead of `any`, so that I get accurate type checking and autocomplete in my IDE.

#### Acceptance Criteria

1. WHEN scanning the entire `libs/aegisx-ui/src` directory THEN the system SHALL have zero occurrences of `any` type (except in legacy compatibility code marked with @deprecated)
2. IF a type was previously `any` THEN it SHALL be replaced with a specific interface, type union, or generic type parameter
3. WHEN replacing `any` types THEN the new types SHALL accurately represent the actual data structure being used
4. IF the actual type is truly dynamic THEN it SHALL use `unknown` or proper generic constraints instead of `any`

### Requirement 2: Extract Inline Types to Dedicated Files

**User Story:** As a developer maintaining the library, I want all type definitions centralized in .types.ts files, so that I can find and update types easily without navigating through component code.

#### Acceptance Criteria

1. WHEN examining component files THEN exported interfaces and types SHALL be moved to corresponding `.types.ts` files
2. IF a component has exported types THEN they SHALL be in `{component-name}.types.ts` in the same directory
3. WHEN types are extracted THEN component files SHALL import types from the .types.ts file
4. IF multiple components share types THEN shared types SHALL be in a common types file (e.g., `common.types.ts` or category-specific types file)
5. WHEN extracting types THEN internal component-only types MAY remain in the component file but SHALL NOT be exported

### Requirement 3: Ensure Complete Public API Type Exports

**User Story:** As a library consumer, I want all public types to be easily importable from the main package, so that I can type my code without having to navigate deep into the library structure.

#### Acceptance Criteria

1. WHEN checking `libs/aegisx-ui/src/index.ts` THEN all public types SHALL be exported through the type system
2. IF a type is used in a public component interface THEN it SHALL be available as a named export
3. WHEN importing types THEN consumers SHALL be able to import from `@aegisx/ui` directly (e.g., `import { AxNavigationItem } from '@aegisx/ui'`)
4. IF types are organized by category THEN they SHALL also be available via subpath exports (e.g., `@aegisx/ui/types`, `@aegisx/ui/components`)

### Requirement 4: Add Comprehensive JSDoc Documentation

**User Story:** As a library consumer, I want comprehensive JSDoc comments on all exported types, so that I understand how to use them without reading source code.

#### Acceptance Criteria

1. WHEN examining exported interfaces THEN each SHALL have a JSDoc comment describing its purpose
2. IF an interface has properties THEN complex or non-obvious properties SHALL have JSDoc comments
3. WHEN documenting types THEN examples SHALL be provided for complex types using @example tags
4. IF a type has deprecated properties THEN they SHALL be marked with @deprecated tags and migration guidance
5. WHEN documenting THEN consistent terminology SHALL be used across all type documentation

### Requirement 5: Standardize Type File Organization

**User Story:** As a developer working on the library, I want a consistent organizational pattern for type files, so that I can quickly locate any type definition.

#### Acceptance Criteria

1. WHEN creating new type files THEN they SHALL follow the naming convention `{feature}.types.ts`
2. IF types are in `libs/aegisx-ui/src/lib/types/` THEN they SHALL be for library-wide/global types
3. WHEN types are component-specific THEN they SHALL be colocated with the component (e.g., `drawer.types.ts` next to `drawer.component.ts`)
4. IF types are for services THEN they SHALL be colocated with the service
5. WHEN organizing types within a file THEN they SHALL be grouped logically with clear section comments

### Requirement 6: Create Type Definition Index Files

**User Story:** As a library consumer, I want a centralized types index file, so that I can discover all available types easily.

#### Acceptance Criteria

1. WHEN checking `libs/aegisx-ui/src/lib/types/index.ts` THEN it SHALL export all global types
2. IF component directories have multiple .types.ts files THEN they SHALL have an index.ts that re-exports them
3. WHEN adding new types THEN corresponding index files SHALL be updated
4. IF types are added to submodules THEN they SHALL be accessible via barrel exports

### Requirement 7: Validate Type Safety with Strict TypeScript Configuration

**User Story:** As a library maintainer, I want strict TypeScript compiler checks enabled, so that type issues are caught at compile time.

#### Acceptance Criteria

1. WHEN building the library THEN TypeScript strict mode SHALL be enabled
2. IF there are implicit `any` types THEN the build SHALL fail with `noImplicitAny: true`
3. WHEN checking nullable types THEN strict null checks SHALL be enabled
4. IF there are unused parameters THEN warnings SHALL be shown (but not fail build for backward compatibility)

### Requirement 8: Widget System Type Completeness

**User Story:** As a developer using the widget system, I want complete type safety for widget configurations and data flows, so that I can build custom widgets with confidence.

#### Acceptance Criteria

1. WHEN defining a widget THEN all configuration types SHALL be fully typed using generics
2. IF a widget has data sources THEN the data type SHALL be parameterized via generic type parameter
3. WHEN widgets emit events THEN event payload types SHALL be explicitly defined
4. IF widgets have lifecycle hooks THEN hook method signatures SHALL be properly typed

### Requirement 9: Component Input/Output Type Safety

**User Story:** As a consumer of AegisX UI components, I want all @Input and @Output decorators to have explicit types, so that I get accurate IntelliSense when using them.

#### Acceptance Criteria

1. WHEN a component has @Input properties THEN each SHALL have an explicit type annotation
2. IF an @Input accepts multiple types THEN it SHALL use a union type (e.g., `string | string[]`)
3. WHEN a component has @Output properties THEN the EventEmitter SHALL have a typed generic parameter
4. IF an output emits complex data THEN the payload type SHALL be defined in the .types.ts file

### Requirement 10: Backward Compatibility and Migration Path

**User Story:** As an existing library consumer, I want type improvements to be backward compatible, so that my existing code doesn't break when I upgrade.

#### Acceptance Criteria

1. WHEN types are refactored THEN existing import paths SHALL continue to work
2. IF types are renamed THEN old names SHALL be maintained as deprecated aliases for at least one major version
3. WHEN breaking changes are necessary THEN they SHALL be clearly documented in CHANGELOG.md
4. IF migration is required THEN a migration guide SHALL be provided with code examples

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Each .types.ts file should focus on a specific domain or component
- **Modular Design**: Types should be organized by feature area (core, components, widgets, layouts, services)
- **Dependency Management**: Minimize circular dependencies between type files
- **Clear Interfaces**: Type definitions should be self-documenting with clear naming conventions

### Performance

- Type checking build time should not increase by more than 10%
- Runtime impact should be zero (types are compile-time only)

### Maintainability

- All type files should follow consistent naming conventions
- Type definitions should be colocated with their corresponding implementation files
- Comprehensive JSDoc comments for all exported types
- Clear examples in documentation

### Developer Experience

- IDE autocomplete should work correctly for all exported types
- Type errors should provide clear, actionable messages
- Library consumers should be able to import types from a single entry point
- Type definitions should enable better refactoring support in IDEs

### Testing

- Type tests should be added to verify type correctness (using tsd or similar)
- Build process should fail on any type errors
- CI/CD pipeline should include type checking

## Success Metrics

1. **Type Coverage**: 100% of public APIs have explicit types (0 occurrences of `any`)
2. **Type Organization**: All public types are in dedicated .types.ts files
3. **Documentation**: 100% of exported types have JSDoc comments
4. **Developer Experience**: Library consumers can import all types from `@aegisx/ui`
5. **Build Success**: Library builds without type errors with strict TypeScript settings
6. **Backward Compatibility**: Existing consumers can upgrade without code changes (except deprecated APIs)
