import { Construct } from 'constructs';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class TriggerLambdaFromS3 extends Construct {
    constructor(scope: Construct, id: string, region: string) {
        super(scope, id);

        const bucket = new s3.Bucket(this, 'client-data-bucket', {
            autoDeleteObjects: true,
            /**
             * The following properties ensure the bucket is properly
             * deleted when we run cdk destroy,
             * might be removed for production */
            removalPolicy: RemovalPolicy.DESTROY
        })

        const clientDynamoDbTable = new dynamodb.Table(this, 'client-dynamodb-table', {
            tableName: "client-table",
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            /**
             * The following properties ensure the table is properly
             * deleted when we run cdk destroy,
             * might be removed for production */
            removalPolicy: RemovalPolicy.DESTROY
        })

        const lambdaFunction = new NodejsFunction(this, 'put-data', {
            environment: {
                TABLE_NAME: clientDynamoDbTable.tableName,
                REGION: region,
            },
        });
        bucket.grantRead(lambdaFunction);
        clientDynamoDbTable.grantWriteData(lambdaFunction);

        const s3PutEventSource = new S3EventSource(bucket, {
            events: [
                s3.EventType.OBJECT_CREATED_PUT,
                s3.EventType.OBJECT_CREATED_POST,
            ]
        });

        lambdaFunction.addEventSource(s3PutEventSource);

        new CfnOutput(this, "bucket-name", {
            value: bucket.bucketName,
        });
    }
}