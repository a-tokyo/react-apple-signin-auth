/** @flow */
import waitForVar from '../utils/waitForVar';

import type { AppleAuthOptions, AppleAuthResponse } from '../types';

/**
 * Performs an apple ID signIn operation
 */
const signIn = async ({
  authOptions,
  onSuccess,
  onError,
}: {
  authOptions: AppleAuthOptions,
  onSuccess?: Function,
  onError?: Function,
}): Promise<?AppleAuthResponse> => {
  try {
    /** wait for apple sript to load */
    await waitForVar('AppleID');
    /** Handle if appleID script was not loaded -- log + throw error to be caught below */
    if (!window.AppleID) {
      console.error(new Error('Error loading apple script'));
    }
    /** Init apple auth */
    window.AppleID.auth.init(authOptions);
    /** Signin to appleID */
    const response = await window.AppleID.auth.signIn();
    /** This is only called in case usePopup is true */
    if (onSuccess) {
      onSuccess(response);
    }
    /** resolve with the reponse */
    return response;
  } catch (err) {
    if (onError) {
      /** Call onError catching the error */
      onError(err);
    } else {
      /** Log the error to help debug */
      console.error(err);
    }
  }
};

export default {
  signIn,
};
