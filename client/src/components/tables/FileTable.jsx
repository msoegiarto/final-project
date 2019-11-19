import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import FileItem from './FileItem';
import DownloadButton from './DownloadButton';
import DeleteButton from './DeleteButton';
import { useTxtrans } from '../../contexts/document-translation-context';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  gridContainer: {
    padding: '5vh 3vw 0 3vw',
    marginBottom: '5vh'
  },
  buttonGroup: {
    margin: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center'
  }
}));

const FileTable = props => {
  const classes = useStyles();
  const { contextTranslatedFiles } = useTxtrans();

  const handleDownload = id => {
    props.handleDownload(id);
  }

  const handleDelete = (id, name = "") => {
    props.handleDelete(id, name);
  }

  return (
    <div className={classes.root}>
      <Grid container className={classes.gridContainer}>
        {
          contextTranslatedFiles && contextTranslatedFiles.length > 0 &&
          (
            contextTranslatedFiles.map((file, index) => (
              <Grid item xs={12} key={index}>
                <FileItem file={file} handleDownload={handleDownload} handleDelete={handleDelete} disabled={props.disabled} />
              </Grid>
            ))
          )
        }
        {
          contextTranslatedFiles && contextTranslatedFiles.length > 1 &&
          (
            <Grid container className={classes.buttonGroup}>
              <Grid item xs={12}>
                <ButtonGroup>
                  <DeleteButton disabled={props.disabled} handleDelete={() => handleDelete('ALL')} btnType={'ALL'} />
                  <DownloadButton disabled={props.disabled} handleDownload={() => { handleDownload('ALL') }} btnType={'ALL'} />
                </ButtonGroup>
              </Grid>
            </Grid>
          )
        }
      </Grid>
    </div>
  );
}

export default FileTable;