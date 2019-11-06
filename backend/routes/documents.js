const Router = require('express').Router;
const ObjectId = require('mongoose').Types.ObjectId;
const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const { once } = require('events');
const JSZip = require('jszip');
const path = require('path');

const router = new Router();

// Users model
const Users = require('../models/Users');
const Userfiles = require('../models/Userfiles');

// Timer
const timer = {
  constant: 600000,
  time: 0,
  token: '',
};

// Constant
const CHARACTER_LIMIT_FOR_ONE_REQUEST = 4000;
const CHARACTER_LIMIT_DELIMITER = '==========';

/**
 * @GET /api/translate/documents
 * 
 */
router.get('/', (req, res, next) => {
  console.log('test');
  res.json({ msg: `GET /api/translate/documents` });
});

/**
 * @POST /api/translate/documents
 * 
 */
router.post('/', async (req, res, next) => {
  try {
    const thisUser = getUserFromRequest(req);
    const userFound = await findUserAndPopulateFiles(thisUser);

    const returnValue = {};

    if (!(userFound && userFound.email && userFound.authentication)) {
      await saveUser(thisUser);
      returnValue.msg = `user saved`;
      returnValue.translatedFiles = [];
    } else {
      const translatedFiles = getTranslatedFiles(userFound.user_files);
      returnValue.msg = translatedFiles.length > 0 ? `user has files` : `user has no files`;
      returnValue.translatedFiles = translatedFiles;
    }

    return res.json(returnValue);
  } catch (err) {
    res.status(500).json({ err });
    next(err);
  }
});

/**
 * @POST /api/translate/documents/translate
 * 
 */
router.post('/translate', async (req, res, next) => {
  try {
    const thisUser = getUserFromRequest(req);

    if (!req.files || !req.files.file) throw new Error('No file uploaded');

    const uploadedFile = req.files.file; // file=what we define in react

    const { fromLanguage, toLanguage } = req.body;

    const newFilename = await constructNewFilename(thisUser, uploadedFile.name, toLanguage);

    // read the file
    const readfileResult = await readbufferTextPlain(uploadedFile.data);
    const readfileResultTextArray = readfileResult.textArray;

    // msTranslationRequests is a dictionary, it consists of at least 1 function call to the Translation API
    const msTranslationRequests = msTransPrepareRequest(readfileResultTextArray, fromLanguage, toLanguage);

    // send the request to the Translation API
    const sendRequestFunction = Object.keys(msTranslationRequests);
    let results = [];
    for (let i = 0; i < sendRequestFunction.length; i++) {
      const f1 = msTranslationRequests[sendRequestFunction[i]]();
      results.push(await f1);
    }

    consolidateResponseArray(results);

    // create a buffer
    const buf = msTransCreateABufferFromResponseArr(results[0]);

    const thisFile = {
      data: buf,
      content_type: 'text/plain',
      file_name: newFilename,
      lang_from: fromLanguage,
      lang_to: toLanguage,
      char_length: readfileResult.totalCharLength
    };

    const savedUser = await saveFileAndRetrieveUserInfo(thisUser, thisFile);

    const translatedFiles = getTranslatedFiles(savedUser.user_files);

    return res.json({ translatedFiles });
  } catch (err) {
    res.status(500).json({ err });
    next(err);
  }
});

/**
 * @DELETE /api/translate/documents/delete
 * 
 */
router.delete('/delete', async (req, res, next) => {
  const tobeDeletedFileIds = req.body.translatedFiles;
  if (!tobeDeletedFileIds || tobeDeletedFileIds.length === 0)
    return res.status(400).json({ err: 'no files to be deleted' });

  try {
    const thisUser = getUserFromRequest(req);
    const userFound = await deleteFilesAndRetrieveUserInfo(thisUser, tobeDeletedFileIds);
    const translatedFiles = getTranslatedFiles(userFound.user_files);

    return res.json({ msg: 'files deleted', translatedFiles });
  } catch (err) {
    res.status(500).json({ err });
    next(err);
  }
});

/**
 * @POST /api/translate/documents/download
 * 
 */
router.post('/download', async (req, res, next) => {
  const tobeDownloadedFileIds = req.body.translatedFiles;
  if (!tobeDownloadedFileIds || tobeDownloadedFileIds.length === 0)
    return res.status(400).json({ err: 'no file to be downloaded' });

  try {
    if (tobeDownloadedFileIds.length === 1) {
      const fileId = tobeDownloadedFileIds[0].id;
      const file = await Userfiles.findById(fileId);
      const fileData = file.data;

      // download 1 file 
      res.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment;filename=${file.file_name}`,
      });
      return res.send(Buffer.from(fileData, 'binary'));
    } else {
      // zip multiple file
      const zip = new JSZip();
      const dataFolder = zip.folder('translatedfiles');

      for (let i = 0; i < tobeDownloadedFileIds.length; i++) {
        const fileId = tobeDownloadedFileIds[i].id;
        const file = await Userfiles.findById(fileId);
        const fileData = file.data;
        dataFolder.file(`${file.file_name}`, fileData);
      }

      zip.generateAsync({ type: 'nodebuffer' })
        .then((content) => {
          res.set({
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment;filename=${Date.now()}.zip`,
          });
          return res.send(Buffer.from(content, 'binary'));
        });
    }

  } catch (err) {
    res.status(500).json({ err });
    next(err);
  }

});

const deleteFilesAndRetrieveUserInfo = async (inputUser, tobeDeletedFileIds) => {
  for (let i = 0; i < tobeDeletedFileIds.length; i++) {
    // remove the file reference on the user record
    await Users.updateOne(
      {},
      {
        "$pull": {
          "user_files": new ObjectId(tobeDeletedFileIds[i].id)
        }
      }
    );
    // delete the file from userfiles table
    await Userfiles.deleteOne({ _id: tobeDeletedFileIds[i].id });
  }

  // get latest data from user
  const userFound = await findUserAndPopulateFiles(inputUser);
  if (!userFound || !userFound._id) throw new Error({ message: 'User not found in the database' });

  return userFound;
}

const saveUser = async (inputUser) => {
  const newUser = new Users(inputUser);
  const savedUser = await newUser.save({});
  return savedUser;
}

const saveFileAndRetrieveUserInfo = async (inputUser, inputFile) => {

  const userFound = await findUserAndPopulateFiles(inputUser);
  if (!userFound || !userFound._id) throw new Error({ message: 'User not found in the database' });

  const fileSaved = await _saveFile(userFound._id, inputFile);

  // push file reference to user record
  userFound.user_files.push(fileSaved);

  // save the user record
  const userResult = await userFound.save({});

  return userResult;

}

const constructNewFilename = async (inputUser, oldName, toLang) => {

  const nameArray = oldName.split('.');
  const ext = nameArray.pop();
  const name = nameArray.join('.') + '_' + toLang;

  const newFilenameNoExt = await _getNewFilenameNoExt(inputUser, name);

  return (newFilenameNoExt + '.' + ext);
}

/** 
 * @param filename
 * format: <filename>_<toLanguage>
 * example: airbnbGuide_it
*/
const _getNewFilenameNoExt = async (inputUser, filename) => {

  const user = await Users.findOne(inputUser);
  if (!user || !user._id) throw new Error('User not found in the database');

  // find duplicate filename
  const fileFound = await Userfiles
    .findOne({ file_owner: user._id, file_name: { $regex: '.*' + filename + '.*' } })
    .sort({ create_date: 'desc' });

  if (isFileFound(fileFound)) {
    // remove extension
    const filenameArr = fileFound.file_name.split('.');
    filenameArr[filenameArr.length - 1] = null;
    filenameArr.pop();

    // remove prefix
    const tail = filenameArr.join('.').replace(filename, '');

    if (!tail) {
      return (filename + '_2');
    } else {
      // remove underscore
      const numberStr = tail.substring(1);
      // increment the number
      const newNumber = parseInt(numberStr) + 1;
      return (filename + '_' + newNumber);
    }
  }

  return filename;
}

const findUserAndPopulateFiles = async (inputUser) => {
  const user = await Users.findOne(inputUser)
    .populate('user_files')
    .exec();
  return user;
}

const _saveFile = async (userId, inputFile) => {
  const newFile = new Userfiles({
    data: inputFile.data,
    content_type: inputFile.content_type,
    file_name: inputFile.file_name,
    lang_from: inputFile.lang_from,
    lang_to: inputFile.lang_to,
    char_length: inputFile.char_length,
    file_owner: userId
  });

  const savedFile = await newFile.save({});
  return savedFile;
}

const getTranslatedFiles = userFiles => {
  const translatedFiles = [];

  if (isFileFound(userFiles)) {
    userFiles.forEach(element => {
      let newObj = {
        id: element._id,
        name: element.file_name,
        fromLanguage: element.lang_from,
        toLanguage: element.lang_to
      };
      translatedFiles.push(newObj);
    });
  }

  return translatedFiles;
}

const getUserFromRequest = req => {
  let errMessage = '';
  if (!req.body.email) errMessage += 'User email';
  if (!req.body.authentication) errMessage += errMessage ? ' and authentication' : 'User authentication';
  if (errMessage) {
    errMessage += ' not found';
    throw new Error({ message: errMessage });
  }

  return {
    email: req.body.email,
    authentication: req.body.authentication
  };
}

const isFileFound = files => {
  if (Array.isArray(files)) {
    return (files.length > 0);
  }
  return (files && files.file_name !== '');
}

const readbufferTextPlain = (data) => {
  console.log('[readbufferTextPlain] START');

  if (!data instanceof Buffer)
    throw new Error('not a instanceof Buffer');

  let totalCharLength = 0;
  let textArray = [];
  let counter = 1;

  const dataArray = data.toString().split(/(?:\r\n|\r|\n)/g);

  for (let i = 0; i < dataArray.length; i++) {
    console.log(i, dataArray[i]);
    if (!dataArray[i]) {
      textArray.push({ 'Text': '' });
      continue;
    }

    const lineArr = dataArray[i].split('.');

    for (let j = 0; j < lineArr.length; j++) {
      let text = lineArr[j].trim() ? lineArr[j] + '.' : '';

      textArray.push({ 'Text': text });

      totalCharLength += text.length;

      if (totalCharLength >= (counter * CHARACTER_LIMIT_FOR_ONE_REQUEST)) {
        textArray.push(CHARACTER_LIMIT_DELIMITER);
        counter++;
      }
    }

  }
  console.log(totalCharLength);
  console.log(textArray);
  console.log('[readbufferTextPlain] END');
  return {
    totalCharLength,
    textArray
  };
}

const readfileTextPlain = async (file) => {
  console.log('[readfileTextPlain] START');

  let totalCharLength = 0;
  let textArray = [];
  let counter = 1;

  // readline.Interface -> input is a stream
  // Note: we use the crlfDelay option to recognize all instances of CR LF ('\r\n') in input.txt as a single line break.
  const readInterface = readline.createInterface({
    input: fs.createReadStream(file),
    crlfDelay: Infinity
  });

  readInterface.on('line', function (line) {

    if (line) {
      const lineArr = line.split('.');

      for (let i = 0; i < lineArr.length; i++) {
        let text = lineArr[i].trim() ? lineArr[i] + '.' : '';

        textArray.push({ 'Text': text });

        totalCharLength += text.length;

        if (totalCharLength >= (counter * CHARACTER_LIMIT_FOR_ONE_REQUEST)) {
          textArray.push(CHARACTER_LIMIT_DELIMITER);
          counter++;
        }
      }

      textArray.push({ 'Text': '' });
    }

  });

  await once(readInterface, 'close');

  console.log('[readfileTextPlain] END');

  return {
    totalCharLength,
    textArray
  };
}

const msTransWriteAFileFromResponseArr = async (filename, inputArray) => {
  console.log('[writeIntoFile] START');

  const dir = path.join(__dirname, `../../test_file/${filename}`);

  const stream = fs.createWriteStream(dir, { flags: 'w', encoding: 'utf8', emitClose: true });

  stream.once('open', function (fd) {
    let text = '';
    for (let i = 0; i < inputArray.length; i++) {
      const data = inputArray[i]['translations'][0]['text'];

      if (!data || i === inputArray.length - 1) {
        stream.write(text);
        stream.write('\n');
        text = '';
      } else {
        text += `${data}`;
      }

    }
    stream.end();
  });

  await once(stream, 'close');
  console.log('[writeIntoFile] END');
}

const msTransSendRequest = async (requestData, fromLanguage, toLanguage) => {
  console.log('[msTransSendRequest] START');

  // get the microsoft token 
  const token = await getMsTranslationToken();

  const translation_url = process.env.MS_TRANSLATOR_TEXT_BASE_URL + `&from=${fromLanguage}&to=${toLanguage}&textType=plain`;

  const msTranslationResult = await axios({
    method: 'POST',
    url: translation_url,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': `application/json` },
    data: requestData
  });
  if (msTranslationResult.data.error) throw res.data.error;

  console.log('[msTransSendRequest] END');
  return msTranslationResult.data;
}

const msTransPrepareRequest = (inputArray, fromLanguage, toLanguage) => {

  const sendRequestFunction = {};

  // divide the 'inputArray' based on delimiter
  // save the indices of the division
  const indices = [];
  let idx = inputArray.indexOf(CHARACTER_LIMIT_DELIMITER);
  while (idx !== -1) {
    indices.push(idx);
    idx = inputArray.indexOf(CHARACTER_LIMIT_DELIMITER, idx + 1);
  }
  indices.push(inputArray.length);

  // create a dictionary
  // each element of the dictionary is a function
  // example: { function_<index> : msTransSendRequest(args) }
  for (let i = 0; i < indices.length; i++) {
    let arrSliced = null;
    if (i === 0) {
      arrSliced = inputArray.slice(0, indices[i]);
    } else {
      arrSliced = inputArray.slice(indices[i - 1] + 1, indices[i]);
    }
    sendRequestFunction['function_' + i] = () => {
      return msTransSendRequest(arrSliced, fromLanguage, toLanguage);
    }
  }

  return sendRequestFunction;
}

const consolidateResponseArray = responseArray => {
  // this function combines the elements of an array into one element, which is element[0]
  if (responseArray.length <= 1) return;

  responseArray[0] = [...responseArray[0], ...responseArray[1]];
  delete responseArray[1];
  responseArray.splice(1, 1);
  consolidateResponseArray(responseArray);
}

const msTransCreateABufferFromResponseArr = strArr => {
  let str = '';
  for (let i = 0; i < strArr.length; i++) {
    const data = strArr[i]['translations'][0]['text'];
    if (!data || i === strArr.length - 1) {
      str += '\n';
    } else {
      str += data;
    }
  }
  return Buffer.from(str);
}

/**
 * This function will return a ms translation token.
 * The token will change every 10 minutes. 
 */
const getMsTranslationToken = async () => {
  console.log('[getMsTranslationToken] START');

  const _getToken = async () => {
    const getToken = await axios({
      method: 'POST',
      url: process.env.MS_MEGA_TRANSLATOR_TEXT_ACCESS_TOKEN_URL,
      headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_TRANSLATION_TEXT_SUBSCRIPTION_KEY },
      data: ''
    });
    return getToken.data;
  }

  const currentTime = Date.now();
  const timeDiff = timer.time ? currentTime - timer.time : timer.constant;

  if (timeDiff >= timer.constant) {
    timer.token = await _getToken();
    timer.time = currentTime;
  }

  console.log('[getMsTranslationToken] END');
  return timer.token;
}

/**
 * @POST /api/translate/documents/save_test
 * 
 */
router.post('/save_test', (req, res, next) => {
  if (req.files === null) {
    return res.status(400).json({ msg: `No file uploaded` });
  }

  const fromLanguage = req.body.from;
  const toLanguage = req.body.to;
  console.log(fromLanguage, toLanguage);

  const uploadedFile = req.files.file; // file=what we define in react

  const dir = path.join(__dirname, `../../client/public/uploads/${uploadedFile.name}`);
  uploadedFile.mv(dir, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  });

  res.json({ msg: `POST /api/translate/documents`, fileName: uploadedFile.name, filePath: `/uploads/${uploadedFile.name}` });
});

/**
 * @POST /api/translate/documents/download_test
 * test zipping one file
 */
router.post('/download_test', (req, res, next) => {
  const tobeDownloadedFileIds = req.body.translatedFiles;

  const fileId = tobeDownloadedFileIds[0].id;
  Userfiles.findById(fileId).exec((err, file) => {
    if (err) throw err;
    const fileData = file.data;
    // zip the file
    const zip = new JSZip();
    const dataFolder = zip.folder('translatedfiles');
    dataFolder.file(`${file.file_name}`, fileData);
    zip.generateAsync({ type: 'nodebuffer' })
      .then((content) => {
        res.set({
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment;filename=${file.file_name}.zip`,
        });
        return res.send(Buffer.from(content, 'binary'));
      });
  });

});

/**
 * @POST /readline_localfile_test
 * read a local file
 * call third party api
 * write into a newfile
 */
router.post('/readline_localfile_test', async (req, res, next) => {
  try {

    const file = path.join(__dirname, `../../test_file/die_verwandlung.txt`);

    // read the file
    const readfileResult = await readfileTextPlain(file);
    const readfileResultTextArray = readfileResult.textArray;

    // msTranslationRequests is a dictionary, it consists of at least 1 function call to the Translation API
    const msTranslationRequests = msTransPrepareRequest(readfileResultTextArray, req.body.fromLanguage, req.body.toLanguage);

    // send the request to the Translation API
    const sendRequestFunction = Object.keys(msTranslationRequests);
    let results = [];
    for (let i = 0; i < sendRequestFunction.length; i++) {
      const f1 = msTranslationRequests[sendRequestFunction[i]]();
      results.push(await f1);
    }

    // consolidate the array of response, so that the array only have one element, which is element[0]
    consolidateResponseArray(results);

    // write the file
    await msTransWriteAFileFromResponseArr('newfile.txt', results[0]);

    res.json({ totalCharLength: readfileResult.totalCharLength });

  } catch (err) {
    console.error(err);
    res.json({ err: 'something went wrong' });
  }

});

module.exports = router;