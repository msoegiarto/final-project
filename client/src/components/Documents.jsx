import React, { Fragment } from 'react';
import { Auth0Context } from "../auth0/react-auth0-wrapper";
import axios from 'axios';
import PropTypes from "prop-types";
import UploadDropzone from './UploadDropzone';
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SendOutlinedIcon from '@material-ui/icons/SendOutlined';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import Select from './Select';
import TranslatedFile from './TranslatedFile';
import Message from './Message';
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

  return {
    headers: {
      'Content-Type': contentType,
      'Authorization': `Bearer ${accessToken}`
    }
  };
}

const getUser = context => {
  const { user } = context;

  return {
    name: user.name,
    authentication: user.sub,
    email: user.email
  };
}

class Documents extends React.Component {

  static contextType = Auth0Context;

  constructor(props) {
    super(props);
    this.state = {
      limit: 3,
      files: null,
      fromLanguage: null,
      toLanguage: null,
      fromLanguagesList: [],
      toLanguagesList: [],
      translatedFiles: [],
      isSuccess: false,
    }
  }

  componentDidMount = async () => {
    this.filterLanguagesList('');

    // dummy file
    // const theFiles = [
    //   { id: '123456780', name: 'fileeeeeeeee.txt', fromLanguage: 'en', toLanguage: 'es' },
    //   { id: '123456781', name: 'anotherFileeeeeeeeee.txt', fromLanguage: 'en', toLanguage: 'fr' },
    //   { id: '123456782', name: 'yetAnotherFileeeeeeeeeeeee.txt', fromLanguage: 'en', toLanguage: 'de' },
    // ];

    // this.setState(prevState => ({
    //   ...prevState,
    //   translatedFiles: theFiles
    // }));

    const config = await getConfig(this.context, 'application/json');
    const user = getUser(this.context);

    try {
      const res = await axios.post(`/api/translate/documents/`, user, config);

      console.log('#####', res.data);
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
      [child.props.name]: child.state.value
    }), () => this.filterLanguagesList(child.props.name));

  }

  dropzoneChangeHandler = (child) => {
    this.setState(oldState => ({
      ...oldState,
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

  test = async () => {
    const { getTokenSilently } = this.context;
    const accessToken = await getTokenSilently();

    try {
      const res = await axios.get(`/api/translate/documents`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  }

  onClickTranslate = async (event) => {
    event.preventDefault();

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
      const res = await axios.post(`/api/translate/documents/save`, formData, config);
      console.log('@@@@@', res.data);

      this.setState(prevState => ({
        ...prevState,
        fromLanguage: null,
        toLanguage: null,
        isSuccess: true,
        translatedFiles: res.data.translatedFiles
      }));

    } catch (err) {
      console.error(err)
    }

  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <Fragment>
          {
            this.state.translatedFiles.length === this.state.limit &&
            <Message text={'You have reached the maximum of 3 saved files.'} cStyle={'warning'} />
          }
        </Fragment>
        <Fragment>
          {
            this.state.isSuccess &&
            <Message text={'Your file is ready.'} cStyle={'success'} />
          }
        </Fragment>
        <Fragment>
          <form className={classes.form} autoComplete="off" onSubmit={this.onClickTranslate}>
            {
              this.state.translatedFiles.length < this.state.limit &&

              <Grid container className={classes.upperSide} spacing={1} alignItems="center">
                <Grid item xs={12}>
                  <UploadDropzone dropzoneChangeHandler={this.dropzoneChangeHandler} />
                </Grid>
                {
                  this.state.files && this.state.files.length > 0 &&
                  <Grid item xs={12} sm={4}>
                    <Select
                      selectChangeHandler={this.selectChangeHandler}
                      name={'fromLanguage'}
                      label={'From'}
                      id={'select-from-language'}
                      helperText={'Required'}
                      languages={this.state.fromLanguagesList}
                    />
                  </Grid>
                }
                {
                  this.state.files && this.state.files.length > 0 &&
                  <Grid item xs={12} sm={4}>
                    <Select
                      selectChangeHandler={this.selectChangeHandler}
                      name={'toLanguage'}
                      label={'To'}
                      id={'select-to-language'}
                      helperText={'Required'}
                      languages={this.state.toLanguagesList}
                    />
                  </Grid>
                }
                {
                  this.state.files && this.state.files.length > 0 && this.state.fromLanguage && this.state.toLanguage &&
                  <Grid item xs={12} sm={4}>
                    <Button type="submit" variant="outlined" size="large" className={classes.sendBtn} startIcon={<SendOutlinedIcon color="inherit" />} disabled={this.state.translatedFiles.length === 3}>Translate</Button>
                  </Grid>
                }
              </Grid>
            }
            <Button variant="contained" className={classes.button} onClick={this.test}>Test</Button>
          </form>
        </Fragment>
        <Fragment>
          <Grid container className={classes.lowerSide}>
            {
              this.state.translatedFiles.length > 0 &&
              this.state.translatedFiles.map((element, index) => (
                <TranslatedFile key={index} file={element} />
              ))

            }
          </Grid>
          {
            this.state.translatedFiles.length > 1 &&
            <Grid container spacing={1} justify="center">
              <Grid item xs={12} md={6}>
                <ButtonGroup fullWidth aria-label="full width outlined button group">
                  <Button variant="contained" size="medium" className={classes.deleteBtn} startIcon={<DeleteOutlinedIcon color="inherit" />}>Delete All</Button>
                  <Button variant="contained" size="medium" className={classes.downloadBtn} startIcon={<CloudDownloadOutlinedIcon color="inherit" />}>Download All</Button>
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