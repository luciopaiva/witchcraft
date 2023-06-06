
![Witchcraft](docs/title.png)

Think Greasemonkey for developers.

Witchcraft is a Google Chrome extension for loading custom Javascript and CSS directly from a folder in your file system, injecting them into pages that match their files names.

It works by matching every page domain against script file names available in the scripts folder. For instance, if one navigates to `www.google.com`, Witchcraft will try to load and run `google.com.js` and `google.com.css`.

For more information on how to install and use it, head to Witchcraft's [home page](//luciopaiva.com/witchcraft).

# Development

Node.js is required, but just to run tests. `nvm` is recommended to manage Node.js versions, but not required (just make sure your Node.js version is similar to the one `.nvmrc` currently points to). To install test dependencies:

    nvm i
    npm i

Then you're ready to run the tests with coverage:

    npm test

Coverage also works in Webstorm seamlessly thanks to [`c8-as-nyc`](https://youtrack.jetbrains.com/issue/IDEA-315826/missing-c8-coverage-tool-support#focus=Comments-27-6999383.0-0).

# Technical notes

Read it [here](./technical-notes.md).

# Credits

Witchcraft is my rendition of [defunkt](//github.com/defunkt)'s original extension, [dotjs](//github.com/defunkt/dotjs). Although I never got to actually use dotjs (it only worked on macOS and the installation process was not easy), I really wanted something like that. Thanks, defunkt, for having such a cool idea.

Thanks [arimus](//github.com/arimus) for the idea of using Web Server for Chrome.

Images in the logo were provided by [Freepik](//www.flaticon.com/authors/freepik).
