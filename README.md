
![Witchcraft](art/witchcraft-banner.png)

Think Greasemonkey for developers.

Witchcraft is a Google Chrome extension that allows loading custom JavaScript and CSS scripts right from the file system, automatically injecting them into selected pages.

It works by matching the current page domain against script file names available in the scripts folder. For instance, if one navigates to `https://www.google.com`, Witchcraft will try to load and run `google.com.js` and `google.com.css`.

It also tries all domain levels. For instance, if one accesses `https://gist.github.com`, Witchcraft will try to load, in this order: `com.js`, `github.com.js` and `gist.github.com.js`... and the same goes for CSS. All domain levels for which a script is found will be loaded, not just the first one.

Whenever you edit or create new scripts, there's no need to reload anything other than the page where the scripts are supposed to run. It makes it way easier than other popular scripting tools, like Greasemonkey or Tampermonkey.

Witchcraft works on Windows, Mac and Linux.

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

# How to install and use

## Step 1: install Chrome extension

Get it from the Chrome Web Store [here](https://chrome.google.com/webstore/detail/witchcraft-inject-js-and/hokcepcfcicnhalinladgknhaljndhpc).

*You can also install it as a development extension (look for the extension under the folder `chrome-extension/`).*

## Step 2: add your scripts

Scripts must reside inside the extension's folder, under `scripts/`. To locate the extension folder:

- Windows: `\Users\<USER-NAME>\AppData\Local\Google\Chrome\User Data\Default\Extensions\hokcepcfcicnhalinladgknhaljndhpc\2.0.1_0\scripts`
- Mac: `~/Library/Application\ Support/Google/Chrome/Default/Extensions/hokcepcfcicnhalinladgknhaljndhpc/2.0.1_0/scripts`
- Linux: `~/.config/google-chrome/Default/Extensions/hokcepcfcicnhalinladgknhaljndhpc/2.0.1_0/scripts`

You may want to create a shortcut to it (e.g.: at `~/.witchcraft`) to make it easier to find the scripts folder.

# How it works

The Chrome extension listens for every frame being loaded in Chrome, parsing its location's host name. Then, for every domain level combination, it looks for JavaScript and CSS files under the extension's scripts folder.

Chrome extensions have a very strict policy regarding acess to the file system. Witchcraft's first version required a web server to run locally so it could provide access to the scripts folder. Since it's way easier to not have to start a web server, I decided to move the scripts folder inside the extension folder, from where it can freely load files, thus removing the necessity of having a server part.

On a side note, there's also the concept of a Chrome *app*, which has more permissions than an *extension*. The problem is that Google is shutting down Chrome apps for all platforms but ChromeOS, so making an app is not an option anymore.

Contextual note: Witchcraft is my rendition of [defunkt](https://github.com/defunkt)'s original tool, [dotjs](https://github.com/defunkt/dotjs). Although I never got to actually use dotjs, I really wanted something like that. My approach works just the same as his, but it's way easier to install (dotjs required a local server and SSL certificates) and works on Windows, Mac and Linux (dotjs only worked on Mac).

# Credits

* [defunkt](https://github.com/defunkt), author of [dotjs](https://github.com/defunkt/dotjs) (and GitHub co-founder);
* witch and witch hat icons by [Freepik](https://www.flaticon.com/authors/freepik), downloaded from [Flaticon](https://www.flaticon.com).
