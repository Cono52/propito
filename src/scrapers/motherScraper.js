const puppeteer = require('puppeteer')
const deduplicateProperties = require('../deduplicateProperties')

const zoopla = require('./zoopla')
const rightMove = require('./rightmove')

const motherScraper = async searchParams => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  return Promise.all([
    zoopla(await browser.newPage(), searchParams),
    rightMove(await browser.newPage(), searchParams)
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
