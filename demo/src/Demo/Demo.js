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
  const [copyButtonText, setCopyButtonText] = useState('Copy Code');

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

  // Function to copy code to clipboard
  const handleCopyCode = async () => {
    if (!navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(codeString);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy Code');
      }, 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy code: ', err);
      setCopyButtonText('Failed to copy');
      setTimeout(() => {
        setCopyButtonText('Copy Code');
      }, 2000);
    }
  };

  return (
    <article className="wrapper">
      <header>
        <div className="header-content">
          <h1>{pkgJson.name}</h1>
          <p>{pkgJson.description}</p>
        </div>
        <GoogleAd />
      </header>
      <div className="container">
        <section>
          <h3>UI:</h3>
          <div className="ui-buttons-row">
            <AppleSigninButton authOptions={authOptions} {...extraProps} />
            <iframe
              src="https://github.com/sponsors/a-tokyo/button"
              title="Sponsor a-tokyo"
              height="32"
              width="114"
              style={{ border: 0, borderRadius: '6px' }}
            />
          </div>
          <h3>Code:</h3>
          <div className="code-ui-container">
            <button
              type="button"
              onClick={handleCopyCode}
              className="copy-code-button">
              {copyButtonText}
            </button>
            <div className="code-ui">
              <SyntaxHighlighter language="javascript" style={atomDark}>
                {codeString}
              </SyntaxHighlighter>
            </div>
          </div>
        </section>
        <section>
          <h2>Props</h2>
          <div className="options-container">
            <h3>Auth options</h3>
            {/* Row 1: Client ID & Scope */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientId">Client ID:</label>
                <input
                  type="text"
                  id="clientId"
                  placeholder="clientId"
                  value={authOptions.clientId}
                  onChange={({ target: { value } }) =>
                    setAuthOptions((currVal) => ({
                      ...currVal,
                      clientId: value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="scope">Scope:</label>
                <input
                  type="text"
                  id="scope"
                  placeholder="scope"
                  value={authOptions.scope}
                  onChange={({ target: { value } }) =>
                    setAuthOptions((currVal) => ({ ...currVal, scope: value }))
                  }
                />
              </div>
            </div>

            {/* Row 2: Redirect URI & State */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="redirectURI">
                  redirectURI - MUST NOT have a trailing slash:
                </label>
                <input
                  type="text"
                  id="redirectURI"
                  placeholder="redirectURI"
                  value={authOptions.redirectURI}
                  onChange={({ target: { value } }) =>
                    setAuthOptions((currVal) => ({
                      ...currVal,
                      redirectURI: value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State:</label>
                <input
                  type="text"
                  id="state"
                  placeholder="state"
                  value={authOptions.state}
                  onChange={({ target: { value } }) =>
                    setAuthOptions((currVal) => ({ ...currVal, state: value }))
                  }
                />
              </div>
            </div>

            {/* Row 3: Nonce & Use Popup */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nonce">Nonce:</label>
                <input
                  type="text"
                  id="nonce"
                  placeholder="nonce"
                  value={authOptions.nonce}
                  onChange={({ target: { value } }) =>
                    setAuthOptions((currVal) => ({ ...currVal, nonce: value }))
                  }
                />
              </div>
              <div className="form-group form-group-checkbox">
                <label htmlFor="use_popup" className="checkbox-label">
                  Use Popup
                </label>
                <input
                  type="checkbox"
                  id="use_popup"
                  checked={authOptions.usePopup}
                  onChange={({ target: { checked } }) =>
                    setAuthOptions((currVal) => ({
                      ...currVal,
                      usePopup: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          {/* UI Props Section - Restructured */}
          <div className="options-container ui-props-container">
            <h3>UI props</h3>

            {/* Row 1: buttonExtraChildren & Theme */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="buttonExtraChildren">
                  buttonExtraChildren:
                </label>
                <input
                  type="text"
                  id="buttonExtraChildren"
                  value={`${extraProps.buttonExtraChildren}`}
                  onChange={({ target: { value } }) =>
                    setExtraProps((currVal) => ({
                      ...currVal,
                      buttonExtraChildren: value,
                    }))
                  }
                />
              </div>
              <div className="form-group form-group-theme-selector">
                <label>Theme:</label> {/* General label for the group */}
                <div className="theme-options">
                  <div className="theme-option">
                    <input
                      type="checkbox"
                      id="uiTypeLight"
                      checked={extraProps.uiType === 'light'}
                      onChange={() =>
                        setExtraProps((currVal) => ({
                          ...currVal,
                          uiType: 'light',
                        }))
                      }
                    />
                    <label htmlFor="uiTypeLight" className="checkbox-label">
                      Light
                    </label>
                  </div>
                  <div className="theme-option">
                    <input
                      type="checkbox"
                      id="uiTypeDark"
                      checked={extraProps.uiType === 'dark'}
                      onChange={() =>
                        setExtraProps((currVal) => ({
                          ...currVal,
                          uiType: 'dark',
                        }))
                      }
                    />
                    <label htmlFor="uiTypeDark" className="checkbox-label">
                      Dark
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: className & noDefaultStyle */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="className">className:</label>
                <input
                  type="text"
                  id="className"
                  value={extraProps.className}
                  onChange={({ target: { value } }) =>
                    setExtraProps((currVal) => ({
                      ...currVal,
                      className: value,
                    }))
                  }
                />
              </div>
              <div className="form-group form-group-checkbox">
                <input
                  type="checkbox"
                  id="noDefaultStyle"
                  checked={extraProps.noDefaultStyle}
                  onChange={({ target: { checked } }) =>
                    setExtraProps((currVal) => ({
                      ...currVal,
                      noDefaultStyle: checked,
                    }))
                  }
                />
                <label htmlFor="noDefaultStyle" className="checkbox-label">
                  noDefaultStyle
                </label>
              </div>
            </div>
          </div>
          {/* Extra Props Section - Restructured for better UI */}
          <div className="options-container extra-props-container">
            <h3>Extra props</h3>
            <div className="extra-props-list">
              <span>onSuccess</span>
              <span>onError</span>
              <span>skipScript</span>
              <span>iconProps</span>
              <span>render</span>
            </div>
          </div>
        </section>
      </div>
      <div className="container">
        <section>
          <h2>
            Why Apple Sign In? The Ultimate Guide to Higher Conversions and App
            Store Success
          </h2>

          <h3>App Store Requirements: Mandatory Integration for iOS Apps</h3>
          <p>
            Apple&apos;s App Store Review Guidelines explicitly require apps
            that offer third-party login options to also provide Sign in with
            Apple. This isn&apos;t just a suggestion—it&apos;s a mandatory
            requirement that can determine whether your app gets approved or
            rejected. Apps that fail to implement Apple Sign In when offering
            other social login options face immediate rejection from the App
            Store, potentially costing developers thousands in lost revenue and
            delayed launches.
          </p>
          <ul>
            <li>
              <strong>App Store Review Guideline 4.8:</strong> Mandatory Apple
              Sign In implementation
            </li>
            <li>
              <strong>iOS 13+ requirement:</strong> All new apps must comply
              with Apple&apos;s authentication standards
            </li>
            <li>
              <strong>Third-party login dependency:</strong> Apps using
              Facebook, Google, or Twitter login must include Apple Sign In
            </li>
            <li>
              <strong>Rejection prevention:</strong> Avoid costly app review
              delays and rejections
            </li>
          </ul>

          <h3>Conversion Rate Optimization: Proven Statistics and Benefits</h3>
          <p>
            Industry research shows that Apple Sign In significantly outperforms
            traditional authentication methods in terms of user conversion and
            retention. Apps implementing Apple Sign In report conversion rate
            improvements of up to 40% compared to standard email registration
            flows.
          </p>
          <ul>
            <li>
              <strong>Higher conversion rates:</strong> 25-40% improvement in
              user sign-up completion
            </li>
            <li>
              <strong>Reduced friction:</strong> One-tap authentication
              eliminates form filling
            </li>
            <li>
              <strong>Trust factor:</strong> Apple&apos;s brand recognition
              increases user confidence
            </li>
            <li>
              <strong>Privacy appeal:</strong> Users prefer Apple&apos;s
              privacy-first approach
            </li>
            <li>
              <strong>Cross-device sync:</strong> Seamless experience across
              iPhone, iPad, Mac, and Apple Watch
            </li>
          </ul>

          <h3>Privacy and Security: The Apple Advantage</h3>
          <p>
            Apple Sign In offers unparalleled privacy features that users
            increasingly demand. The &apos;Hide My Email&apos; feature allows
            users to create unique, random email addresses for each app,
            protecting their personal information while maintaining
            functionality.
          </p>
          <ul>
            <li>
              <strong>Hide My Email:</strong> Generate unique email addresses
              for enhanced privacy
            </li>
            <li>
              <strong>Two-factor authentication:</strong> Built-in security with
              Apple ID
            </li>
            <li>
              <strong>No tracking:</strong> Apple doesn&apos;t track users
              across apps
            </li>
            <li>
              <strong>Data minimization:</strong> Users control what information
              they share
            </li>
            <li>
              <strong>Secure enclave:</strong> Biometric authentication with
              Face ID and Touch ID
            </li>
          </ul>

          <h3>Business Impact: Revenue and User Acquisition</h3>
          <p>
            Implementing Apple Sign In isn&apos;t just about
            compliance—it&apos;s a strategic business decision that impacts your
            bottom line. Companies report significant improvements in key
            metrics after implementing Apple Sign In.
          </p>
          <ul>
            <li>
              <strong>User acquisition cost reduction:</strong> Lower CAC due to
              higher conversion rates
            </li>
            <li>
              <strong>Premium user segments:</strong> Apple users typically have
              higher lifetime value
            </li>
            <li>
              <strong>App Store featuring:</strong> Better chances of being
              featured by Apple
            </li>
            <li>
              <strong>Advertising revenue:</strong> Higher-value ad placements
              and better CPM rates
            </li>
            <li>
              <strong>Global reach:</strong> Access to Apple&apos;s worldwide
              user base
            </li>
          </ul>

          <h3>Technical Implementation: React Apple Sign In Integration</h3>
          <p>
            Our react-apple-signin-auth library simplifies the complex process
            of integrating Apple Sign In into React applications. With just a
            few lines of code, you can implement a production-ready Apple Sign
            In button that handles all the authentication complexities.
          </p>
          <ul>
            <li>
              <strong>Easy integration:</strong> Minimal code required for full
              functionality
            </li>
            <li>
              <strong>TypeScript support:</strong> Full type safety and
              IntelliSense
            </li>
            <li>
              <strong>Customizable UI:</strong> Dark/light themes and custom
              styling options
            </li>
            <li>
              <strong>Popup and redirect modes:</strong> Flexible authentication
              flows
            </li>
            <li>
              <strong>Error handling:</strong> Comprehensive error management
              and logging
            </li>
            <li>
              <strong>Production ready:</strong> Battle-tested in thousands of
              applications
            </li>
          </ul>

          <h3>Industry Adoption and Success Stories</h3>
          <p>
            Major companies across industries have successfully implemented
            Apple Sign In to improve their user experience and business metrics.
            From e-commerce to fintech, Apple Sign In has become the gold
            standard for mobile authentication.
          </p>
          <ul>
            <li>
              <strong>E-commerce platforms:</strong> Faster checkout and reduced
              cart abandonment
            </li>
            <li>
              <strong>Social media apps:</strong> Improved user onboarding and
              engagement
            </li>
            <li>
              <strong>Gaming applications:</strong> Seamless login across Apple
              devices
            </li>
            <li>
              <strong>Financial services:</strong> Enhanced security and
              regulatory compliance
            </li>
            <li>
              <strong>Subscription services:</strong> Higher conversion from
              trial to paid users
            </li>
          </ul>

          <h3>SEO and Marketing Benefits</h3>
          <p>
            Beyond user experience, Apple Sign In implementation can boost your
            app&apos;s visibility and marketing performance. Apps with Apple
            Sign In often rank higher in App Store search results and attract
            more organic downloads.
          </p>
          <ul>
            <li>
              <strong>App Store SEO:</strong> Better ranking in iOS app search
              results
            </li>
            <li>
              <strong>Apple ecosystem integration:</strong> Featured in
              Apple&apos;s marketing materials
            </li>
            <li>
              <strong>Premium ad placements:</strong> Access to higher-value
              advertising inventory
            </li>
            <li>
              <strong>Developer recognition:</strong> Apple Developer Program
              benefits and features
            </li>
            <li>
              <strong>Media coverage:</strong> Tech press coverage for
              privacy-focused implementations
            </li>
          </ul>

          <h3>Getting Started: Implementation Best Practices</h3>
          <p>
            Ready to implement Apple Sign In in your React application? Follow
            these best practices to ensure a smooth integration and optimal user
            experience.
          </p>
          <ol>
            <li>
              <strong>Configure Apple Developer Account:</strong> Set up your
              Apple ID and app configuration
            </li>
            <li>
              <strong>Install react-apple-signin-auth:</strong> Add our library
              to your project dependencies
            </li>
            <li>
              <strong>Implement the button:</strong> Use our customizable Apple
              Sign In component
            </li>
            <li>
              <strong>Handle authentication:</strong> Process user data and
              manage sessions
            </li>
            <li>
              <strong>Test thoroughly:</strong> Verify functionality across all
              Apple devices
            </li>
            <li>
              <strong>Monitor analytics:</strong> Track conversion improvements
              and user behavior
            </li>
          </ol>

          <p>
            <strong>References and Further Reading:</strong>
          </p>
          <ul>
            <li>
              <a
                href="https://developer.apple.com/sign-in-with-apple/"
                target="_blank"
                rel="noopener noreferrer">
                Apple Developer: Sign in with Apple Official Documentation
              </a>
            </li>
            <li>
              <a
                href="https://developer.apple.com/app-store/review/guidelines/"
                target="_blank"
                rel="noopener noreferrer">
                App Store Review Guidelines
              </a>
            </li>
            <li>
              <a
                href="https://developer.apple.com/videos/play/wwdc2019/706/"
                target="_blank"
                rel="noopener noreferrer">
                WWDC 2019: Introducing Sign In with Apple
              </a>
            </li>
            <li>
              <a
                href="https://www.apple.com/privacy/features/"
                target="_blank"
                rel="noopener noreferrer">
                Apple Privacy Features Overview
              </a>
            </li>
            <li>
              <a
                href="https://github.com/a-tokyo/react-apple-signin-auth"
                target="_blank"
                rel="noopener noreferrer">
                React Apple Sign In Auth GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/en-us/HT210318"
                target="_blank"
                rel="noopener noreferrer">
                Apple Support: Sign in with Apple ID
              </a>
            </li>
          </ul>
        </section>
      </div>
      <footer>
        Built with{' '}
        <span role="img" aria-label="love">
          ❤️
        </span>{' '}
        by <a href="https://ahmedtokyo.com">Ahmed Tokyo</a>
        <div>
          <a
            href="https://github.com/a-tokyo/react-apple-signin-auth"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginRight: '15px' }}>
            GitHub Repository
          </a>
          <a
            href="https://developer.apple.com/sign-in-with-apple/"
            target="_blank"
            rel="noopener noreferrer">
            Official Apple Sign In Docs
          </a>
        </div>
        <div>
          version:
          {pkgJson.version}
        </div>
      </footer>
    </article>
  );
}

export default Demo;
