const puppeteer = require('puppeteer')
const { blockedResourceTypes, skippedResources } = require('./resourceTypes')

const rightMoveScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true
    // args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  const URL =
    'https://www.rightmove.co.uk/property-to-rent/find.html?locationIdentifier=REGION%5E1234&maxBedrooms=1&minBedrooms=0&maxPrice=2000&minPrice=100&sortType=18&includeLetAgreed=false'

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

  // right move use some kind of region code so we can just use a url we need to enter the area in their search field
  await page.click('.filters-location > input', { clickCount: 2 })
  await page.keyboard.press('Backspace')
  await page.keyboard.type('Holborn')
  await page.waitFor(500)
  await page.waitForSelector('.autocomplete-suggestionLink')
  await page.click('.autocomplete-suggestion')
  await page.waitFor(500)

  // grab the number of pages and log them out
  const pages = '[data-bind="text: total"]'
  let pagesReturned
  await page.waitForSelector(pages).then(async () => {
    pagesReturned = await page.evaluate(
      pages => document.querySelector(pages).innerHTML,
      pages
    )
  })
  console.log('pages returned:', pagesReturned)

  // set up data array and push first page
  let data = []
  const urlWithRegionCode = page.url()
  data.push(
    ...(await page.evaluate(() => {
      const batch = []
      Array.from(document.querySelectorAll('.propertyCard')).forEach(card => {
        if (card.querySelector('.not-matched')) {
          batch.push({
            done: true
          })
          return
        }
        if (card.className.includes('propertyCard--featured')) {
          return
        }
        const link = card.querySelector('.propertyCard-img-link').href
        if (!link.includes('locationIdentifier')) {
          batch.push({
            link: link,
            price: card.querySelector('.propertyCard-price').innerText
          })
        }
      })
      return batch
    }))
  )

  // If we are already getting cards that dont have out keyword we quit
  if (data.find(obj => obj.done)) {
    console.log(data.filter(obj => !obj.done))
    return
  }

  for (let i = 1; i < pagesReturned; i++) {
    if (data.find(obj => obj.done)) {
      data.pop()
      console.log(data)
      return
    }
    if (i !== 0) {
      // skip first nav since we are already on first page of results
      console.log(`...navigating to page ${i + 1}`)
      await page.goto(`${urlWithRegionCode}&index=${i * 24}`)
    }
    await page.waitForSelector('.propertyCard')
    data.push(
      ...(await page.evaluate(() => {
        const batch = []
        Array.from(document.querySelectorAll('.propertyCard')).forEach(card => {
          if (card.querySelector('.not-matched')) {
            batch.push({
              done: true
            })
            return
          }
          if (card.className.includes('propertyCard--featured')) {
            return
          }
          const link = card.querySelector('.propertyCard-img-link').href
          if (!link.includes('locationIdentifier')) {
            batch.push({
              link: card.querySelector('.propertyCard-img-link').href,
              price: card.querySelector('.propertyCard-price').innerText
            })
          }
        })
        return batch
      }))
    )
  }
  console.log(data)
}

rightMoveScraper()
