/* @flow */

/**
 * Async wait for a variable till it gets defined in a parent
 *
 * • Usage Example: Waiting for async window.FB var to be initialized
 * - eg: `waitForVar('FB').then(FB => FB.test())`
 * - eg: `waitForVar('FB', { pollFrequency: 500, retries: 2, parent: window || global }).then(FB => FB.test())`
 * - eg: `waitForVar('FB', { retries: ({ retries } => retries * 500) }).then(FB => FB.test())`
 */
const waitForVar = async (
  name,
  {
    pollFrequency = 1000,
    retries: inRetries = 100,
    parent = window,
  }: {
    pollFrequency?: number | (({ retries: number }) => number),
    retries?: number,
    parent?: Object,
  } = { pollFrequency: 1000, retries: 100, parent: window },
) => {
  // eslint-disable-next-line no-prototype-builtins
  if (parent && parent.hasOwnProperty(name)) {
    return parent[name];
  }
  if (!inRetries) {
    return undefined;
  }
  const retries = inRetries - 1;
  await new Promise((resolve) =>
    setTimeout(
      resolve,
      typeof pollFrequency === 'function'
        ? pollFrequency({ retries })
        : pollFrequency,
    ),
  );
  return waitForVar(name, { pollFrequency, parent, retries });
};

export default waitForVar;
