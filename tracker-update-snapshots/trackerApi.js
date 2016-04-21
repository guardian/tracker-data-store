const reqwest = require('reqwest');
const moment = require('moment');

const trackerRoot = "https://tracker.gutools.co.uk";


function unixToUtc(unixTime) {
  return moment(unixTime).toISOString();
}

module.exports = {
  fetchStats: (path, fromDate, toDate) => {

    return new Promise((resolve, reject) => {
      reqwest({
        url: trackerRoot + "/ophan-info",
        data: {
          capiId: "/" + path,
          from: unixToUtc(fromDate),
          to: unixToUtc(toDate)
        },
        success: resolve,
        error: reject
      });
    });
  },

  fetchFullTrackerData: (composerId) => {

    if (!composerId) {
      return Promise.reject("No composer ID passed");
    }
    return new Promise((resolve, reject) => {
      reqwest({
        url: trackerRoot + "/capi-flex/" + composerId,
        success: resolve,
        error: reject
      });
    });
  }
}
