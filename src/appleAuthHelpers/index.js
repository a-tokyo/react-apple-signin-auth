/** @flow */
import waitForVar from '../utils/waitForVar';

import type { AppleAuthOptions, AppleAuthResponse } from '../types';

const APPLE_SCRIPT_SRC: string =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

/**
 * Performs an apple ID signIn operation
 */
const signIn = ({
  authOptions,
}: {
  authOptions: AppleAuthOptions,
}): Promise<?AppleAuthResponse> =>
  /** wait for apple sript to load */
  waitForVar('AppleID').then(() => {
    /** Handle if appleID script was not loaded -- log + throw error to be caught below */
    if (!window.AppleID) {
      throw new Error('Error loading apple script');
    }
    /** Init apple auth */
    window.AppleID.auth.init(authOptions);
    /** Signin to appleID */
    return window.AppleID.auth.signIn();
  });
export default {
  APPLE_SCRIPT_SRC,
  signIn,
};
