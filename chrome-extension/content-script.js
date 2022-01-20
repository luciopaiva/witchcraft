/*
 This is the part that gets injected in each frame of the page. It signals the Witchcraft background script that a new
 frame has been loaded and gets ready (by creating a listener) to receive and load any matching scripts.
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

    if ( scriptMode === 0 ){
      Function(scriptContents)();
    }

    if ( scriptMode === 1 ){
      createScriptEl({ node : 'head', scriptContents })
    }

    if ( scriptMode === 2 ){
      window.addEventListener('load', (ev) => {
        createScriptEl({ node : 'body', scriptContents });
      })
    }

    if ( scriptMode === 3 ){
      document.addEventListener('DOMContentLoaded', (ev) => {
        createScriptEl({ node : 'body', scriptContents });
      });
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
