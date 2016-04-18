module.exports = {
  calculateNextSnapshotDate: (publishedTime, currentSnapshot) => {
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
}
