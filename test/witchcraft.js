
const
    assert = require("assert"),
    {describe, it, setup} = require("mocha"),
    sinon = require("sinon"),
    chrome = require("sinon-chrome"),
    Witchcraft = require("../chrome-extension/witchcraft");

describe("Witchcraft", function () {

    const tabId = 42;
    const sampleCode = "// some javascript code";

    /** @type {Witchcraft} */
    let witchcraft;
    let sender;

    setup(function () {
        witchcraft = new Witchcraft(chrome, undefined);
        sinon.stub(witchcraft, "queryLocalServerForFile").resolves(sampleCode);

        sender = {
            tab: { id: tabId },
            frameId: 0
        };
    });

    it ("should correctly iterate domain levels", function () {
        let levels = [...Witchcraft.iterateDomainLevels("www.google.com")];
        assert.strictEqual(levels.length, 3);
        assert.deepStrictEqual(levels, ["com", "google.com", "www.google.com"]);

        levels = [...Witchcraft.iterateDomainLevels("luciopaiva.com")];
        assert.strictEqual(levels.length, 2);
        assert.deepStrictEqual(levels, ["com", "luciopaiva.com"]);

        levels = [...Witchcraft.iterateDomainLevels("foo")];
        assert.strictEqual(levels.length, 1);
        assert.deepStrictEqual(levels, ["foo"]);

        levels = [...Witchcraft.iterateDomainLevels("")];
        assert.strictEqual(levels.length, 1);
        assert.deepStrictEqual(levels, [""]);
    });

    it ("should be able to splice strings", function () {
        // insert by shifting
        assert.strictEqual(Witchcraft.spliceString("foofoo", 3, 3, "bar"), "foobarfoo");
        // insert by replacing the same amount
        assert.strictEqual(Witchcraft.spliceString("foobarfoo", 3, 6, "BAR"), "fooBARfoo");
        // insert by replacing with more characters
        assert.strictEqual(Witchcraft.spliceString("foobarfoo", 3, 6, "BARBAR"), "fooBARBARfoo");
        // insert by replacing with less characters
        assert.strictEqual(Witchcraft.spliceString("foobarfoo", 3, 6, "B"), "fooBfoo");
        // insert at beginning
        assert.strictEqual(Witchcraft.spliceString("foobar", 0, 0, ":-)"), ":-)foobar");
        // insert at the end
        assert.strictEqual(Witchcraft.spliceString("foobar", 6, 6, "8-D"), "foobar8-D");
        // with line breaks
        assert.strictEqual(Witchcraft.spliceString("foo\n\n\nbar", 5, 5, "hello"), "foo\n\nhello\nbar");
    });

    it("should not add same script twice for same tab", function () {
        assert.strictEqual(witchcraft.getScriptNamesForTabId(1).size, 0);
        witchcraft.registerScriptForTabId("foo", 1);
        assert.strictEqual(witchcraft.getScriptNamesForTabId(1).size, 1);
        witchcraft.registerScriptForTabId("foo", 1);
        assert.strictEqual(witchcraft.getScriptNamesForTabId(1).size, 1);
    });

    it("should update interface for given tab", function () {
        sinon.spy(witchcraft, "updateIconWithScriptCount");

        // non-existing tab id, should report zero scripts
        witchcraft.updateInterface(1);
        assert(witchcraft.updateIconWithScriptCount.calledOnce);
        assert(witchcraft.updateIconWithScriptCount.calledWith(0));
        assert(chrome.browserAction.setTitle.calledOnce);

        // erase call history
        witchcraft.updateIconWithScriptCount.resetHistory();
        chrome.browserAction.setTitle.resetHistory();

        // existing tab id, should report 2 scripts
        witchcraft.registerScriptForTabId("foo", 1);
        witchcraft.registerScriptForTabId("bar", 1);
        witchcraft.updateInterface(1);
        assert(witchcraft.updateIconWithScriptCount.calledOnce);
        assert(witchcraft.updateIconWithScriptCount.calledWith(2));
        assert(chrome.browserAction.setTitle.calledOnce);

        // erase call history
        witchcraft.updateIconWithScriptCount.resetHistory();
        chrome.browserAction.setTitle.resetHistory();
    });

    it("should load single script", async function () {
        await witchcraft.loadScript("google.com", "js", sender);

        // check that the message is being sent to the tab
        assert(chrome.tabs.sendMessage.calledOnce);
        const call = chrome.tabs.sendMessage.getCall(0);
        assert.deepStrictEqual(call.args, [
            tabId, {
                scriptType: "js",
                scriptContents: sampleCode
            }, {
                frameId: 0
            }
        ]);
    });

    it("should fetch all relevant scripts for hostname", async function () {
        const globalJs = Witchcraft.globalScriptName + ".js";
        const globalCss = Witchcraft.globalScriptName + ".css";

        await witchcraft.onScriptRequest("google.com", sender);

        const calls = witchcraft.queryLocalServerForFile.getCalls();

        // must have made a total of 6 of calls: [global, google.com, com] x [js, css]
        assert.strictEqual(calls.length, 6);
        for (const call of calls) {
            assert.strictEqual(call.args.length, 1);
        }

        const actualScriptNames = calls.map(call => call.args[0]);
        assert.deepStrictEqual(actualScriptNames, [
            globalJs, globalCss,
            "com.js", "com.css",
            "google.com.js", "google.com.css"]);
    });

    it("should process include directives", async function () {
        const includeFoo = "// @include foo.js";
        const sampleCodeWithIncludeDirective = `console.info('Hello');\n${includeFoo}\nconsole.info('world');`;
        const fooCode = "// foo";
        const startIndex = sampleCodeWithIncludeDirective.indexOf(includeFoo);
        const endIndex = startIndex + includeFoo.length;
        const finalCode = Witchcraft.spliceString(sampleCodeWithIncludeDirective, startIndex, endIndex, fooCode);

        witchcraft.queryLocalServerForFile.reset();
        let callIndex = -1;
        witchcraft.queryLocalServerForFile.onCall(++callIndex).resolves(null);  // _global.js
        witchcraft.queryLocalServerForFile.onCall(++callIndex).resolves(null);  // _global.css
        witchcraft.queryLocalServerForFile.onCall(++callIndex).resolves(sampleCodeWithIncludeDirective);  // com.js
        witchcraft.queryLocalServerForFile.onCall(++callIndex).resolves(fooCode);  // foo.js (included from com.js)
        witchcraft.queryLocalServerForFile.onCall(++callIndex).resolves(null);  // com.css
        await witchcraft.onScriptRequest("com", sender);

        const calls = witchcraft.queryLocalServerForFile.getCalls();
        assert.strictEqual(calls.length, 5);
        const requestedScripts = calls.map(call => call.args[0]);
        assert.deepStrictEqual(requestedScripts, [
            "_global.js",
            "_global.css",
            "com.js",
            "foo.js",
            "com.css",
        ]);

        assert(chrome.tabs.sendMessage.calledOnce);
        const tabMessageCall = chrome.tabs.sendMessage.getCall(0);
        assert.strictEqual(tabMessageCall.args.length, 3);
        assert.strictEqual(tabMessageCall.args[1].scriptContents, finalCode);
    });
});
