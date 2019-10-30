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
    email: req.body.email,
    authentication: req.body.authentication
  };
  findUserAndPopulateFiles(thisUser, (err, user) => {
    if (err) return res.status(500).json({ err: err.message });

    if (!user || !user.email || !user.authentication) {
      console.log('user not found');
      saveUser(thisUser, (err, savedUser) => {
        if (err) return res.status(500).json({ err: err.message });
        console.log('save user');
        return res.json({ msg: `User saved`, id: savedUser._id, email: savedUser.email });
      });
    } else {
      console.log('user found', user);
      if (user.user_files && user.user_files.length > 0) {
        console.log('user has files');

        const userFiles = [];
        user.user_files.forEach(element => {
          let newObj = {
            id: element._id,
            name: element.file_name,
            fromLanguage: element.lang_from,
            toLanguage: element.lang_to
          }
          userFiles.push(newObj);
        });

        // console.log(userFiles);
        return res.status(200).json({ msg: `Files found`, translatedFiles: userFiles });
      } else {
        console.log('user has no files');
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
    email: req.body.email,
    authentication: req.body.authentication
  };

  const uploadedFile = req.files.file; // file=what we define in react
  const thisFile = {
    data: uploadedFile.data,
    content_type: 'text/plain',
    file_name: getNewName(uploadedFile.name, req.body.toLanguage),
    lang_from: req.body.fromLanguage,
    lang_to: req.body.toLanguage
  };

  try {
    saveFileWrapper(thisUser, thisFile, (user) => {
      const userFiles = [];
      user.user_files.forEach(element => {
        let newObj = {
          id: element._id,
          name: element.file_name,
          fromLanguage: element.lang_from,
          toLanguage: element.lang_to
        }
        userFiles.push(newObj);
      });

      return res.json({ translatedFiles: userFiles });
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

/**
 * @DELETE /api/translate/documents/delete
 * 
 */
router.delete('/delete', (req, res, next) => {
  const deletedIds = req.body.translatedFiles;
  if (!deletedIds || deletedIds.length === 0) return res.status(400).json({ err: 'no ids to be deleted' });

  try {
    deleteFiles(deletedIds, () => {
      const thisUser = {
        email: req.body.email,
        authentication: req.body.authentication
      };
      findUserAndPopulateFiles(thisUser, (error, user) => {
        if (error) throw error;
        const userFiles = [];
        user.user_files.forEach(element => {
          let newObj = {
            id: element._id,
            name: element.file_name,
            fromLanguage: element.lang_from,
            toLanguage: element.lang_to
          }
          userFiles.push(newObj);
        });
        return res.json({ msg: 'files deleted', translatedFiles: userFiles });
      });
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

const deleteFiles = (deletedIds, callback) => {

  (deletedIds.forEach(element => {
    console.log('deleteId:', element.id);

    Userfiles.findById(element.id).exec((err, userFiles) => {
      if (err) throw err;

      userFiles.remove(error => {
        if (error) throw error;

        Users.updateOne(
          { _id: userFiles.file_owner },
          { $pull: { user_files: userFiles._id } },
          // { multi: true } //if reference exists in multiple documents 
        )
          .exec();
      });
    });
  }), () => {
    callback();
  })();

}

const findUserAndPopulateFiles = (inputUser, callback) => {
  Users.findOne(inputUser)
    .populate('user_files', '_id file_name lang_from lang_to')
    .exec((error, user) => callback(error, user));
}

const saveUser = (inputUser, callback) => {
  const newUser = new Users(inputUser);

  newUser.save({}, (error, user) => callback(error, user));
}

const saveFile = (inputFile, userId, callback) => {
  const newFile = new Userfiles({
    data: inputFile.data,
    content_type: inputFile.content_type,
    file_name: inputFile.file_name,
    lang_from: inputFile.lang_from,
    lang_to: inputFile.lang_to,
    file_owner: userId
  });

  newFile.save({}, (error, file) => callback(error, file))
}

const saveFileWrapper = (inputUser, inputFile, callback) => {

  findUserAndPopulateFiles(inputUser, (error, user) => {
    if (error) throw error;
    if (!user || !user.email || !user.authentication) throw new Error('user not found');

    saveFile(inputFile, user._id, (error, file) => {
      if (error) throw error;

      user.user_files.push(file);

      user.save({}, (error, user) => {
        if (error) throw error;
        callback(user);
      });
    });
  });

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