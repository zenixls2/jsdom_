const request = require('request')
const url = require('url');
const fs = require('fs')
let lastline = fs.readFileSync('./node_modules/jsdom/lib/api.js').toString().split('\n');
if (lastline[lastline.length-1] !== 
  'exports.defaultDocumentFeatures = defaultDocumentFeatures;') {
  fs.appendFileSync('node_modules/jsdom/lib/api.js', '\nconst {defaultDocumentFeatures} = require("./jsdom/browser/documentfeatures");\ndefaultDocumentFeatures.FetchExternalResources = ["script", "link", "frame", "iframe"];\nexports.defaultDocumentFeatures = defaultDocumentFeatures;');
}
const jsdom = require("jsdom")
const {JSDOM} = jsdom;
const implSymbol = Symbol("impl");

exports.lambdaHandler = (event, context, callback) => {
  let params = event.queryStringParameters || event
  let _url = params.url
  let wait = parseInt(params.wait || 1) * 1000
  let delay = parseInt(params.delay || 5) * 1000
  let method = params.method || 'GET'
  let options = {
      url: _url,
      method: method,
      followRedirect: true,
      followAllRedirects: true,
      timeout: delay,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36" +
                      "(KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
      }
    }
  let wrappedCallback = (error, response, body) => {
    if (error) {
      console.log('[WARNING] ', error);
      return callback(null, {
        statusCode: 504,
        headers: {'Content-Type': 'text/html; charset=utf-8'},
        body: '<html lang="ja"></html>',
      })
    }
    try {
      let dom = new JSDOM(body, {
        url: _url,
        userAgent: options.headers['User-Agent'],
        runScripts: 'dangerously',
      });

      let timer = dom.window.setTimeout(() => {
        callback(null, {
          statusCode: response.statusCode,
          headers: {'Content-Type': 'text; charset=utf-8'},
          body: dom.serialize(),
        });
      }, wait);
    } catch(e) {
      console.log('[Error] ', e);
      return callback(null, {
        statusCode: 500,
        headers: {'Content-Type': 'text/html; charset=utf-8'},
        body: '<html lang="ja"></html>',
      })
    }
  }
  if (method === 'POST') {
    let urlObject = url.parse(_url);
    _url = url.format(
        {
          protocol: (urlObject.protocol || 'http:'),
          slashes: urlObject.slashes,
          auth: urlObject.auth || '',
          host: urlObject.host || 'localhost',
          pathname: urlObject.pathname || '/',
          hash: urlObject.hash || '',
          search: '',
        });
    params.url = _url;
    let dataType = params.dataType || 'form';
    if (dataType === 'json')
      options.json = urlObject.query;
    else if (dataType === 'form') {
      options.form = urlObject.query;
    } else if (dataType === 'formdata') {
      options.formData = {}
      // Not supported yet
    }
  }
  request(options, wrappedCallback);
};