const AWS = require('aws-sdk');
const trackerApi = require('./trackerApi');

AWS.config.update({
  region: "eu-west-1",
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const dynamoTableName = "tracker-data-store-PROD";
const oneDayInMs = 1000 * 60 * 60 * 24;
const oneWeekInMs = oneDayInMs * 7;

function findContentToSnapshot(callback) {

  var params = {
    TableName: dynamoTableName,
    FilterExpression: "(attribute_not_exists (snapshot24Hours) AND publishedDate < :time24HrsAgoInMilliseconds) OR \
     (attribute_not_exists (snapshot7Days) AND publishedDate < :time7DaysAgoInMilliseconds)",
    ExpressionAttributeValues: {
        ":time24HrsAgoInMilliseconds": Date.now() - oneDayInMs,
        ":time7DaysAgoInMilliseconds": Date.now() - oneWeekInMs
    },
  };

  dynamodbClient.scan(params, callback);
};

function buildSnapshot(statsSnapshot, item) {
  const snapshot = {
    time: item.nextSnapshotDate,
    value: statsSnapshot
  }
  return snapshot;
}

function saveItem(item) {
  var params = {
      TableName: dynamoTableName,
      Item: item
  };

  dynamodbClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Updated item: " + item.path);
    }
  })
}

function snapshotType(item) {
  if (!item.snapshot24Hours && item.publishedDate + oneDayInMs < Date.now()) {
    return '24hr';
  } else if (!item.snapshot7Days && item.publishedDate + oneWeekInMs < Date.now()) {
    return 'week'
  } else return null;
}

function snapshotDate(publishedDate, st) {
  if (st === '24hr') {
    return publishedDate + oneDayInMs;
  } else if (st === 'week') {
    return publishedDate + oneWeekInMs;
  } else {
    return null;
  }
}


function addSnapshotToItem(item) {
  var st = snapshotType(item);
  var sd = snapshotDate(item.publishedDate, st);
  if (st) {
  trackerApi.fetchStats(item.path, item.publishedDate, sd)
    .then((statssnapshot) => {
      return Promise.resolve(buildSnapshot(statssnapshot, item));
    })
    .then((snapshot) => {
      if (st === '24hr') {
        item.snapshot24Hours = snapshot;
      } else if (st === 'week') {
        item.snapshot7Days = snapshot;
      }
      saveItem(item);
    })
    .catch((err) => {
      //TODO: Catch ophan no more data error and write no further snapshots;
      console.log("Error fetching snapshot", err)
    });
  }
}


function findContentToAddTrackerInformation(callback) {

  var params = {
    TableName: dynamoTableName,
    FilterExpression: "attribute_not_exists(trackerData)"
  };

  dynamodbClient.scan(params, callback);
};

function addTrackerDataToItem(item) {
  trackerApi.fetchFullTrackerData(item.composerId)
    .then((trackerData) => {
      const newItem = Object.assign({}, item, {
        trackerData: trackerData
      });

      saveItem(newItem);
    })
    .catch((err) => {
      console.log("Error fetching full tracker information", err);
    })
}

exports.handler = function(event, context) {
  findContentToSnapshot((err, data) => {
    if(err) {
      console.error("Unable to content awaiting snapshot data from DynamoDB:", JSON.stringify(err, null, 2));
      return;
    }
    data.Items.forEach(addSnapshotToItem);
  });

  findContentToAddTrackerInformation((err, data) => {
    if(err) {
      console.error("Unable to find content to add to tracker data from DynamoDB:", JSON.stringify(err, null, 2));
      return;
    }

    data.Items.forEach(addTrackerDataToItem);
  })
}
