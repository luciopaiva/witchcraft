
# Development

Node.js is required, but just to run tests. `nvm` is recommended to manage Node.js versions, but not required (just make sure your Node.js version is similar to the one `.nvmrc` currently points to). To install test dependencies:

    nvm i
    npm i

Then you're ready to run the tests with coverage:

    npm test

Coverage also works in Webstorm seamlessly thanks to [`c8-as-nyc`](https://youtrack.jetbrains.com/issue/IDEA-315826/missing-c8-coverage-tool-support#focus=Comments-27-6999383.0-0).

## Analytics

Analytics is not required, but can be optionally set via the following instructions.

To set up GA, the file `./chrome-extension/credentials.json` must be created. Its format should be:

    {
        "measurementId": "G-XXXXXXXXXX",
        "apiSecret": "0123456789012345678901"
    }

Where `measurementId` and `apiSecret` are values obtained from the Google Analytics dashboard. Witchcraft is currently using GA4.
