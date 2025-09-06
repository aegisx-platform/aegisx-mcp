import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Simple SVG Icon Component for Navigation
 * No external dependencies, just clean SVG icons
 */
@Component({
  selector: 'ax-navigation-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      [attr.width]="size" 
      [attr.height]="size" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      [attr.aria-label]="ariaLabel"
      role="img"
    >
      @if (svgPath) {
        <path 
          [attr.d]="svgPath" 
          [attr.stroke]="strokeColor" 
          [attr.stroke-width]="strokeWidth" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          [attr.fill]="fillColor"
        />
        @if (secondaryPath) {
          <path 
            [attr.d]="secondaryPath" 
            [attr.stroke]="strokeColor" 
            [attr.stroke-width]="strokeWidth" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            [attr.fill]="fillColor"
          />
        }
      } @else {
        <!-- Default icon when not found -->
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          [attr.stroke]="strokeColor" 
          [attr.stroke-width]="strokeWidth" 
          fill="none"
        />
        <text 
          x="12" 
          y="16" 
          text-anchor="middle" 
          [attr.fill]="strokeColor" 
          font-size="14" 
          font-weight="bold"
        >?</text>
      }
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    svg {
      transition: all 0.2s ease;
    }
  `]
})
export class NavigationIconComponent {
  @Input() icon = '';
  @Input() size = 24;
  @Input() strokeColor = 'currentColor';
  @Input() fillColor = 'none';
  @Input() strokeWidth = 2;
  
  get ariaLabel(): string {
    return this.iconName.replace(/_/g, ' ');
  }
  
  get iconName(): string {
    // Extract icon name from various formats
    if (this.icon.includes(':')) {
      return this.icon.split(':').pop() || '';
    }
    return this.icon;
  }
  
  get svgPath(): string {
    // Icon path definitions
    const icons: Record<string, string> = {
      // Navigation Icons
      'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'chart-pie': 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9.164A9.004 9.004 0 0112.02 3.05v6.114h8.468z',
      'briefcase': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      'cube': 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'shopping-bag': 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      'shopping-cart': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8m0 0a2 2 0 100-4 2 2 0 000 4zm-8 0a2 2 0 100-4 2 2 0 000 4z',
      'cog-6-tooth': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'beaker': 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      'book-open': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'tag': 'M7 7h.01M7 3h5a4 4 0 014 4v5.586a1 1 0 01-.293.707l-7 7a2 2 0 01-2.828 0l-4.586-4.586a2 2 0 010-2.828l7-7A1 1 0 017.586 3H7z',
      'chevron-right': 'M9 5l7 7-7 7',
      
      // Additional common icons
      'menu': 'M4 6h16M4 12h16M4 18h16',
      'menu-open': 'M4 6h16M4 12h8m-8 6h16',
      'x': 'M6 18L18 6M6 6l12 12',
      'check': 'M5 13l4 4L19 7',
      'plus': 'M12 4v16m8-8H4',
      'minus': 'M20 12H4',
      'pencil': 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
      'trash': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      'download': 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
      'upload': 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
      'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      'filter': 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
      'refresh': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'eye': 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      'eye-off': 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21',
      'external-link': 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
    };
    
    return icons[this.iconName] || '';
  }
  
  get secondaryPath(): string | null {
    // Icons that need multiple paths
    const secondaryPaths: Record<string, string> = {
      'cube': 'M3 8l9-5v13l-9-5V8z M21 8l-9-5v13l9-5V8z M3 8l9 5 9-5M12 21V8'
    };
    
    return secondaryPaths[this.iconName] || null;
  }
}