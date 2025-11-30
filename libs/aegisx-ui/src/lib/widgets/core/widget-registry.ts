import { Injectable } from '@angular/core';
import { WidgetCategory, WidgetDefinition } from './widget.types';

/**
 * Registry for widget definitions.
 * Manages registration and lookup of available widgets.
 */
@Injectable()
export class WidgetRegistry {
  private widgets = new Map<string, WidgetDefinition>();

  /**
   * Register a widget definition
   * @param definition - Widget definition to register
   * @throws Error if widget ID already exists
   */
  register(definition: WidgetDefinition): void {
    if (this.widgets.has(definition.id)) {
      console.warn(
        `Widget "${definition.id}" is already registered. Overwriting.`,
      );
    }
    this.widgets.set(definition.id, definition);
  }

  /**
   * Register multiple widget definitions
   * @param definitions - Array of widget definitions
   */
  registerMany(definitions: WidgetDefinition[]): void {
    definitions.forEach((def) => this.register(def));
  }

  /**
   * Get widget definition by ID
   * @param id - Widget ID
   * @returns Widget definition or undefined
   */
  get(id: string): WidgetDefinition | undefined {
    return this.widgets.get(id);
  }

  /**
   * Check if widget exists
   * @param id - Widget ID
   */
  has(id: string): boolean {
    return this.widgets.has(id);
  }

  /**
   * Get all registered widgets
   * @returns Array of all widget definitions
   */
  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Get widgets by category
   * @param category - Widget category
   * @returns Array of widgets in category
   */
  getByCategory(category: WidgetCategory): WidgetDefinition[] {
    return this.getAll().filter((w) => w.category === category);
  }

  /**
   * Search widgets by name or tags
   * @param query - Search query
   * @returns Matching widget definitions
   */
  search(query: string): WidgetDefinition[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.tags?.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  /**
   * Get widget count
   */
  get size(): number {
    return this.widgets.size;
  }

  /**
   * Clear all registered widgets
   */
  clear(): void {
    this.widgets.clear();
  }
}
