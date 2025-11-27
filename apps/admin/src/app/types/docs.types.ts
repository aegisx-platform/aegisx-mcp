/**
 * AegisX Admin Documentation Types
 *
 * TypeScript interfaces for the Storybook-style documentation system.
 */

// ============================================
// COMPONENT DOCUMENTATION TYPES
// ============================================

/**
 * Component status indicating stability level
 */
export type ComponentStatus = 'stable' | 'beta' | 'experimental' | 'deprecated';

/**
 * Component category for organization
 */
export type ComponentCategory =
  | 'data-display'
  | 'forms'
  | 'feedback'
  | 'navigation'
  | 'layout';

/**
 * Breadcrumb item for documentation navigation
 */
export interface BreadcrumbItem {
  label: string;
  link?: string;
}

/**
 * Property definition for component API documentation
 */
export interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
  values?: string[];
}

/**
 * Output/Event definition for component API
 */
export interface OutputDefinition {
  name: string;
  type: string;
  description: string;
}

/**
 * Method definition for component API
 */
export interface MethodDefinition {
  name: string;
  signature: string;
  description: string;
  parameters?: { name: string; type: string; description: string }[];
  returns?: { type: string; description: string };
}

/**
 * CSS variable/token used by a component
 */
export interface ComponentToken {
  category: string;
  cssVar: string;
  usage: string;
  value?: string;
}

/**
 * Code example with optional TypeScript and SCSS
 */
export interface CodeExample {
  id: string;
  title: string;
  description?: string;
  html: string;
  typescript?: string;
  scss?: string;
}

/**
 * Usage guideline item (do's and don'ts)
 */
export interface GuidelineItem {
  text: string;
  icon?: string;
}

/**
 * Related component reference
 */
export interface RelatedComponent {
  name: string;
  link: string;
  icon?: string;
  description?: string;
}

/**
 * Complete component documentation data
 */
export interface ComponentDocData {
  // Identity
  id: string;
  name: string;
  selector: string;
  category: ComponentCategory;
  status: ComponentStatus;
  version?: string;

  // Content
  description: string;
  whenToUse?: string;
  features?: string[];

  // Import
  importPath: string;
  importName: string;

  // API
  inputs: PropDefinition[];
  outputs?: OutputDefinition[];
  methods?: MethodDefinition[];
  cssVariables?: ComponentToken[];

  // Examples
  examples: CodeExample[];

  // Guidelines
  dos?: GuidelineItem[];
  donts?: GuidelineItem[];
  accessibility?: string[];

  // Related
  relatedComponents?: RelatedComponent[];
}

// ============================================
// TOKEN DOCUMENTATION TYPES
// ============================================

/**
 * Token category for organization
 */
export type TokenCategory =
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'borders'
  | 'shadows'
  | 'motion'
  | 'breakpoints'
  | 'z-index';

/**
 * Single design token definition
 */
export interface DesignToken {
  name: string;
  cssVar: string;
  value: string;
  category: TokenCategory;
  description?: string;
  tailwindClass?: string;
  previewStyle?: Record<string, string>;
}

/**
 * Token group for organized display
 */
export interface TokenGroup {
  name: string;
  description?: string;
  tokens: DesignToken[];
}

/**
 * Semantic color with 6 variants
 */
export interface SemanticColorScale {
  name: string;
  variants: {
    faint: string;
    muted: string;
    subtle: string;
    default: string;
    emphasis: string;
    inverted: string;
  };
}

/**
 * Component to token mapping
 */
export interface ComponentTokenUsage {
  componentName: string;
  selector: string;
  tokens: ComponentToken[];
}

// ============================================
// NAVIGATION TYPES
// ============================================

/**
 * Documentation section for sidebar
 */
export interface DocSection {
  id: string;
  title: string;
  icon?: string;
  children?: DocNavItem[];
  defaultOpen?: boolean;
}

/**
 * Documentation navigation item
 */
export interface DocNavItem {
  id: string;
  title: string;
  link: string;
  icon?: string;
  badge?: string;
  status?: ComponentStatus;
}

// ============================================
// CODE DISPLAY TYPES
// ============================================

/**
 * Supported programming languages for code blocks
 */
export type CodeLanguage = 'typescript' | 'html' | 'scss' | 'bash' | 'json';

/**
 * Code tab configuration
 */
export interface CodeTab {
  label: string;
  code: string;
  language: CodeLanguage;
}

// ============================================
// THEME TYPES
// ============================================

/**
 * Theme comparison data
 */
export interface ThemedTokenValue {
  tokenName: string;
  cssVar: string;
  lightValue: string;
  darkValue: string;
  isDifferent: boolean;
}
