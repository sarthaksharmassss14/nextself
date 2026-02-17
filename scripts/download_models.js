const fs = require('fs');
const https = require('https');
const path = require('path');

const models = [
  'face_landmark_68_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'ssd_mobilenet_v1_model-shard1',
  'ssd_mobilenet_v1_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-weights_manifest.json'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const dest = path.join(__dirname, '..', 'public', 'models');

if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

models.forEach(model => {
  const file = fs.createWriteStream(path.join(dest, model));
  https.get(baseUrl + model, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded ' + model);
    });
  });
});
