//Do some stuff to add an item

const pako = require('pako');
const thrift = require('thrift');
const Event = require('./thrift/generated/event_types').Event;
const AWS = require('aws-sdk')

AWS.config.update({
  region: "eu-west-1",
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();

const dynamoTableName = "tracker-data-store-PROD";

function deserialiseKinesisRecord(record) {
  const recordDataWithSettingsBit = new Buffer(record.kinesis.data, 'base64');
  const recordData = recordDataWithSettingsBit.slice(1);
  const uncompressedRecord = new Buffer(pako.inflate(recordData).buffer);

  var transport = new thrift.TFramedTransport(uncompressedRecord);
  var protocol = new thrift.TCompactProtocol(transport);
  var eventType = new Event()

  eventType.read(protocol);

  return eventType;
}

function isUpdateEvent(eventRecord) {
  //1 is update
  //2 is delete
  return eventRecord.eventType === 1;
};

function isPublishedContent(contentRecord) {
  return contentRecord.published && contentRecord.contentChangeDetails.published;
}

function insertIntoDynamo(contentRecord) {

  var params = {
    TableName : dynamoTableName,
    KeyConditionExpression: "#path = :path",
    ExpressionAttributeNames:{
        "#path": "path"
    },
    ExpressionAttributeValues: {
        ":path": contentRecord.identifiers.path
    }
  };

  dynamodbClient.query(params, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    if (data.Count !== 0) {
      console.log("Already exists in DynamoDB, returning")
      return;
    }

    var publishedDate = contentRecord.contentChangeDetails.published.date.toNumber();
    var twentyFourHoursInMilliseconds = 1000 * 60 * 60 * 24;
    var params = {
        TableName: dynamoTableName,
        Item:{
            "path": contentRecord.identifiers.path,
            "title": contentRecord.fields.headline,
            "publishedDate": publishedDate,
            "nextSnapshotDate" : publishedDate + twentyFourHoursInMilliseconds
        }
    };

    dynamodbClient.put(params, function(err, data) {
      if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Added item:", JSON.stringify(data, null, 2));
      }
    })
  })
};

exports.handler = function(event, context) {
  const validContent = event.Records
    .map(deserialiseKinesisRecord)
    .filter(isUpdateEvent)
    .map((updateEvent) => updateEvent.content)
    .filter(isPublishedContent)
    .forEach(insertIntoDynamo)
}
