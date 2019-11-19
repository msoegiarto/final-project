import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import DeleteButton from './DeleteButton';
import DownloadButton from './DownloadButton';

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
        <Typography variant="body2" component="p">
          {props.file.languageFrom} - {props.file.languageTo}
        </Typography>
      </CardContent>
      <CardActions className={classes.cardAction}>
        <DeleteButton disabled={props.disabled} handleDelete={handleDelete}  />
        <DownloadButton disabled={props.disabled} handleDownload={handleDownload} />
      </CardActions>
    </Card>
  );
}

export default FileItem;