const express = require('express')
const app = express()
const getProperties = require('./propertyScraper.js')

const port = process.env.PORT || 8080

app.get('/getProps', async (req, res) => {
  console.log(req.query.scrapeword)
  if (!req.query.scrapeword) {
    res.status(400).send('Please provide a scrapeword')
    return
  }
  const result = await getProperties(req.query.scrapeword)
  res.json(result)
})

app.listen(port, () => {
  console.log(`listening on port ${port}!`)
  setUpCLI()
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
    const result = await getProperties(location, bedMax, bedMin, scrapeword)
    console.log(result)
    rl.prompt()
  }).on('close', () => {
    console.log('Have a great day!')
    process.exit(0)
  })
}
