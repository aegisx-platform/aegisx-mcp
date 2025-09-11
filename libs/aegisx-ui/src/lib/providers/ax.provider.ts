import { Provider } from '@angular/core';

export interface AxProviderConfig {
  ax?: unknown;
}

export function provideAx(_config: AxProviderConfig): Provider[] {
  return [];
}
