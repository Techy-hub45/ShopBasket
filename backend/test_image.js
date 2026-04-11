const https = require('https');

https.get('https://image.pollinations.ai/prompt/test?width=800&height=800&nologo=true', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => {
    console.log('Received bytes:', Buffer.concat(data).length);
  });
}).on('error', (e) => {
  console.error(e);
});
