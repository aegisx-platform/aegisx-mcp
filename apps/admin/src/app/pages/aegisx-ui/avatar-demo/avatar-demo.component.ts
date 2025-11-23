import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AxAvatarComponent } from '@aegisx/ui';

@Component({
  selector: 'app-avatar-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    AxAvatarComponent,
  ],
  templateUrl: './avatar-demo.component.html',
  styleUrls: ['./avatar-demo.component.scss'],
})
export class AvatarDemoComponent {}
