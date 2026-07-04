const config = {
  isTesting: false, //use testing data?
  scrapMSCD: 3000, //cooldown between scrap batch in milliseconds
  scrapeBatchSize: 2, // how many works are scraped at once
  isDeveloping: false, // activate code that makes developing a little easier
  minHourBetweenScrap: 6, // at least this many hours have happened before scrap happens
  recheckFrequencyInHour: 1,
  rescrapeAttemptTimeInMinutes: 3,
  scrapeFailureAllowed: 3, // if scraping fails, try again for this many time
  //design
  pointRadius: 0,
  lineWidth: 3,
  lineRoundness: 0.2
}

export default config;