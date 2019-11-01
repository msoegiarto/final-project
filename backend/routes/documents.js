const Router = require('express').Router;
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

const router = new Router();

// Users model
const Users = require('../models/Users');
const Userfiles = require('../models/Userfiles');

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
    const userFound = await _findUserAndPopulateFiles(thisUser);

    const returnValue = {};
    const translatedFiles = [];

    if (!isUserFound(userFound)) {
      await saveUser(thisUser);
      returnValue.msg = `user saved`;
      returnValue.translatedFiles = translatedFiles;
    } else {
      const userFiles = userFound.user_files;
      if (isFileFound(userFiles)) {
        userFiles.forEach(element => {
          const newObj = {
            id: element._id,
            name: element.file_name,
            fromLanguage: element.lang_from,
            toLanguage: element.lang_to
          }
          translatedFiles.push(newObj);
        });
        returnValue.msg = `user has files`;
      } else {
        returnValue.msg = `user has no files`;
      }
      returnValue.translatedFiles = translatedFiles;
    }
    return res.json(returnValue);
  } catch (err) {
    res.status(500).json({ err: err.message });
    next();
  }
});

/**
 * @POST /api/translate/documents/translate
 * 
 */
router.post('/translate', async (req, res, next) => {
  try {
    const thisUser = getUserFromRequest(req);
    const uploadedFile = req.files.file; // file=what we define in react
    const newFilename = await constructNewFilename(thisUser, uploadedFile.name, req.body.toLanguage);

    const thisFile = {
      data: uploadedFile.data,
      content_type: 'text/plain',
      file_name: newFilename,
      lang_from: req.body.fromLanguage,
      lang_to: req.body.toLanguage
    };

    const savedUser = await saveFile(thisUser, thisFile);

    const translatedFiles = [];
    savedUser.user_files.forEach(element => {
      let newObj = {
        id: element._id,
        name: element.file_name,
        fromLanguage: element.lang_from,
        toLanguage: element.lang_to
      }
      translatedFiles.push(newObj);
    });

    return res.json({ translatedFiles });
  } catch (err) {
    res.status(500).json({ err: err.message });
    next();
  }
});

/**
 * @DELETE /api/translate/documents/delete
 * 
 */
router.delete('/delete', async (req, res, next) => {
  const tobeDeletedFileIds = req.body.translatedFiles;
  if (!tobeDeletedFileIds || tobeDeletedFileIds.length === 0)
    return res.status(400).json({ err: 'no ids to be deleted' });

  console.log('tobeDeletedFileIds', tobeDeletedFileIds);

  const thisUser = getUserFromRequest(req);

  try {
    const user = await deleteFiles(thisUser, tobeDeletedFileIds);
    const userfiles = user.user_files;
    
    const translatedFiles = [];

    if (isFileFound(userfiles)) {
      userfiles.forEach(element => {
        let newObj = {
          id: element._id,
          name: element.file_name,
          fromLanguage: element.lang_from,
          toLanguage: element.lang_to
        }
        translatedFiles.push(newObj);
      });
    }
    console.log(translatedFiles);

    return res.json({ msg: 'files deleted', translatedFiles });
  } catch (err) {
    res.status(500).json({ err: err.message });
    next();
  }
});

/**
 * @POST /api/translate/documents/download
 * 
 */
router.post('/download', (req, res, next) => {
  const thisUser = getUserFromRequest(req);
  const fileToDownload = req.body.translatedFiles;

  try {
    fileToDownload.forEach(element => {
      const fileId = element.id;
      Userfiles.findById(fileId).exec((err, file) => {
        if (err) throw err;

        // try 1 file first

        // zip the file
        const zip = new JSZip();
        const dataFolder = zip.folder('translatedfiles');
        const fileData = file.data;
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
  } catch (err) {
    res.status(500).json({ err: err.message });
    next();
  }

});

const deleteFiles = async (inputUser, tobeDeletedFileIds) => {
  for (let i = 0; i < tobeDeletedFileIds.length; i++) {
    // remove file reference on user
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
  const user = await _findUserAndPopulateFiles(inputUser);

  return user;
}

const _deleteFile = async (tobeDeletedFileIds) => {

}


const saveUser = async (inputUser) => {
  const newUser = new Users(inputUser);
  const savedUser = await newUser.save({});
  return savedUser;
}

const saveFile = async (inputUser, inputFile) => {

  const userFound = await _findUserAndPopulateFiles(inputUser);

  const fileSaved = await _saveFile(userFound._id, inputFile);

  // push reference
  userFound.user_files.push(fileSaved);

  // save reference
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

const _findUserAndPopulateFiles = async (inputUser) => {
  const userFound = await Users.findOne(inputUser)
    .populate('user_files')
    .exec();
  return new Promise(resolve => {
    resolve(userFound);
  });;
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

const getUserFromRequest = req => {
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

const isUserFound = user => {
  return (user && user.email && user.authentication);
}

/**
 * @POST /api/translate/documents/:from/:to
 * @deprecated This route is no longer used, but I'm keeping it for future reference
 */
router.post('/:from/:to', (req, res, next) => {
  if (req.files === null) {
    return res.status(400).json({ msg: `No file uploaded` });
  }

  const fromLanguage = req.params.from;
  const toLanguage = req.params.to;
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

module.exports = router;