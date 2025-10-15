import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'ax-debug-icons',
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-6">Icon Debug Page</h1>
      
      <!-- Font Loading Status -->
      <div class="bg-white p-4 rounded shadow mb-6">
        <h2 class="text-lg font-semibold mb-2">Font Loading Status</h2>
        <p>Material Icons loaded: <strong>{{ fontLoaded }}</strong></p>
        <p>Document fonts ready: <strong>{{ fontsReady }}</strong></p>
      </div>
      
      <!-- Direct HTML Icons -->
      <div class="bg-white p-4 rounded shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">Direct HTML Icons</h2>
        <div class="flex gap-4 items-center">
          <span class="material-icons" style="font-size: 24px;">home</span>
          <span class="material-icons" style="font-size: 24px;">pie_chart</span>
          <span class="material-icons" style="font-size: 24px;">people</span>
          <span class="material-icons" style="font-size: 24px;">settings</span>
        </div>
      </div>
      
      <!-- Icon with Inline Styles -->
      <div class="bg-white p-4 rounded shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">Icons with Full Inline Styles</h2>
        <div class="flex gap-4 items-center">
          <span style="font-family: 'Material Icons'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased;">home</span>
          <span style="font-family: 'Material Icons'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased;">pie_chart</span>
        </div>
      </div>
      
      <!-- Test Navigation Icons -->
      <div class="bg-white p-4 rounded shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">Navigation Icon Classes</h2>
        <div class="flex gap-4 items-center">
          <span class="fuse-vertical-navigation-item-icon material-icons">home</span>
          <span class="fuse-vertical-navigation-item-icon material-icons">pie_chart</span>
          <span class="fuse-vertical-navigation-item-icon material-icons">people</span>
        </div>
      </div>
      
      <!-- Browser Console Test -->
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold mb-2">Browser Console Test</h2>
        <p class="text-sm text-gray-600 mb-2">Run this in console to check font:</p>
        <code class="block bg-gray-100 p-2 rounded text-xs">
          document.fonts.check('24px Material Icons')
        </code>
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
    
    .fuse-vertical-navigation-item-icon {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      width: 24px !important;
      height: 24px !important;
      font-size: 24px !important;
      line-height: 24px !important;
    }
  `]
})
export class DebugIconsComponent implements OnInit {
  fontLoaded = 'Checking...';
  fontsReady = 'Checking...';

  ngOnInit() {
    // Check if fonts API is available
    if ('fonts' in document) {
      // Check if Material Icons font is loaded
      document.fonts.ready.then(() => {
        this.fontsReady = 'Yes';
        const materialIconsLoaded = document.fonts.check('24px Material Icons');
        this.fontLoaded = materialIconsLoaded ? 'Yes ✓' : 'No ✗';
        
        // Log all loaded fonts
        console.log('Loaded fonts:');
        document.fonts.forEach(font => {
          console.log(`- ${font.family} (${font.style} ${font.weight})`);
        });
      });
    } else {
      this.fontLoaded = 'Fonts API not supported';
      this.fontsReady = 'Fonts API not supported';
    }
  }
}