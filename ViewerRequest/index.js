'use strict';

const querystring = require('querystring');

// defines the allowed dimensions, default dimensions and how much variance from allowed
// dimension is allowed.

const MAX_WIDTH = 1500;
const MIN_WIDTH = 1;

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  // parse the querystrings key-value pairs. In our case it would be d=100x100
  const params = querystring.parse(request.querystring);
  // fetch the uri of original image
  // if there is no dimension attribute, just pass the request
  if (!params.w) {
    callback(null, request);
    return;
  }
  // set the width and height parameters
  const width = parseInt(params.w, 10);
  if (width > MAX_WIDTH) {
    console.log('too large specific width:', params.w);
    callback(null, request);
    return;
  } else if (width < MIN_WIDTH) {
    console.log('too small specific width:', params.w);
    callback(null, request);
    return;
  }

  // final modified url is of format /[orgPath]/w100/[orgFile]
  // ex) /images/w100/image.jpg
  const uriParts = request.uri.split('/');
  uriParts.splice(uriParts.length - 1, 0, `w${width}`);
  const fwdUri = uriParts.join('/');
  // console.log('fwdUri :', fwdUri);
  request.uri = fwdUri;
  callback(null, request);
};