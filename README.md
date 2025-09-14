
![Witchcraft](docs/src/assets/title.png)

Think Greasemonkey (or Tampermonkey, Violentmonkey) for developers.

Witchcraft is a Google Chrome extension for loading custom Javascript and CSS directly from a folder in your file system, injecting them into pages that match their files names.

It works by matching every page domain against script file names available in the scripts folder. For instance, if one navigates to `google.com`, Witchcraft will try to load and run `google.com.js` and `google.com.css`.

For more information on how to install and use it, head to Witchcraft's [home page](//luciopaiva.com/witchcraft).

# Serving local files

Chrome extensions cannot access local files directly for security reasons. To work around this, Witchcraft needs a local HTTP server to serve the scripts folder.

There are many ways to accomplish this. For example, if you have Python installed, you can run the following command in the scripts folder:

    python3 -m http.server 5743 

Alternatively, if you have Node.js installed, you can run:

    npx http-server -p 5743

# Development

See [here](./development.md).

# Technical notes

Read it [here](./technical-notes.md).

# Credits

Witchcraft is my rendition of [defunkt](//github.com/defunkt)'s original extension, [dotjs](//github.com/defunkt/dotjs). Although I never got to actually use dotjs (it only worked on macOS and the installation process was not easy), I really wanted something like that. Thanks, defunkt, for having such a cool idea.

Images in the logo were provided by [Freepik](//www.flaticon.com/authors/freepik).
