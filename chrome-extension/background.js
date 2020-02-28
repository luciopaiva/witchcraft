
// https://developers.google.com/analytics/devguides/collection/analyticsjs/tracking-snippet-reference#alternative-async-tag
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
ga('create', 'UA-159294933-1', 'auto');
ga('set', 'checkProtocolTask', null);  // https://stackoverflow.com/a/56442610/778272
ga('send', 'pageview', "/background");
// not relevant here, but good reference nevertheless:
// https://stackoverflow.com/a/30503705/778272
// explains the proper way to track content scripts

// bind it to window so it can be accessed from the popup screen
window.witchcraft = new Witchcraft(chrome, typeof document !== "undefined" ? document : undefined);
