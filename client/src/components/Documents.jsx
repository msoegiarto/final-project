import React from 'react';
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
  },
  lowerSide: {
    display: 'flex',
    flexGrow: 1,
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
});

class Documents extends React.Component {

  static contextType = Auth0Context;

  constructor(props) {
    super(props);
    this.state = {
      files: null,
      fromLanguage: '',
      toLanguage: '',
      fromLanguagesList: [],
      toLanguagesList: [],
      translatedFiles: []
    }
  }

  componentDidMount = () => {
    this.filterLanguagesList('');

    // dummy file
    const theFiles = [
      { id: '123456780', name: 'file.txt', from: 'en', to: 'es' },
      { id: '123456781', name: 'anotherFile.txt', from: 'en', to: 'fr' },
      // { id: '123456782', name: 'yetAnotherFile.txt', from: 'en', to: 'de' },
    ];

    this.setState(prevState => ({
      ...prevState,
      translatedFiles: theFiles
    }));
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
    console.log(accessToken);
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
    const { getTokenSilently } = this.context;
    const accessToken = await getTokenSilently();

    const formData = new FormData();
    this.state.files.forEach(element => {
      formData.append('file', element);
    });

    const config = {
      headers: {
        'Content-Type': `multipart/form-data`,
        'Authorization': `Bearer ${accessToken}`
      }
    };

    try {
      const res = await axios.post(`/api/translate/documents/${this.state.fromLanguage}/${this.state.toLanguage}`, formData, config);
      console.log('@@@@@', res.data);
      this.updateTranslatedFiles(res.data);

    } catch (err) {
      console.error(err)
    }
  }

  updateTranslatedFiles = data => {

  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <form className={classes.form} autoComplete="off" onSubmit={this.onClickTranslate}>
          <Grid container className={classes.upperSide} spacing={1} alignItems="center">
            <Grid item xs={12} sm={12} md={6}>
              <UploadDropzone dropzoneChangeHandler={this.dropzoneChangeHandler} />
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Grid item xs={12}>
                <Select
                  selectChangeHandler={this.selectChangeHandler}
                  name={'fromLanguage'}
                  label={'From'}
                  id={'select-from-language'}
                  helperText={'Required'}
                  languages={this.state.fromLanguagesList}
                />
              </Grid>
              <Grid item xs={12}>
                <Select
                  selectChangeHandler={this.selectChangeHandler}
                  name={'toLanguage'}
                  label={'To'}
                  id={'select-to-language'}
                  helperText={'Required'}
                  languages={this.state.toLanguagesList}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Button type="submit" variant="outlined" size="large" className={classes.sendBtn} startIcon={<SendOutlinedIcon color="inherit" />} disabled={this.state.translatedFiles.length === 3}>Translate</Button>
              {/* <Button variant="contained" className={classes.button} onClick={this.test}>Test</Button> */}
            </Grid>
          </Grid>
        </form>
        {
          this.state.translatedFiles.length > 0 &&
          <Grid container className={classes.lowerSide} spacing={1} justify="flex-end">
            <Grid item xs={12} md={6}>
              <ButtonGroup fullWidth aria-label="full width outlined button group">
                <Button variant="contained" size="medium" className={classes.deleteBtn} startIcon={<DeleteOutlinedIcon color="inherit" />}>Delete All</Button>
                <Button variant="contained" size="medium" className={classes.downloadBtn} startIcon={<CloudDownloadOutlinedIcon color="inherit" />}>Download All</Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        }
        {
          this.state.translatedFiles.length > 0 &&
          this.state.translatedFiles.map((element, index) => (
            <TranslatedFile key={index} file={element} />
          ))
        }
      </div >
    );
  }
}

Documents.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Documents);