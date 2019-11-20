import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { grey, indigo } from '@material-ui/core/colors';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import UploadForm from './forms/UploadForm';
import MessageSnackbars from './messages/MessageSnackbar';
import WarningMessage from './messages/WarningMessage';
import FileTable from './tables/FileTable';
import { useAuth0 } from '../contexts/react-auth0-context';
import { useTxtrans } from '../contexts/document-translation-context';
import config from '../config';

const MAX_FILE_LIMIT = config.MAX_FILE_LIMIT;

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    [theme.breakpoints.up('md')]: {
      margin: '0 20vw',
    },
    minHeight: '80vh',
  },
  circular: {
    display: 'flex',
    direction: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
  footer: {
    display: 'flex',
    width: '100%',
    minHeight: '10vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: grey[50],
  }
}));

const DocumentsContent = () => {

  const classes = useStyles();
  const { getTokenSilently, user } = useAuth0();
  const {
    loadFiles,
    contextTranslatedFiles,
    retrieveUserSavedFilesOrSaveNewUser,
    doTranslateFiles,
    doDownloadFiles,
    doDeleteFiles } = useTxtrans();

  const [disabled, setDisabled] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVariant, setSnackbarVariant] = useState('');
  const [showWarningMessage, setShowWarningMessage] = useState('');

  // equivalent to componentDidMount
  // function: save new user into DB or retrieve existing user's files (if any)
  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = await getTokenSilently();
        await retrieveUserSavedFilesOrSaveNewUser(accessToken, user);
      } catch (err) {
        console.error(err);
      }
    };
    initialize();
    // eslint-disable-next-line 
  }, []);

  useEffect(() => {
    if (contextTranslatedFiles && contextTranslatedFiles.length === MAX_FILE_LIMIT) {
      setShowWarningMessage(true);
    } else {
      setShowWarningMessage(false);
    }
  }, [contextTranslatedFiles]);

  const handleSubmit = async (dropzoneFiles, sourceLanguage, targetLanguage) => {
    setDisabled(true);
    setOpenSnackbar(false);

    try {
      const accessToken = await getTokenSilently();

      await doTranslateFiles(accessToken, user, dropzoneFiles, sourceLanguage, targetLanguage);

      isSuccess(`The file ${dropzoneFiles[dropzoneFiles.length - 1].name} has been successfully translated`);
    } catch (err) {
      isError(err);
    } finally {
      setDisabled(false);
    }
  }

  const handleDownload = async (id) => {
    setDisabled(true);
    setOpenSnackbar(false);

    try {
      const accessToken = await getTokenSilently();

      const res = await doDownloadFiles(accessToken, user, id)

      const contentDisposition = res.headers['content-disposition'];
      const startIndex = contentDisposition.indexOf('filename=') + 9;
      const endIndex = contentDisposition.length;
      const filename = contentDisposition.substring(startIndex, endIndex);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.click();
      window.URL.revokeObjectURL(url);

      isSuccess('Downloading...');
    } catch (err) {
      isError(err);
    } finally {
      setDisabled(false);
    }
  }

  const handleDelete = async (id, name) => {
    setDisabled(true);
    setOpenSnackbar(false);

    try {
      const accessToken = await getTokenSilently();
      await doDeleteFiles(accessToken, user, id)

      let message = (id === 'ALL') ? 'All the files have been successfully deleted' : `The file ${name} has been successfully deleted`;

      isSuccess(message);
    } catch (err) {
      isError(err);
    } finally {
      setDisabled(false);
    }
  }

  const isSuccess = message => {
    setSnackbarMessage(message);
    setSnackbarVariant("success");
    setOpenSnackbar(true);
  }

  const isError = err => {
    setOpenSnackbar(false);
    console.error(err);
    setSnackbarMessage('Something went wrong');
    setSnackbarVariant("error");
    setOpenSnackbar(true);
  }

  if (loadFiles) {
    return (
      <div className={`${classes.root} ${classes.circular}`}>
        <CircularProgress />
      </div>);
  };

  return (
    <div className={classes.root}>
      <MessageSnackbars
        openSnackbar={openSnackbar}
        text={snackbarMessage}
        variant={snackbarVariant} />
      <WarningMessage
        showWarningMessage={showWarningMessage}
        text={`You have reached the maximum of ${MAX_FILE_LIMIT} saved files. Please delete some files to continue translating.`} />
      {
        contextTranslatedFiles && contextTranslatedFiles.length < MAX_FILE_LIMIT &&
        <UploadForm handleSubmit={handleSubmit} disabled={disabled} />
      }
      <FileTable disabled={disabled} handleDownload={handleDownload} handleDelete={handleDelete} />
    </div>
  );
}

const Documents = () => {
  const classes = useStyles();
  const { loading, user } = useAuth0();

  // auth0 user has to be loaded before proceed to DocumentsContent's componentDidMount
  if (loading || !user) {
    return (
      <div className={`${classes.root} ${classes.circular}`}>
        <CircularProgress />
      </div>);
  };

  return (
    <div>
      <DocumentsContent />
      <Paper className={classes.footer}>
        <Typography variant="body2" component="p">
          Powered by <a href="https://www.microsoft.com/en-us/translator/" style={{ color: indigo[900] }}>Microsoft Translator</a>
        </Typography>
      </Paper>
    </div>
  );
}

export default Documents;