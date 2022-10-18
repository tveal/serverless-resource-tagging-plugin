const { get, toUpper } = require('lodash');
const ERROR = ['ERROR'];
const WARN = [...ERROR, 'WARN'];
const INFO = [...WARN, 'INFO'];
const DEBUG = [...INFO, 'DEBUG'];
const isLevelEnabled = (configuredLevel, loggerLevel) => get({
  ERROR, WARN, INFO, DEBUG
}, toUpper(configuredLevel), INFO).includes(loggerLevel);
module.exports = { isLevelEnabled };
