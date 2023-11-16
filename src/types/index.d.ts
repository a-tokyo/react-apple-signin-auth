import { ReactNode } from 'react';

declare module 'react-apple-signin-auth' {
  export type AppleAuthOptions = {
    /** Client ID - eg: 'com.example.com' */
    clientId: string;
    /** Requested scopes, seperated by spaces - eg: 'email name' */
    scope: string;
    /** Apple's redirectURI - must be one of the URIs you added to the serviceID - the undocumented trick in apple docs is that you should call auth from a page that is listed as a redirectURI, localhost fails */
    redirectURI: string;
    /** State string that is returned with the apple response */
    state?: string;
    /** Nonce */
    nonce?: string;
    /** Uses popup auth instead of redirection */
    usePopup?: boolean;
  };

  export type AppleAuthResponse = {
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
  };

  export type AppleSignInButtonProps = {
    authOptions: AppleAuthOptions;
    /** Called upon signin success in case authOptions.usePopup = true -- which means auth is handled client side */
    onSuccess: Function;
    /** Called upon signin error */
    onError: Function;
    /** Skips loading the apple script if true */
    skipScript?: boolean;
    /** Apple image props */
    iconProps?: Object;
    /** render function - called with all props - can be used to fully customize the UI by rendering your own component  */
    render?: Function;
    /** UI type */
    uiType: 'light' | 'dark';
    /** className */
    className?: string | null | undefined;
    /** prevents rendering of default styles */
    noDefaultStyle?: boolean;
    /** Allows to change the button's children, eg: for changing the button text */
    buttonExtraChildren?: string | ReactNode;
    /** Rest is spread on the root button component */
  };

  export type SignInProps = {
    authOptions: AppleAuthOptions;
    onSuccess?: Function;
    onError?: Function;
  };

  function useScript(src: string | null | undefined): void;

  namespace appleAuthHelpers {
    let APPLE_SCRIPT_SRC: string;
    function signIn(props: SignInProps): Promise<AppleAuthResponse | null>;
  }

  function AppleSignInButton(props: AppleSignInButtonProps): JSX.Element;

  export default AppleSignInButton;
  export { appleAuthHelpers, useScript };
}
