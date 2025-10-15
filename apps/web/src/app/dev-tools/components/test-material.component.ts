import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-test-material',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="test-container">
      <h1>Test Material Input</h1>

      <!-- Test 1: Basic outline input -->
      <mat-form-field appearance="outline">
        <mat-label>Outline Input</mat-label>
        <input matInput placeholder="Type something" />
      </mat-form-field>

      <!-- Test 2: Fill input -->
      <mat-form-field appearance="fill">
        <mat-label>Fill Input</mat-label>
        <input matInput placeholder="Type something" />
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      .test-container {
        padding: 2rem;
        background: white;
      }

      mat-form-field {
        width: 100%;
        margin-bottom: 1rem;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class TestMaterialComponent {}
