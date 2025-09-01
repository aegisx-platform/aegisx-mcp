import { Directive, ElementRef, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

@Directive({
  selector: '[axScrollbar]',
  standalone: true
})
export class AegisxScrollbarDirective implements OnInit, OnDestroy {
  @Input() axScrollbar: 'auto' | 'thin' | 'none' = 'auto';
  @Input() scrollbarColor = 'rgba(0, 0, 0, 0.12)';
  @Input() scrollbarHoverColor = 'rgba(0, 0, 0, 0.24)';
  
  private _elementRef = inject(ElementRef);
  private _platform = inject(Platform);
  private _styleElement?: HTMLStyleElement;
  
  ngOnInit(): void {
    // Only apply custom scrollbar styles on non-mobile platforms
    if (!this._platform.IOS && !this._platform.ANDROID) {
      this.applyScrollbarStyles();
    }
  }
  
  ngOnDestroy(): void {
    if (this._styleElement) {
      this._styleElement.remove();
    }
  }
  
  private applyScrollbarStyles(): void {
    const element = this._elementRef.nativeElement as HTMLElement;
    const uniqueClass = `ax-scrollbar-${Math.random().toString(36).substr(2, 9)}`;
    
    element.classList.add(uniqueClass);
    element.classList.add('ax-scrollbar');
    
    // Create style element for this specific instance
    this._styleElement = document.createElement('style');
    
    const styles = this.generateScrollbarStyles(uniqueClass);
    this._styleElement.textContent = styles;
    
    document.head.appendChild(this._styleElement);
    
    // Apply overflow styles
    if (this.axScrollbar !== 'none') {
      element.style.overflow = 'auto';
    }
  }
  
  private generateScrollbarStyles(className: string): string {
    if (this.axScrollbar === 'none') {
      return `
        .${className} {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .${className}::-webkit-scrollbar {
          display: none;
        }
      `;
    }
    
    const width = this.axScrollbar === 'thin' ? '6px' : '10px';
    const borderRadius = this.axScrollbar === 'thin' ? '3px' : '5px';
    
    return `
      .${className} {
        scrollbar-width: ${this.axScrollbar};
        scrollbar-color: ${this.scrollbarColor} transparent;
      }
      
      .${className}::-webkit-scrollbar {
        width: ${width};
        height: ${width};
      }
      
      .${className}::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .${className}::-webkit-scrollbar-thumb {
        background: ${this.scrollbarColor};
        border-radius: ${borderRadius};
        transition: background 0.2s;
      }
      
      .${className}::-webkit-scrollbar-thumb:hover {
        background: ${this.scrollbarHoverColor};
      }
      
      .${className}::-webkit-scrollbar-corner {
        background: transparent;
      }
    `;
  }
}