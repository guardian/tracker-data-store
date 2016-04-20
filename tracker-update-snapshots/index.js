const AWS = require('aws-sdk');
const util = require('./util');
const trackerApi = require('./trackerApi');

AWS.config.update({
  region: "eu-west-1",
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const dynamoTableName = "tracker-data-store-PROD";

function findContentToSnapshot(callback) {

  var params = {
    TableName: dynamoTableName,
    FilterExpression: "nextSnapshotDate < :timeNowInMilliseconds",
    ExpressionAttributeValues: {
        ":timeNowInMilliseconds": Date.now()
    },
  };

  dynamodbClient.scan(params, callback);
};

function addSnapshotToArray(statsSnapshot, item) {

  const snapshot = {
    time: item.nextSnapshotDate,
    value: statsSnapshot
  }

  return item.snapshots ? item.snapshots.concat(snapshot) : [snapshot];
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

function updateSnapshotDates(oldItem) {
  const lastSnapshotDate = oldItem.nextSnapshotDate;
  const nextSnapshotDate = util.calculateNextSnapshotDate(oldItem.publishedDate, oldItem.nextSnapshotDate);

  return Object.assign({}, oldItem, {
    nextSnapshotDate: nextSnapshotDate,
    lastSnapshotDate: lastSnapshotDate
  });
}

function addSnapshotToItem(item) {
  trackerApi.fetchStats(item.path, item.publishedDate, item.nextSnapshotDate)
    .then((statssnapshot) => {
      return Promise.resolve(addSnapshotToArray(statssnapshot, item));
    })
    .then((snapshotArray) => {
      item.snapshots = snapshotArray;
      const itemNewTimes = updateSnapshotDates(item)
      saveItem(itemNewTimes);
    })
    .catch((err) => {
      //TODO: Catch ophan no more data error and write no further snapshots;
      console.log("Error fetching snapshot", err);
    });
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
