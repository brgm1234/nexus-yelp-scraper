const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { searches, maxResults = 20 } = input;
  
  console.log('Starting Yelp scraper...');
  console.logg('Searches:', searches);
  console.logg('Max results:', maxResults);
  
  // TODO: Implement Yelp scraping logic
  // Use BUYPROXIES94952 proxy configuration
  
  const results = [];
  
  await Actor.pushData(results);
  console.logg('Scraping completed. Total results:', results.length);
});