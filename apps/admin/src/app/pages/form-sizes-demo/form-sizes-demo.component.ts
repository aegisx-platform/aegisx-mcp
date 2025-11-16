import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

interface SizeVariant {
  id: string;
  name: string;
  formHeight: string;
  buttonHeight: string;
  fontSize: string;
  useCase: string;
  className: string;
}

@Component({
  selector: 'app-form-sizes-demo',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTabsModule,
    MatTableModule,
  ],
  templateUrl: './form-sizes-demo.component.html',
  styleUrl: './form-sizes-demo.component.scss',
})
export class FormSizesDemoComponent {
  selectedTab = signal(0);

  sizeVariants: SizeVariant[] = [
    {
      id: 'compact',
      name: 'Compact',
      formHeight: '40px',
      buttonHeight: '36px',
      fontSize: '14px (0.875rem)',
      useCase: 'CRUD tables, Tremor style, dashboard widgets ✓ RECOMMENDED',
      className: 'form-compact',
    },
    {
      id: 'standard',
      name: 'Standard',
      formHeight: '48px',
      buttonHeight: '40px',
      fontSize: '16px (1rem)',
      useCase: 'General forms, settings pages (Material Design 3 default)',
      className: 'form-standard',
    },
  ];

  displayedColumns: string[] = [
    'variant',
    'formHeight',
    'buttonHeight',
    'fontSize',
    'useCase',
  ];

  setTab(index: number): void {
    this.selectedTab.set(index);
  }
}
