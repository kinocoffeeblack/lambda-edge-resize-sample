'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');

// 参考： https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html

// set the S3 endpoints
const BUCKET = 'study-cf-origin-us-east-1-756298751873';

exports.handler = async (event, context, callback) => {
  let response = event.Records[0].cf.response;

  console.log('Response status code :%s', response.status);
  // check if image is not present
  // ここで404でチェックできるようにするためにはS3バケットのバケットポリシーでs3:ListBucktの許可の追加が必要(s3:GetObjectだけだと403になる)
  if (response.status != '404') {
    callback(null, response);
    return;
  }

  let request = event.Records[0].cf.request;
  let path = request.uri;

  // read the S3 key from the path variable. Ex: path variable /img/w100/image.jpg
  let key = path.substring(1);

  const keyParts = key.split('/');
  const fileName = keyParts[keyParts.length - 1];
  const fileNameParts = fileName.split('.');
  const extention = fileNameParts[fileNameParts.length - 1];

  // correction for jpg required for 'Sharp'
  const requiredFormat = extention === 'jpg' ? 'jpeg' : extention;

  if (!(requiredFormat === 'jpeg' || requiredFormat === 'png')) {
    // support only jpeg or png.
    callback(null, response);
    return;
  }

  // get width. Ex: images/w100/image.jpg → 100
  let width;
  const widthPart = keyParts[keyParts.length - 2];
  try {
    width = parseInt(widthPart.substring(1), 10);
  } catch (err) {
    console.log('cannot get width from widthPart: %s', widthPart);
    callback(null, response);
    return;
  }

  // remove width part. Ex: images/w100/image.jpg → images/image.jpg
  keyParts.splice(keyParts.length - 2, 1);
  const originalKey = keyParts.join('/');

  // get the source image file
  console.log('getObject originalKey:', originalKey);
  let s3Data;
  try {
    s3Data = await S3.getObject({ Bucket: BUCKET, Key: originalKey }).promise();
  } catch (err) {
    console.log('Exception while reading source image :%j',err);
    callback(null, response);
    return;
  }

  // perform the resize operation
  const sharpedBuff = await Sharp(s3Data.Body).resize(width).toBuffer();

  // save the resized object to S3 bucket with appropriate object key.
  try {
    await S3.putObject({
      Body: sharpedBuff,
      Bucket: BUCKET,
      ContentType: 'image/' + requiredFormat,
      CacheControl: 'max-age=31536000',
      Key: key,
      StorageClass: 'STANDARD'
    }).promise();
  } catch (err) {
    console.log('Exception while writing resized image to bucket', err);
    callback(null, response);
    return;
  }

  // generate a binary response with resized image
  response.status = '200';
  response.body = sharpedBuff.toString('base64');
  response.bodyEncoding = 'base64';
  response.headers['content-type'] = [{ key: 'Content-Type', value: 'image/' + requiredFormat }];
  callback(null, response);
};