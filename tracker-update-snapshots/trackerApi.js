const reqwest = require('reqwest');

const trackerRoot = "https://tracker.gutools.co.uk";

module.exports = {
  fetchStats: (path, fromDate, toDate) => {
    // return reqwest({
    //   url: trackerRoot + "/dynamicStatsPath",
    //   data: {
    //     path: path,
    //     fromDate: fromDate,
    //     toDate: toDate
    //   }
    // });
    return new Promise((resolve, reject) => {
        resolve({
          pageViews: 2000,
          uniqueVisitors: 1000,
          returningVisitors: 100
        });
      });
  },

  fetchFullTrackerData: (composerId) => {

    if (!composerId) {
      return Promise.reject("No composer ID passed");
    }

    return reqwest({
      url: trackerRoot + "/capi-flex/" + composerId
    });
  }
}
