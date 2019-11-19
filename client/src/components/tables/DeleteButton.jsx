import React, { Fragment, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Hidden from '@material-ui/core/Hidden';

const RedButton = withStyles(theme => ({
  root: {
    color: red['A400'],
    backgroundColor: '#fff',
    borderColor: red['A400'],
    '&:hover': {
      color: theme.palette.getContrastText(red['A700']),
      backgroundColor: red['A700'],
    },
    minWidth: 175,
    [theme.breakpoints.down('sm')]: {
      minWidth: 50,
    },
  },
}))(Button);

const DeleteButton = props => {
  const { handleDelete, label, btnType, ...other } = props;

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(false);
    handleDelete();
  }

  return (
    <Fragment>
      <Hidden smDown>
        <RedButton
          size="medium"
          variant="outlined"
          startIcon={<DeleteOutlinedIcon color="inherit" />}
          onClick={() => setOpen(true)}
          {...other}
  >Delete{btnType ? ' ' + btnType : ''}</RedButton>
      </Hidden>
      <Hidden mdUp>
        <RedButton
          size="medium"
          variant="outlined"
          onClick={() => setOpen(true)}
          {...other}>
          <DeleteOutlinedIcon color="inherit" />{btnType ? ' ' + btnType : ''}
        </RedButton>
      </Hidden>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="delete-dialog-title">
        <DialogTitle id="delete-dialog-title">{"Do you want to delete the file(s)?"}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="contained" color="secondary" autoFocus>No</Button>
          <Button onClick={handleClick} variant="contained" color="primary">Yes</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default DeleteButton;