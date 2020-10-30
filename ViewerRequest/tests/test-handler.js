'use strict';

const index = require('../index.js');
const chai = require('chai');
const fs = require('fs');
const expect = chai.expect;
var event, context;

describe('Test OptimizeImg', function () {
  it('test resize', async () => {
    const evetFile = 'event-cf';
    event = JSON.parse(fs.readFileSync(`tests/${evetFile}.json`));
    await index.handler(event, context, (hoge, request) => {
      expect(request.uri).to.equal('/img/w100/sakura.jpg');
    });
  });

});
