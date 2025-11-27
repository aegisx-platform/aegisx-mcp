import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-typography-showcase',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './typography-showcase.component.html',
  styleUrl: './typography-showcase.component.scss',
})
export class TypographyShowcaseComponent {
  sampleCode = `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const user = {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
};

console.log(greet(user.name));`;

  tableData = [
    { element: 'H1', size: '36px', weight: '700', lineHeight: '1.2' },
    { element: 'H2', size: '30px', weight: '600', lineHeight: '1.3' },
    { element: 'H3', size: '24px', weight: '600', lineHeight: '1.4' },
    { element: 'H4', size: '20px', weight: '600', lineHeight: '1.5' },
    { element: 'Body', size: '15px', weight: '400', lineHeight: '1.7' },
    { element: 'Small', size: '14px', weight: '500', lineHeight: '1.6' },
  ];
}
