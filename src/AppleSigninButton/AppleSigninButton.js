/** @flow */
import React from 'react';

import useScript from '../hooks/useScript';

import appleAuthHelpers from '../appleAuthHelpers';

import type { AppleAuthOptions } from '../types';

type Props = {
  authOptions: AppleAuthOptions,
  /** Called upon signin success in case authOptions.usePopup = true -- which means auth is handled client side */
  onSuccess: Function,
  /** Called upon signin error */
  onError: Function,
  /** Skips loading the apple script if true */
  skipScript?: boolean,
  /** Apple image props */
  iconProps: Object,
  /** render function - called with all props - can be used to fully customize the UI by rendering your own component  */
  render?: Function,
  /** UI type */
  uiType: 'light' | 'dark',
  /** className */
  className?: ?string,
  /** prevents rendering of default styles */
  noDefaultStyle?: boolean,
  /** Allows to change the button's children, eg: for changing the button text */
  buttonExtraChildren?: string | React$Node,
  /** Rest is spread on the root button component */
};

/** css styles */
const _style = `
.react-apple-signin-auth-btn {
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 4px;
  padding: 0 8px 0 2px;
  font-size: 14px;
  font-size: 1em;
  line-height: 1;
  border: 1px solid #000;
  overflow: hidden;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.react-apple-signin-auth-btn-light {
  background-color: #FFF;
  color: #000;
  border-color: #000;
}
.react-apple-signin-auth-btn-dark {
  background-color: #000;
  color: #FFF;
  border-color: #FFF;
}`.replace(/ {2}|\n/g, '');

const AppleSigninButton = ({
  onSuccess,
  onError,
  skipScript = false,
  authOptions,
  iconProps,
  render,
  uiType = 'dark',
  className,
  noDefaultStyle = false,
  buttonExtraChildren = 'Continue with Apple',
  ...rest
}: Props) => {
  /** load script if neccessary */
  useScript(skipScript ? null : appleAuthHelpers.APPLE_SCRIPT_SRC);

  /** Button click handler */
  const handleClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    appleAuthHelpers.signIn({ authOptions, onSuccess, onError });
  };

  /** common props */
  const props = {
    children: (
      <>
        <svg width="24px" height="44px" viewBox="0 0 24 44" {...iconProps}>
          <g
            id="Left-Black-Logo-Small"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd">
            <rect
              id="Rectangle"
              fill={uiType === 'light' ? '#FFF' : '#000'}
              x="0"
              y="0"
              width="24"
              height="44"
            />
            <path
              d="M12.2337427,16.9879688 C12.8896607,16.9879688 13.7118677,16.5445313 14.2014966,15.9532812 C14.6449341,15.4174609 14.968274,14.6691602 14.968274,13.9208594 C14.968274,13.8192383 14.9590357,13.7176172 14.9405591,13.6344727 C14.2107349,13.6621875 13.3330982,14.1241016 12.8065162,14.7430664 C12.3907935,15.2142188 12.012024,15.9532812 12.012024,16.7108203 C12.012024,16.8216797 12.0305005,16.9325391 12.0397388,16.9694922 C12.0859302,16.9787305 12.1598365,16.9879688 12.2337427,16.9879688 Z M9.92417241,28.1662891 C10.8202857,28.1662891 11.2175318,27.5658008 12.3353638,27.5658008 C13.4716724,27.5658008 13.721106,28.1478125 14.7188404,28.1478125 C15.6980982,28.1478125 16.3540162,27.2424609 16.972981,26.3555859 C17.6658521,25.339375 17.9522388,24.3416406 17.9707154,24.2954492 C17.9060474,24.2769727 16.0306763,23.5101953 16.0306763,21.3576758 C16.0306763,19.491543 17.5088013,18.6508594 17.5919459,18.5861914 C16.612688,17.1819727 15.1253248,17.1450195 14.7188404,17.1450195 C13.6194849,17.1450195 12.7233716,17.8101758 12.1598365,17.8101758 C11.5501099,17.8101758 10.7463794,17.1819727 9.79483648,17.1819727 C7.98413335,17.1819727 6.14571538,18.6785742 6.14571538,21.5054883 C6.14571538,23.2607617 6.8293482,25.1176563 7.67003179,26.3186328 C8.39061773,27.3348438 9.01882085,28.1662891 9.92417241,28.1662891 Z"
              id=""
              fill={uiType === 'light' ? '#000' : '#FFF'}
              fillRule="nonzero"
            />
          </g>
        </svg>
        {buttonExtraChildren}
      </>
    ),
    onClick: handleClick,
    ...rest,
  };

  /** use render function if passed */
  if (render) {
    return render(props);
  }

  /** render button */
  return (
    <>
      <button
        className={`${
          noDefaultStyle
            ? ''
            : `react-apple-signin-auth-btn react-apple-signin-auth-btn-${uiType}`
        }${className ? ` ${className}` : ''}`}
        type="button"
        aria-label="Signin with apple ID"
        {...props}
      />
      {noDefaultStyle ? null : <style>{_style}</style>}
    </>
  );
};

export default AppleSigninButton;
