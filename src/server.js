require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')

const { motherScraper } = require('./scrapers')
const emailProps = require('./email.js')

const port = process.env.PORT || 8000

app.get('/', async (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.html`))
})

app.get('/getPropsToEmail', async (req, res) => {
  if (!req.query.keyword) {
    res.status(400).send('Please provide a keyword')
    return
  }
  const {
    location,
    bedmax,
    bedmin,
    pricemax,
    pricemin,
    keyword,
    email
  } = req.query
  console.log(location, bedmax, bedmin, pricemax, pricemin, keyword, email)
  let result
  try {
    result = await motherScraper({
      location,
      bedsMax: bedmax,
      bedsMin: bedmin,
      priceMin: pricemin,
      priceMax: pricemax,
      keyword
    })
  } catch (e) {
    console.log('Something went wrong while scraping')
    console.log(e)
  }
  if (result) {
    emailProps(email, result)
  }
  res.json(result)
})

app.listen(port, () => {
  console.log(`listening on port ${port}!`)
})
