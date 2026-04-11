const https = require('https');

https.get('https://loremflickr.com/800/800/laptop', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers['location']);
}).on('error', (e) => {
  console.error(e);
});
