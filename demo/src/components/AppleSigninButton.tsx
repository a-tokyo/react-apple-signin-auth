import React from 'react';

// Import the original Flow-based component directly
// @ts-ignore - Suppressing TypeScript error for Flow file import
import OriginalAppleSigninButton from '../../../src/AppleSigninButton/AppleSigninButton.jsx';

// TypeScript types equivalent to the Flow types
export interface AppleAuthOptions {
  /** Client ID - eg: 'com.example.com' */
  clientId: string;
  /** Requested scopes, seperated by spaces - eg: 'email name' */
  scope: string;
  /** Apple's redirectURI - must be one of the URIs you added to the serviceID */
  redirectURI: string;
  /** State string that is returned with the apple response */
  state?: string;
  /** Nonce */
  nonce?: string;
  /** Uses popup auth instead of redirection */
  usePopup?: boolean;
}

export interface AppleAuthResponse {
  authorization: {
    /** ID JWT */
    id_token: string;
    /** Grant code valid for 5m */
    code: string;
    /** State string passed to the request */
    state?: string;
  };
  /** Only provided by apple in the first request */
  user?: {
    email: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Props {
  authOptions: AppleAuthOptions;
  /** Called upon signin success in case authOptions.usePopup = true */
  onSuccess?: (response: AppleAuthResponse) => void;
  /** Called upon signin error */
  onError?: (error: any) => void;
  /** Skips loading the apple script if true */
  skipScript?: boolean;
  /** Apple image props */
  iconProps?: React.SVGProps<SVGSVGElement>;
  /** render function - called with all props - can be used to fully customize the UI */
  render?: (props: any) => React.ReactNode;
  /** UI type */
  uiType?: 'light' | 'dark';
  /** className */
  className?: string;
  /** prevents rendering of default styles */
  noDefaultStyle?: boolean;
  /** Allows to change the button's children, eg: for changing the button text */
  buttonExtraChildren?: string | React.ReactNode;
  /** Rest props */
  [key: string]: any;
}

// TypeScript wrapper for the Flow-based component
const AppleSigninButton: React.FC<Props> = (props) => {
  // Cast props to any to avoid Flow/TypeScript type conflicts
  return <OriginalAppleSigninButton {...(props as any)} />;
};

export default AppleSigninButton; 