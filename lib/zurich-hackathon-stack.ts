import { Construct } from 'constructs';
import {Stack, StackProps} from 'aws-cdk-lib';
import {TriggerLambdaFromS3} from './trigger-lambda-from-s3'


export class ZurichHackathonStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    new TriggerLambdaFromS3(this, "trigger-lambda-from-s3", this.region);
  }
}


