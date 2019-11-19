import React, { Fragment, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { blueGrey } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import SendOutlinedIcon from '@material-ui/icons/SendOutlined';
import SelectLanguage from './SelectLanguage';
import Dropzone from './Dropzone';
import CircularProgress from '@material-ui/core/CircularProgress';

const ColorButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText(blueGrey[50]),
    backgroundColor: blueGrey[50],
    '&:hover': {
      color: theme.palette.getContrastText(blueGrey[700]),
      backgroundColor: blueGrey[700],
    },
  },
}))(Button);

const useStyles = makeStyles(theme => ({
  form: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  gridContainer: {
    padding: '5vh 3vw 0 3vw'
  },
  gridItems: {
    display: 'flex',
    direction: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '5vh',
    marginTop: '2vh'
  },
  button: {
    width: 200,
    [theme.breakpoints.down('sm')]: {
      margin: '2vh 0',
    },
  },
  circular: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
}));

const UploadForm = props => {
  const classes = useStyles();
  const { disabled } = props;

  const [dropzoneFiles, setDropzoneFiles] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');

  const handleDropzoneChange = filesFromChild => {
    setDropzoneFiles(filesFromChild);

    if (!filesFromChild || filesFromChild.length === 0) {
      setSourceLanguage('');
      setTargetLanguage('');
    }
  }

  const handleSourceLanguageChange = valueFromChild => {
    setSourceLanguage(valueFromChild);
  }

  const handleTargetLangugaeChange = valueFromChild => {
    setTargetLanguage(valueFromChild);
  }

  const handleSubmit = async event => {
    event.preventDefault();
    setSourceLanguage('');
    setTargetLanguage('');
    props.handleSubmit(dropzoneFiles, sourceLanguage, targetLanguage);
  }

  return (
    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleSubmit}>
      <Grid container className={classes.gridContainer}>
        <Grid item xs={12} className={classes.gridItems}>
          <Dropzone handleDropzoneChange={handleDropzoneChange} />
        </Grid>
        {
          dropzoneFiles.length > 0 &&
          (
            <Fragment>
              <Grid item xs={12} sm={4} className={classes.gridItems}>
                <SelectLanguage id={'sourceLanguage'} name={'sourceLanguage'} label={'Source Language'} disabled={disabled} propsValue={sourceLanguage} excludeValue={targetLanguage} onValueChange={handleSourceLanguageChange} />
              </Grid>
              <Grid item xs={12} sm={4} className={classes.gridItems}>
                <SelectLanguage id={'targetLanguage'} name={'targetLanguage'} label={'Target Language'} disabled={disabled} propsValue={targetLanguage} excludeValue={sourceLanguage} onValueChange={handleTargetLangugaeChange} />
              </Grid>
            </Fragment>
          )
        }
        {
          !disabled && sourceLanguage && targetLanguage &&
          (
            <Grid item xs={12} sm={4} className={classes.gridItems}>
              <ColorButton disabled={disabled} startIcon={<SendOutlinedIcon color="inherit" />} type="submit" size="large" variant="outlined" className={classes.button} >Translate</ColorButton>
            </Grid>
          )
        }
        {
          disabled && (
            <Grid item xs={12} sm={4} className={`${classes.gridItems} ${classes.circular}`}>
              <CircularProgress /></Grid>
          )
        }
      </Grid>
    </form >
  );
}

export default UploadForm;