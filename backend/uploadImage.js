const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support large base64 uploads

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>ShopBasket - Upload Founder Card</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-w: 400px; }
          h1 { color: #1e293b; margin-bottom: 10px; }
          p { color: #64748b; margin-bottom: 25px; }
          input[type=file] { margin-bottom: 20px; text-decoration: none; }
          button { background: #f97316; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
          button:hover { background: #ea580c; }
          #preview { max-width: 150px; border-radius: 50%; display: none; margin: 0 auto 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Upload Founder Image</h1>
          <p>This will instantly attach the photo to the About page.</p>
          <img id="preview" />
          <input type="file" id="fileInput" accept="image/*" />
          <br>
          <button id="uploadBtn" style="display:none;">Upload to ShopBasket</button>
          <p id="status" style="margin-top: 20px; color: green; font-weight: bold;"></p>
        </div>
        <script>
          let base64Image = null;
          document.getElementById('fileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
              base64Image = event.target.result;
              document.getElementById('preview').src = base64Image;
              document.getElementById('preview').style.display = 'block';
              document.getElementById('uploadBtn').style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
          });
          
          document.getElementById('uploadBtn').addEventListener('click', function() {
            document.getElementById('status').innerText = 'Uploading...';
            fetch('http://localhost:5001/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64Image })
            })
            .then(res => res.json())
            .then(data => {
              document.getElementById('status').innerText = 'Success! Image Uploaded!';
              setTimeout(() => { window.close(); }, 3000);
            })
            .catch(err => {
              document.getElementById('status').innerText = 'Error uploading image.';
              document.getElementById('status').style.color = 'red';
            });
          });
        </script>
      </body>
    </html>
  `);
});

app.post('/upload', (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  // Extract base64
  const base64Data = image.replace(/^data:image\/\\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  const destPath = path.join(__dirname, '../frontend/public/images/founder.jpg');
  fs.writeFileSync(destPath, buffer);
  
  console.log('Successfully saved founder.jpg to public images folder!');
  res.json({ success: true, message: 'Image uploaded and saved!' });
});

app.listen(5001, () => {
  console.log('Upload bridge running on http://localhost:5001');
});
