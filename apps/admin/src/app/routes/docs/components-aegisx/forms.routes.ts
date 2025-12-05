/**
 * Forms Routes
 *
 * IMPORTANT: Dynamic imports MUST use static string paths.
 * Template literals with variables do NOT work with Webpack/Angular.
 */

import { Route } from '@angular/router';

export const FORMS_ROUTES: Route[] = [
  {
    path: 'forms/date-picker',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/forms/date-picker/date-picker-doc.component'
      ).then((m) => m.DatePickerDocComponent),
    data: {
      title: 'Date Picker',
      description: 'Date picker component',
    },
  },
  {
    path: 'forms/file-upload',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/forms/file-upload/file-upload-doc.component'
      ).then((m) => m.FileUploadDocComponent),
    data: {
      title: 'File Upload',
      description: 'File upload component',
    },
  },
  {
    path: 'forms/popup-edit',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/forms/popup-edit/popup-edit-doc.component'
      ).then((m) => m.PopupEditDocComponent),
    data: {
      title: 'Popup Edit',
      description: 'Popup edit component',
    },
  },
  {
    path: 'forms/knob',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/forms/knob/knob-doc.component'
      ).then((m) => m.KnobDocComponent),
    data: {
      title: 'Knob Component',
      description: 'Knob form component',
    },
  },
  {
    path: 'forms/time-slots',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/forms/time-slots/time-slots-doc.component'
      ).then((m) => m.TimeSlotsDocComponent),
    data: {
      title: 'Time Slots',
      description: 'Time slots component',
    },
  },
  {
    path: 'forms/scheduler',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/forms/scheduler/scheduler-doc.component'
      ).then((m) => m.SchedulerDocComponent),
    data: {
      title: 'Scheduler',
      description: 'Scheduler component',
    },
  },
  {
    path: 'forms/input-otp',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/forms/input-otp/input-otp-doc.component'
      ).then((m) => m.InputOtpDocComponent),
    data: {
      title: 'Input OTP',
      description: 'One-time password input component',
    },
  },
];
