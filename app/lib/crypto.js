let CryptoJS = require('crypto-js');

let keySize = 512;

let ivSize = 256;

let saltSize = 256;

let iterations = 128;

const encrypt = (msg, pass) => {
  let salt = CryptoJS.lib.WordArray.random(saltSize / 8);

  // eslint-disable-next-line new-cap
  let key = CryptoJS.PBKDF2(pass, salt, {
    keySize: keySize / 32,
    iterations: iterations
  });

  let iv = CryptoJS.lib.WordArray.random(ivSize / 8);

  let encrypted = CryptoJS.AES.encrypt(msg, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  return salt.toString() + iv.toString() + encrypted.toString();
};

const decrypt = (transitmessage, pass) => {
  let salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 64));

  let iv = CryptoJS.enc.Hex.parse(transitmessage.substr(64, 64));

  let encrypted = transitmessage.substring(128);

  // eslint-disable-next-line new-cap
  let key = CryptoJS.PBKDF2(pass, salt, {
    keySize: keySize / 32,
    iterations: iterations
  });

  try {
    return CryptoJS.AES.decrypt(encrypted, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    }).toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return '';
  }
};

const hash = (msg, salt = '') => {
  // eslint-disable-next-line new-cap
  return CryptoJS.SHA256(`${salt}${msg}`).toString();
};

module.exports = {
  encrypt,
  decrypt,
  hash
};
