
# dot.js: GreaseMonkey for developers

> "I almost wish you could just stick JavaScript in ~/.js. Do you know what I'm saying?"

dot.js is a Google Chrome extension that executes JavaScript files in `~/.js` based on the page domain being accessed.

If you navigate to `https://www.google.com`, dot.js will execute `~/.js/google.com.js`.

This makes it super easy to spruce up your favorite pages using JavaScript.

On subdomains such as http://gist.github.com, dot.js will try to load `~/.js/gist.github.com.js` as well as `~/.js/github.com.js` and `~/.js/com.js`.

GreaseMonkey user scripts are great, but you need to publish them somewhere and re-publish after making modifications. With dot.js, just add or edit files in `~/.js`. Script changes will immediately be seen by the extension; no need to reload anything.

*Note: this is my rendition of [defunkt](https://github.com/defunkt)'s original tool, [dotjs](https://github.com/defunkt/dotjs). Although I never got to actually use his implementation, I really wanted something like that. My approach works just the same as his, but it's way easier to install and should work for any platform that is able to run Node.js.*

# Example

    > cat ~/.js/google.com.js

    document.querySelectorAll('img')
        .forEach(img => img.style.transform = 'scaleX(-1)');

![defaced avatars](elgoog.png)

# How to install

This extension is composed of two parts: the Chrome extension itself and a local HTTP server running on Node.js. Follow these two steps below to install it.

## Step 1: start the server

First make sure you have [Node.js](https://nodejs.org) installed.

Go to the root of this repository and simply run:

    node dot.js

*Note: you may want to add it to your shell's login script, otherwise you'll need to restart it every time you reboot your system.*

## Step 2: install Chrome extension

The extension is in the folder `chrome-extension/`. Please refer to Google on how to install development Chrome extensions on the most recent Chrome release. I am not writing the steps here since this is likely to change for newer Chrome versions.

After both the server is running and the extension is installed, you're good to go. Write your kick-ass scripts and just put them under `~/.js`.

# How it works

Chrome extensions can't access the local file system, so dot.js runs a tiny web server on port 3131 that serves files out of `~/.js`.

The dot.js Chrome extension then makes ajax requests to http://localhost:3131/www.google.com any time you hit a page on `www.google.com`, for example, and executes the returned JavaScript.

Our tiny server, upon receiving a request to `www.google.com`, looks for these scripts, in this exact order:

* `~/.js/com.js`
* `~/.js/google.com.js`
* `~/.js/www.google.com.js`

And it returns a bundled version of all scripts it could find, ready to be executed by the extension. If there were a `com.js` and a `www.google.com.js`, the resulting script would be a concatenation of them.

Defunkt's original dot.js server ran over HTTPS, since Chrome complains if you request something over HTTP on a HTTPS page. This is called "mixed content" (see [this explanation](https://developers.google.com/web/fundamentals/security/prevent-mixed-content/what-is-mixed-content)).

This new approach allow us to request HTTP just fine, though. Chrome extensions have a foreground environment, where you have access to a page's content, and a background one, where your scripts run in a exclusive process created just for your extension. This same background process is shared among all your foreground instances. It also happens that the background process can request whatever it wants, including HTTP (non-secure) requests; and this is just what we need.

# To do

- allow for a custom script list to be loaded: if user accesses `google.com` and there is a `~/.js/google.com.list` file, override default behavior and load scripts in that list instead. The file can be a list of newline separated file names;
- allow for loading of custom images and CSS through our tiny server;
- allow for optional organization of scripts into subfolders (e.g.: `~/.js/com/google/`).

# Credits

* [defunkt](https://github.com/defunkt) and his [original implementation](https://github.com/defunkt/dotjs);
* witch icon downloaded from https://www.flaticon.com/free-icon/witch_477108.
