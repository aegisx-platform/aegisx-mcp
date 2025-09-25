// Main Layout Components (standardized names with actual component classes)
export { ClassicLayoutComponent as AxClassicLayoutComponent } from './classic/classic-layout.component';
export { CompactLayoutComponent as LegacyAxCompactLayoutComponent } from './compact/compact-layout.component';
export { AxCompactLayoutComponent } from './ax-compact/ax-compact-layout.component';
export { EmptyLayoutComponent as AxEmptyLayoutComponent } from './empty/empty-layout.component';
export { EnterpriseLayoutComponent as AxEnterpriseLayoutComponent } from './enterprise/enterprise-layout.component';
export { LayoutWrapperComponent as AxLayoutWrapperComponent } from './layout-wrapper/layout-wrapper.component';

// Legacy exports for backward compatibility (all standalone components)
export * from './classic/classic-layout.component';
export * from './compact/compact-layout.component';
export * from './empty/empty-layout.component';
export * from './enterprise/enterprise-layout.component';
export * from './layout-wrapper/layout-wrapper.component';

// Layout Components
export * from './components/navbar/navbar.component';
export * from './components/toolbar/toolbar.component';

// AX Layout Components (new format)
export * from './ax-classic/ax-classic-layout.component';
export * from './ax-compact/ax-compact-layout.component';
export * from './ax-classic/simple-vertical-navigation.component';
