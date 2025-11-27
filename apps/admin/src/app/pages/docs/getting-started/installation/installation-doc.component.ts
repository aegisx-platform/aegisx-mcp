import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CodeBlockComponent } from '../../../../components/code-block/code-block.component';
import { DocHeaderComponent } from '../../../../components/docs';

/**
 * Installation Page - Setup and installation guide
 * Location: docs/getting-started/installation
 */
@Component({
  selector: 'ax-installation-doc',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CodeBlockComponent,
    DocHeaderComponent,
  ],
  templateUrl: './installation-doc.component.html',
  styleUrl: './installation-doc.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class InstallationDocComponent {
  // Installation commands
  readonly npmInstall = `npm install @aegisx/ui @angular/material@18`;
  readonly pnpmInstall = `pnpm add @aegisx/ui @angular/material@18`;

  // Angular configuration
  readonly angularConfig = `{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/@angular/material/prebuilt-themes/azure-blue.css",
              "node_modules/@aegisx/ui/styles/aegisx-light.css",
              "src/styles.scss"
            ]
          }
        }
      }
    }
  }
}`;

  // App config example
  readonly appConfig = `import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
  ],
};`;

  // Theme import example
  readonly themeImport = `@import '@aegisx/ui/styles/aegisx-light.css';

/* Your custom styles */
:root {
  /* Override design tokens if needed */
  --ax-brand-default: #your-brand-color;
}`;

  // Component usage example
  readonly componentUsage = `import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-example',
  imports: [MatButtonModule, MatCardModule],
  template: \`
    <mat-card>
      <mat-card-content>
        <h2>Hello AegisX!</h2>
        <button mat-raised-button color="primary">
          Get Started
        </button>
      </mat-card-content>
    </mat-card>
  \`,
})
export class ExampleComponent {}`;

  requirements = [
    { name: 'Angular', version: '18.0.0 or higher', icon: 'code' },
    { name: 'Angular Material', version: '18.0.0 or higher', icon: 'palette' },
    { name: 'Node.js', version: '20.0.0 or higher', icon: 'dns' },
    { name: 'npm/pnpm', version: 'Latest', icon: 'package' },
  ];
}
