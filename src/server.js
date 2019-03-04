require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { zoopla, rightMove } = require('./scrapers')
const emailProps = require('./email.js')
const puppeteer = require('puppeteer')
const deduplicateProperties = require('./deduplicateProperties')

const port = process.env.PORT || 8000

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

app.get('/', async (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.html`))
})

app.get('/getPropsToEmail', async (req, res) => {
  if (!req.query.keyword) {
    res.status(400).send('Please provide a keyword')
    return
  }
  const { location, bedmax, bedmin, keyword, email } = req.query
  console.log(location, bedmax, bedmin, keyword, email)
  let result
  try {
    result = await motherScraper(location, bedmax, bedmin, keyword)
  } catch (e) {
    console.log('Something went wrong while scraping')
  }
  if (result) {
    emailProps(email, result)
  }
  res.json(result)
})

app.listen(port, () => {
  console.log(`listening on port ${port}!`)
})
