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
const AppleIDAuthSignInFnResponse = { success: true };

describe('appleAuthHelpers', () => {
  let AppleIDAuthInitFn;
  let AppleIDAuthSignInFn;

  beforeEach(() => {
    /** Mock apple funcs */
    AppleIDAuthInitFn = jest.fn(() => true);
    AppleIDAuthSignInFn = jest.fn(() =>
      Promise.resolve(AppleIDAuthSignInFnResponse),
    );
    /** Mock window object */
    window.AppleID = {
      auth: {
        init: AppleIDAuthInitFn,
        signIn: AppleIDAuthSignInFn,
      },
    };
  });

  it('should export APPLE_SCRIPT_SRC', async () => {
    expect(appleAuthHelpers.APPLE_SCRIPT_SRC).toBe(
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
    );
  });

  it('should call apple functions with proper params upon signIn', async () => {
    const input = {
      authOptions: _authOptions,
    };
    await appleAuthHelpers.signIn(input);

    expect(window.AppleID.auth.init).toHaveBeenCalled();
    expect(window.AppleID.auth.init.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        ...input.authOptions,
      }),
    );
    expect(window.AppleID.auth.init.mock.calls[0]).toBeDefined();
  });

  it('should return undefined and log error if apple script is not loaded', async () => {
    window.AppleID = null;
    const input = {
      authOptions: _authOptions,
    };
    const response = await appleAuthHelpers.signIn(input);
    expect(response).toBeNull();
  });

  it('should return undefined and call onError if apple script is not loaded', async () => {
    window.AppleID = null;
    const input = {
      authOptions: _authOptions,
      onError: jest.fn(),
    };
    const response = await appleAuthHelpers.signIn(input);
    expect(response).toBeNull();
    expect(input.onError.mock.calls[0][0]).toEqual(expect.any(Error));
  });

  it('should return undefined and call onError if apple signIn throws', async () => {
    window.AppleID = {
      auth: {
        init: AppleIDAuthInitFn,
        signIn: () => Promise.reject(new Error('test error')),
      },
    };
    const input = {
      authOptions: _authOptions,
      onError: jest.fn(),
    };
    const response = await appleAuthHelpers.signIn(input);
    expect(input.onError.mock.calls[0][0]).toEqual(expect.any(Error));
    expect(input.onError.mock.calls[0][0].message).toEqual('test error');
    expect(response).toBeNull();
  });

  it('should return undefined and call onError if apple init throws', async () => {
    window.AppleID = {
      auth: {
        init: () => {
          throw new Error('test error');
        },
        signIn: AppleIDAuthSignInFn,
      },
    };
    const input = {
      authOptions: _authOptions,
      onError: jest.fn(),
    };
    const response = await appleAuthHelpers.signIn(input);
    expect(response).toBeNull();
    expect(input.onError.mock.calls[0][0]).toEqual(expect.any(Error));
  });

  it('should return undefined and log error if apple signIn throws', async () => {
    window.AppleID = {
      auth: {
        init: AppleIDAuthInitFn,
        signIn: () => Promise.reject(new Error('test error')),
      },
    };
    const input = {
      authOptions: _authOptions,
    };
    const response = await appleAuthHelpers.signIn(input);
    expect(response).toBeNull();
  });

  it('should return undefined and log error if apple init throws', async () => {
    window.AppleID = {
      auth: {
        init: () => {
          throw new Error('test error');
        },
        signIn: AppleIDAuthSignInFn,
      },
    };
    const input = {
      authOptions: _authOptions,
    };
    const response = await appleAuthHelpers.signIn(input);
    expect(response).toBeNull();
  });

  it('should call onSuccess upon success', async () => {
    const input = {
      authOptions: _authOptions,
      onSuccess: jest.fn(),
    };
    await appleAuthHelpers.signIn(input);

    expect(input.onSuccess.mock.calls[0][0]).toEqual(
      AppleIDAuthSignInFnResponse,
    );
  });
});
