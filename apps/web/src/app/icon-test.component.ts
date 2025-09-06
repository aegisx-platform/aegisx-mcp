import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'ax-icon-test',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-8 bg-white dark:bg-gray-900">
      <h2 class="text-2xl font-bold mb-4">Icon Test</h2>
      
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="text-center">
          <mat-icon class="text-4xl">home</mat-icon>
          <p class="text-sm mt-2">mat-icon home</p>
        </div>
        
        <div class="text-center">
          <i class="material-icons text-4xl">home</i>
          <p class="text-sm mt-2">i.material-icons home</p>
        </div>
        
        <div class="text-center">
          <mat-icon fontIcon="home" class="text-4xl"></mat-icon>
          <p class="text-sm mt-2">mat-icon fontIcon</p>
        </div>
        
        <div class="text-center">
          <span style="font-family: 'Material Icons'; font-size: 36px;">home</span>
          <p class="text-sm mt-2">span with font-family</p>
        </div>
      </div>

      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4">Navigation Icons Test</h3>
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center">
            <i class="material-icons">home</i>
            <p class="text-sm">home</p>
          </div>
          <div class="text-center">
            <i class="material-icons">pie_chart</i>
            <p class="text-sm">pie_chart</p>
          </div>
          <div class="text-center">
            <i class="material-icons">work</i>
            <p class="text-sm">work</p>
          </div>
          <div class="text-center">
            <i class="material-icons">widgets</i>
            <p class="text-sm">widgets</p>
          </div>
          <div class="text-center">
            <i class="material-icons">people</i>
            <p class="text-sm">people</p>
          </div>
          <div class="text-center">
            <i class="material-icons">shopping_bag</i>
            <p class="text-sm">shopping_bag</p>
          </div>
          <div class="text-center">
            <i class="material-icons">shopping_cart</i>
            <p class="text-sm">shopping_cart</p>
          </div>
          <div class="text-center">
            <i class="material-icons">settings</i>
            <p class="text-sm">settings</p>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-4">Font Test</h3>
        <p>Material Icons font loaded: <span id="font-loaded">Checking...</span></p>
      </div>
    </div>
  `,
  styles: [`
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }
  `]
})
export class IconTestComponent {
  ngAfterViewInit() {
    // Check if Material Icons font is loaded
    if (document.fonts) {
      document.fonts.ready.then(() => {
        const fontLoaded = document.fonts.check('24px Material Icons');
        const element = document.getElementById('font-loaded');
        if (element) {
          element.textContent = fontLoaded ? '✓ Yes' : '✗ No';
        }
      });
    }
  }
}