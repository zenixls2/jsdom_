const {lambdaHandler} = require('./index');

lambdaHandler({
  queryStringParameters: {
    url: 'https://www.digikey.com/en/supplier-centers',
    method: 'GET',
    wait: '5'
  }
}, null, (error, response) => {
  console.log(response.body)
})

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
  console.log(response.body);
})
