/* @flow */
import AppleSigninButton, { appleAuthHelpers, useScript } from './index';

describe('index', () => {
  it('exports all modules', () => {
    expect(AppleSigninButton).toEqual(expect.any(Function));
    expect(appleAuthHelpers).toEqual(expect.any(Object));
    expect(useScript).toEqual(expect.any(Function));
  });
});
