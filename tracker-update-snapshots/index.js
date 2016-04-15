const AWS = require('aws-sdk');

AWS.config.update({
  region: "eu-west-1",
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const dynamoTableName = "tracker-data-store-PROD";

function findContentToSnapshot(callback) {

  var params = {
    TableName: dynamoTableName,
    ExpressionAttributeNames:{
        "#path": "path"
    },
    ProjectionExpression: "#path, nextSnapshotDate",
    FilterExpression: "nextSnapshotDate < :timeNowInMilliseconds",
    ExpressionAttributeValues: {
        ":timeNowInMilliseconds": Date.now()
    },
  };

  dynamodbClient.scan(params, callback);

};

exports.handler = function(event, context) {
  findContentToSnapshot((err, data) => {
    if(err) {
      console.error("Unable to retrive data from DynamoDB:", JSON.stringify(err, null, 2));
      return;
    }
    console.log("Got some content that needs to be snapshotted", data);
  })
  console.log("This is the part where I update a snapshot");
}
