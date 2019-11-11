import React, { Component } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';
import config from '../../config';


class UploadDropzone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: null
    };
  }

  handleChange(files) {
    this.setState({ files: files },
      () => this.props.dropzoneChangeHandler(this)
    );
  }

  render() {
    if (this.props.fileLength < this.props.fileLengthLimit) {
      return (
        <DropzoneArea
          acceptedFiles={['text/plain']}
          filesLimit={1}
          maxFileSize={config.MAX_ATTACHMENT_SIZE}
          showFileNames={true}
          dropzoneText={'Drag and drop a text file here or click'}
          onChange={this.handleChange.bind(this)}
        />
      );
    }

    return (<></>);
  }
}

export default UploadDropzone;