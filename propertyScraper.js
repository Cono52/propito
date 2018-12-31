require("dotenv").config();
const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(process.env.URL);
  console.log("...loading first page");
  await page.setViewport({ width: 1400, height: 900 });

  const pagesReturned = await page.evaluate(() => {
    let el = document.querySelector(".paginate");
    return Array.from(el.children).length - 3; // minus 3 for Pages, Prev and Next elements
  });
  console.log(`...scraping pages 2-${pagesReturned + 1}`);

  const results = [];
  for (let i = 0; i < pagesReturned; i++) {
    if (i !== 0) {
      // skip first nav since we are already on first page of results
      console.log(`...navigating to page ${i + 1}`);
      await page.goto(`${process.env.URL}&pn=${i + 1}`);
    }
    await page.waitForSelector(".listing-results-wrapper");
    results.push(
      ...(await page.evaluate(key => {
        let data = []; // Create an empty array that will store our data
        let elements = document.querySelectorAll(".listing-results-wrapper"); // Select all property results
        elements = Array.from(elements).filter(
          el => el.innerText.indexOf(key) !== -1
        );
        for (var element of elements) {
          const priceTag = element.querySelector(".listing-results-price");
          const company = element.querySelector(".listing-results-marketed");
          data.push({
            price: priceTag.innerText,
            link: priceTag["href"],
            listed: company.innerText.split("\n")[0],
            company: company.innerText.split("\n")[1]
          });
        }
        return data;
      }, process.env.KEYWORD))
    );
  }
  console.log(results);
  await browser.close();
})();
