/* @flow */
import AppleSigninButton, { appleAuthHelpers } from './index';

describe('index', () => {
  it('exports all modules', () => {
    expect(AppleSigninButton).toEqual(expect.any(Function));
    expect(appleAuthHelpers).toEqual(expect.any(Object));
  });
});
