# serverless-resource-tagging-plugin

Serverless stackTags apply once to AWS resources at first-time deploy. This
plugin applies them on every deploy so that updates are applied to existing
deploys.

NOTE: For AWS Provider Only
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

```
AWS::ApiGateway::RestApi
AWS::ApiGateway::Stage
AWS::CloudFront::Distribution
AWS::DynamoDB::Table
AWS::IAM::Role
AWS::Kinesis::Stream
AWS::Lambda::Function
AWS::Logs::LogGroup
AWS::S3::Bucket
AWS::SNS::Topic
AWS::SQS::Queue
AWS::StepFunctions::StateMachine
AWS::WAFv2::WebACL
```

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
