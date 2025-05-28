import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import pkgJson from '../../../../package.json';
// @ts-ignore
import AppleSigninButton from '../../../../src/AppleSigninButton/AppleSigninButton';

import './Demo.css';

// Declare window.adsbygoogle for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

// Google AdSense component
interface GoogleAdProps {
  format?: string;
  adSlot: string;
  className?: string;
}

const GoogleAd = ({ format = 'auto', adSlot, className = '' }: GoogleAdProps) => {
  useEffect(() => {
    const pushAd = () => {
      try {
        const adsbygoogle = window.adsbygoogle || [];
        adsbygoogle.push({});
      } catch (err) {
        console.error('Error pushing ad:', err);
      }
    };

    // If the script is already loaded
    if (window.adsbygoogle) {
      pushAd();
    } else {
      // Wait for script to load
      const scriptElement = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
      if (scriptElement) {
        scriptElement.addEventListener('load', pushAd);
        return () => scriptElement.removeEventListener('load', pushAd);
      }
    }
  }, []);

  return (
    <div className={`ad-container ${className}`.trim()}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5266987079964279"
        data-ad-slot={adSlot}
        data-ad-format={format}
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
    uiType: 'dark' as 'light' | 'dark',
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
        <div className="header-side">
          <GoogleAd adSlot="8959679920" />
        </div>
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
          <div className="form-container">
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
                <label htmlFor="use_popup" className="checkbox-label">
                  Use Popup
                </label>
              </div>
            </div>
          </div>
          {/* UI Props Section */}
          <div className="form-container">
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
                <label>Theme:</label>
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
          {/* Extra Props Section */}
          <div className="extra-props-container">
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
      <GoogleAd adSlot="9923910253" />
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

          <h3>Complete Implementation Guide: From Setup to Production</h3>
          <p>
            Integrating Apple Sign In involves several steps across different
            platforms. This comprehensive guide covers everything from Apple
            Developer account setup to frontend and backend implementation using
            our react-apple-signin-auth library.
          </p>

          <h4>Prerequisites and Development Setup</h4>
          <p>
            Before implementing Apple Sign In, you&apos;ll need an active Apple
            Developer Program membership ($99/year) and a few development tools
            for local testing.
          </p>
          <ul>
            <li>
              <strong>Apple Developer Program:</strong> Required for creating
              App IDs and Service IDs
            </li>
            <li>
              <strong>ngrok or similar tool:</strong> Apple Sign In requires
              HTTPS domains, even for local development
            </li>
            <li>
              <strong>Static domain:</strong> Create a static ngrok domain to
              avoid reconfiguring Apple credentials during development
            </li>
          </ul>

          <h4>Setting Up ngrok for Local Development</h4>
          <p>
            Apple Sign In doesn&apos;t support HTTP domains, so you&apos;ll need
            to expose your local development server via HTTPS. ngrok is the most
            popular solution for this:
          </p>
          <ol>
            <li>Install ngrok from their official website</li>
            <li>Create a static domain in your ngrok dashboard</li>
            <li>
              Run:{' '}
              <code>ngrok http 3000 --domain your-static-domain.ngrok.io</code>
            </li>
            <li>
              Access your app at{' '}
              <code>https://your-static-domain.ngrok.io</code>
            </li>
          </ol>

          <h4>Apple Developer Account Configuration</h4>
          <p>
            You&apos;ll need to create both an App ID and Service ID in your
            Apple Developer account:
          </p>

          <strong>Creating an App ID:</strong>
          <ol>
            <li>Sign in to Apple Developer Console</li>
            <li>
              Navigate to &quot;Certificates, Identifiers &amp; Profiles&quot;
            </li>
            <li>
              Under &quot;Identifiers,&quot; click the &quot;+&quot; button
            </li>
            <li>Choose &quot;App IDs&quot; and click &quot;Continue&quot;</li>
            <li>
              Enter description and bundle ID (e.g., com.yourcompany.yourapp)
            </li>
            <li>Enable &quot;Sign In with Apple&quot; capability</li>
          </ol>

          <strong>Creating a Service ID:</strong>
          <ol>
            <li>
              Again in &quot;Identifiers,&quot; click &quot;+&quot; and choose
              &quot;Services IDs&quot;
            </li>
            <li>Fill in identifier and description</li>
            <li>Enable &quot;Sign In with Apple&quot;</li>
            <li>Configure domains (add your ngrok domain for development)</li>
            <li>Set redirect URLs (your frontend URL for popup mode)</li>
          </ol>

          <h4>Frontend Implementation with React</h4>
          <p>Install and configure the react-apple-signin-auth package:</p>
          <pre
            style={{
              background: '#2d2d2d',
              color: '#f8f8f2',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
            }}>
            {`npm install react-apple-signin-auth

// AppleSignIn.js
import AppleSigninButton from 'react-apple-signin-auth';

function AppleSignIn() {
  const handleSuccess = (data) => {
    const { authorization, user } = data;
    // Send data to your backend for verification
    console.log('Apple Sign In Success:', data);
  };

  const authOptions = {
    clientId: 'your.service.id', // Your Service ID
    scope: 'email name',
    redirectURI: 'https://your-domain.com',
    nonce: 'nonce',
    usePopup: true, // Recommended for single-page apps
  };

  return (
    <AppleSigninButton
      authOptions={authOptions}
      uiType="dark"
      className="apple-auth-btn"
      onSuccess={handleSuccess}
      onError={(error) => console.error(error)}
    />
  );
}`}
          </pre>

          <h4>Understanding the Apple Response</h4>
          <p>
            Apple&apos;s response structure varies between first-time and
            returning users:
          </p>
          <pre
            style={{
              background: '#2d2d2d',
              color: '#f8f8f2',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
            }}>
            {`// First-time user response
{
  "authorization": {
    "state": "state",
    "code": "single-use-auth-code",
    "id_token": "JWT-token-to-verify"
  },
  "user": {
    "email": "user@email.com",
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}

// Returning user response (user object omitted)
{
  "authorization": {
    "state": "state",
    "code": "single-use-auth-code", 
    "id_token": "JWT-token-to-verify"
  }
}`}
          </pre>

          <h4>Backend Verification and User Management</h4>
          <p>
            Verify the ID token on your backend using the apple-signin-auth
            package:
          </p>
          <pre
            style={{
              background: '#2d2d2d',
              color: '#f8f8f2',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
            }}>
            {`npm install apple-signin-auth

// backend/auth.js
import appleSignin from 'apple-signin-auth';

export const verifyAppleToken = async (idToken, user) => {
  try {
    const { sub, email, iss } = await appleSignin.verifyIdToken(idToken, {
      audience: 'your.service.id', // Your Service ID
      ignoreExpiration: false,
    });

    // sub = unique user identifier
    // email = user's email
    // iss = issuer (https://appleid.apple.com)

    // Check if user exists in database
    let existingUser = await findUserBySub(sub);
    
    if (!existingUser && user) {
      // First-time user - save profile information
      existingUser = await createUser({
        appleId: sub,
        email: email,
        firstName: user.name?.firstName,
        lastName: user.name?.lastName,
      });
    }

    return existingUser;
  } catch (error) {
    throw new Error('Invalid Apple ID token');
  }
};`}
          </pre>

          <h4>Production Deployment Considerations</h4>
          <ul>
            <li>
              <strong>Domain verification:</strong> Update Apple Service ID
              configuration with production domains
            </li>
            <li>
              <strong>HTTPS requirement:</strong> Ensure all domains use valid
              SSL certificates
            </li>
            <li>
              <strong>User data storage:</strong> Apple only sends user details
              on first sign-in - store them immediately
            </li>
            <li>
              <strong>Token expiration:</strong> Implement proper token refresh
              mechanisms
            </li>
            <li>
              <strong>Error handling:</strong> Handle network failures and
              invalid tokens gracefully
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

          <h3>Best Practices and Optimization Tips</h3>
          <p>
            Follow these proven strategies to maximize the effectiveness of your
            Apple Sign In implementation and achieve the highest conversion
            rates.
          </p>
          <ul>
            <li>
              <strong>Button placement:</strong> Position Apple Sign In
              prominently above other login options
            </li>
            <li>
              <strong>Visual consistency:</strong> Use Apple&apos;s official
              design guidelines and maintain brand consistency
            </li>
            <li>
              <strong>Error handling:</strong> Provide clear, helpful error
              messages for authentication failures
            </li>
            <li>
              <strong>Performance optimization:</strong> Lazy load the Apple SDK
              to improve initial page load times
            </li>
            <li>
              <strong>Analytics tracking:</strong> Monitor conversion rates,
              drop-off points, and user behavior patterns
            </li>
            <li>
              <strong>A/B testing:</strong> Test different button styles, copy,
              and placement to optimize conversions
            </li>
            <li>
              <strong>Fallback options:</strong> Always provide alternative
              login methods for users without Apple devices
            </li>
            <li>
              <strong>Privacy messaging:</strong> Clearly communicate your
              app&apos;s privacy practices to build trust
            </li>
          </ul>

          <p>
            <strong>References and Further Reading:</strong>
          </p>
          <ul>
            <li>
              <a
                href="https://github.com/a-tokyo/react-apple-signin-auth"
                target="_blank"
                rel="noopener noreferrer">
                Apple Sign In for React, Vue, Angular, NextJS and JavaScript in
                general
              </a>
            </li>
            <li>
              <a
                href="https://github.com/a-tokyo/apple-signin-auth"
                target="_blank"
                rel="noopener noreferrer">
                Apple Sign In for Node JS
              </a>
            </li>
            <li>
              <a
                href="https://www.fullness.io/insights/how-to-integrate-signin-with-apple-in-react-a-stepbystep-guide"
                target="_blank"
                rel="noopener noreferrer">
                Full Stack Setup Guide to Apple Sign In
              </a>
            </li>
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
      <GoogleAd adSlot="1999002989" />
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
