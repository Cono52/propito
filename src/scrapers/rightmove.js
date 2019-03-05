const { blockedResourceTypes, skippedResources } = require('../resourceTypes')
const axios = require('axios')

const getRegionCodeForLocation = async location => {
  if (location.length % 2) {
    location = location.slice(0, location.length - 1)
  }

  const cutUpLocation = location
    .toUpperCase()
    .split('')
    .reduce(
      (acc, curr, i) =>
        !((i + 1) % 2) ? acc.concat(`${curr}/`) : acc.concat(curr),
      []
    )
    .join('')
  return axios
    .get(`https://www.rightmove.co.uk/typeAhead/uknostreet/${cutUpLocation}`)
    .then(({ data }) =>
      data.typeAheadLocations[0].locationIdentifier.split('^').join('%5E')
    )
}

function extractor () {
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
}

const rightMove = async (
  page,
  { location, bedsMax, bedsMin, priceMin, priceMax, keyword }
) => {
  await page.setViewport({ width: 1920, height: 1080 })
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

  const rootUrl = 'https://www.rightmove.co.uk/property-to-rent/find.html?'
  const code = await getRegionCodeForLocation(location)
  const locationIdentifier = `locationIdentifier=${code}`

  let URL = `${rootUrl}${locationIdentifier}`
  if (bedsMax) URL = URL.concat(`&maxBedrooms=${bedsMax}`)
  if (bedsMin) URL = URL.concat(`&minBedrooms=${bedsMin}`)
  if (priceMax) URL = URL.concat(`&maxPrice=${priceMax}`)
  if (priceMin) URL = URL.concat(`&minPrice=${priceMin}`)
  URL = URL.concat(
    `&sortType=18&includeLetAgreed=false&keywords=${keyword
      .split(' ')
      .join('%20')}`
  )

  console.log('rightmove: url to hit -> ', URL)
  console.log('rightmove: ....going to page')
  await page.goto(URL)
  console.log('rightmove:  ....on page')

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
  await page.waitForSelector('.links-group-header span')
  await page.waitFor(500)
  data.push(...(await page.evaluate(extractor)))

  // If we are already getting cards that dont have our keyword, we quit
  if (data.find(obj => obj.done)) {
    await page.close()
    console.log('match found with no keyword on p1 - EXIT')
    return data.filter(obj => !obj.done)
  }

  // loop through remaining pages
  for (let i = 1; i < pagesReturned; i++) {
    // if we find a "done" entry, we return the data
    if (data.find(obj => obj.done)) {
      await page.close()
      console.log('match found with no keyword - EXIT')
      return data.filter(obj => !obj.done)
    }

    console.log(`rightmove: ...navigating to page ${i + 1}`)
    await page.goto(`${URL}&index=${i * 24}`)
    await page.waitForSelector('.links-group-header span')
    await page.waitFor(500)
    data.push(...(await page.evaluate(extractor)))
  }

  await page.close()
  return data
}

module.exports = rightMove
