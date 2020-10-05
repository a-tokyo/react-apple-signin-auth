/** @flow */
import waitForVar from './utils/waitForVar';

import type { AppleAuthOptions, AppleAuthResponse } from './types';

/**
 * Performs an apple ID signin operation
 */
const signin = async ({
  authOptions,
  onSuccess,
  onError,
}: {
  authOptions: AppleAuthOptions,
  onSuccess?: Function,
  onError?: Function,
} = {}): Promise<?AppleAuthResponse> => {
  try {
    await waitForVar('AppleID');
    if (!window.AppleID) {
      console.error(new Error('Error loading apple script'));
    }
    window.AppleID.auth.init(authOptions);
    const response = await window.AppleID.auth.signIn();
    /** This is only called in case usePopup is true */
    if (onSuccess) {
      onSuccess(response);
    }
    return response;
  } catch (err) {
    if (onError) {
      onError(err);
    } else {
      console.error(err);
    }
  }
};

export default {
  signin,
};
