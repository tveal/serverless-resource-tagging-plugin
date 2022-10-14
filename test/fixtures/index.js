const SERVERLESS_RESOURCE_CFG_CUSTOM_EXCLUDES = {
  service: {
    custom: {
      resourceTagging: {
        exclusive: false,
        types: [
          'AWS::Custom::Resource',
        ],
        excludes: [
          'AWS::DynamoDB::Table',
        ],
      },
    },
  },
};

const SERVERLESS_RESOURCE_CFG_CUSTOM_EXCLUSIVE = {
  service: {
    custom: {
      resourceTagging: {
        exclusive: true,
        types: [
          'AWS::Custom::Resource',
        ],
      },
    },
  },
};

const SERVERLESS_PROVIDER_TAGS = {
  service: {
    provider: {
      stackTags: {
        'MyOrg:stackTag': 'provider.stackTags',
        'MyOrg:Name': 'my-service',
        'MyOrg:Environment': 'sample',
      },
      tags: {
        'MyOrg:tag': 'provider.tags',
        'MyOrg:Name': 'DUPLICATE',
      },
    },
  },
};

const PLUGIN_DEFAULT_CONFIG = {
  excludes: [],
  types: [
    'AWS::ApiGatewayV2::Api',
    'AWS::ApiGatewayV2::Stage',
    'AWS::SSM::Parameter',
    'AWS::ApiGateway::RestApi',
    'AWS::ApiGateway::Stage',
    'AWS::CloudFront::Distribution',
    'AWS::DynamoDB::Table',
    'AWS::IAM::Role',
    'AWS::Kinesis::Stream',
    'AWS::Lambda::Function',
    'AWS::Logs::LogGroup',
    'AWS::S3::Bucket',
    'AWS::SNS::Topic',
    'AWS::SQS::Queue',
    'AWS::StepFunctions::StateMachine',
    'AWS::WAFv2::WebACL',
  ],
};

const SERVERLESS_GLOBAL_TAGS_WITH_RESOURCES = {
  service: {
    custom: {
      resourceTagging: {
        excludes: ['ServerlessDeploymentBucket'],
      },
    },
    provider: {
      ...SERVERLESS_PROVIDER_TAGS.service.provider,
      compiledCloudFormationTemplate: {
        Resources: {
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
              ],
            },
          },
          MyQueue: {
            Type: 'AWS::SQS::Queue',
            Properties: {
              QueueName: 'my-service-queue',
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
          MySsmParam: {
            Type: 'AWS::SSM::Parameter',
            Properties: {
              Commands: 'commands',
              Type: 'String',
              Tags: {
                'MyOrg:Name': 'my-service-ssm-param',
              },
            },
          },
        },
      },
    },
  },
};

module.exports = {
  SERVERLESS_RESOURCE_CFG_CUSTOM_EXCLUDES,
  SERVERLESS_RESOURCE_CFG_CUSTOM_EXCLUSIVE,
  PLUGIN_DEFAULT_CONFIG,
  SERVERLESS_PROVIDER_TAGS,
  SERVERLESS_GLOBAL_TAGS_WITH_RESOURCES,
};
