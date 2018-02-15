const request = require('request')
const url = require('url');
const fs = require('fs')
const jsdom = require("jsdom")
const {JSDOM} = jsdom;
const implSymbol = Symbol("impl");
const iconv = require('iconv-lite');
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("jsdomError", (e) => {/*console.log(e)*/});

exports.lambdaHandler = (event, context, callback) => {
  let params = event.queryStringParameters || event
  let _url = params.url
  let wait = parseInt(params.wait || 1) * 1000
  let delay = parseInt(params.delay || 5) * 1000
  let method = params.method || 'GET'
  let options = {
      url: _url,
      encoding: null,
      method: method,
      followRedirect: true,
      followAllRedirects: true,
      timeout: delay,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36" +
                      "(KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
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
    console.log(response.headers);
    try {
      let encoding = (response.headers['content-type'] || '').split('charset=')[1] || 'utf-8';
      let dom = new JSDOM(
        iconv.decode(body, encoding),
        {
          url: response.request.uri.href || _uri,
          headers: response.headers,
          userAgent: options.headers['User-Agent'],
          runScripts: 'dangerously',
          resources: ["script", "frame", "iframe"],
          virtualConsole: virtualConsole
        }
      );
      let tags = dom.window.document.getElementsByTagName('meta');
      for (let i=0; i<tags.length; i++) {
        if ((tags[i].getAttribute('http-equiv') || '').toLowerCase() == 'content-type') {
          let tagEncoding = tags[i].getAttribute('content').split("charset=")[1] || 'utf-8';
          if (encoding == 'utf-8' && tagEncoding != encoding) {
            dom = new JSDOM(
              iconv.decode(body, tagEncoding),
              {
                url: response.request.uri.href || _uri,
                headers: response.headers,
                userAgent: options.headers['User-Agent'],
                runScripts: 'dangerously',
                resources: ["script", "frame", "iframe"],
                virtualConsole: virtualConsole
              }
            );
            tags = dom.window.document.getElementsByTagName('meta');
          }
          tags[i].setAttribute('content', 'text/html; charset=UTF-8');
        }
      }

      let timer = dom.window.setTimeout(() => {
        callback(null, {
          statusCode: response.statusCode,
          headers: {
            'Content-Type':
              'text; charset=utf-8',
            'Location': dom.window.location.href,
          },
          body: dom.serialize().toString('utf-8'),
        });
        dom.window.close();
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
