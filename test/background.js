
const
    vm = require("vm"),
    fs = require("fs"),
    assert = require("assert"),
    {describe, it} = require("mocha"),
    chrome = require("sinon-chrome");

describe("Background script", function () {

    it ("should bind Witchcraft instance to window", function () {
        // Thanks this SO answer for showing how to do this: https://stackoverflow.com/a/26779746/778272
        const witchcraftCode = fs.readFileSync(__dirname + "/../chrome-extension/witchcraft.js");
        const backgroundCode = fs.readFileSync(__dirname + "/../chrome-extension/background.js");
        const context = {
            window: {},
            chrome: chrome,
        };

        vm.runInNewContext([witchcraftCode, backgroundCode].join("\n\n"), context);

        // should be listening for messages from the tab context
        assert(chrome.runtime.onMessage.addListener.calledOnce);
        // should be listening for tab switches
        assert(chrome.tabs.onActivated.addListener.calledOnce);

        assert.notStrictEqual(typeof context.window.witchcraft, "undefined");
        assert.strictEqual(context.window.witchcraft.constructor.name, "Witchcraft");
    });
});
