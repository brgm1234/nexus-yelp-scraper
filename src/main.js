const { Actor } = require('apify');
const axios = require('axios');
const cheerio = require('cheerio');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { searches, maxResults = 20 } = input;
  
  console.log('Starting Yelp scraper...');
  console.log('Searches:', searches);
  console.log('Max results:', maxResults);
  
  const results = [];
  const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['BUYPROXIES94952']
  });
  
  for (const search of searches) {
    if (results.length >= maxResults) break;
    
    try {
      const searchUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(search)}`;
      
      const response = await axios.get(searchUrl, {
        proxy: proxyConfiguration.createProxyUrl(),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      const $ = cheerio.load(response.data);
      const businesses = $('[data-testid="serp-ia-card"]');
      
      businesses.each((i, el) => {
        if (results.length >= maxResults) return false;
        
        const name = $(el).find('a[class*="business-name"]').text().trim() || 
                    $(el).find('h3').text().trim() || '';
        const ratingText = $(el).find('[aria-label*="star rating"]').attr('aria-label') || '';
        const rating = parseFloat(ratingText.match(/([0-9.]+)/)?.[0]) || 0;
        const reviewCount = parseInt($(el).find('[class*="review-count"]').text().replace(/[^0-9]/g, '')) || 0;
        const category = $(el).find('[class*="price-category"] span').first().text().trim() || '';
        const address = $(el).find('[class*="address"]').text().trim() || '';
        const phone = $(el).find('[class*="phone"]').text().trim() || '';
        const isOpen = $(el).text().toLowerCase().includes('open') || false;
        const yelpUrl = $(el).find('a').attr('href') || '';
        const priceRange = $(el).find('[aria-label*="price range"]').text().trim() || '';
        
        results.push({
          name,
          rating,
          reviewCount,
          category,
          address,
          phone,
          isOpen,
          yelpUrl: yelpUrl.startsWith('http') ? yelpUrl : `https://www.yelp.com${yelpUrl}`,
          priceRange,
          search
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error scraping search "${search}":`, error.message);
    }
  }
  
  await Actor.pushData(results);
  console.log('Scraping completed. Total results:', results.length);
});