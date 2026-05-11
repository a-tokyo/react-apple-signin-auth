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
  onSuccess,
  onError,
}: {
  authOptions: AppleAuthOptions,
  onSuccess?: Function,
  onError?: Function,
}): Promise<?AppleAuthResponse> =>
  /** wait for apple sript to load */
  waitForVar('AppleID')
    .then(() => {
      /** Handle if appleID script was not loaded -- log + throw error to be caught below */
      if (!window.AppleID) {
        console.error(new Error('Error loading apple script'));
      }
      /** Init apple auth */
      window.AppleID.auth.init(authOptions);
      /** Signin to appleID */
      const signInPromise = window.AppleID.auth.signIn();
      /**
       * In redirect mode (!usePopup) the Apple SDK navigates the page away.
       * The returned promise can reject spuriously during/after navigation,
       * which would flash onError before the redirect happens. Skip handlers
       * in that case onSuccess/onError are popup-only by design.
       */
      if (!authOptions.usePopup) {
        /** Swallow rejection to avoid unhandled promise warnings during navigation. */
        if (signInPromise && typeof signInPromise.catch === 'function') {
          signInPromise.catch(() => {});
        }
        return null;
      }
      return signInPromise
        .then((response) => {
          /** This is only called in case usePopup is true */
          if (onSuccess) {
            onSuccess(response);
          }
          /** resolve with the reponse */
          return response;
        })
        .catch((err) => {
          if (onError) {
            /** Call onError catching the error */
            onError(err);
          } else {
            /** Log the error to help debug */
            console.error(err);
          }
          return null;
        });
    })
    .catch((err) => {
      if (onError) {
        /** Call onError catching the error */
        onError(err);
      } else {
        /** Log the error to help debug */
        console.error(err);
      }

      return null;
    });
export default {
  APPLE_SCRIPT_SRC,
  signIn,
};
