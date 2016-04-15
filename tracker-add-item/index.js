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

const commissioningDesks = [
  "tracking/commissioningdesk/uk-culture",
  "tracking/commissioningdesk/uk-environment",
  "tracking/commissioningdesk/uk-g2-features",
  "tracking/commissioningdesk/uk-media",
  "tracking/commissioningdesk/uk-opinion",
  "tracking/commissioningdesk/uk-science",
  "tracking/commissioningdesk/uk-travel"];

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

function isRecentlyPublishedContent(contentRecord) {
  var isPublished = contentRecord.published;
  var publishedDate = contentRecord.contentChangeDetails.published
  return isPublished && publishedDate && isPublishedInLastWeek(publishedDate);
}

function isPublishedInLastWeek(publishedDate) {
  var oneWeekInMilliseconds = 1000 * 60 * 60 * 24 * 7;
  var dateOneWeekAgo = Date().now - oneWeekInMilliseconds;
  return publishedDate >= dateOneWeekAgo;
}

function CommisioningDeskFilter(content) {
  var tags = content.taxonomy.tags;
  for (var i = 0; i < tags.length; i++) {
    var commissioningDesk = tags[i].tag.path;
    if(isCommisioningDeskOfInterest(commissioningDesk)) {
      return true;
    }
  }
  return false;
};

function isCommisioningDeskOfInterest(tag) {
  return commissioningDesks.indexOf(tag) > -1;
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
  console.log("started");
  event.Records
    .map(deserialiseKinesisRecord)
    .filter(isUpdateEvent)
    .map((updateEvent) => updateEvent.content)
    .filter(isRecentlyPublishedContent)
    .filter(isCommisioningDeskOfInterest)
    .forEach(insertIntoDynamo)
}
