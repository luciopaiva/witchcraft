
const
    assert = require("assert"),
    {describe, it, setup, teardown} = require("mocha"),
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
        chrome.reset();  // just to be on the safe side in case we missed any teardown

        witchcraft = new Witchcraft(chrome, undefined);
        sinon.stub(witchcraft, "queryServerForFile").resolves(sampleCode);

        sender = {
            tab: { id: tabId },
            frameId: 0
        };
    });

    teardown(function () {
        chrome.reset();
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

    it ("should correctly iterate path segments", function () {
        let levels = [...Witchcraft.iteratePathSegments("/")];
        assert.strictEqual(levels.length, 0);

        levels = [...Witchcraft.iteratePathSegments("")];
        assert.strictEqual(levels.length, 0);

        levels = [...Witchcraft.iteratePathSegments(undefined)];
        assert.strictEqual(levels.length, 0);

        levels = [...Witchcraft.iteratePathSegments("/foo")];
        assert.deepStrictEqual(levels, ["/foo"]);

        levels = [...Witchcraft.iteratePathSegments("/foo/bar/index.html")];
        assert.deepStrictEqual(levels, ["/foo", "/foo/bar", "/foo/bar/index.html"]);

        levels = [...Witchcraft.iteratePathSegments("/foo//bar/index.html")];
        assert.deepStrictEqual(levels, ["/foo", "/foo/bar", "/foo/bar/index.html"],
            "must deal with double slashes");
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
        assert.strictEqual(witchcraft.getScriptNamesForTab(1).size, 0);
        witchcraft.registerScriptForTabId("foo", 1);
        assert.strictEqual(witchcraft.getScriptNamesForTab(1).size, 1);
        witchcraft.registerScriptForTabId("foo", 1);
        assert.strictEqual(witchcraft.getScriptNamesForTab(1).size, 1);
    });

    it("should clear scripts", function () {
        assert.strictEqual(witchcraft.getScriptNamesForTab(sender.tab.id).size, 0);
        witchcraft.registerScriptForTabId("foo", sender.tab.id);
        assert.strictEqual(witchcraft.getScriptNamesForTab(sender.tab.id).size, 1);
        witchcraft.clearScriptsIfTopFrame(sender);
        assert.strictEqual(witchcraft.getScriptNamesForTab(sender.tab.id).size, 0);
    });

    it("should update interface for given tab", function () {
        const tabId = 1;
        sinon.spy(witchcraft, "updateIconWithScriptCount");

        // non-existing tab id, should report zero scripts
        witchcraft.updateIconAndTitle(1);
        assert(witchcraft.updateIconWithScriptCount.calledOnce);
        assert(witchcraft.updateIconWithScriptCount.calledWith(0));
        assert(chrome.browserAction.setTitle.calledOnce);

        // erase call history
        witchcraft.updateIconWithScriptCount.resetHistory();
        chrome.browserAction.setTitle.resetHistory();

        // existing tab id, should report 2 scripts
        witchcraft.registerScriptForTabId("foo", tabId);
        witchcraft.registerScriptForTabId("bar", tabId);
        witchcraft.updateIconAndTitle(tabId);
        assert(witchcraft.updateIconWithScriptCount.calledOnce);
        assert(witchcraft.updateIconWithScriptCount.calledWith(2));
        assert(chrome.browserAction.setTitle.calledOnce);

        // take the chance to check if updateInterface() updated the current tab id
        const scriptNames = witchcraft.getScriptNamesForTab(tabId);
        assert.strictEqual(scriptNames.size, 2);
        assert(scriptNames.has("foo"));
        assert(scriptNames.has("bar"));

        // erase call history
        witchcraft.updateIconWithScriptCount.resetHistory();
        chrome.browserAction.setTitle.resetHistory();
    });

    it("should load single script", async function () {
        await witchcraft.loadScript("google.com.js", Witchcraft.EXT_JS, sender);

        // check that the message is being sent to the tab
        assert(chrome.tabs.sendMessage.calledOnce);
        const call = chrome.tabs.sendMessage.getCall(0);
        assert.deepStrictEqual(call.args, [
            tabId, {
                scriptType: Witchcraft.EXT_JS,
                scriptContents: sampleCode
            }, {
                frameId: 0
            }
        ]);
    });

    it("should fetch all relevant scripts for hostname", async function () {
        const globalJs = Witchcraft.globalScriptName + ".js";
        const globalCss = Witchcraft.globalScriptName + ".css";

        const location = /** @type {Location} */ {
            hostname: "google.com",
        };
        await witchcraft.onScriptRequest(location, sender);

        const calls = witchcraft.queryServerForFile.getCalls();

        // must have made a total of 6 of calls: [global, google.com, com] x [js, css]
        assert.strictEqual(calls.length, 6);
        for (const call of calls) {
            assert.strictEqual(call.args.length, 2);
        }

        const actualScriptNames = calls.map(call => call.args[0]);
        assert.deepStrictEqual(actualScriptNames, [
            globalJs, globalCss,
            "com.js", "com.css",
            "google.com.js", "google.com.css"]);
    });

    it("should fetch all relevant scripts for hostname with a pathname", async function () {
        const globalJs = Witchcraft.globalScriptName + ".js";
        const globalCss = Witchcraft.globalScriptName + ".css";

        const location = /** @type {Location} */ {
            hostname: "luciopaiva.com",
            pathname: "/foo/bar/index.html",
        };
        await witchcraft.onScriptRequest(location, sender);

        const calls = witchcraft.queryServerForFile.getCalls();

        // must have made a total of 6 of calls:
        // [global, com, luciopaiva.com, luciopaiva.com/foo, luciopaiva.com/foo/bar, luciopaiva.com/foo/bar/index.html]
        // x [js, css]
        assert.strictEqual(calls.length, 12);
        for (const call of calls) {
            assert.strictEqual(call.args.length, 2);
        }

        const actualScriptNames = calls.map(call => call.args[0]);
        assert.deepStrictEqual(actualScriptNames, [
            globalJs, globalCss,
            "com.js", "com.css",
            "luciopaiva.com.js", "luciopaiva.com.css",
            "luciopaiva.com/foo.js", "luciopaiva.com/foo.css",
            "luciopaiva.com/foo/bar.js", "luciopaiva.com/foo/bar.css",
            "luciopaiva.com/foo/bar/index.html.js", "luciopaiva.com/foo/bar/index.html.css",
        ]);
    });

    it("should handle bad fetch responses", async function () {
        witchcraft.queryServerForFile.restore();  // remove stub placed during setup()

        witchcraft.fetch = async () => { throw new Error() };
        const response1 = await witchcraft.queryServerForFile("google.com.js", Witchcraft.EXT_JS);
        assert.strictEqual(response1, null);

        witchcraft.fetch = async () => { return { status: 500 } };
        const response2 = await witchcraft.queryServerForFile("google.com.js", Witchcraft.EXT_JS);
        assert.strictEqual(response2, null);

        witchcraft.fetch = async () => { return { status: 404 } };
        const response3 = await witchcraft.queryServerForFile("google.com.js", Witchcraft.EXT_JS);
        assert.strictEqual(response3, null);
    });

    it("should handle good fetch responses", async function () {
        witchcraft.queryServerForFile.restore();  // remove stub placed during setup()

        witchcraft.fetch = async () => { return { status: 200, text: async () => { return "hello"; } } };
        const response = await witchcraft.queryServerForFile("google.com.js", Witchcraft.EXT_JS);
        assert.strictEqual(response, "hello");
    });

    it("should handle local URL", async function () {
        witchcraft.queryServerForFile.restore();  // remove stub placed during setup()

        witchcraft.fetch = sinon.stub();

        const localFile = "google.com.js";
        await witchcraft.queryServerForFile(localFile, Witchcraft.EXT_JS);
        assert(witchcraft.fetch.calledOnce);
        assert(witchcraft.fetch.getCall(0)
            .calledWithExactly(witchcraft.serverAddress + localFile, witchcraft.fetchOptions));
    });

    it("should handle remote URL", async function () {
        witchcraft.queryServerForFile.restore();  // remove stub placed during setup()

        witchcraft.fetch = sinon.stub();

        const url = "https://google.com/foo.js";
        await witchcraft.queryServerForFile(url, Witchcraft.EXT_JS);
        assert(witchcraft.fetch.calledOnce);
        assert(witchcraft.fetch.getCall(0).calledWithExactly(url, witchcraft.fetchOptions));
    });

    it("should correctly match JavaScript include directives", function () {
        function testString(line) {
            const result = witchcraft.findIncludedScriptNames(line, Witchcraft.EXT_JS).next().value;
            return result ? result[0] : null;
        }

        // valid includes
        assert.strictEqual(testString("// @include foo.js"), "foo.js");
        assert.strictEqual(testString("/* @include foo.js */"), "foo.js");
        assert.strictEqual(testString('// @include "foo.js"'), "foo.js");
        assert.strictEqual(testString('/* @include "foo.js" */'), "foo.js");
        assert.strictEqual(testString('/* @include "foo.js"*/'), "foo.js");

        // valid remote includes
        assert.strictEqual(testString("// @include http://google.com/foo.js"), "http://google.com/foo.js");
        assert.strictEqual(testString('// @include "http://google.com/foo.js"'), "http://google.com/foo.js");

        // malformed includes
        assert.strictEqual(testString("// include foo.js"), null);  // missing the @
        assert.strictEqual(testString("/* include foo.js"), null);  // must close in the same line
        assert.strictEqual(testString(" include foo.js */"), null);  // must open in the same line
    });

    it("should correctly match CSS include directives", function () {
        function testString(line) {
            const result = witchcraft.findIncludedScriptNames(line, Witchcraft.EXT_CSS).next().value;
            return result ? result[0] : null;
        }

        // valid includes
        assert.strictEqual(testString("/* @include foo.css */"), "foo.css");
        assert.strictEqual(testString('/* @include "foo.css" */'), "foo.css");
        assert.strictEqual(testString('/*@include "foo.css" */'), "foo.css");
        assert.strictEqual(testString('/* @include "foo.css"*/'), "foo.css");
        assert.strictEqual(testString('/*@include "foo.css"*/'), "foo.css");

        // malformed includes
        assert.strictEqual(testString("/* include foo.css */"), null);  // missing the @
        assert.strictEqual(testString("/* @include foo.css"), null);  // must close in the same line
        assert.strictEqual(testString(" @include foo.css */"), null);  // must open in the same line
    });

    it("should process simple JavaScript include directives", async function () {
        const fileName = "foo.js";
        const script = `// 1\n// @include bar.js\n// 3`;

        witchcraft.queryServerForFile.reset();
        witchcraft.queryServerForFile.onCall(0).resolves("// 2");  // bar.js

        const result = await witchcraft.processIncludeDirectives(script, fileName, Witchcraft.EXT_JS, sender);

        assert.strictEqual(witchcraft.queryServerForFile.getCalls().length, 1);
        assert.strictEqual(result, "// 1\n// 2\n// 3");
    });

    it("should process two consecutive JavaScript include directives", async function () {
        const fileName = "foo.js";
        const script = "console.info('start')\n" +
            "// @include test1.js\n" +
            "// @include test2.js\n" +
            "console.info('end')";

        witchcraft.queryServerForFile.reset();
        witchcraft.queryServerForFile.onCall(0).resolves("console.info('test 1');");  // test1.js
        witchcraft.queryServerForFile.onCall(1).resolves("console.info('test 2');");  // test2.js

        const result = await witchcraft.processIncludeDirectives(script, fileName, Witchcraft.EXT_JS, sender);

        assert.strictEqual(witchcraft.queryServerForFile.getCalls().length, 2);
        assert.strictEqual(result, "console.info('start')\n" +
            "console.info('test 1');\n" +
            "console.info('test 2');\n" +
            "console.info('end')"
        );
    });

    it("should not break if JavaScript include is not found", async function () {
        const fileName = "foo.js";
        const script = `// 1\n// @include bar.js\n// 3`;

        witchcraft.queryServerForFile.reset();
        witchcraft.queryServerForFile.onCall(0).resolves(null);  // bar.js not found

        const result = await witchcraft.processIncludeDirectives(script, fileName, Witchcraft.EXT_JS, sender);

        assert.strictEqual(witchcraft.queryServerForFile.getCalls().length, 1);
        // we expect the include directive to have been replaced by a multiline comment with a warning
        assert(result.startsWith("// 1\n/*"));
        assert(result.endsWith("*/\n// 3"));
        assert.strictEqual(witchcraft.jsIncludesNotFoundCount, 1);
    });

    it("should process recursive JavaScript include directives", async function () {
        const fileName = "foo.js";
        const script = `// 1\n// @include bar.js\n// 3`;

        witchcraft.queryServerForFile.reset();
        witchcraft.queryServerForFile.onCall(0).resolves("// @include third.js");  // bar.js
        witchcraft.queryServerForFile.onCall(1).resolves("// 2");  // third.js

        const result = await witchcraft.processIncludeDirectives(script, fileName, Witchcraft.EXT_JS, sender);

        assert.strictEqual(witchcraft.queryServerForFile.getCalls().length, 2);
        assert.strictEqual(result, "// 1\n// 2\n// 3");
    });

    it("should detect and avoid CSS include dependency cycles", async function () {
        const fileName = "foo.js";
        const script = `// 1\n// @include bar.js\n// 3`;

        witchcraft.queryServerForFile.reset();
        witchcraft.queryServerForFile.onCall(0).resolves("// @include bar.js");  // bar.js

        const result = await witchcraft.processIncludeDirectives(script, fileName, Witchcraft.EXT_JS, sender);

        assert.strictEqual(witchcraft.queryServerForFile.getCalls().length, 1);
        // we expect the include directive to have been replaced by a multiline comment with a warning
        assert(result.startsWith("// 1\n/*"));
        assert(result.endsWith("*/\n// 3"));
    });

    it("should process simple CSS include directives", async function () {
        const fileName = "foo.css";
        const script = `div {}\n/* @include bar.css */\n.bar {}`;

        witchcraft.queryServerForFile.reset();
        witchcraft.queryServerForFile.onCall(0).resolves(".foo {}");  // bar.js

        const result = await witchcraft.processIncludeDirectives(script, fileName, Witchcraft.EXT_CSS, sender);

        assert.strictEqual(witchcraft.queryServerForFile.getCalls().length, 1);
        assert.strictEqual(result, "div {}\n.foo {}\n.bar {}");
    });

    it("should not break if CSS include is not found", async function () {
        const fileName = "foo.css";
        const script = `div {}\n/* @include bar.css */\n.bar {}`;

        witchcraft.queryServerForFile.reset();
        witchcraft.queryServerForFile.onCall(0).resolves(null);  // bar.css not found

        const result = await witchcraft.processIncludeDirectives(script, fileName, Witchcraft.EXT_CSS, sender);

        assert.strictEqual(witchcraft.queryServerForFile.getCalls().length, 1);
        // we expect the include directive to have been replaced by a multiline comment with a warning
        assert(result.startsWith("div {}\n/*"));
        assert(result.endsWith("*/\n.bar {}"));
        assert.strictEqual(witchcraft.cssIncludesNotFoundCount, 1);
    });

    it("should process recursive CSS include directives", async function () {
        const fileName = "foo.css";
        const script = `div {}\n/* @include bar.css */\n.bar {}`;

        witchcraft.queryServerForFile.reset();
        witchcraft.queryServerForFile.onCall(0).resolves("/* @include third.css */");  // bar.css
        witchcraft.queryServerForFile.onCall(1).resolves(".foo {}");  // third.css

        const result = await witchcraft.processIncludeDirectives(script, fileName, Witchcraft.EXT_CSS, sender);

        assert.strictEqual(witchcraft.queryServerForFile.getCalls().length, 2);
        assert.strictEqual(result, "div {}\n.foo {}\n.bar {}");
    });

    it("should detect and avoid CSS include dependency cycles", async function () {
        const fileName = "foo.css";
        const script = `div {}\n/* @include bar.css */\n.bar {}`;

        witchcraft.queryServerForFile.reset();
        witchcraft.queryServerForFile.onCall(0).resolves("/* @include bar.css */");  // bar.css

        const result = await witchcraft.processIncludeDirectives(script, fileName, Witchcraft.EXT_CSS, sender);

        assert.strictEqual(witchcraft.queryServerForFile.getCalls().length, 1);
        // we expect the include directive to have been replaced by a multiline comment with a warning
        assert(result.startsWith("div {}\n/*"));
        assert(result.endsWith("*/\n.bar {}"));
    });

    it("should fetch all included scripts", async function () {
        const includeFoo = "// @include foo.js";
        const sampleCodeWithIncludeDirective = `console.info('Hello');\n${includeFoo}\nconsole.info('world');`;
        const fooCode = "// foo";
        const startIndex = sampleCodeWithIncludeDirective.indexOf(includeFoo);
        const endIndex = startIndex + includeFoo.length;
        const finalCode = Witchcraft.spliceString(sampleCodeWithIncludeDirective, startIndex, endIndex, fooCode);

        witchcraft.queryServerForFile.reset();
        let callIndex = -1;
        witchcraft.queryServerForFile.onCall(++callIndex).resolves(null);  // _global.js
        witchcraft.queryServerForFile.onCall(++callIndex).resolves(null);  // _global.css
        witchcraft.queryServerForFile.onCall(++callIndex).resolves(sampleCodeWithIncludeDirective);  // com.js
        witchcraft.queryServerForFile.onCall(++callIndex).resolves(fooCode);  // foo.js (included from com.js)
        witchcraft.queryServerForFile.onCall(++callIndex).resolves(null);  // com.css
        const location = /** @type {Location} */ {
            hostname: "com",
        };

        const sendMetricsSpy = sinon.spy(witchcraft, "sendMetrics");

        await witchcraft.onScriptRequest(location, sender);

        const calls = witchcraft.queryServerForFile.getCalls();
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

        const loadedScripts = witchcraft.getScriptNamesForTab(sender.tab.id);
        assert.strictEqual(loadedScripts.size, 2);
        assert(loadedScripts.has("com.js"));
        assert(loadedScripts.has("foo.js"));

        assert(sendMetricsSpy.calledOnce);
    });

    it("should correctly set server address", function () {
        function test(address, expectedAddress = address) {
            witchcraft.setServerAddress(address);
            assert.strictEqual(witchcraft.getServerAddress(), expectedAddress);
        }

        test("https://github.com/");
        test("https://github.com", "https://github.com/");
        test("", witchcraft.defaultServerAddress);
        test("  https://github.com   ", "https://github.com/");
    });
});
