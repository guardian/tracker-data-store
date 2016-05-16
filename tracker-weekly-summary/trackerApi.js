const reqwest = require('reqwest');
const moment = require('moment');

const trackerRoot = "https://tracker.gutools.co.uk";

function unixToUtc(unixTime) {
  return moment(unixTime).toISOString();
}

module.exports = {
  fetchWeeklyStatsForDesk: (desk, fromDate, toDate) => {
    return new Promise((resolve, reject) => {
      reqwest({
        url: trackerRoot + "/capi-count",
        data: {
          from: unixToUtc(fromDate),
          to: unixToUtc(toDate),
          desk: desk
        },
        success: function(data) {
          resolve({
            count: data,
            desk: desk
          });
        },
        error: reject
      });
    });
  }
}
