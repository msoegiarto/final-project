const axios = require('axios');
const qs = require('qs');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { once } = require('events');

// models

// constants
const CHARACTER_LIMIT_FOR_ONE_REQUEST = 9000;

// return a string array with each element has the length of CHARACTER_LIMIT_FOR_ONE_REQUEST or less
const _divideTextBasedOnCharLength = (input, result = []) => {
  if (!input) return result;

  if (input.length > CHARACTER_LIMIT_FOR_ONE_REQUEST) {
    // within the first 9000 character, find the index of the last whitespace character
    const lastWordIndexWithin9000Char = input.substring(0, CHARACTER_LIMIT_FOR_ONE_REQUEST + 1).search(/ [^ ]*$/);

    const newString = input.substring(0, lastWordIndexWithin9000Char);

    result.push(newString);
    return _divideTextBasedOnCharLength(input.substring(lastWordIndexWithin9000Char), result);
  } else {
    result.push(input);
    return _divideTextBasedOnCharLength('', result);
  }
}

const _constructRequestData = (data) => {
  console.log('[YANDEX _constructRequestData] START');
  const dataString = data instanceof Buffer ? data.toString() : data;
  console.log('[YANDEX _constructRequestData] END');
  return _divideTextBasedOnCharLength(dataString);
}

const _sendRequest = async (stringOfText, fromLanguage, toLanguage) => {
  console.log('[YANDEX _sendRequest] START');

  const url = process.env.YANDEX_TRANSLATION_TEXT_BASE_URL;

  const yandexTranslationResult = await axios({
    method: 'POST',
    url: url,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({
      lang: `${fromLanguage}-${toLanguage}`,
      key: process.env.YANDEX_TRANSLATION_API_KEY,
      format: 'plain',
      text: stringOfText
    })
  });

  console.log('[YANDEX _sendRequest] END');
  return yandexTranslationResult.data.text;
}

const _writeFile = async (filepath, filename, textArray) => {
  console.log('[YANDEX _writeFile] START');

  // const dir = path.join(__dirname, `../../test_file/${filename}`); // local for test
  const dir = path.join(__dirname, `${filepath}/${filename}`);
  // to know more about flags, visit: https://nodejs.org/api/fs.html#fs_file_system_flags
  const stream = fs.createWriteStream(dir, { flags: 'w', encoding: 'utf8', emitClose: true });

  stream.once('open', function (fd) {

    stream.write('Powered by Yandex.Translate: http://translate.yandex.com\r\n\r\n');

    for (let i = 0; i < textArray.length; i++) {
      const data = textArray[i];
      stream.write(data);
    }

    stream.end();
  });

  await once(stream, 'close');
  console.log('[YANDEX _writeFile] END');
}

class YandexTranslation {
  constructor() {
    if (!process.env.YANDEX_TRANSLATION_API_KEY)
      throw new Error('Please set/export the following environment variable: YANDEX_TRANSLATION_API_KEY');

    if (!process.env.YANDEX_TRANSLATION_TEXT_BASE_URL)
      throw new Error('Please set/export the following environment variable: YANDEX_TRANSLATION_TEXT_BASE_URL');
  }

  async translate(data, fromLanguage, toLanguage) {
    const readfileResult = data instanceof Buffer ? _constructRequestData(data) : [data];
    const yandexResults = [];

    for (let i = 0; i < readfileResult.length; i++) {
      const response = await _sendRequest(readfileResult[i], fromLanguage, toLanguage);
      yandexResults.push(response);
    }

    return new Promise(resolve => { resolve({ textArray: yandexResults }) });
  }

  async writeFile(filepath, filename, textArray) {
    await _writeFile(filepath, filename, textArray[0]);
  }
}

module.exports = YandexTranslation;