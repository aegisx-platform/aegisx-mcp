import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

export type BreadcrumbSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ax-breadcrumb',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class AxBreadcrumbComponent {
  private router = inject(Router);

  @Input() items: BreadcrumbItem[] = [];
  @Input() separator = '/';
  @Input() separatorIcon?: string; // Material icon name for separator (e.g., 'chevron_right')
  @Input() size: BreadcrumbSize = 'md'; // Breadcrumb size (font size)
  @Output() itemClick = new EventEmitter<BreadcrumbItem>(); // Optional event for custom handling

  get breadcrumbClasses(): string {
    return `ax-breadcrumb ax-breadcrumb-${this.size}`;
  }

  onItemClick(item: BreadcrumbItem, event: MouseEvent): void {
    if (item.url) {
      event.preventDefault();
      // Auto-navigate using Angular Router
      this.router.navigate([item.url]);
      // Still emit event for backward compatibility or custom handling
      this.itemClick.emit(item);
    }
  }

  isLastItem(index: number): boolean {
    return index === this.items.length - 1;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
