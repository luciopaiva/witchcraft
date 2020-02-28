
// bind it to window so it can be accessed from the popup screen
window.analytics = new Analytics();
window.analytics.send("Background", "Load");

// bind it to window so it can be accessed from the popup screen
window.witchcraft = new Witchcraft(chrome, typeof document !== "undefined" ? document : undefined, window.analytics);
