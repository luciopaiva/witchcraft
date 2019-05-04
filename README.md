
![Witchcraft](docs/title.png)

Think Greasemonkey for more advanced users.

Witchcraft is a Google Chrome extension for loading custom Javascript and CSS directly from a folder in your file system, injecting them into pages that match their files names.

It works by matching every page domain against script file names available in the scripts folder. For instance, if one navigates to `www.google.com`, Witchcraft will try to load and run `google.com.js` and `google.com.css`.

For more information on how to install and use it, head to Witchcraft's [home page](//luciopaiva.com/witchcraft).

# Development

Node.js is required, but just to run tests. I also use `nvm` to manage Node.js versions, but that's not required (just make sure your Node.js version is similar to the one `.nvmrc` currently points to). To install test dependencies:

    cd <project-folder>
    nvm use
    npm install

Then you're ready to run tests:

    npm test

# Credits

Witchcraft is my rendition of [defunkt](//github.com/defunkt)'s original extension, [dotjs](//github.com/defunkt/dotjs). Although I never got to actually use dotjs (it only worked for MacOS and the installation process was not easy), I really wanted something like that. Thanks, defunkt, for having such a cool idea.

Thanks [arimus](//github.com/arimus) for the idea of using Web Server for Chrome.

The little witch and the witch hat icons were provided by [Freepik](//www.flaticon.com/authors/freepik).
