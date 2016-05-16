const reqwest = require('reqwest');
const moment = require('moment');

const trackerRoot = "https://tracker.gutools.co.uk";

function unixToUtc(unixTime) {
  return moment(unixTime).toISOString();
}

module.exports = {
  fetchWeeklyStats: (fromDate, toDate) => {
    return new Promise((resolve, reject) => {
      reqwest({
        url: trackerRoot + "/weekly-summary",
        data: {
          from: unixToUtc(fromDate),
          to: unixToUtc(toDate)
        },
        success: resolve,
        error: reject
      });
    });
  }
}
