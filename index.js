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
    return {
      info: (msg) => {
        this.serverless.cli.log(`[${PLUGIN_ID}] INFO ${msg}`);
      },
      error: (msg) => {
        this.serverless.cli.log(`[${PLUGIN_ID}] ERROR ${msg}`);
      },
      warn: (msg) => {
        this.serverless.cli.log(`[${PLUGIN_ID}] WARN ${msg}`);
      },
    };
  }
}

module.exports = Plugin;
