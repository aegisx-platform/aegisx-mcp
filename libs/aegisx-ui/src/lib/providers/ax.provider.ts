import { Provider } from '@angular/core';

export interface AxProviderConfig {
  ax?: any;
}

export function provideAx(config: AxProviderConfig): Provider[] {
  return [];
}
