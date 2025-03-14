
![Witchcraft](docs/title.png)

Think Greasemonkey (or Tampermonkey, Violentmonkey) for developers.

Witchcraft is a Google Chrome extension for loading custom Javascript and CSS directly from a folder in your file system, injecting them into pages that match their files names.

It works by matching every page domain against script file names available in the scripts folder. For instance, if one navigates to `google.com`, Witchcraft will try to load and run `google.com.js` and `google.com.css`.

For more information on how to install and use it, head to Witchcraft's [home page](//luciopaiva.com/witchcraft).

# New in version 3

If you are a regular Witchcraft user, be aware that version 3 introduces a few important changes.

## Everything is now working properly

Version 2 started presenting several problems due to recent changes in Chrome that started breaking extensions that cached its data in memory. Extensions started being arbitrarily unloaded from memory to save resources, and that presented many problems to Witchcraft which made the popup window misbehave and eventually scripts to not load at all.

This was completely fixed in version 3 that now properly stores its state in the local storage so nothing is lost.

## Execution environment

First, scripts now run in the same environment as the page. This means that your script will be able to access everything that is loaded in the `window` object of the page. This is a potential breaking change because Witchcraft used to run in an isolated environment that had access to the DOM, but had its own separate `window` object.

Running in the same environment as the page makes more sense because there is no reason for Witchcraft to protect the user from themselves. If they are modifying a page via scripting, they should be responsible for making sure that everything is working as expected and not conflicting with anything loaded in the `window` object.

Moreover, having a single environment causes less confusion, since it's no longer necessary to explain that content scripts run in a separate execution environment. It's also no longer needed to explain how the user can inject scripts into the page environment. Everything is just easier.

## Web Server Chrome app

Up until now, it was recommended to use Web Server Chrome app as the HTTP server serving scripts. That is no longer true because Chrome apps are no longer being supported by Google. Moreover, I've been seeing strange behavior where existing files are not found and 404 is returned, but when called a second time it suddenly works.

I'm still looking for an alternative that, once installed, will seamlessly serve the scripts folder. For now, I'm just running this from the scripts folder every time I start my computer:

    python3 -m http.server 5743 

# Development

See [here](./development.md).

# Technical notes

Read it [here](./technical-notes.md).

# Credits

Witchcraft is my rendition of [defunkt](//github.com/defunkt)'s original extension, [dotjs](//github.com/defunkt/dotjs). Although I never got to actually use dotjs (it only worked on macOS and the installation process was not easy), I really wanted something like that. Thanks, defunkt, for having such a cool idea.

Thanks [arimus](//github.com/arimus) for the idea of using Web Server for Chrome.

Images in the logo were provided by [Freepik](//www.flaticon.com/authors/freepik).
