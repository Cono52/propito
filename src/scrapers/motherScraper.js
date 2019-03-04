const puppeteer = require('puppeteer')
const deduplicateProperties = require('./deduplicateProperties')

const { zoopla, rightMove } = require('./index')

const motherScraper = async (location, bedmax, bedmin, keyword) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  return Promise.all([
    zoopla(await browser.newPage(), location, bedmax, bedmin, keyword),
    rightMove(await browser.newPage(), location, bedmax, bedmin, keyword)
  ]).then(async properties => {
    const joinScrapedResults = properties.reduce(
      (acc, curr) => acc.concat(curr),
      []
    )
    const unqiueResults = deduplicateProperties(joinScrapedResults)
    await browser.close()
    return unqiueResults
  })
}

module.exports = motherScraper
