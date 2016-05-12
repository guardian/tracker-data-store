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

const commissioningDeskRegex = /^tracking\/commissioningdesk\/uk-(.*)/
const whitelistedCommissioningDesks = [
  'tracking/commissioningdesk/uk-audio',
  'tracking/commissioningdesk/uk-business',
  'tracking/commissioningdesk/cities',
  'tracking/commissioningdesk/uk-communities-and-social',
  'tracking/commissioningdesk/cook',
  'tracking/commissioningdesk/crosswords',
  'tracking/commissioningdesk/uk-culture',
  'tracking/commissioningdesk/digital-backbench',
  'tracking/commissioningdesk/uk-education',
  'tracking/commissioningdesk/uk-environment',
  'tracking/commissioningdesk/family',
  'tracking/commissioningdesk/uk-fashion',
  'tracking/commissioningdesk/uk-foreign',
  'tracking/commissioningdesk/foreign-networks',
  'tracking/commissioningdesk/g1',
  'tracking/commissioningdesk/uk-g2-features',
  'tracking/commissioningdesk/global-development',
  'tracking/commissioningdesk/uk-guardian-weekly-commissioning',
  'tracking/commissioningdesk/uk-home-news',
  'tracking/commissioningdesk/uk-labs',
  'tracking/commissioningdesk/uk-letters-and-leader-writers',
  'tracking/commissioningdesk/long-read',
  'tracking/commissioningdesk/uk-media',
  'tracking/commissioningdesk/uk-membership',
  'tracking/commissioningdesk/uk-money',
  'tracking/commissioningdesk/uk-obituaries',
  'tracking/commissioningdesk/uk-opinion',
  'tracking/commissioningdesk/uk-pictures-guardian-arts',
  'tracking/commissioningdesk/uk-pictures-guardian-features',
  'tracking/commissioningdesk/uk-pictures-guardian-news',
  'tracking/commissioningdesk/uk-professional-networks',
  'tracking/commissioningdesk/research-and-information',
  'tracking/commissioningdesk/review',
  'tracking/commissioningdesk/guardian-saturday',
  'tracking/commissioningdesk/uk-science',
  'tracking/commissioningdesk/uk-society',
  'tracking/commissioningdesk/uk-special-projects',
  'tracking/commissioningdesk/uk-sport',
  'tracking/commissioningdesk/uk-technology',
  'tracking/commissioningdesk/the-guide',
  'tracking/commissioningdesk/uk-travel',
  'tracking/commissioningdesk/uk-video',
  'tracking/commissioningdesk/uk-visuals',
  'tracking/commissioningdesk/uk-weather',
  'tracking/commissioningdesk/weekend'
]

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
  if (!contentRecord.contentChangeDetails.published) {
    return false;
  }

  var publishedDate = contentRecord.contentChangeDetails.published.date.toNumber()

  return isPublishedInLastWeek(publishedDate);
}

function isPublishedInLastWeek(publishedDate) {
  var oneWeekInMilliseconds = 1000 * 60 * 60 * 24 * 7;
  var dateOneWeekAgo = Date.now() - oneWeekInMilliseconds;

  return publishedDate >= dateOneWeekAgo;
}

function getCommissioningDesks(content) {
  return content.taxonomy.tags.filter((tagUsage) => {
    return tagUsage.tag.path && whitelistedCommissioningDesks.indexOf(tagUsage.tag.path) !== -1
  }).map((tagUsage) => tagUsage.tag.path);
}

function isCommissioningDeskOfInterest(content) {
  return !!getCommissioningDesks(content).length;
};

function hasNewspaperTags(content) {
  return !!content.taxonomy.newspaper;
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
            "nextSnapshotDate" : publishedDate + twentyFourHoursInMilliseconds,
            "composerId": contentRecord.id,
            "commissioningDesks": getCommissioningDesks(contentRecord),
            "inNewspaper": hasNewspaperTags(contentRecord)
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
  event.Records
    .map(deserialiseKinesisRecord)
    .filter(isUpdateEvent)
    .map((updateEvent) => updateEvent.content)
    .filter(isRecentlyPublishedContent)
    .filter(isCommissioningDeskOfInterest)
    .forEach(insertIntoDynamo)
}
