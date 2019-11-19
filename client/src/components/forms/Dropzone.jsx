import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { blueGrey } from '@material-ui/core/colors';
import { DropzoneArea } from 'material-ui-dropzone';
import config from '../../config';

const DropzoneAreaColored = withStyles(theme => ({
  dropZone: {
    backgroundColor: blueGrey[50] 
  },
}))(DropzoneArea);

const Dropzone = props => {
  const handleChange = (files) => {
    props.handleDropzoneChange(files);
  }

  return (
    <DropzoneAreaColored
      acceptedFiles={['text/plain']}
      filesLimit={1}
      maxFileSize={config.MAX_ATTACHMENT_SIZE}
      showFileNames={true}
      dropzoneText={'Drag and drop a text file here or click'}
      onChange={handleChange}
    />
  );
}

export default Dropzone;