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

  return item.Snapshots ? item.snapshots.concat(snapshot) : [snapshot];

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

function addSnapshotToItem(item) {
  console.log(item);

  trackerStatsRequest(item)
    .then((statssnapshot) => {
      return Promise.resolve(addSnapshotToArray(statssnapshot, item));
    })
    .then((snapshotArray) => {
      item.snapshots = snapshotArray;
      saveItem(item);
    })
    .catch((err) => {
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
