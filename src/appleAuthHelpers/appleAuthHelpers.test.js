import appleAuthHelpers from '.';

/** Demo auth options */
const _authOptions = {
  clientId: 'com.example.web',
  scope: 'email name',
  redirectURI: 'https://example.com',
  state: 'state',
  nonce: 'nonce',
  usePopup: true,
};
/** Response */
const AppleIDAuthSigninFnResponse = { success: true };

describe('appleAuthHelpers', () => {
  let AppleIDAuthInitFn;
  let AppleIDAuthSigninFn;

  beforeEach(() => {
    /** Mock apple funcs */
    AppleIDAuthInitFn = jest.fn(() => Promise.resolve(true));
    AppleIDAuthSigninFn = jest.fn(() => Promise.resolve(AppleIDAuthSigninFnResponse));
    /** Mock window object */
    window.AppleID = {
      auth: {
        init: AppleIDAuthInitFn,
        signIn: AppleIDAuthSigninFn,
      },
    };
  });

  it('should call apple functions with proper params upon signin', async () => {
    const input = {
      authOptions: _authOptions,
    };
    await appleAuthHelpers.signin(input);

    expect(window.AppleID.auth.init).toHaveBeenCalled();
    expect(window.AppleID.auth.init.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        ...input.authOptions,
      }),
    );
    expect(window.AppleID.auth.init.mock.calls[0]).toBeDefined();
  });

  it('should return undefined and call onError if apple script is not loaded', async () => {
    window.AppleID = null;
    const input = {
      authOptions: _authOptions,
      onError: jest.fn(),
    };
    const response = await appleAuthHelpers.signin(input);
    expect(response).toBeUndefined();
    expect(input.onError.mock.calls[0][0]).toEqual(expect.any(Error))
  });

  it('should call onSuccess upon success', async () => {
    const input = {
      authOptions: _authOptions,
      onSuccess: jest.fn(),
    };
    await appleAuthHelpers.signin(input);

    expect(input.onSuccess.mock.calls[0][0]).toEqual(AppleIDAuthSigninFnResponse);
  });
});
