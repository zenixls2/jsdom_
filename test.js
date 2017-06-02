const {lambdaHandler} = require('./index');

lambdaHandler({
  queryStringParameters: {
    url: 'https://www.jp.usedmachinery.bz/members/list' +
         '?serviceId=&locationId=&firstChar=&page=2',
    method: 'POST',
    dataType: 'form',
    wait: '3',
    /*url: 'https://tw.yahoo.com',
    delay: '3',*/
  }
}, null, (error, response) => {
  // mimic AWS Lambda gateway's behaviour
  console.log(Buffer.from(response.body, 'latin1').toString('utf-8'))
})
