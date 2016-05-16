const reqwest = require('reqwest');
const moment = require('moment');

const trackerRoot = "https://tracker.gutools.co.uk";

module.exports = {
  fetchWeeklyStatsForDesk: (desk, fromDate, toDate) => {
    return new Promise((resolve, reject) => {
      reqwest({
        url: trackerRoot + "/capi-count",
        data: {
          from: fromDate,
          to: toDate,
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
  },
  fetchWeeklyStatsForAll: (fromDate, toDate) => {
    return new Promise((resolve, reject) => {
      reqwest({
        url: trackerRoot + "/capi-count",
        data: {
          from: fromDate,
          to: toDate,
        },
        success: resolve,
        error: reject
      });
    });
  }
}
