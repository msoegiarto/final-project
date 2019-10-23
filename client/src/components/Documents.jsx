import React from 'react';
import axios from 'axios';
import PropTypes from "prop-types";
import UploadDropzone from './UploadDropzone';
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from '@material-ui/core/Button';
import Selects from './Selects';
import languages from './lang_config.json';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  form: {
    margin: theme.spacing(1),
  },
  button: {
    width: 200
  }
});

class Documents extends React.Component {
  constructor() {
    super();
    this.state = {
      files: null,
      fromLanguage: '',
      toLanguage: '',
      fromLanguagesList: [],
      toLanguagesList: [],
    }
  }

  selectChangeHandler = (child) => {
    this.setState(oldState => ({
      ...oldState,
      [child.state.name]: child.state.value
    }), () => this.filterLanguagesList(child.state.name));

  }

  dropzoneChangeHandler = (child) => {
    this.setState(oldState => ({
      ...oldState,
      files: child.state.files
    }));
  }

  componentDidMount = () => {
    this.filterLanguagesList('');
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

  onClickTranslate = (event) => {
    event.preventDefault();

    const url = `/api/translate/documents`;
    const formData = new FormData();
    formData.append('file', this.state.files);
    const data = {
      formData,
      fromLanguage: this.state.fromLanguage,
      toLanguage: this.state.toLanguage
    }
    console.log('button clicked.', formData);

    axios.post(url, data)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <form className={classes.form} autoComplete="off" onSubmit={this.onClickTranslate}>
        <Grid container className={classes.root} spacing={1} alignItems="center">
          <Grid item xs={12} sm={12} md={6}>
            <UploadDropzone dropzoneChangeHandler={this.dropzoneChangeHandler} />
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <Grid item xs={12}>
              <Selects
                selectChangeHandler={this.selectChangeHandler}
                name={'fromLanguage'}
                label={'From'}
                id={'select-from-language'}
                helperText={'Required'}
                languages={this.state.fromLanguagesList}
              />
              <p>fromLanguage: {this.state.fromLanguage}</p>
            </Grid>
            <Grid item xs={12}>
              <Selects
                selectChangeHandler={this.selectChangeHandler}
                name={'toLanguage'}
                label={'To'}
                id={'select-to-language'}
                helperText={'Required'}
                languages={this.state.toLanguagesList}
              />
              <p>toLanguage: {this.state.toLanguage}</p>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <Button variant="contained" className={classes.button} type="submit">Translate</Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

Documents.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Documents);