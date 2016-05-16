const AWS = require('aws-sdk');
const trackerApi = require('./trackerApi');

AWS.config.update({
  region: "eu-west-1",
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const dynamoTableName = "tracker-weekly-summary-PROD";
const oneDayInMs = 1000 * 60 * 60 * 24;
const oneWeekInMs = oneDayInMs * 7;

exports.handler = function(event, context) {
  console.log("tracker the thinger")
}