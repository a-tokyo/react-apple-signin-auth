import * as React from 'react';

declare module 'react-apple-signin-auth' {
  import type { ComponentType } from 'react';
  
  export type AppleSignInProps = {
    authOptions: {
      clientId: string;
      scope: string;
      redirectURI: string;
      state?: string;
      nonce?: string;
      usePopup?: boolean;
    };
    uiType?: 'light' | 'dark';
    className?: string;
    noDefaultStyle?: boolean;
    buttonExtraChildren?: any;
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
  };

  const AppleSigninButton: ComponentType<AppleSignInProps>;
  export default AppleSigninButton;
} 