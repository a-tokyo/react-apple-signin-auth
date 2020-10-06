# react-apple-signin-auth

 Apple signin for React using the official Apple JS SDK

<a href="https://npmjs.com/package/react-apple-signin-auth">
  <img src="https://img.shields.io/npm/v/react-apple-signin-auth.svg"></img>
  <img src="https://img.shields.io/npm/dt/react-apple-signin-auth.svg"></img>
</a>
<a href="https://codecov.io/gh/A-Tokyo/react-apple-signin-auth">
  <img src="https://img.shields.io/codecov/c/github/a-tokyo/react-apple-signin-auth.svg"></img>
</a>
<a href="https://twitter.com/intent/follow?screen_name=ahmad_tokyo"><img src="https://img.shields.io/twitter/follow/ahmad_tokyo.svg?label=Follow%20@ahmad_tokyo" alt="Follow @ahmad_tokyo"></img></a>

[Checkout the demo for a quick start!](https://a-tokyo.github.io/react-apple-signin-auth)

## Prerequisites
1. You should be enrolled in [Apple Developer Program](https://developer.apple.com/programs/).
2. Please have a look at [Apple documentation](
https://developer.apple.com/sign-in-with-apple/get-started/) related to "Sign in with Apple" feature.
3. You should create App ID and Service ID in your Apple Developer Account.
4. You should generate private key for your Service ID in your Apple Developer Account.

## Apple Signin Setup
Deatiled confuguration instructions can be found at [blog post](https://medium.com/@artyomefremov/add-sign-in-with-apple-button-to-your-website-today-part-1-12ed1444623a?postPublishedType=initial) and [Apple docs](https://help.apple.com/developer-account/#/dev1c0e25352) and [official apple docs for webpage signin](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple).

## Installation

```bash
npm i react-apple-signin-auth
```
OR
```bash
yarn add react-apple-signin-auth
```

## Usage
[Checkout the demo for a quick start!](https://a-tokyo.github.io/react-apple-signin-auth)
```js
import AppleSignin from 'react-apple-signin-auth';

/** Apple Signin button */
const MyAppleSigninButton = () => (
  <AppleSignin
    /** Auth options passed to AppleID.auth.init() */
    authOptions={{
      /** Client ID - eg: 'com.example.com' */
      clientId: 'com.example.web',
      /** Requested scopes, seperated by spaces - eg: 'email name' */
      scope: 'email name',
      /** Apple's redirectURI - must be one of the URIs you added to the serviceID - the undocumented trick in apple docs is that you should call auth from a page that is listed as a redirectURI, localhost fails */
      redirectURI: 'https://example.com',
      /** State string that is returned with the apple response */
      state: 'state',
      /** Nonce */
      nonce: 'nonce',
      /** Uses popup auth instead of redirection */
      usePopup: ${authOptions.usePopup},
    }} // REQUIRED
    /** General props */
    uiType="dark"
    /** Extra controlling props */
    /** Called upon signin success in case authOptions.usePopup = true -- which means auth is handled client side */
    onSuccess={(response) => console.log(response)} // default = undefined
    /** Called upon signin error */
    onError={(error) => console.error(error)} // default = undefined
    /** Skips loading the apple script if true */
    skipScript={false} // default = undefined
    /** Apple image props */
    iconProp={{ style: { marginTop: '10px' } }} // default = undefined
    /** render function - called with all props - can be used to fully customize the UI by rendering your own component  */
    render={(props) => <button {...props}>My Custom Button</button>}
  />
);

export default MyAppleSigninButton;
```

### Raw JS functionality
a module called `appleAuthHelpers` is also exported to allow you to use the functionality without using the UI or relying on React. This works with any kind of frontend JS, eg: react, vue, etc...
```js
import { appleAuthHelpers } from 'react-apple-signin-auth';
// OR
// import appleAuthHelpers from 'react-apple-signin-auth/dist/appleAuthHelpers'; // @unstable - might change with upgrades

/**
 * perform apple signIn operation
 */
appleAuthHelpers.signIn({
  authOptions: {
    // same as above
  },
  onSuccess: (response) => console.log(response),
  onError: (error) => console.error(error),
});

// OR

/** promisified version - promise resolves with response on success or undefined on error -- note that this only work with usePopup: true */
const response = await appleAuthHelpers.signIn({
  authOptions: {
    // same as above
  },
  onError: (error) => console.error(error),
});

if (response) {
  console.log(response);
} else {
  console.error('Error performing apple signin.');
}

```

## Server-side authentication (nodeJS backend)
Another library exists for server/backend support for Apple signin [apple-signin-auth](https://github.com/A-Tokyo/apple-signin-auth)

### Usage
- Install the library `yarn add apple-signin-auth` OR `npm i apple-signin-auth`
- Implement JWT verification logic
  ```js
  const appleSignin = require("apple-signin-auth");


  const { authorization, user } = req.body;

  try {
    const { sub: userAppleId } = await appleSignin.verifyIdToken(
      authorization.id_token, // We need to pass the token that we wish to decode.
      {
        audience: "com.example.web", // client id - The same one we used on the frontend, this is the secret key used for encoding and decoding the token.
        nonce: 'nonce' // nonce - The same one we used on the frontend - OPTIONAL
      }
    );
  } catch (err) {
    // Token is not verified
    console.error(err);
  }
  ```
#### Further resources:
- https://dev.to/onygami/how-to-add-signin-with-apple-on-your-website-43m9

### Related Projects
- [Apple Signin for Node JS](https://github.com/A-Tokyo/apple-signin-auth)
- [Apple Signin for React Native](https://github.com/invertase/react-native-apple-authentication)

## Contributing
Pull requests are highly appreciated! For major changes, please open an issue first to discuss what you would like to change.

### Getting Started
- Clone the repo: `git clone https://github.com/a-tokyo/react-apple-signin-auth`
- Install deps: `yarn`
- Start webpack development server on [localhost:3001](http://localhost:3001): `yarn start`
- To run/update the tests locally, run: `yarn test -u`

## Roadmap / Todos
- Better UI for the demo. eg: tailwind
- Typescript support
