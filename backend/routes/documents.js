// const db = require('../config/database');
const Router = require('express').Router;
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
router.post('/', (req, res, next) => {
  const thisUser = {
    name: req.body.name,
    authentication: req.body.authentication,
    email: req.body.email
  };
  selectUser(thisUser, (err, user) => {
    if (err) return res.status(500).json({ err: err.message });

    if (!user || user.length === 0) {
      saveUser(thisUser, (err, savedUser) => {
        if (err) return res.status(500).json({ err: err.message });
        return res.status(200).json({ msg: `User saved`, email: savedUser.email });
      });
    } else {
      if (user.user_files && user.user_files.length > 0) {
        populateUserFiles(user.user_files, (err, files) => {
          if (err) return res.status(500).json({ err: err.message });
          return res.status(200).json(files);
        });
      } else {
        return res.status(200).json(user.user_files);
      }
    }
  });
});

/**
 * @POST /api/translate/documents/save
 * 
 */
router.post('/save', (req, res, next) => {

  const thisUser = {
    name: req.body.name,
    authentication: req.body.authentication,
    email: req.body.email
  };

  const uploadedFile = req.files.file;
  const thisFile = {
    data: uploadedFile.data,
    content_type: 'text/plain',
    file_name: getNewName(uploadedFile.name, req.body.toLanguage),
    lang_from: req.body.fromLanguage,
    lang_to: req.body.toLanguage
  };

  console.log(thisUser, thisFile);

  saveFileWrapper(thisUser, thisFile, (err, updatedUser, file) => {
    if (err) return res.status(500).json({ err: err.message });
    console.log(updatedUser);
    console.log(file);
    res.status(200).json(updatedUser);
  })

});

/**
 * @POST /api/translate/test
 * 
 */
router.post('/test/:from/:to', (req, res, next) => {
  if (req.files === null) {
    return res.status(400).json({ msg: `No file uploaded` });
  }

  const name = req.body.name;
  const authorization = req.body.authorization;
  const email = req.body.email;
  const fromLanguage = req.params.from;
  const toLanguage = req.params.to;
  console.log(fromLanguage, toLanguage);

  const uploadedFile = req.files.file; // file=what we define in react
  console.log('uploadedFile:', uploadedFile);

});

/**
 * @POST /api/translate/documents
 * 
 */
router.post('/:from/:to', (req, res, next) => {
  if (req.files === null) {
    return res.status(400).json({ msg: `No file uploaded` });
  }

  const fromLanguage = req.params.from;
  const toLanguage = req.params.to;
  console.log(fromLanguage, toLanguage);

  const uploadedFile = req.files.file; // file=what we define in react
  console.log('uploadedFile:', uploadedFile);

  const dir = path.join(__dirname, `../../client/public/uploads/${uploadedFile.name}`);
  uploadedFile.mv(dir, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  });

  res.json({ msg: `POST /api/translate/documents`, fileName: uploadedFile.name, filePath: `/uploads/${uploadedFile.name}` });
});

const selectUser = (inputUser, callback) => {
  Users.findOne(inputUser, (error, user) => callback(error, user));
}

const populateUserFiles = (user_files, callback) => {
  console.log(user_files);
  Userfiles.find({
    '_id': { $in: user_files }
  }, (err, docs) => {
    console.log(docs);
    callback(err, docs);
  });
}

const saveUser = (inputUser, callback) => {
  const newUser = new Users(inputUser);
  newUser.save({}, (error, user) => callback(error, user));
}

const saveFile = (inputFile, callback) => {
  const newFile = new Userfiles(inputFile);
  newFile.save({}, (error, file) => callback(error, file))
}

const saveFileWrapper = (inputUser, inputFile, callback) => {
  const newFile = new Userfiles(inputFile);
  saveFile(newFile, (error, file) => {
    if (error) throw error;

    console.log('savedFileId:', file._id);
    Users.findOne(inputUser, (error, user) => {
      if (error) throw error;

      user.user_files.push(file._id);
      Users.updateOne(user, (error, updatedUser) => callback(error, updatedUser, file));
    });
  })

}

const getNewName = (oldName, toLang) => {
  const name = oldName.split('.');
  if (name.length > 1) {
    name[name.length - 2] += `_${toLang}`;
  } else {
    name[0] += `_${toLang}`;
  }
  return name.join('.');
}

module.exports = router;