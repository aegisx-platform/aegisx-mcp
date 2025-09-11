import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconsService {
  private _domSanitizer = inject(DomSanitizer);
  private _matIconRegistry = inject(MatIconRegistry);

  constructor() {
    this.registerIcons();
  }

  registerIcons(): void {
    // Register icon sets
    this._matIconRegistry.addSvgIconSet(
      this._domSanitizer.bypassSecurityTrustResourceUrl('icons/heroicons-outline.svg')
    );
    this._matIconRegistry.addSvgIconSetInNamespace(
      'heroicons_outline',
      this._domSanitizer.bypassSecurityTrustResourceUrl('icons/heroicons-outline.svg')
    );
    this._matIconRegistry.addSvgIconSetInNamespace(
      'heroicons_solid',
      this._domSanitizer.bypassSecurityTrustResourceUrl('icons/heroicons-solid.svg')
    );
  }
}