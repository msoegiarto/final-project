import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import DeleteButton from './DeleteButton';
import DownloadButton from './DownloadButton';
import languages from '../../languages.json';

const useStyles = makeStyles(theme => ({
  card: {
    minWidth: 275,
    marginBottom: '2vh',
    backgroundColor: grey[100],
  },
  cardContent: {
    textAlign: 'left'
  },
  cardAction: {
    justifyContent: 'flex-end'
  },
}));

const FileItem = props => {
  const classes = useStyles();
  const [sourceLang, setSourceLang] = useState();
  const [targetLang, setTargetLang] = useState();

  console.log(props);

  useEffect(() => {
    const sourceLanguage = languages.find(element => element.key === props.file.sourceLanguage).value || '';
    setSourceLang(sourceLanguage);

    const targetLanguage = languages.find(element => element.key === props.file.targetLanguage).value || '';
    setTargetLang(targetLanguage);
    // eslint-disable-next-line 
  }, []);

  const handleDownload = () => {
    props.handleDownload(props.file.id);
  }

  const handleDelete = () => {
    props.handleDelete(props.file.id, props.file.name);
  }

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" component="h2">{props.file.name}</Typography>
        <Typography component="p">
          {sourceLang} - {targetLang}
        </Typography>
      </CardContent>
      <CardActions className={classes.cardAction}>
        <DeleteButton disabled={props.disabled} handleDelete={handleDelete} />
        <DownloadButton disabled={props.disabled} handleDownload={handleDownload} />
      </CardActions>
    </Card>
  );
}

export default FileItem;