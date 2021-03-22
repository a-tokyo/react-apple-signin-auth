/* @flow */
/* eslint-disable import/no-extraneous-dependencies */

import 'regenerator-runtime/runtime';
import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import ShallowRenderer from 'react-test-renderer/shallow';

Enzyme.configure({
  adapter: new EnzymeAdapter(),
});

/**
 * Overwrite shallow to render correct snapshots
 *  while we don not use create-react script
 */
global.shallow = (Component) => {
  const renderer = new ShallowRenderer();
  renderer.render(Component);
  return renderer.getRenderOutput();
};
