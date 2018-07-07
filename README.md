
![Witchcraft](art/witchcraft-banner.png)

Think Greasemonkey for developers.

Witchcraft is a Google Chrome extension that allows loading custom JavaScript and CSS scripts right from your file system, automatically injecting them into target pages.

It works by matching every page domain against script file names available in the scripts folder. For instance, if one navigates to `https://www.google.com`, Witchcraft will try to load and run `google.com.js` and `google.com.css`.

Witchcraft also tries all domain levels. For instance, if one accesses `https://gist.github.com`, it will try to load, in this order: `com.js`, `github.com.js` and `gist.github.com.js`... and the same for CSS. All domain levels for which a script is found will be loaded, not just the first one.

Whenever you edit or create new scripts, there's no need to reload anything other than the page where the scripts are supposed to run. This is what makes Witchcraft special and different than other popular scripting tools, like Greasemonkey or Tampermonkey.

Since Witchcraft runs as a Chrome extension, it is also cross-platform. It has been tested on Windows, MacOS and Linux.

## What if I want to inject jQuery (or any other library, for that matter?)

Use Witchcraft's `@include` directive. Anywhere in your script (say, `google.com.js`), type:

    // @include jquery.js

Then just include `jquery.js` in your scripts folder. You can include any number of scripts you want. Included scripts will also have their `@include` directives parsed in recursive fashion. Dependency cycles (e.g., `foo.js` includes `bar.js`, which includes `foo.js`) will be automatically resolved and each script won't be loaded more than once.

# Example

Sample Javascript:

    > cat google.com.js

    window.addEventListener("load" => {
        document.querySelectorAll("img")
            .forEach(img => img.style.transform = "scaleX(-1)");
    });

Sample CSS:

    > cat google.com.css

    img {
        filter: grayscale(100%);
    }

![](elgoog.png)

Practical uses includes getting rid of nasty ads, automating clicks and improving page layouts with your own CSS rules. You're only limited to what Javascript and CSS can do.

# How to install and use

## 1. Install Chrome extension

Get it from the Chrome Web Store [here](https://chrome.google.com/webstore/detail/witchcraft-inject-js-and/hokcepcfcicnhalinladgknhaljndhpc).

*You can also install it as a development extension (look for the extension under the folder `chrome-extension/` and manually load it as an unpacked extension).*

## 2. Install Web Server app for Chrome

Witchcraft will try to load files from `http://127.0.0.1:5743` (irrelevant note: 0x53 and 0x43 are ASCii codes for `W` and `C`). For instance, to load `google.com.js`, the request URL will be `http://127.0.0.1:5743/google.com.js`.

The easiest way to go is to install [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb). This app will let you server a local folder at designated port. Choose port `5743` and select the folder where your scripts will be located (suggested folder: `~/.wildcraft`). Mark it to automatically start so you don't have to worry about it ever again:

![](docs/web-server.PNG)

Of course, you are free to use whatever server you prefer. All it has to do is to be able to serve files directly from the folder where you chose to store your scripts. For other options, check this [gist](https://gist.github.com/willurd/5720255) with a thorough list of ways to serve a local folder.

# Technical note on accessing local files

Witchcraft listens for every *frame* being loaded in Chrome, parsing its location's host name. Then, for every domain level combination, it looks for JavaScript and CSS files by requesting them to the local server.

Chrome extensions have a very strict policy regarding access to the file system. That's why Witchcraft needs a local web server. Unfortunately, the only way to not depend on a local server would be to also have a Chrome app (apps are allowed to do some things that extensions can't). The problem is that new Chrome apps are not being accepted by the store any more, because Google is discontinuing support for them on all platforms except ChromeOS. I tried even serving scripts from inside the extension folder, but Chrome complains that the extension installation is corrupt and disables the extension. So it looks like we're stuck with either installing a third-party app that does that or running our own local server.

# Credits

Witchcraft is my rendition of [defunkt](https://github.com/defunkt)'s original extension, [dotjs](https://github.com/defunkt/dotjs). Although I never got to actually use dotjs (it only worked for MacOS and the installation process was not easy), I really wanted something like that. Thanks, defunkt, for having such a cool idea.

Thanks [arimus](https://github.com/arimus) for the idea of using Web Server for Chrome.

The little witch and the witch hat icons were provided by [Freepik](https://www.flaticon.com/authors/freepik).
