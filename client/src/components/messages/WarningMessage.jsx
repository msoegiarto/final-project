import React, { Fragment, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    margin: '5vh 3vw 0 3vw',
    display: 'flex',
    minHeight: '50px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  warning: {
    backgroundColor: red['A400'],
    color: theme.palette.getContrastText(red['A400']),
  },
}));

const WarningMessage = props => {
  const classes = useStyles();
  const [showMessage, setShowMessage] = useState();

  useEffect(() => {
    setShowMessage(props.showWarningMessage);
  }, [props.showWarningMessage]);

  return (
    <Fragment>
      {
        showMessage &&
        (
          <Paper className={`${classes.root} ${classes.warning}`}>
            <Typography variant="h5" component="h5">
              {props.text}
            </Typography>
          </Paper>
        )
      }
    </Fragment>
  );

}

export default WarningMessage;