# serverless-resource-tagging-plugin

Serverless stackTags apply once to AWS resources at first-time deploy. This
plugin applies them on every deploy so that updates are applied to existing
deploys.

NOTES:
- For AWS Provider Only
- Applies both provider.stackTags and provider.tags to supported resources
- Skips resources that have deploy-time CloudFormation conditional on the root
  `Properties` value, such as
    ```yml
    Properties: 
      Fn::If:
        - IsOtherRegionDeployed
        - ${file(additional.yml):BucketProps.withReplication}
        - ${file(additional.yml):BucketProps.noReplication}
    ```

## Install plugin

```
npm install -D serverless-resource-tagging-plugin
```

## serverless.yml

```yaml
provider:
  name: aws
  stackTags:
    MyOrg:stackTag: provider.stackTags
    MyOrg:Name: ${self:service}
    MyOrg:Region: ${opt:region}
    MyOrg:Environment: ${opt:stage}

plugins:
  - serverless-resource-tagging-plugin
```

## Supported AWS Resources

A _tiny_ subset of supported resources:
```
AWS::ApiGateway::DomainName
AWS::ApiGateway::RestApi
AWS::ApiGateway::Stage
AWS::CloudFront::Distribution
AWS::Cognito::UserPool
AWS::DynamoDB::Table
AWS::IAM::Role
AWS::Kinesis::Stream
AWS::Lambda::Function
AWS::Logs::LogGroup
AWS::S3::Bucket
AWS::SNS::Topic
AWS::SQS::Queue
AWS::StepFunctions::StateMachine
```
For the many other supported formats, see
[the source here](https://github.com/tveal/serverless-resource-tagging-plugin/blob/main/lib/supportedTypes.js)

## Additional Config

Optionally, you can add other AWS resource types for tagging with
```yml
custom:
  resourceTagging:
    types:
      - AWS::Custom::Resource
```

If you only want specific resources you define, add the `exclusive` flag
```yml
custom:
  resourceTagging:
    exclusive: true
    types:
      - AWS::Custom::Resource
```

If you want to exclude certain resources by **type** or **logical ID**
```yml
custom:
  resourceTagging:
    excludes:
      - AWS::SNS::Topic
      - AWS::SQS::Queue
      - ServerlessDeploymentBucket
```

To adjust the log level (default: info)
```yml
custom:
  resourceTagging:
    log: debug # one of [error, warn, info, debug]
```
