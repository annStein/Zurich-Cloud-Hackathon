import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import * as AWS from 'aws-sdk';

const region = process.env.REGION!;
const dynamoTableName = process.env.TABLE_NAME!;

const dynamoDbClient = new AWS.DynamoDB.DocumentClient({ region: region });
const s3Client = new S3Client({ region: region });

 // JSON - Insert to Dynamo Table
 const insertToDynamoTable = async function(json: JSON){
  try {
      const dynamoDBRecords = getDynamoDBRecords(json)
      console.log(dynamoDBRecords)
      const batches = [];

      while(dynamoDBRecords.length) {
          batches.push(dynamoDBRecords.splice(0, 25));
      }
      console.log(batches)
      await Promise.all(
        batches.map(async (batch) =>{
            const params = {
                'RequestItems': {
                  [dynamoTableName]: batch
                }
            };
            
            console.log(params)
            await dynamoDbClient.batchWrite(params).promise()
        })
      );
      
  } catch (error) {
      console.log(error);
  }
}

// create dynamoDB records
const getDynamoDBRecords = function (data: any) {
  const dynamoDBRecords = data.map((entity: object) => {
      console.log(entity)
      const dynamoRecord = Object.assign({ PutRequest: { Item: entity } })
      return dynamoRecord
  })
  return dynamoDBRecords
}

export const handler = (event: AWSLambda.S3Event) => {
  event.Records.forEach(async (record) => {
    try {
      const params={
          Bucket: record.s3.bucket.name, 
          Key: record.s3.object.key
      };
      const getObjCommand = new GetObjectCommand(params);
      const response = await s3Client.send(getObjCommand);
      const stream = await response.Body?.transformToString()
      if(stream) {
        const json_data = JSON.parse(stream)
        await insertToDynamoTable(json_data)     
        return `Successfully processed ${json_data.length} records.`;
      } else {
        return 'File uploaded to S3 seems to be empty.'
      }
      
    } catch (err) {
      return { error: err }
    }
  });
};