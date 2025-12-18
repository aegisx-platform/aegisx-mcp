import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LoadingBarService } from './loading-bar.service';
import { LoadingBarVariant } from './loading-bar.types';

@Component({
  selector: 'ax-loading-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-bar.component.html',
  styleUrls: ['./loading-bar.component.scss'],
})
export class AxLoadingBarComponent implements OnInit {
  @Input() variant: LoadingBarVariant = 'primary';
  @Input() height: number = 3;

  loading$!: Observable<boolean>;
  progress$!: Observable<number>;

  private loadingBarService = inject(LoadingBarService);

  ngOnInit(): void {
    this.loading$ = this.loadingBarService.getLoading();
    this.progress$ = this.loadingBarService.getProgress();
  }

  get barClasses(): string {
    const classes = ['ax-loading-bar', `ax-loading-bar-${this.variant}`];
    return classes.join(' ');
  }

  get barStyles(): Record<string, string> {
    return {
      height: `${this.height}px`,
    };
  }

  getProgressStyles(progress: number): Record<string, string> {
    return {
      width: `${progress}%`,
    };
  }
}
