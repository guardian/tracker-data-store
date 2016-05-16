const AWS = require('aws-sdk');
const trackerApi = require('./trackerApi');
const getConfig = require('./getConfig');
const moment = require('moment');

AWS.config.update({
  region: "eu-west-1",
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const dynamoTableName = "tracker-weekly-summary-PROD";
const oneDayInMs = 1000 * 60 * 60 * 24;
const oneWeekInMs = oneDayInMs * 7;

function fetchCountForCommissioningDesk(desk, fromDate, toDate) {
  console.log("Fetching " + desk + " between " + fromDate + " and " + toDate);
  return trackerApi.fetchWeeklyStatsForDesk(desk, fromDate, toDate)
}

function writeCommissioningSummaryToDynamo(deskName, count, fromDate) {
  var params = {
      TableName: dynamoTableName,
      Item: {
        commissioningDesk: deskName,
        weekCommencing: fromDate,
        count: parseInt(count, 10)
      }
  };

  dynamodbClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item: " + deskName + " W/C:" + fromDate);
    }
  })
}

function generateTrackedVirtualDesk(deskSummaries) {
   return deskSummaries.reduce((currentCount, deskSummary) => currentCount + parseInt(deskSummary.count, 10), 0)
}

function writeCommissioningSummariesToDynamo(deskSummaries, fromDate) {
  console.log("Writing all summaries to DynamoDB")
  
  deskSummaries.forEach((deskSummary) => writeCommissioningSummaryToDynamo(deskSummary.desk, deskSummary.count, fromDate))
  
  //Write the virtual desk - all tracked
  const trackedTotal = generateTrackedVirtualDesk(deskSummaries)
  writeCommissioningSummaryToDynamo('virtual/commissioningdesk/all-tracked', trackedTotal, fromDate) 
}

exports.handler = function(event, context) {
  
  const fromDate = moment().subtract(7, 'days').startOf('isoweek').format('YYYY-MM-DD');
  const toDate = moment().subtract(7, 'days').endOf('isoweek').format('YYYY-MM-DD');
  
  console.log("Fetching Weekly Summary between " + fromDate + " and " + toDate);
  
  getConfig('commissioningDesks')
    .then(desks => desks.map(desk => fetchCountForCommissioningDesk(desk, fromDate, toDate)))
    .then(deskRequests => Promise.all(deskRequests))
    .then((deskSummaries) => writeCommissioningSummariesToDynamo(deskSummaries, fromDate))
    .catch((err) => {
      console.log(err)
    })
    
    
  //Write the virtual desk - all
  trackerApi.fetchWeeklyStatsForAll(fromDate, toDate)
    .then((allCount) => {
        writeCommissioningSummaryToDynamo('virtual/commissioningdesk/all', allCount, fromDate)
    })
    .catch((err) => console.log(err))

}