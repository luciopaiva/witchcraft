
# Development

Node.js is required, but just to run tests. `nvm` is recommended to manage Node.js versions, but not required (just make sure your Node.js version is similar to the one `.nvmrc` currently points to). To install test dependencies:

    nvm i
    npm i

Then you're ready to run the tests with coverage:

    npm test

## Running integration tests on WSL2

It's possible to run integration tests on WSL2, but it requires some setup. [This SO answer](https://stackoverflow.com/a/78776116/778272) nails it:

```
sudo apt update
sudo apt install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
```

After installing all these packages, you should be able to run the following test:

```
npm i puppeteer # nodejs +14
cat <<EOF > index.js
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://www.google.com/')
  const title = await page.title()
  console.log(title) // prints "Google"
  await browser.close()
})()
EOF
node index.js
# prints "Google"
```

## Analytics

Analytics is not required, but can be optionally set via the following instructions.

To set up GA, the file `./chrome-extension/credentials.json` must be created. Its format should be:

    {
        "measurementId": "G-XXXXXXXXXX",
        "apiSecret": "0123456789012345678901"
    }

Where `measurementId` and `apiSecret` are values obtained from the Google Analytics console. Witchcraft is currently set up to use GA4.

