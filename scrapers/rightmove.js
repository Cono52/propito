const { blockedResourceTypes, skippedResources } = require('../resourceTypes')

const rightMove = async (page, location, bedsMax, bedsMin, scrapeWord) => {
  await page.setViewport({ width: 1920, height: 1080 })

  const rootUrl = 'https://www.rightmove.co.uk/property-to-rent/find.html?'
  const locationIdentifier = 'locationIdentifier=REGION%5E93554' // Brighton East Sussex
  const maxPrice = 2000
  const minPrice = 100

  const URL = `${rootUrl}${locationIdentifier}&maxBedrooms=${bedsMax}&minBedrooms=${bedsMin}&maxPrice=${maxPrice}&minPrice=${minPrice}&sortType=18&includeLetAgreed=false&keywords=${scrapeWord
    .split(' ')
    .join('%20')}`

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

  console.log('rightmove: ....going to page')
  await page.goto(URL)
  console.log('rightmove:  ....on page')
  // right move use some kind of region code so we can just use a url we need to enter the area in their search field
  await page.click('.filters-location > input', { clickCount: 2 })
  await page.keyboard.press('Backspace')
  await page.keyboard.type(location)
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
  console.log('rightmove: pages returned:', pagesReturned)

  // set up data array and push first page
  let data = []
  const urlWithRegionCode = page.url()
  console.log('\n\nrightMove: URL to hit:', urlWithRegionCode)
  data.push(
    ...(await page.evaluate(() => {
      const batch = []
      Array.from(document.querySelectorAll('.propertyCard')).forEach(card => {
        if (card.querySelector('.not-matched')) {
          console.log(
            'rightmove:  property found without keyword - return data'
          )
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
            price: card.querySelector('.propertyCard-price').innerText,
            desc: card.querySelector('[itemprop="description"]').innerText,
            listed: card.querySelector('[class*="addedOrReduced"').innerText,
            company: card
              .querySelector('.propertyCard-branchSummary-branchName')
              .innerText.split('by ')[1]
          })
        }
      })
      return batch
    }))
  )

  // If we are already getting cards that dont have out keyword we quit
  if (data.find(obj => obj.done)) {
    return data.filter(obj => !obj.done)
  }

  // loop through remaining pages
  for (let i = 1; i < pagesReturned; i++) {
    // if we find a "done" entry, we return the data
    if (data.find(obj => obj.done)) {
      return data.filter(obj => !obj.done)
    }
    if (i !== 0) {
      // skip first nav since we are already on first page of results
      console.log(`rightmove: ...navigating to page ${i + 1}`)
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
              price: card.querySelector('.propertyCard-price').innerText,
              desc: card.querySelector('[itemprop="description"]').innerText,
              listed: card.querySelector('[class*="addedOrReduced"').innerText,
              company: card
                .querySelector('.propertyCard-branchSummary-branchName')
                .innerText.split('by ')[1]
            })
          }
        })
        return batch
      }))
    )
  }

  return data
}

module.exports = rightMove
