require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { zoopla, rightMove } = require('./scrapers')
const emailProps = require('./email.js')
const puppeteer = require('puppeteer')
const deduplicateProperties = require('./deduplicateProperties')

const port = process.env.PORT || 8000

const motherScraper = async (location, bedmax, bedmin, scrapeword) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  return Promise.all([
    zoopla(await browser.newPage(), location, bedmax, bedmin, scrapeword),
    rightMove(await browser.newPage(), location, bedmax, bedmin, scrapeword)
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
  if (!req.query.scrapeword) {
    res.status(400).send('Please provide a scrapeword')
    return
  }
  const { location, bedmax, bedmin, scrapeword, email } = req.query
  console.log(location, bedmax, bedmin, scrapeword, email)
  let result
  try {
    result = await motherScraper(location, bedmax, bedmin, scrapeword)
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
  if (process.env.NODE_ENV !== 'production') {
    setUpCLI()
  }
})

const setUpCLI = () => {
  const readline = require('readline')
  const rl = readline.createInterface(process.stdin, process.stdout)

  rl.setPrompt(
    'Enter location, bedsmax, bedsmin, scrape hook, comma seperated> '
  )
  rl.prompt()

  rl.on('line', async line => {
    if (!line || line === '') {
      rl.prompt()
      return
    }
    const [location, bedMax, bedMin, scrapeword] = line.split(', ')
    const result = await motherScraper(location, bedMax, bedMin, scrapeword)
    console.log(result)
    rl.prompt()
  }).on('close', () => {
    console.log('Have a great day!')
    process.exit(0)
  })
}
