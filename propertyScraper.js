const puppeteer = require('puppeteer')
const { TimeoutError } = require('puppeteer/Errors')

const validatePuppeteerError = error => {
  if (error instanceof TimeoutError) {
    return 'Error Timeout occured while scraping'
  }
  return 'An error ocurred'
}

const blockedResourceTypes = [
  // 'image', <-- seems to fail when we block images
  'media',
  'font',
  'texttrack',
  'stylesheet',
  'object',
  'beacon',
  'csp_report',
  'imageset'
]

const skippedResources = [
  'quantserve',
  'adzerk',
  'doubleclick',
  'adition',
  'exelator',
  'sharethrough',
  'cdn.api.twitter',
  'google-analytics',
  'googletagmanager',
  'google',
  'fontawesome',
  'https://lid.zoocdn.com/80/60',
  'facebook',
  'analytics',
  'optimizely',
  'clicktale',
  'mixpanel',
  'match',
  'criteo',
  'zedo',
  'clicksor',
  'zoopla/static',
  'tiqcdn'
]

const getProperties = async (location, bedsMax, bedsMin, scrapeWord) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  try {
    let URL = 'https://www.zoopla.co.uk/to-rent/property/LOCATION/?beds_max=BEDS_MAX&beds_min=BEDS_MIN&page_size=100&price_frequency=per_month&q=URL_LOC_ENCODE&radius=0&results_sort=newest_listings&search_source=refine'
      .replace('BEDS_MAX', bedsMax)
      .replace('BEDS_MIN', bedsMin)
      .replace(
        'LOCATION',
        location
          .toLowerCase()
          .split(' ')
          .join('-')
      )
      .replace(
        'URL_LOC_ENCODE',
        location
          .split(' ')
          .map(w => w.slice(0, 1).toUpperCase() + w.slice(1, w.length))
          .join('%20')
      )
    console.log('URL to hit:', URL)
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setRequestInterception(true)
    page.on('request', request => {
      const requestUrl = request._url.split('?')[0].split('#')[0]
      if (
        blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
        skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
      ) {
        request.abort()
      } else {
        request.continue()
      }
    })
    await page.goto(URL)
    console.log('...loading first page')

    const pagesReturned = await page.evaluate(() => {
      let el = document.querySelector('.paginate')
      return Array.from(el.children).length - 3 // minus 3 for Pages, Prev and Next elements
    })
    console.log(`...scraping pages 2-${pagesReturned + 1}`)

    const results = []
    for (let i = 0; i < pagesReturned; i++) {
      if (i !== 0) {
        // skip first nav since we are already on first page of results
        console.log(`...navigating to page ${i + 1}`)
        await page.goto(`${URL}&pn=${i + 1}`)
      }
      await page.waitForSelector('.listing-results-wrapper')
      results.push(
        ...(await page.evaluate(key => {
          let data = [] // Create an empty array that will store our data
          let elements = document.querySelectorAll('.listing-results-wrapper') // Select all property results
          elements = Array.from(elements).filter(
            el => el.innerText.indexOf(key) !== -1
          )
          for (var element of elements) {
            const priceTag = element.querySelector('.listing-results-price')
            const company = element.querySelector('.listing-results-marketed')
            data.push({
              searchId: priceTag['href'].split('/')[5].split('?')[0], // there seems to be a section of the URL that is unique, surprisingly not the seach_identifier
              price: priceTag.innerText,
              link: priceTag['href'],
              listed: company.innerText.split('\n')[0],
              company: company.innerText.split('\n')[1]
            })
          }
          return data
        }, scrapeWord))
      )
    }
    console.log('done')
    await browser.close()
    return results
  } catch (e) {
    console.log(e)
    await browser.close()
    return validatePuppeteerError(e)
  }
}

module.exports = getProperties
