// backend/config/firebaseAdmin.js

const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(
  __dirname,
  './service.json'
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
