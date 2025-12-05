import { Route } from '@angular/router';

export const AUTH_ROUTES: Route[] = [
  {
    path: 'auth',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/auth/auth-doc.component'
      ).then((m) => m.AuthDocComponent),
    data: {
      title: 'Authentication',
      description:
        'Authentication components including Login, Register, and Social Login',
    },
  },
  {
    path: 'auth/examples/login',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/auth/examples/login-example.component'
      ).then((m) => m.LoginExampleComponent),
    data: {
      title: 'Login Example',
      description: 'Full page login example',
    },
  },
  {
    path: 'auth/examples/register',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/auth/examples/register-example.component'
      ).then((m) => m.RegisterExampleComponent),
    data: {
      title: 'Register Example',
      description: 'Full page register example',
    },
  },
  {
    path: 'auth/examples/forgot-password',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/auth/examples/forgot-password-example.component'
      ).then((m) => m.ForgotPasswordExampleComponent),
    data: {
      title: 'Forgot Password Example',
      description: 'Full page forgot password example',
    },
  },
  {
    path: 'auth/examples/reset-password',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/auth/examples/reset-password-example.component'
      ).then((m) => m.ResetPasswordExampleComponent),
    data: {
      title: 'Reset Password Example',
      description: 'Full page reset password example',
    },
  },
  {
    path: 'auth/examples/confirm-email',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/auth/examples/confirm-email-example.component'
      ).then((m) => m.ConfirmEmailExampleComponent),
    data: {
      title: 'Confirm Email Example',
      description: 'Full page email confirmation example',
    },
  },
];
