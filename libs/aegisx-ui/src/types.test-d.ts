/**
 * Type Tests for AegisX UI Library
 *
 * This file contains compile-time type tests using tsd.
 * These tests verify that the TypeScript types are correct and provide
 * proper type safety for library consumers.
 *
 * Run tests with: pnpm run test:types
 */

import {
  expectType,
  expectError,
  expectAssignable,
  expectNotAssignable,
} from 'tsd';

// Import types from public API
import type {
  // Navigation types
  AxNavigationItem,
  AxNavigation,
  AxNavigationBadge,

  // Config types
  AegisxConfig,
  AegisxThemeConfig,
  AegisxLayoutType,

  // Theme types
  ThemeMode,
} from './index';

// =============================================================================
// Navigation Types Tests
// =============================================================================

describe('AxNavigationItem', () => {
  // Test basic navigation item structure
  const navItem: AxNavigationItem = {
    id: 'home',
    title: 'Home',
    type: 'item',
    icon: 'home',
    link: '/home',
  };
  expectType<AxNavigationItem>(navItem);

  // Test with children
  const navGroup: AxNavigationItem = {
    id: 'admin',
    title: 'Admin',
    type: 'group',
    children: [
      { id: 'users', title: 'Users', type: 'item', link: '/admin/users' },
    ],
  };
  expectType<AxNavigationItem>(navGroup);

  // Test badge property
  const navWithBadge: AxNavigationItem = {
    id: 'notifications',
    title: 'Notifications',
    type: 'item',
    badge: {
      content: '5',
      type: 'warn',
    },
  };
  expectType<AxNavigationItem>(navWithBadge);

  // Test that invalid types are rejected
  expectError<AxNavigationItem>({
    id: 'invalid',
    // Missing required 'title' property
    type: 'item',
  });

  // Test link as array
  const navWithArrayLink: AxNavigationItem = {
    id: 'details',
    title: 'Details',
    type: 'item',
    link: ['/', 'admin', 'details'],
  };
  expectType<AxNavigationItem>(navWithArrayLink);
});

describe('AxNavigationBadge', () => {
  // Test valid badge types
  expectType<AxNavigationBadge>({ content: '10', type: 'primary' });
  expectType<AxNavigationBadge>({ content: 'NEW', type: 'accent' });
  expectType<AxNavigationBadge>({ content: '!', type: 'warn' });

  // Test that invalid badge types are rejected
  expectError<AxNavigationBadge>({ content: 'test', type: 'invalid' });
});

describe('AxNavigation', () => {
  const navigation: AxNavigation = {
    default: [{ id: 'home', title: 'Home', type: 'item', link: '/' }],
    compact: [
      { id: 'home', title: 'Home', type: 'item', link: '/', icon: 'home' },
    ],
  };
  expectType<AxNavigation>(navigation);

  // Test that default and compact are required
  expectError<AxNavigation>({
    default: [],
    // Missing 'compact' property
  });
});

// =============================================================================
// Config Types Tests
// =============================================================================

describe('AegisxConfig', () => {
  // Test minimal valid config
  const minimalConfig: AegisxConfig = {};
  expectType<AegisxConfig>(minimalConfig);

  // Test full config
  const fullConfig: AegisxConfig = {
    theme: {
      name: 'default',
      scheme: 'light',
      colors: {
        primary: '#3f51b5',
        accent: '#ff4081',
        warn: '#f44336',
      },
    },
    layout: {
      default: 'classic',
      sidenavWidth: 280,
      showBranding: true,
      collapsible: true,
    },
    language: 'en',
  };
  expectType<AegisxConfig>(fullConfig);
});

describe('AegisxThemeConfig', () => {
  // Test valid theme schemes
  expectType<AegisxThemeConfig>({ scheme: 'light' });
  expectType<AegisxThemeConfig>({ scheme: 'dark' });
  expectType<AegisxThemeConfig>({ scheme: 'auto' });

  // Test that invalid schemes are rejected
  expectError<AegisxThemeConfig>({ scheme: 'invalid' });
});

describe('AegisxLayoutType', () => {
  // Test valid layout types
  expectType<AegisxLayoutType>('empty');
  expectType<AegisxLayoutType>('classic');
  expectType<AegisxLayoutType>('compact');
  expectType<AegisxLayoutType>('enterprise');
  expectType<AegisxLayoutType>('docs');

  // Test that invalid layout types are rejected
  expectError<AegisxLayoutType>('invalid');
});

// =============================================================================
// Theme Types Tests
// =============================================================================

describe('ThemeMode', () => {
  // Test valid theme modes
  expectType<ThemeMode>('light');
  expectType<ThemeMode>('dark');

  // Test that invalid modes are rejected
  expectError<ThemeMode>('auto');
  expectError<ThemeMode>('custom');
});

// =============================================================================
// Type Inference Tests
// =============================================================================

describe('Type Inference', () => {
  // Test that types can be inferred correctly
  const config = {
    theme: { scheme: 'dark' as const },
    layout: { default: 'enterprise' as const },
  };

  expectAssignable<AegisxConfig>(config);
});

// =============================================================================
// Generic Type Tests
// =============================================================================

describe('Generic Constraints', () => {
  // These tests would be expanded as we add more generic types
  // For now, testing basic assignability

  const navItem = {
    id: 'test',
    title: 'Test',
    type: 'item' as const,
  };

  expectAssignable<AxNavigationItem>(navItem);
  expectNotAssignable<AxNavigationItem>({ id: 'test' }); // Missing required fields
});

// =============================================================================
// Union Type Tests
// =============================================================================

describe('Union Types', () => {
  // Test that union types work correctly
  const itemType:
    | 'item'
    | 'basic'
    | 'group'
    | 'collapsible'
    | 'divider'
    | 'spacer' = 'item';

  const navItem: AxNavigationItem = {
    id: 'test',
    title: 'Test',
    type: itemType,
  };

  expectType<AxNavigationItem>(navItem);
});
