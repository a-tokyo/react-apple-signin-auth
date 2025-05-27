import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import pkgJson from '../../../package.json';
import AppleSigninButton from '../../../src';

import './Demo.css';

// Google AdSense component
const GoogleAd = () => {
  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.src =
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5266987079964279';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize ad after script loads
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ad-container">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5266987079964279"
        data-ad-slot="8959679920"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

function Demo() {
  const [authOptions, setAuthOptions] = useState({
    clientId: 'com.example.web',
    scope: 'email name',
    redirectURI: 'https://example.com',
    state: '',
    nonce: 'nonce',
    usePopup: true,
  });
  const [extraProps, setExtraProps] = useState({
    uiType: 'dark',
    className: 'apple-auth-btn',
    noDefaultStyle: false,
    buttonExtraChildren: 'Continue with Apple',
  });
  const [codeString, setCodeString] = useState('');

  /** Update code string */
  useEffect(() => {
    setCodeString(`import AppleSignin from 'react-apple-signin-auth';

/** Apple Signin button */
const MyAppleSigninButton = ({ ...rest }) => (
  <AppleSignin
    /** Auth options passed to AppleID.auth.init() */
    authOptions={{
      clientId: '${authOptions.clientId}',
      scope: '${authOptions.scope}',
      redirectURI: '${authOptions.redirectURI}',
      state: '${authOptions.state}',
      nonce: '${authOptions.nonce}',
      usePopup: ${authOptions.usePopup},
    }}
    /** General props */
    uiType="${extraProps.uiType}"${
      extraProps.className
        ? `\n    /** className */\n    className="${extraProps.className}"`
        : ''
    }${
      extraProps.noDefaultStyle
        ? `\n    /** Removes default style tag */\n    noDefaultStyle`
        : ''
    }${
      extraProps.buttonExtraChildren
        ? `\n    /** Allows to change the button's children, eg: for changing the button text */\n    buttonExtraChildren="${extraProps.buttonExtraChildren}"`
        : ''
    }
    /** Checkout README.md for further customization props. */
    /** Spread rest props if needed */
    {...rest}
  />
);

export default MyAppleSigninButton;
`);
  }, [authOptions, extraProps]);

  return (
    <article className="wrapper">
      <header>
        <h1>{pkgJson.name}</h1>
        <p>{pkgJson.description}</p>
      </header>
      <div className="container">
        <section>
          <h3>UI:</h3>
          <AppleSigninButton authOptions={authOptions} {...extraProps} />
          <h3>Code:</h3>
          <div className="code-ui">
            <SyntaxHighlighter language="javascript" style={atomDark}>
              {codeString}
            </SyntaxHighlighter>
          </div>
        </section>
        <section>
          <h2>Props</h2>
          <div className="options-container">
            <h3>Auth options</h3>
            <label htmlFor="clientId">Client ID:</label>
            <input
              type="text"
              placeholder="clientId"
              value={authOptions.clientId}
              onChange={({ target: { value } }) =>
                setAuthOptions((currVal) => ({ ...currVal, clientId: value }))
              }
            />
            <label htmlFor="scope">Scope:</label>
            <input
              type="text"
              placeholder="scope"
              value={authOptions.scope}
              onChange={({ target: { value } }) =>
                setAuthOptions((currVal) => ({ ...currVal, scope: value }))
              }
            />
            <label htmlFor="redirectURI">
              redirectURI - MUST NOT have a trailing slash:
            </label>
            <input
              type="text"
              placeholder="redirectURI"
              value={authOptions.redirectURI}
              onChange={({ target: { value } }) =>
                setAuthOptions((currVal) => ({
                  ...currVal,
                  redirectURI: value,
                }))
              }
            />
            <label htmlFor="redirectURI">State:</label>
            <input
              type="text"
              placeholder="state"
              value={authOptions.state}
              onChange={({ target: { value } }) =>
                setAuthOptions((currVal) => ({ ...currVal, state: value }))
              }
            />
            <label htmlFor="nonce">Nonce:</label>
            <input
              type="text"
              placeholder="nonce"
              value={authOptions.nonce}
              onChange={({ target: { value } }) =>
                setAuthOptions((currVal) => ({ ...currVal, nonce: value }))
              }
            />
            <div>
              <input
                type="checkbox"
                checked={authOptions.usePopup}
                onChange={({ target: { checked } }) =>
                  setAuthOptions((currVal) => ({
                    ...currVal,
                    usePopup: checked,
                  }))
                }
              />
              <label htmlFor="use_popup">Use Popup:</label>
            </div>
          </div>
          <div>
            <h3>UI props</h3>
            <div>
              Light:
              <input
                type="checkbox"
                checked={extraProps.uiType === 'light'}
                onChange={() =>
                  setExtraProps((currVal) => ({
                    ...currVal,
                    uiType: 'light',
                  }))
                }
              />
              Dark:
              <input
                type="checkbox"
                checked={extraProps.uiType === 'dark'}
                onChange={() =>
                  setExtraProps((currVal) => ({
                    ...currVal,
                    uiType: 'dark',
                  }))
                }
              />
            </div>
          </div>
          <div>
            className:
            <input
              type="text"
              value={extraProps.className}
              onChange={({ target: { value } }) =>
                setExtraProps((currVal) => ({
                  ...currVal,
                  className: value,
                }))
              }
            />
          </div>
          <div>
            noDefaultStyle:
            <input
              type="checkbox"
              checked={extraProps.noDefaultStyle}
              onChange={({ target: { checked } }) =>
                setExtraProps((currVal) => ({
                  ...currVal,
                  noDefaultStyle: checked,
                }))
              }
            />
          </div>
          <div>
            buttonExtraChildren:
            <input
              type="text"
              value={`${extraProps.buttonExtraChildren}`}
              onChange={({ target: { value } }) =>
                setExtraProps((currVal) => ({
                  ...currVal,
                  buttonExtraChildren: value,
                }))
              }
            />
          </div>
          <div>
            <h3>Extra props</h3>
            <div>
              <span>onSuccess</span>
              <span>onError</span>
              <span>skipScript</span>
              <span>iconProps</span>
              <span>render</span>
            </div>
          </div>
          <GoogleAd />
        </section>
      </div>
      <footer>
        Built with{' '}
        <span role="img" aria-label="love">
          ❤️
        </span>{' '}
        by <a href="https://ahmedtokyo.com">Ahmed Tokyo</a>
        <div>
          version:
          {pkgJson.version}
        </div>
      </footer>
    </article>
  );
}

export default Demo;
