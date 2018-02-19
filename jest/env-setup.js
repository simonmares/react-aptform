// npm
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

// See TUTO_IMPL_DEV_GLOBAL
global.__DEV__ = true;

// localStorage global stub (used in reducers, should not be)
global.localStorage = {
  getItem() {},
};

Enzyme.configure({ adapter: new Adapter() });
