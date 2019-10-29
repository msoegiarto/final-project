import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(1),
    display: 'flex',
    minHeight: '50px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  warning: {
    backgroundColor: '#ff80ab',
    color: '#880e4f',
  },
  success: {
    backgroundColor: '#e8f5e9',
    color: '#1b5e20',
  },
}));

const Message = props => {
  const classes = useStyles();
  if (props.cStyle === 'warning') {
    return (
      <div>
        <Paper className={`${classes.root} ${classes.warning}`}>
          <Typography variant="h5" component="h5">
            {props.text}
          </Typography>
        </Paper>
      </div>
    );
  } else if (props.cStyle === 'success') {
    return (
      <div>
        <Paper className={`${classes.root} ${classes.success}`}>
          <Typography variant="h5" component="h5">
            {props.text}
          </Typography>
        </Paper>
      </div>
    );
  } else {
    return (<></>)
  }

}

export default Message;