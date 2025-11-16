import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  QuickAddDialogComponent,
  ConfirmDeleteDialogComponent,
  EditProfileDialogComponent,
  SettingsDialogComponent,
} from './dialogs';

@Component({
  selector: 'app-form-layouts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTabsModule,
    MatDialogModule,
  ],
  templateUrl: './form-layouts.component.html',
  styleUrl: './form-layouts.component.scss',
})
export class FormLayoutsComponent {
  selectedPlan = 'basic';
  hidePassword = true;

  countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
  ];

  constructor(private dialog: MatDialog) {}

  onSubmit() {
    console.log('Form submitted');
  }

  openQuickAddDialog(): void {
    const dialogRef = this.dialog.open(QuickAddDialogComponent, {
      width: '500px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Quick Add Dialog Result:', result);
      }
    });
  }

  openConfirmDeleteDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '450px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        console.log('Item deletion confirmed');
      }
    });
  }

  openEditProfileDialog(): void {
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '550px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Edit Profile Dialog Result:', result);
      }
    });
  }

  openSettingsDialog(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '500px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Settings Dialog Result:', result);
      }
    });
  }
}
