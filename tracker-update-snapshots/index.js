const AWS = require('aws-sdk');
const trackerApi = require('./trackerApi');

AWS.config.update({
  region: "eu-west-1",
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const dynamoTableName = "tracker-data-store-PROD";
const oneDayInMs = 1000 * 60 * 60 * 24;
const oneWeekInMs = oneDayInMs * 7;

function findContentToSnapshot(callback, content, startKey) {

  var params = {
    TableName: dynamoTableName,
    FilterExpression: "(attribute_not_exists (snapshot24Hours) AND publishedDate < :time24HrsAgoInMilliseconds) OR \
     (attribute_not_exists (snapshot7Days) AND publishedDate < :time7DaysAgoInMilliseconds)",
    ExpressionAttributeValues: {
        ":time24HrsAgoInMilliseconds": Date.now() - oneDayInMs,
        ":time7DaysAgoInMilliseconds": Date.now() - oneWeekInMs
    },
  };


  if (startKey) {
    params['ExclusiveStartKey'] = startKey;
  }

  dynamodbClient.scan(params, (err, data) => {
    const newContent = content ? content.concat(data.Items) : data.Items;
    if (data.LastEvaluatedKey) {
      findContentToSnapshot(callback, newContent, data.LastEvaluatedKey)
    } else {
      callback(err, newContent)
    }
  });
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

function deleteItem(item) {
  var params = {
      TableName: dynamoTableName,
      Key: {
        "path": item.path
      }
  };

  dynamodbClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Cleaned up item: " + item.path);
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
        return Promise.resolve(item);
      })
      .then((item) => {
        if (item.inNewspaper === true) {
          return Promise.resolve(item);
        }
        
        return trackerApi.fetchFullTrackerData(item.composerId)
          .then((trackerData) => {            
            return Object.assign({}, item, {
              inNewspaper: trackerData.inNewspaper
            })
          })
      })
      .then(saveItem)
      .catch((err) => {
        console.log("Error fetching snapshot for ", item.path)
      });
  }
}


function findContentToAddTrackerInformation(callback, content, startKey) {

  var params = {
    TableName: dynamoTableName,
    FilterExpression: "attribute_not_exists(trackerData)"
  };

  if (startKey) {
    params['ExclusiveStartKey'] = startKey;
  }

  dynamodbClient.scan(params, (err, data) => {
    const newContent = content ? content.concat(data.Items) : data.Items;
    if (data.LastEvaluatedKey) {
      findContentToAddTrackerInformation(callback, newContent, data.LastEvaluatedKey)
    } else {
      callback(err, newContent)
    }
  });
};

function addTrackerDataToItem(item) {
  console.log("fetching tracker data for " + item.path)
  trackerApi.fetchFullTrackerData(item.composerId)
    .then((trackerData) => {
      console.log("fetched tracker data for " + item.path)
      const newItem = Object.assign({}, item, {
        trackerData: trackerData,
        inNewspaper: trackerData.inNewspaper
      });

      saveItem(newItem);
    })
    .catch((err) => {
      console.log("Error fetching full tracker information", item.path);
    })
}

function findContentToCleanUp(callback, content, startKey) {

  var params = {
    TableName: dynamoTableName,
    FilterExpression: "publishedDate < :timeConsideredOldInMilliseconds",
    ExpressionAttributeValues: {
        ":timeConsideredOldInMilliseconds": Date.now() - (5 * oneWeekInMs)
    }
  };

  if (startKey) {
    params['ExclusiveStartKey'] = startKey;
  }

  dynamodbClient.scan(params, (err, data) => {
    const newContent = content ? content.concat(data.Items) : data.Items;
    if (data.LastEvaluatedKey) {
      findContentToCleanUp(callback, newContent, data.LastEvaluatedKey)
    } else {
      callback(err, newContent)
    }
  });
};

exports.handler = function(event, context) {
  
  findContentToCleanUp((err, content) => {
    content.forEach(deleteItem);
  });

  findContentToSnapshot((err, content) => {
    if(err) {
      console.error("Unable to content awaiting snapshot data from DynamoDB:", JSON.stringify(err, null, 2));
      return;
    }

    console.log("Found " + content.length + "pieces of content needing snapshots")
    content.slice(0,20).forEach(addSnapshotToItem);
  });

  findContentToAddTrackerInformation((err, content) => {
    if(err) {
      console.error("Unable to find content to add to tracker data from DynamoDB:", JSON.stringify(err, null, 2));
      return;
    }
    console.log("Found " + content.length + "pieces of content needing tracker information")

    content.slice(0,20).forEach(addTrackerDataToItem);
  })
}
