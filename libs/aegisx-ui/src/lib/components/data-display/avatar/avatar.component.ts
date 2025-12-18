import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarSize, AvatarShape } from './avatar.types';

@Component({
  selector: 'ax-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AxAvatarComponent {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() name: string = '';
  @Input() size: AvatarSize = 'md';
  @Input() shape: AvatarShape = 'circle';

  imageError = false;

  get avatarClasses(): string {
    const classes = ['ax-avatar'];
    classes.push(`ax-avatar-${this.size}`);
    classes.push(`ax-avatar-${this.shape}`);
    return classes.join(' ');
  }

  get initials(): string {
    if (!this.name) return '';
    const parts = this.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  }

  onImageError(): void {
    this.imageError = true;
  }
}
