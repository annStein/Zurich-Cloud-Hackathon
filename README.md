# Getting started

This project was created using *yarn* as package manager.

Run `yarn install` in order to install all necessary packages.

Configure your AWS credentials and the region where the stack should be deployed to. Follow the AWS instructions [here](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_auth).

If this is the first CDK stack you deploy to your account, run `yarn cdk bootstrap`.

To deploy the stack run `yarn cdk deploy`.

# Test the stack

In order to test if this stack is working properly you can upload a file to S3 using the following command:
```
aws s3 cp ./client_data.json s3://<YOUR_BUCKET_NAME>/client_data.json
```
The bucket name is randomly created on stack deployment and will be printed within the stack output after the deployment is finished.


# Useful commands

* `cdk deploy`          deploy this stack to your default AWS account/region
* `cdk diff`            compare deployed stack with current state
* `cdk synth`           emits the synthesized CloudFormation template
* `cdk destroy`         removes the stack and all of its resources
* `yarn eslint .`       run linter on your code and see warning and errors
* `yarn eslint . --fix` run linter on your code and fix automatically (if possible)

In case you wanna remove totally everything (also the CDK base stack which is needed for deployment), you should also check Cloudformation in the console and manually remove the CDK stack. This will delete all included resources as well.

# Troubleshooting
If your deployment does not deploy or crash at somepoint and you don't know what happened, check Cloudformation in the AWS console to see the error and the current state of your stack.

!!! BE CAREFUL !!! If you delete the stack, it also deletes all included resources. This might create downtime for your system until it is redeployed and hardcoded names including random generated parts might change.

# File structure

- `cdk.json` file tells the CDK Toolkit how to execute your app.
- `client_data.json` example file to upload to S3 bucket and test the stack
- `bin/cdk.ts` entry point where the app and the stack are instantiated
- `lib/zurich-hackathon-stack.ts` stack for this competition
- `lib/trigger-lambda-from-s3.ts` component which includes all resources that need to be deployed to trigger the lambda on S3 upload and add data to DynamoDB
- `lib/trigger-lambda-from-s3.put-data.ts` lambda function code which is automagically found by `TriggerLambdaFromS3` component

# Decisions
## Using CDK and Typescript
I decided to use CDK instead of Terraform which was actually suggested. There are serveral advantages of CDK:
- There is no 'manual' state handling since Cloudformation takes care about the state when using CDK.
- You can create your infrastructure code using Typescript and you can use Typescript for the Lambda function. So there is no need to learn or apply different languages.
- CDK implemented already a lot of AWS security recommendations as default values.
- Especially for small projects like this one it is great that the code of Lambda functions can be right next to its infrastructure code and it is automagically found.
- With CDK it is easy have least-priviledge roles with the right permissions. Creating Policies with the actions you need is not really necessary. A simple `dynamoDbTable.grantWriteData(lambdaFunction);` is enough and shorter and way easier to read than policies and policy-attachements Terraform.

You may think "that's all great but with CDK I am locked within AWS and cannot simply switch to other providers like GCP or Azure". Sure. But... you are using DynamoDB, you are using Lambda functions. Even if you used Terraform it would take quite some effort to move everything to another cloud since the services have different names, different syntax etc.

## Code Structure
I just created one single stack with a single component for this Hackathon competition. If there are more resources and functionalities needed in the future, another component could be added to the stack if the current functionality was extended or another stack could be added if it adds functionality for a whole different system / department.