import React, { Component } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';

class UploadDropzone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }
  handleChange(files) {
    this.setState({
      files: files
    });
  }
  onDrop(files) {
    console.log(files);
  }
  render() {
    return (
      <DropzoneArea
        acceptedFiles={['text/plain']}
        filesLimit={1}
        maxFileSize={5000000}
        showFileNames={true}
        dropzoneText={'Drag and drop a text file here or click'}
        onChange={this.handleChange.bind(this)}
        onDrop={this.onDrop.bind(this)}
      />
    )
  }
}

export default UploadDropzone;