const { isLevelEnabled } = require('./lib/logLevels');
const { addTagsToResources } = require('./lib/addTagsToResources');

const PLUGIN_ID = 'resource-tagging-plugin';
class Plugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.hooks = {
      'after:aws:package:finalize:mergeCustomProviderResources': addTagsToResources.bind(this),
    };
  }

  get log() {
    const logIfEnabled = (loggerLevel, msg) => {
      if (isLevelEnabled(this.logLevel, loggerLevel)) {
        this.serverless.cli.log(`[${PLUGIN_ID}] ${loggerLevel} ${msg}`);
      }
    };
    return {
      error: (msg) => {
        logIfEnabled('ERROR', msg);
      },
      warn: (msg) => {
        logIfEnabled('WARN', msg);
      },
      info: (msg) => {
        logIfEnabled('INFO', msg);
      },
      debug: (msg) => {
        logIfEnabled('DEBUG', msg);
      },
    };
  }
}

module.exports = Plugin;
