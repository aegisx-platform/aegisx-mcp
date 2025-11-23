import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import {
  AxFieldDisplayComponent,
  AxDescriptionListComponent,
} from '@aegisx/ui';

@Component({
  selector: 'app-data-display-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    AxFieldDisplayComponent,
    AxDescriptionListComponent,
  ],
  templateUrl: './data-display-demo.component.html',
  styleUrls: ['./data-display-demo.component.scss'],
})
export class DataDisplayDemoComponent {
  userProfile = {
    fullName: 'Sathit Seethaphon',
    email: 'sathit@example.com',
    phone: '0991234567',
    website: 'https://example.com',
    role: 'Administrator',
    department: 'Engineering',
    joinDate: new Date('2024-01-15'),
    salary: 85000,
    performanceScore: 92.5,
    isActive: true,
  };

  orderData = {
    id: 'ORD-2024-001',
    customer: 'John Doe',
    email: 'john@example.com',
    phone: '0881234567',
    orderDate: new Date('2024-11-01'),
    deliveryDate: new Date('2024-11-10'),
    status: 'Delivered',
    subtotal: 1250.0,
    tax: 87.5,
    shipping: 50.0,
    total: 1387.5,
    itemCount: 3,
  };
}
