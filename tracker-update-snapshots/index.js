const AWS = require('aws-sdk');

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

function trackerStatsRequest(item) {
  return new Promise((resolve, reject) => {
    resolve({
      pageViews: 2000,
      uniqueVisitors: 1000,
      returningVisitors: 100
    });
  });
}

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
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
  })
}

function calculateNextSnapshotDate(publishedTime, currentSnapshot) {
  const ageOfCurrentSnapshot = currentSnapshot - publishedTime;
  const oneDayInMs = 1000 * 60 * 60 * 24;
  const oneWeekInMs = oneDayInMs * 7;
  const oneMonthInMs = oneDayInMs * 31;

  if (ageOfCurrentSnapshot < ((2 * oneWeekInMs) - oneDayInMs + 1000)) { // up to 13 days old (Ophan current range)
    return currentSnapshot + oneDayInMs;
  }

  if (ageOfCurrentSnapshot < (oneMonthInMs - oneWeekInMs + 1000)) { // up to 30 days old
    return currentSnapshot + oneWeekInMs;
  }

  return currentSnapshot + oneMonthInMs;
}

function updateSnapshotDates(oldItem) {
  const lastSnapshotDate = oldItem.nextSnapshotDate;
  const nextSnapshotDate = calculateNextSnapshotDate(oldItem.publishedDate, oldItem.nextSnapshotDate);

  return Object.assign({}, oldItem, {
    nextSnapshotDate: nextSnapshotDate,
    lastSnapshotDate: lastSnapshotDate
  });
}

function addSnapshotToItem(item) {
  trackerStatsRequest(item)
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
      console.log(err)
    });
}

exports.handler = function(event, context) {
  findContentToSnapshot((err, data) => {
    if(err) {
      console.error("Unable to retrive data from DynamoDB:", JSON.stringify(err, null, 2));
      return;
    }

    data.Items.forEach(addSnapshotToItem);

  });
}
