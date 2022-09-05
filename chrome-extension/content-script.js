/**
 * @description This is the part that gets injected in each frame of the page. It signals the Witchcraft background
 * script that a new frame has been loaded and gets ready (by creating a listener) to receive and load any matching
 * scripts.
 * document.readyState works like this {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState|mdn}
 */

chrome.runtime.onMessage.addListener(({ scriptType, scriptContents, scriptMode = 0 }) => {
  if ( scriptType === "js" ){
    const createScriptEl = ({ node = 'head', scriptContents }) => {
      const scriptEl = document.createElement('script');
      scriptEl.type = 'text/javascript';
      scriptEl.appendChild(document.createTextNode(scriptContents));
      scriptEl.setAttribute("data-witchcraft", "");  // to make it easy finding the element if we want to
      document[node].appendChild(scriptEl);
    };
    const {readyState} = document;
    let ev, node;
    switch ( scriptMode ){
      case 0:
        return Function(scriptContents)();
      case 1:
        node = 'head';
        return createScriptEl({ node, scriptContents });
      case 2:
        [ ev, node ] = [ 'load', 'body' ];
        if( readyState !== 'complete' ) return window.addEventListener(ev, () => ( createScriptEl({ node, scriptContents }) ));
        return createScriptEl({node, scriptContents});
      case 3:
        // if the readyState is loading then the next state of 'interactive' has not happened yet.
        [ ev, node ] = [ 'DOMContentLoaded', 'body' ];
        if( readyState ==='loading') return document.addEventListener(ev, () => ( createScriptEl({ node, scriptContents }) ));
        return createScriptEl({node,scriptContents});
    }

  } else if ( scriptType === "css" ){
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(scriptContents));
    style.setAttribute("data-witchcraft", "");  // to make it easy finding the element if we want to
    document.head.appendChild(style);
  }
});

chrome.runtime.sendMessage(location);
