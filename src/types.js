/* @flow */

export type AppleAuthOptions = {
  /** Client ID - eg: 'com.example.com' */
  clientId: string,
  /** Requested scopes, seperated by spaces - eg: 'email name' */
  scope: string,
  /** Apple's redirectURI - must be one of the URIs you added to the serviceID - the undocumented trick in apple docs is that you should call auth from a page that is listed as a redirectURI, localhost fails */
  redirectURI: string,
  /** State string that is returned with the apple response */
  state?: string,
  /** Nonce */
  nonce?: string,
  /** Uses popup auth instead of redirection */
  usePopup?: boolean,
};

export type AppleAuthResponse = {
  authorization: {
    /** ID JWT */
    id_token: string,
    /** Grant code valid for 5m */
    code: string,
    /** State string passed to the request */
    state?: string,
  },
  /** Only provided by apple in the first request */
  user?: {
    email: string,
    name: {
      firstName: string,
      lastName: string,
    },
  },
};
