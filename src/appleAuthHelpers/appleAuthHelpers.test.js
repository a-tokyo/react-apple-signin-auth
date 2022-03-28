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

  it.only('should throw error if apple script is not loaded', async () => {
    window.AppleID = null;
    const input = {
      authOptions: _authOptions,
      onError: jest.fn(),
    };
    let error;
    try {
      const response = await appleAuthHelpers.signIn(input);
      expect(response).toBeNull();
    } catch (err) {
      error = err;
    }
    expect(error).toEqual(expect.any(Error));
    expect(error.message).toEqual('Error loading apple script');
  });

  it('should throw error if apple signIn throws', async () => {
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
    let error;
    try {
      const response = await appleAuthHelpers.signIn(input);
      expect(response).toBeNull();
    } catch (err) {
      error = err;
    }
    expect(error).toEqual(expect.any(Error));
    expect(error.message).toEqual('test error');
  });

  it('should throw error if apple init throws', async () => {
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
    let error;
    try {
      const response = await appleAuthHelpers.signIn(input);
      expect(response).toBeNull();
    } catch (err) {
      error = err;
    }
    expect(error).toEqual(expect.any(Error));
    expect(error.message).toEqual('test error');
  });

  it('should resolve with response on success', async () => {
    const input = {
      authOptions: _authOptions,
      onSuccess: jest.fn(),
    };
    const response = await appleAuthHelpers.signIn(input);

    expect(response).toEqual(AppleIDAuthSignInFnResponse);
  });
});
