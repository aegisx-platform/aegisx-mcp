import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  InsertTemplate,
  PdfTemplateInsertService,
} from '../../services/pdf-template-insert.service';

@Component({
  selector: 'app-template-insert-toolbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './template-insert-toolbar.component.html',
  styleUrl: './template-insert-toolbar.component.scss',
})
export class TemplateInsertToolbarComponent {
  private insertService = inject(PdfTemplateInsertService);

  /**
   * Whether the logo is uploaded
   * Used to enable/disable logo-related templates
   */
  @Input() hasLogo = false;

  /**
   * Emits when a template is selected to be inserted
   */
  @Output() templateSelected = new EventEmitter<InsertTemplate>();

  /**
   * Get all available insert templates from service
   */
  readonly insertTemplates = this.insertService.getAllTemplates();

  /**
   * Handle template button click
   */
  onTemplateClick(template: InsertTemplate): void {
    // Check if logo is required but not uploaded
    const logoTemplateNames = [
      'Logo',
      'Logo (Left)',
      'Logo (Right)',
      'Logo (Center)',
    ];

    if (logoTemplateNames.includes(template.name) && !this.hasLogo) {
      console.warn(
        '[Template Insert Toolbar] Logo required but not uploaded for:',
        template.name,
      );
      // Emit anyway - let parent component handle the error display
      this.templateSelected.emit(template);
      return;
    }

    console.log('[Template Insert Toolbar] Template selected:', template.name);
    this.templateSelected.emit(template);
  }

  /**
   * Check if template button should be disabled
   */
  isTemplateDisabled(_template: InsertTemplate): boolean {
    // For now, no templates are disabled
    // Could add logic here for conditional enabling/disabling
    return false;
  }
}
