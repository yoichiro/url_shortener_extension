

var shindig = shindig || {};
shindig.oauth = shindig.oauth || {};


shindig.oauth.popup = function(options) {
  if (!("destination" in options)) {
    throw "Must specify options.destination";
  }
  if (!("windowOptions" in options)) {
    throw "Must specify options.windowOptions";
  }
  if (!("onOpen" in options)) {
    throw "Must specify options.onOpen";
  }
  if (!("onClose" in options)) {
    throw "Must specify options.onClose";
  }
  var destination = options.destination;
  var windowOptions = options.windowOptions;
  var onOpen = options.onOpen;
  var onClose = options.onClose;

  // created window
  var win = null;
  // setInterval timer
  var timer = null;

  function handleApproval() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    if (win) {
      win.close();
      win = null;
    }
    onClose();
    return false;
  }

  function checkClosed() {
    if ((!win) || win.closed) {
      win = null;
      handleApproval();
    }
  }


  function createOpenerOnClick() {
    return function() {
      // If a popup blocker blocks the window, we do nothing.  The user will
      // need to approve the popup, then click again to open the window.
      // Note that because we don't call window.open until the user has clicked
      // something the popup blockers *should* let us through.
      win = window.open(destination, "_blank", windowOptions);
      if (win) {
        // Poll every 100ms to check if the window has been closed
        timer = window.setInterval(checkClosed, 100);
        onOpen();
      }
      return false;
    };
  }

  
  function createApprovedOnClick() {
    return handleApproval;
  }

  return {
    createOpenerOnClick: createOpenerOnClick,
    createApprovedOnClick: createApprovedOnClick
  };
};

