import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

@Component({
  selector: 'app-breadcrumb-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    AxBreadcrumbComponent,
  ],
  templateUrl: './breadcrumb-demo.component.html',
  styleUrls: ['./breadcrumb-demo.component.scss'],
})
export class BreadcrumbDemoComponent {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Components', url: '/components' },
    { label: 'Showcase' },
  ];
}
