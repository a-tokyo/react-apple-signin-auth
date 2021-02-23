import React from 'react';
import { shallow } from 'enzyme';
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

describe('<AppleSigninButton />', () => {
  it('renders basic props correctly', () => {
    const wrapper = shallow(setupAppleSigninButton());

    expect(wrapper).toMatchSnapshot();
  });

  it('skips script addition via prop', () => {
    const wrapper = shallow(
      setupAppleSigninButton({
        skipScript: true,
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('render UI type properly', () => {
    const wrapperLight = shallow(
      setupAppleSigninButton({
        uiType: 'light',
      }),
    );

    expect(wrapperLight).toMatchSnapshot();
    const wrapperDark = shallow(
      setupAppleSigninButton({
        uiType: 'dark',
      }),
    );

    expect(wrapperDark).toMatchSnapshot();
  });

  it('should use render prop', () => {
    const wrapper = shallow(
      setupAppleSigninButton({
        render: (props) => <button id="test-btn" {...props} />,
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('pass icon props to svg', () => {
    const wrapper = shallow(
      setupAppleSigninButton({
        iconProps: {
          width: '30px',
        },
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('gracefully handles falsy authOptions', () => {
    const wrapper = shallow(
      setupAppleSigninButton({
        authOptions: null,
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('handle the prop noDefaultStyle', () => {
    const wrapper = shallow(
      setupAppleSigninButton({
        noDefaultStyle: true,
        className: 'test_classname',
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('handle the prop className', () => {
    const wrapper = shallow(
      setupAppleSigninButton({
        noDefaultStyle: true,
      }),
    );

    expect(wrapper).toMatchSnapshot();
  });
});
