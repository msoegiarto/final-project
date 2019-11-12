import React, { Fragment } from 'react';
import { Auth0Context } from "../auth0/react-auth0-wrapper";
import axios from 'axios';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SendOutlinedIcon from '@material-ui/icons/SendOutlined';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import UploadDropzone from './documents/UploadDropzone.jsx';
import Select from './documents/Select.jsx';
import TranslatedFile from './documents/TranslatedFile.jsx';
import Message from './notifications/Message.jsx';
import SuccessSnackbar from './notifications/SuccessSnackbar.jsx';
import languages from './lang_config.json';

const styles = theme => ({
  form: {
    margin: theme.spacing(1),
  },
  upperSide: {
    display: 'flex',
    flexGrow: 1,
  },
  sendBtn: {
    width: 200,
    color: '#6200ea',
    [theme.breakpoints.down('sm')]: {
      margin: '2vh 0',
    },
  },
  lowerSide: {
    display: 'flex',
    flexGrow: 1,
    marginTop: '10vh',
  },
  deleteBtn: {
    flexDirection: 'column',
    margin: theme.spacing(1),
    color: '#ff3d00',
    width: '100%',
  },
  downloadBtn: {
    flexDirection: 'column',
    margin: theme.spacing(1),
    color: '#11cb5f',
    width: '100%',
  },
  container: {
    [theme.breakpoints.up('md')]: {
      margin: '0 20vw',
    },
  }
});

const getConfig = async (context, contentType) => {
  const { getTokenSilently } = context;
  let accessToken = await getTokenSilently();
  console.log(accessToken);

  return {
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${accessToken}`
    }
  };
}

const getUser = context => {
  const { user } = context;

  return {
    email: user.email,
    authentication: user.sub,
    nickname: user.nickname,
  };
}

class Documents extends React.Component {

  static contextType = Auth0Context;

  constructor(props) {
    super(props);
    this.state = {
      limit: 3,
      files: null,
      fromLanguage: '',
      toLanguage: '',
      fromLanguagesList: [],
      toLanguagesList: [],
      translatedFiles: [],
      isSuccess: false,
      isDisabled: false
    }
  }

  componentDidMount = async () => {
    this.filterLanguagesList('');

    const config = await getConfig(this.context, 'application/json');
    const user = getUser(this.context);

    try {
      const res = await axios.post('/api/translate/documents', user, config);

      if (res.data.translatedFiles) {
        this.setState(prevState => ({
          ...prevState,
          translatedFiles: res.data.translatedFiles
        }));
      }
    } catch (err) {
      console.error(err)
    }

  }

  selectChangeHandler = (child) => {
    this.setState(oldState => ({
      ...oldState,
      isSuccess: false,
      [child.props.name]: child.state.value
    }), () => this.filterLanguagesList(child.props.name));

  }

  dropzoneChangeHandler = (child) => {
    this.setState(oldState => ({
      ...oldState,
      isSuccess: false,
      files: child.state.files
    }));
  }

  filterLanguagesList = (name) => {
    if (!name) {
      this.setLanguagesList('toLanguagesList', languages);
      this.setLanguagesList('fromLanguagesList', languages);
    } if (name === 'fromLanguage') {
      let newList = languages.filter(element => element.key !== this.state.fromLanguage);
      this.setLanguagesList('toLanguagesList', newList);
    } else if (name === 'toLanguage') {
      let newList = languages.filter(element => element.key !== this.state.toLanguage);
      this.setLanguagesList('fromLanguagesList', newList);
    }
  }

  setLanguagesList = (name, newList) => {
    this.setState(oldState => ({
      ...oldState,
      [name]: newList,
    }));
  }

  onClickTranslate = async (event) => {
    event.preventDefault();
    this.setState(oldState => ({
      ...oldState,
      isSuccess: false,
      isDisabled: !oldState.isDisabled
    }));

    const config = await getConfig(this.context, 'multipart/form-data');
    const user = getUser(this.context);

    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('authentication', user.authentication);
    formData.append('email', user.email);
    formData.append('fromLanguage', this.state.fromLanguage);
    formData.append('toLanguage', this.state.toLanguage);
    this.state.files.forEach(element => {
      formData.append('file', element, element.name);
    });

    try {
      const res = await axios({
        url: '/api/translate/documents/translate',
        method: 'POST',
        headers: config.headers,
        data: formData,
      });
      // const res = await axios({
      //   url: '/api/translate/documents/save_test',
      //   method: 'POST',
      //   headers: config.headers,
      //   data: formData,
      //   onUploadProgress: function (progressEvent) {
      //     console.log('onUploadProgress', progressEvent);
      //     //progressEvent.loaded/progressEvent.total
      //     if (progressEvent.lengthComputable) {
      //       const totalLength = progressEvent.total;
      //       let loaded = progressEvent.loaded;
      //       console.log(loaded, totalLength);
      //     }
      //   },
      // });

      this.setState(prevState => ({
        ...prevState,
        fromLanguage: '',
        toLanguage: '',
        isSuccess: true,
        fromLanguagesList: languages,
        toLanguagesList: languages,
        translatedFiles: res.data.translatedFiles,
        isDisabled: !prevState.isDisabled
      }));
    } catch (err) {
      console.error(err)
    }
  }

  onClickDownload = async (id) => {
    console.log('onClickDownload', id);
    const config = await getConfig(this.context, 'application/json');
    const user = getUser(this.context);

    const data = {};
    if (id === 'ALL') {
      const tobeDownloadedFileIds = [];
      this.state.translatedFiles.forEach(element => {
        tobeDownloadedFileIds.push({ id: element.id });
      });
      data.translatedFiles = tobeDownloadedFileIds;
      
    } else {
      data.translatedFiles = [{ id: id }];
    }
    data.nickname = user.nickname;

    try {
      const res = await axios({
        url: '/api/translate/documents/download',
        method: 'POST',
        headers: config.headers,
        config: config,
        responseType: 'blob',
        data: data
      });

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

    } catch (error) {
      console.error(error);
    }
  }

  onClickDownloadAll = () => {
    this.onClickDownload('ALL');
  }

  onClickDelete = async (id) => {
    const config = await getConfig(this.context, 'application/json');
    const user = getUser(this.context);

    const data = {
      email: user.email,
      authentication: user.authentication,
    };

    if (id === 'ALL') {
      const tobeDeletedFileIds = [];
      this.state.translatedFiles.forEach(element => {
        tobeDeletedFileIds.push({ id: element.id });
      });
      data.translatedFiles = tobeDeletedFileIds;
      this.setState({ files: null });
    } else {
      data.translatedFiles = [{ id: id }];
      this.setState({ translatedFiles: [] });
    }

    try {
      const res = await axios({
        url: '/api/translate/documents/delete',
        method: 'DELETE',
        headers: config.headers,
        data: data
      });

      this.setState(prevState => ({
        ...prevState,
        isSuccess: false,
        translatedFiles: res.data.translatedFiles,
        files: res.data.translatedFiles.length === this.state.limit - 1 ? null : prevState.files
      }));

    } catch (error) {
      console.error(error);
    }
  }

  onClickDeleteAll = () => {
    this.onClickDelete('ALL');
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <SuccessSnackbar
          isSuccess={this.state.isSuccess}
          text="The file has been successfully translated!" />
        <Message
          fileLength={this.state.translatedFiles.length}
          fileLengthLimit={this.state.limit}
          text={`You have reached the maximum of ${this.state.limit} saved files.`}
          cStyle={'warning'} />
        <Fragment>
          <form className={classes.form} autoComplete="off" onSubmit={this.onClickTranslate}>
            <Grid container className={classes.upperSide} spacing={1} alignItems="center">
              <Grid item xs={12}>
                <UploadDropzone
                  dropzoneChangeHandler={this.dropzoneChangeHandler}
                  fileLength={this.state.translatedFiles.length}
                  fileLengthLimit={this.state.limit} />
              </Grid>
              {
                this.state.files && this.state.files.length > 0
                && this.state.translatedFiles.length < this.state.limit &&
                <Grid item xs={12} sm={4}>
                  <Select
                    selectChangeHandler={this.selectChangeHandler}
                    name={'fromLanguage'}
                    label={'From'}
                    id={'select-from-language'}
                    helperText={'Required'}
                    languages={this.state.fromLanguagesList}
                    value={this.state.fromLanguage}
                    isDisabled={this.state.isDisabled}
                  />
                </Grid>
              }
              {
                this.state.files && this.state.files.length > 0
                && this.state.translatedFiles.length < this.state.limit &&
                <Grid item xs={12} sm={4}>
                  <Select
                    selectChangeHandler={this.selectChangeHandler}
                    name={'toLanguage'}
                    label={'To'}
                    id={'select-to-language'}
                    helperText={'Required'}
                    languages={this.state.toLanguagesList}
                    value={this.state.toLanguage}
                    isDisabled={this.state.isDisabled}
                  />
                </Grid>
              }
              {
                this.state.files && this.state.files.length > 0 && this.state.fromLanguage && this.state.toLanguage &&
                <Grid item xs={12} sm={4}>
                  <Button
                    type="submit"
                    variant="outlined"
                    size="large"
                    className={classes.sendBtn}
                    startIcon={<SendOutlinedIcon color="inherit" />}
                    disabled={this.state.isDisabled}>
                    Translate
                    </Button>
                </Grid>
              }
            </Grid>
          </form>
        </Fragment>
        <Fragment>
          <Grid container className={classes.lowerSide}>
            {
              this.state.translatedFiles.length > 0 &&
              this.state.translatedFiles.map((element, index) => (
                <TranslatedFile
                  key={index}
                  file={element}
                  onClickDelete={this.onClickDelete}
                  onClickDownload={this.onClickDownload}
                  isDisabled={this.state.isDisabled} />
              ))
            }
          </Grid>
        </Fragment>
        <Fragment>
          {
            this.state.translatedFiles.length > 1 &&
            <Grid container spacing={1} justify="center">
              <Grid item xs={12} md={6}>
                <ButtonGroup fullWidth aria-label="full width outlined button group">
                  <Button
                    variant="contained"
                    size="medium"
                    className={classes.deleteBtn}
                    startIcon={<DeleteOutlinedIcon color="inherit" />}
                    onClick={this.onClickDeleteAll}
                    disabled={this.state.isDisabled}>
                    Delete All
                    </Button>
                  <Button
                    variant="contained"
                    size="medium"
                    className={classes.downloadBtn}
                    startIcon={<CloudDownloadOutlinedIcon color="inherit" />}
                    onClick={this.onClickDownloadAll}
                    disabled={this.state.isDisabled}>
                    Download All
                    </Button>
                </ButtonGroup>
              </Grid>
            </Grid>
          }
        </Fragment>
      </div >
    );
  }
}

Documents.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Documents);