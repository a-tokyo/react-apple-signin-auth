import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import './Demo.css';

import AppleSigninButton from '../../../src';

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
  });
  const [codeString, setCodeString] = useState('');

  /** Update code string */
  useEffect(() => {
    setCodeString(`import AppleSignin from 'react-apple-signin';

/** Apple Signin button */
const MyAppleSigninButton = () => {
  return (
    <AppleSignin
      /** Auth options passed to AppleID.auth.init() */
      authOptions={{
        clientId: '${authOptions.clientId}',
        scope: '${authOptions.scope}',
        redirectURI: '${authOptions.redirectURI}',
        state: '${authOptions.state}',
        usePopup: ${authOptions.usePopup},
      }}
      /** General props */
      uiType="${extraProps.uiType}"
      /** Checkout README.md for further customization props. */
    />
  );
};

export default MyAppleSigninButton;
`);
  }, [authOptions, extraProps]);

  return (
    <div className="App">
      <h1>React-apple-signin</h1>
      <p>Apple signin for React using Apple's official JS SDK.</p>
      <div className="container">
        <div>
          <h3>UI:</h3>
          <AppleSigninButton authOptions={authOptions} {...extraProps} />
          <h3>Code:</h3>
          <div className="code-ui">
            <SyntaxHighlighter language="javascript" style={atomDark}>
              {codeString}
            </SyntaxHighlighter>
          </div>
        </div>
        <div>
          <h2>Props</h2>
          <div className="options-container">
            <h3>Auth options</h3>
            <label>Client ID:</label>
            <input
              type="text"
              placeholder="clientId"
              value={authOptions.clientId}
              onChange={({ target: { value } }) =>
                setAuthOptions((currVal) => ({ ...currVal, clientId: value }))
              }
            />
            <label>Scope:</label>
            <input
              type="text"
              placeholder="scope"
              value={authOptions.scope}
              onChange={({ target: { value } }) =>
                setAuthOptions((currVal) => ({ ...currVal, scope: value }))
              }
            />
            <label>redirectURI - MUST NOT have a trailing slash:</label>
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
            <label>State:</label>
            <input
              type="text"
              placeholder="state"
              value={authOptions.state}
              onChange={({ target: { value } }) =>
                setAuthOptions((currVal) => ({ ...currVal, state: value }))
              }
            />
            <label>Nonce:</label>
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
              <label>Use Popup:</label>
            </div>
          </div>
          <div>
            <h3>UI props</h3>
            <div>
              Light:
              <input
                type="checkbox"
                checked={extraProps.uiType === 'light'}
                onChange={({ target: { checked } }) =>
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
                onChange={({ target: { checked } }) =>
                  setExtraProps((currVal) => ({
                    ...currVal,
                    uiType: 'dark',
                  }))
                }
              />
            </div>
          </div>
          <div>
            <h3>Extra props</h3>
            <div>
              <div>onSuccess</div>
              <div>onError</div>
              <div>skipScript</div>
              <div>imgProps</div>
              <div>render</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Demo;
