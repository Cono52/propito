const { blockedResourceTypes, skippedResources } = require('../resourceTypes')
const { TimeoutError } = require('puppeteer/Errors')

const validatePuppeteerError = error => {
  if (error instanceof TimeoutError) {
    return 'Error Timeout occured while scraping'
  }
  return 'An error ocurred'
}

const zoopla = async (page, location, bedsMax, bedsMin, scrapeWord) => {
  await page.setViewport({ width: 1920, height: 1080 })
  try {
    let URL = `https://www.zoopla.co.uk/to-rent/property/${location
      .toLowerCase()
      .split(' ')
      .join(
        '-'
      )}/?beds_max=${bedsMax}&beds_min=${bedsMin}&page_size=100&price_frequency=per_month&q=${location
      .split(' ')
      .map(w => w.slice(0, 1).toUpperCase() + w.slice(1, w.length))
      .join('%20')}&keywords=${scrapeWord
      .split(' ')
      .join('%20')}&radius=0&results_sort=newest_listings&search_source=refine`

    console.log('\n\nzoopla: URL to hit:', URL)

    // Set up interceptor
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
    console.log('zoopla: ...loading first page')

    const pagesReturned = await page.evaluate(() => {
      let el = document.querySelector('.paginate')
      if (!el) {
        return 1
      }
      return Array.from(el.children).length - 3 // minus 3 for Pages, Prev and Next elements
    })

    console.log(`zoopla: ...scraping pages 2-${pagesReturned + 1}`)

    const results = []
    for (let i = 0; i < pagesReturned; i++) {
      if (i !== 0) {
        // skip first nav since we are already on first page of results
        console.log(`zoopla: ...navigating to page ${i + 1}`)
        await page.goto(`${URL}&pn=${i + 1}`)
      }
      await page.waitForSelector('.listing-results-wrapper')
      results.push(
        ...(await page.evaluate(key => {
          let data = [] // Create an empty array that will store our data
          let elements = document.querySelectorAll('.listing-results-wrapper') // Select all property results
          // elements = Array.from(elements).filter(
          //   el => el.innerText.indexOf(key) !== -1
          // )
          for (var element of elements) {
            const priceTag = element.querySelector('.listing-results-price')
            const company = element.querySelector('.listing-results-marketed')
            data.push({
              link: priceTag['href'],
              price: priceTag.innerText,
              desc: element.getElementsByTagName('p')[1].innerText,
              listed: company.innerText.split('\n')[0],
              company: company.innerText.split('\n')[1]
            })
          }
          return data
        }, scrapeWord))
      )
    }
    console.log('zoopla: done')
    await page.close()
    return results
  } catch (e) {
    console.log('zoopla: ', e)
    await page.close()
    return validatePuppeteerError(e)
  }
}

module.exports = zoopla
