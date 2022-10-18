const { get, uniq, difference, uniqBy, merge } = require('lodash');
const {
  SUPPORTED_TYPES,
  SUPPORTED_TYPES_MAP_TAGS,
  getTypeTagKey,
} = require('./supportedTypes');

function addTagsToResources() {
  const {
    serverless,
    // options,
    log,
  } = this;
  const config = getPluginConfig(serverless);
  this.logLevel = config.logLevel;
  const globalTagsList = getStackTagsForAws(serverless);
  log.info(`Global Tags: ${JSON.stringify(
    globalTagsList.map(tag => ({ [tag.Key]: tag.Value })).reduce(merge, {}),
    null, 2
  )}`);
  if (globalTagsList.length > 0) {
    const template = serverless.service.provider.compiledCloudFormationTemplate;
    const taggedLogicalIds = [];
    Object.keys(template.Resources).forEach(key => {
      const resourceType = get(template, `Resources[${key}].Type`);
      const resourceProps = get(template, `Resources[${key}].Properties`);
      const isSupportedType = config.types.includes(resourceType);
      if (config.excludes.includes(key)) {
        log.info(`Skipping tags for ${key}`);
      } else if (
        isSupportedType
        &&
        isValidProperties(resourceProps)
      ) {
        if (SUPPORTED_TYPES_MAP_TAGS.includes(resourceType)) {
          const resourceTags = get(resourceProps, 'Tags', {});
          template.Resources[key].Properties[getTypeTagKey(resourceType)] = [
            ...globalTagsList.map(tag => ({ [tag.Key]: tag.Value })),
            resourceTags, // last override first
          ].reduce(merge, {});
          taggedLogicalIds.push(key);
        } else {
          const resourceTags = get(resourceProps, 'Tags', []);
          template.Resources[key].Properties[getTypeTagKey(resourceType)] = getStackTagsForAws(serverless, resourceTags);
          taggedLogicalIds.push(key);
        }
      } else if (!isSupportedType) {
        log.debug(`Skipping unsupported type for ${key} (${resourceType})`);
      } else {
        log.warn(`Skipping invalid properties for ${key} (${resourceType})`);
      }
    });
    log.info(`Added global tags to resources: ${JSON.stringify(taggedLogicalIds, null, 2)}`);
  } else {
    log.warn('No global tags defined [provider.stackTags, provider.tags]');
  }
}

const getPluginConfig = serverless => {
  const {
    types: userTypes = [],
    exclusive = false,
    excludes = [],
    log: logLevel,
  } = get(serverless, 'service.custom.resourceTagging', {});

  return {
    excludes,
    types: exclusive
      ? userTypes
      : difference(
        uniq([
          ...SUPPORTED_TYPES,
          ...userTypes,
        ]),
        excludes,
      ),
    logLevel,
  };
};

const isValidProperties = props => props && (
  Object.keys(props).length > 1
  ||
  !`${Object.keys(props)[0]}`.match(new RegExp('^!|Fn::', 'g'))
);

const getStackTagsForAws = (serverless, resourceTags = []) => uniqBy(
  [
    ...resourceTags, // first overrides later same-keys
    ...mapServerlessTagsToAwsTags(get(serverless, 'service.provider.stackTags', {})),
    ...mapServerlessTagsToAwsTags(get(serverless, 'service.provider.tags', {})),
  ],
  'Key'
);

const mapServerlessTagsToAwsTags = (serverlessTags = {}) => Object.entries(serverlessTags)
  .map(([Key, Value]) => ({ Key, Value }));

module.exports = {
  addTagsToResources,

  // exported for tests
  getPluginConfig,
  getStackTagsForAws,
  mapServerlessTagsToAwsTags,
};
