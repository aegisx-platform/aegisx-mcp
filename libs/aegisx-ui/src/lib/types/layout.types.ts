export interface AegisxLayoutConfig {
  navbar: {
    hidden: boolean;
    position: 'left' | 'right' | 'top';
    width: number;
    backgroundColor?: string;
    variant?: 'vertical' | 'horizontal';
  };
  toolbar: {
    hidden: boolean;
    position: 'above' | 'below' | 'none';
    height: number;
    backgroundColor?: string;
  };
  footer: {
    hidden: boolean;
    position: 'above' | 'below' | 'none';
    height: number;
    backgroundColor?: string;
  };
  sidepanel: {
    hidden: boolean;
    position: 'left' | 'right';
  };
  settings: {
    hidden: boolean;
  };
}

export interface AegisxBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}