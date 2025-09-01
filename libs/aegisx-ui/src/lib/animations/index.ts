import {
  animate,
  AnimationTriggerMetadata,
  group,
  query,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

// Expand/Collapse Animation
export const expandCollapse: AnimationTriggerMetadata = trigger('expandCollapse', [
  state('collapsed, void', 
    style({
      height: '0',
      overflow: 'hidden',
      opacity: '0',
    })
  ),
  state('expanded', 
    style({
      height: '*',
      overflow: 'hidden',
      opacity: '1',
    })
  ),
  transition('collapsed <=> expanded', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
]);

// Fade In/Out Animations
export const fadeIn: AnimationTriggerMetadata = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 })),
  ]),
]);

export const fadeOut: AnimationTriggerMetadata = trigger('fadeOut', [
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 })),
  ]),
]);

// Slide Animations
export const slideInLeft: AnimationTriggerMetadata = trigger('slideInLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0%)' })),
  ]),
]);

export const slideInRight: AnimationTriggerMetadata = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0%)' })),
  ]),
]);

export const slideInTop: AnimationTriggerMetadata = trigger('slideInTop', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateY(0%)' })),
  ]),
]);

export const slideInBottom: AnimationTriggerMetadata = trigger('slideInBottom', [
  transition(':enter', [
    style({ transform: 'translateY(100%)' }),
    animate('300ms ease-out', style({ transform: 'translateY(0%)' })),
  ]),
]);

// Zoom Animations
export const zoomIn: AnimationTriggerMetadata = trigger('zoomIn', [
  transition(':enter', [
    style({ transform: 'scale(0)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
  ]),
]);

export const zoomOut: AnimationTriggerMetadata = trigger('zoomOut', [
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'scale(0)', opacity: 0 })),
  ]),
]);

// Router Animations
export const routerTransition: AnimationTriggerMetadata = trigger('routerTransition', [
  transition('* <=> *', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
    group([
      query(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' })),
      ], { optional: true }),
      query(':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('0.5s ease-in-out', style({ transform: 'translateX(-100%)' })),
      ], { optional: true }),
    ]),
  ]),
]);

// Shake Animation
export const shake: AnimationTriggerMetadata = trigger('shake', [
  transition('* => *', [
    animate('0.5s', 
      style({ transform: 'translate3d(-1px, 0, 0)' })
    ),
    animate('0.5s', 
      style({ transform: 'translate3d(2px, 0, 0)' })
    ),
    animate('0.5s', 
      style({ transform: 'translate3d(-4px, 0, 0)' })
    ),
    animate('0.5s', 
      style({ transform: 'translate3d(4px, 0, 0)' })
    ),
    animate('0.5s', 
      style({ transform: 'translate3d(0, 0, 0)' })
    ),
  ]),
]);

// Export all animations
export const aegisxAnimations = [
  expandCollapse,
  fadeIn,
  fadeOut,
  slideInLeft,
  slideInRight,
  slideInTop,
  slideInBottom,
  zoomIn,
  zoomOut,
  routerTransition,
  shake,
];