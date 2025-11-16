import { Component, input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Guideline item definition
 */
export interface GuidelineItem {
  /** Guideline text */
  text: string;

  /** Custom icon (optional, defaults to check/close) */
  icon?: string;
}

/**
 * UsageGuidelinesComponent - Displays do's and don'ts for component usage
 *
 * @example
 * <ax-usage-guidelines
 *   [dos]="[
 *     { text: 'Use primary buttons for main actions' },
 *     { text: 'Keep button text concise' }
 *   ]"
 *   [donts]="[
 *     { text: 'Don\'t use more than one primary button per section' },
 *     { text: 'Don\'t use overly long button labels' }
 *   ]"
 * />
 */
@Component({
  selector: 'ax-usage-guidelines',
  imports: [CommonModule, MatIconModule],
  templateUrl: './usage-guidelines.component.html',
  styleUrl: './usage-guidelines.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class UsageGuidelinesComponent {
  /** List of recommended practices */
  dos = input<GuidelineItem[]>([]);

  /** List of practices to avoid */
  donts = input<GuidelineItem[]>([]);

  /** Custom title for "do" section */
  doTitle = input<string>('Do');

  /** Custom title for "don\'t" section */
  dontTitle = input<string>("Don't");

  /** Show icons */
  showIcons = input<boolean>(true);

  /** Layout: 'grid' (side by side) or 'stack' (vertical) */
  layout = input<'grid' | 'stack'>('grid');

  /**
   * Get icon for do item
   */
  protected getDoIcon(item: GuidelineItem): string {
    return item.icon || 'check_circle';
  }

  /**
   * Get icon for don't item
   */
  protected getDontIcon(item: GuidelineItem): string {
    return item.icon || 'cancel';
  }
}
