function initialize() {
  // Get the access token from the query string and set it to the cookie.
  var hash = location.hash.substring(1);
  hash = hash.split("&");
  var params = {};
  hash.each(function(p) {
    var a = p.split("=");
    params[a[0]] = a[1];
  });
  var accessToken = params.access_token;
  localStorage["access_token"] = accessToken;
  var expiresIn = params.expires_in;
  localStorage["expires_in"] = expiresIn;
  parent.window.postMessage("close", "*");
}

window.onload = function() {
    initialize();
};