import React from 'react';
import AppleSigninButton from './AppleSigninButton';

const authOptions = {
  clientId: 'com.example.web',
  scope: 'email name',
  redirectURI: 'https://example.com',
  state: 'state',
  nonce: 'nonce',
  usePopup: true,
};

const setupAppleSigninButton = (overrideProps) => (
  <AppleSigninButton authOptions={authOptions} {...overrideProps} />
);

const _originalAppleId = global.AppleID;

describe('<AppleSigninButton />', () => {
  beforeEach(() => {
    global.AppleID = {
      auth: {
        signIn: jest.fn(() => Promise.resolve({ is_test: true })),
      },
    };
  });

  afterAll(() => {
    if (_originalAppleId) {
      global.AppleID = _originalAppleId;
    } else {
      delete global.AppleID;
    }
  });

  it('renders basic props correctly', () => {
    const wrapper = global.shallow(setupAppleSigninButton());

    expect(wrapper).toMatchSnapshot();
  });

  it('skips script addition via prop', () => {
    const wrapper = global.shallow(
      setupAppleSigninButton({
        skipScript: true,
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('render UI type properly', () => {
    const wrapperLight = global.shallow(
      setupAppleSigninButton({
        uiType: 'light',
      }),
    );

    expect(wrapperLight).toMatchSnapshot();
    const wrapperDark = global.shallow(
      setupAppleSigninButton({
        uiType: 'dark',
      }),
    );

    expect(wrapperDark).toMatchSnapshot();
  });

  it('should use render prop', () => {
    const wrapper = global.shallow(
      setupAppleSigninButton({
        render: (props) => <button type="button" id="test-btn" {...props} />,
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('pass icon props to svg', () => {
    const wrapper = global.shallow(
      setupAppleSigninButton({
        iconProps: {
          width: '30px',
        },
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('gracefully handles falsy authOptions', () => {
    const wrapper = global.shallow(
      setupAppleSigninButton({
        authOptions: null,
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('handle the prop noDefaultStyle', () => {
    const wrapper = global.shallow(
      setupAppleSigninButton({
        noDefaultStyle: true,
        className: 'test_classname',
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('handle the prop buttonExtraChildren string', () => {
    const wrapper = global.shallow(
      setupAppleSigninButton({
        buttonExtraChildren: 'Sign up with Apple',
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('handle the prop buttonExtraChildren node', () => {
    const wrapper = global.shallow(
      setupAppleSigninButton({
        buttonExtraChildren: <span>Sign up with Apple</span>,
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('handle the prop className', () => {
    const wrapper = global.shallow(
      setupAppleSigninButton({
        noDefaultStyle: true,
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });
});
