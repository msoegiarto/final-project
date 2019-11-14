import React from 'react';
import PropTypes from "prop-types";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

const DeleteDialog = (props) => {

  const handleClose = () => props.toggleDeleteDialog();

  const handleDelete = () => {
    props.toggleDeleteDialog();
    props.onClickDelete();
  }

  return (
    <Dialog
      open={props.openDeleteDialog}
      onClose={handleClose}
      aria-labelledby="delete-dialog-title">
      <DialogTitle id="delete-dialog-title">{"Do you want to delete this file(s)?"}</DialogTitle>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="secondary" autoFocus>No</Button>
        <Button onClick={handleDelete} variant="contained" color="primary">Yes</Button>
      </DialogActions>
    </Dialog>
  );
}

DeleteDialog.propTypes = {
  toggleDeleteDialog: PropTypes.func.isRequired,
  openDeleteDialog: PropTypes.bool.isRequired,
  onClickDelete: PropTypes.func.isRequired,
};

export default DeleteDialog;