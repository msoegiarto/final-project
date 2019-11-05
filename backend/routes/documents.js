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

// Environment variables
const get_token_url = 'MS_GLOBAL_TRANSLATOR_TEXT_ACCESS_TOKEN_URL';
if (!process.env[get_token_url])
  throw new Error('Please set/export the following environment variable: ' + get_token_url);
const translation_base_url = 'MS_TRANSLATOR_TEXT_BASE_URL';
if (!process.env[translation_base_url])
  throw new Error('Please set/export the following environment variable: ' + translation_base_url);

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

    const newFilename = await constructNewFilename(thisUser, uploadedFile.name, req.body.toLanguage);

    const thisFile = {
      data: uploadedFile.data,
      content_type: 'text/plain',
      file_name: newFilename,
      lang_from: req.body.fromLanguage,
      lang_to: req.body.toLanguage
    };

    //////////////////////////////////////////
    //                                      //
    // TODO: call the translation API here  //
    //                                      //
    //////////////////////////////////////////

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
  const user = await findUserAndPopulateFiles(inputUser);
  if (!userFound || !userFound._id) throw new Error({ message: 'User not found in the database' });

  return user;
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

const getMsTranslationToken = async () => {

  const getToken = await axios({
    method: 'POST',
    url: process.env[get_token_url],
    headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_TRANSLATION_TEXT_SUBSCRIPTION_KEY },
    data: ''
  });

  console.log('getToken', getToken.data);

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

router.post('/readline_localfile_test', async (req, res, next) => {
  try {
    const CHAR_COUNT_LIMIT_FOR_ONE_REQUEST = 4000;
    let totalCharLength = 0;
    let count = 0;
    let textArray = [];
    const countLimit = 50;

    const dir = path.join(__dirname, `../../test_file/die_verwandlung.txt`);

    // Note: we use the crlfDelay option to recognize all instances of CR LF ('\r\n') in input.txt as a single line break.
    const readInterface = readline.createInterface({
      input: fs.createReadStream(dir),
      crlfDelay: Infinity
      // output: process.stdout,
      // console: false
    });

    let string = '';
    readInterface.on('line', function (line) {
      let charLength = line.trim().split('').length;
      count += charLength;
      string += line;

      if (count + charLength >= countLimit) {
        textArray.push({ 'Text': string });
        string = '';
        count = 0;
      }

      console.log('string:', string);
      totalCharLength += charLength;
    });

    await once(readInterface, 'close');

    textArray.forEach((element, index) => {
      console.log('index', index, ':', element);
    });

    const get_token_url = 'MS_GLOBAL_TRANSLATOR_TEXT_ACCESS_TOKEN_URL';
    if (!process.env[get_token_url])
      throw new Error('Please set/export the following environment variable: ' + get_token_url);

    const getToken = await axios({
      method: 'POST',
      url: process.env[get_token_url],
      headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_TRANSLATION_TEXT_SUBSCRIPTION_KEY },
      data: ''
    });

    console.log('getToken', getToken.data);

    const translation_url = process.env[translation_base_url] + `&from=${req.body.fromLanguage}&to=${req.body.toLanguage}&textType=plain`;

    const res = await axios({
      method: 'POST',
      url: translation_url,
      headers: { 'Authorization': `Bearer ${getToken.data}`, 'Content-Type': `application/json` },
      data: textArray
    });

    if (res.data.error) {
      throw res.data.error;
    } else {
      console.log(res.data[0].translations);
      console.log(res.data[0].translations[0].text);
    }

    res.json({ totalCharLength: totalCharLength, text: res.data[0].translations[0].text });

  } catch (err) {
    console.error(err);
    res.json({ err: 'something went wrong' });
  }

});

module.exports = router;