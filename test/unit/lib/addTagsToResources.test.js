const { expect, it, describe, beforeEach } = require('@jest/globals');
const { cloneDeep, merge } = require('lodash');
const {
  SERVERLESS_RESOURCE_CFG_CUSTOM_EXCLUDES,
  SERVERLESS_RESOURCE_CFG_CUSTOM_EXCLUSIVE,
  PLUGIN_DEFAULT_CONFIG,
  SERVERLESS_PROVIDER_TAGS,
  SERVERLESS_GLOBAL_TAGS_WITH_RESOURCES
} = require('../../fixtures');
const {
  getPluginConfig,
  addTagsToResources,
  getStackTagsForAws,
  mapServerlessTagsToAwsTags,
} = require('../../../lib/addTagsToResources');

describe('addTagsToResources', () => {
  describe('getPluginConfig', () => {
    it('should get default config', () => {
      const config = getPluginConfig();

      expect(config).toEqual(PLUGIN_DEFAULT_CONFIG);
    });

    it('should get custom config with excludes', () => {
      const config = getPluginConfig(SERVERLESS_RESOURCE_CFG_CUSTOM_EXCLUDES);

      expect(config).toEqual({
        excludes: [ 'AWS::DynamoDB::Table' ],
        types: [
          ...PLUGIN_DEFAULT_CONFIG.types.filter(t => t !== 'AWS::DynamoDB::Table'),
          'AWS::Custom::Resource',
        ],
      });
    });

    it('should get exclusive custom config', () => {
      const config = getPluginConfig(SERVERLESS_RESOURCE_CFG_CUSTOM_EXCLUSIVE);

      expect(config).toEqual({
        excludes: [],
        types: [
          'AWS::Custom::Resource',
        ],
      });
    });
  });
  describe('addTagsToResources', () => {
    let logOutput;
    beforeEach(() => {
      logOutput = [];
    });
    class TestPlugin {
      constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.invoke = addTagsToResources.bind(this);
      }

      get log() {
        return {
          info: (msg) => {
            logOutput.push(`INFO ${msg}`);
          },
          error: (msg) => {
            logOutput.push(`ERROR ${msg}`);
          },
          warn: (msg) => {
            logOutput.push(`WARN ${msg}`);
          },
        };
      }
    }
    it('should NOT log config', () => {
      const testPlugin = new TestPlugin({}, {});

      expect(logOutput).toEqual([]);
      testPlugin.invoke();
      expect(logOutput).toEqual([
        'INFO Global Tags: {}',
        'WARN No global tags defined [provider.stackTags, provider.tags]',
      ]);
    });
    it('should adorn global tags to resources', () => {
      const serverless = cloneDeep(SERVERLESS_GLOBAL_TAGS_WITH_RESOURCES);
      const testPlugin = new TestPlugin(serverless, {});

      expect(logOutput).toEqual([]);
      testPlugin.invoke();
      expect(logOutput).toEqual([
        `INFO Global Tags: ${JSON.stringify({
          'MyOrg:stackTag': 'provider.stackTags',
          'MyOrg:Name': 'my-service',
          'MyOrg:Environment': 'sample',
          'MyOrg:tag': 'provider.tags',
        }, null, 2)}`,
        'INFO Skipping tags for ServerlessDeploymentBucket',
        'WARN Skipping global tagging for MyCustomResource (AWS::Custom::Resource)',
        'WARN Skipping global tagging for MyBucket (AWS::S3::Bucket)',
        'WARN Skipping global tagging for BucketNoProps (AWS::S3::Bucket)',
        `INFO Added global tags to resources: ${JSON.stringify([
          'MyLambda',
          'MyQueue',
          'MySsmParam',
        ], null, 2)}`,
      ]);

      const globalTags = [
        {
          Key: 'MyOrg:stackTag',
          Value: 'provider.stackTags',
        },
        {
          Key: 'MyOrg:Name',
          Value: 'my-service',
        },
        {
          Key: 'MyOrg:Environment',
          Value: 'sample',
        },
        {
          Key: 'MyOrg:tag',
          Value: 'provider.tags',
        },
      ];
      expect(
        serverless.service.provider.compiledCloudFormationTemplate.Resources
      ).toEqual({
        ServerlessDeploymentBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {
            BucketName: 'serverless-deployment-bucket',
          },
        },
        MyLambda: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            FunctionName: 'my-service-lambda',
            Tags: [
              {
                Key: 'MyOrg:FunctionName',
                Value: 'my-service-lambda',
              },
              ...globalTags,
            ],
          },
        },
        MyQueue: {
          Type: 'AWS::SQS::Queue',
          Properties: {
            QueueName: 'my-service-queue',
            Tags: globalTags,
          },
        },
        MyCustomResource: {
          Type: 'AWS::Custom::Resource',
          Properties: {
            Name: 'my-service-custom-resource',
            Meta: 'custom is ambiguous',
          },
        },
        MyBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {
            'Fn::If': [
              'SomeCondition',
              { msg: 'true case' },
              { msg: 'false case' },
            ],
          },
        },
        BucketNoProps: {
          Type: 'AWS::S3::Bucket',
        },
        MySsmParam: {
          Type: 'AWS::SSM::Parameter',
          Properties: {
            Commands: 'commands',
            Type: 'String',
            Tags: {
              'MyOrg:Name': 'my-service-ssm-param',
              'MyOrg:Environment': 'sample',
              'MyOrg:stackTag': 'provider.stackTags',
              'MyOrg:tag': 'provider.tags',
            },
          },
        },
      });
    });
  });
  describe('getStackTagsForAws', () => {
    it('should get stackTags and tags and format for AWS tags', () => {
      const awsStackTags = getStackTagsForAws(SERVERLESS_PROVIDER_TAGS);

      expect(awsStackTags).toEqual([
        {
          Key: 'MyOrg:stackTag',
          Value: 'provider.stackTags',
        },
        {
          Key: 'MyOrg:Name',
          Value: 'my-service',
        },
        {
          Key: 'MyOrg:Environment',
          Value: 'sample',
        },
        {
          Key: 'MyOrg:tag',
          Value: 'provider.tags',
        },
      ]);
    });
    it('should override global tag with resource tag', () => {
      const resourceTags = [
        {
          Key: 'MyOrg:Name',
          Value: 'my-service-resource',
        },
      ];
      const awsStackTags = getStackTagsForAws(SERVERLESS_PROVIDER_TAGS, resourceTags);

      expect(awsStackTags).toEqual([
        {
          Key: 'MyOrg:Name',
          Value: 'my-service-resource',
        },
        {
          Key: 'MyOrg:stackTag',
          Value: 'provider.stackTags',
        },
        {
          Key: 'MyOrg:Environment',
          Value: 'sample',
        },
        {
          Key: 'MyOrg:tag',
          Value: 'provider.tags',
        },
      ]);
    });
  });
  describe('mapServerlessTagsToAwsTags', () => {
    it('should work with undefined input', () => {
      expect(mapServerlessTagsToAwsTags(undefined)).toEqual([]);
    });
  });
});
