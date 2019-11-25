import React, { Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { useAuth0 } from '../../contexts/react-auth0-context';
import { makeStyles } from '@material-ui/core/styles';
import { blueGrey, grey } from '@material-ui/core/colors';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  appbar: {
    color: theme.palette.getContrastText(blueGrey[50]),
    background: blueGrey[50],
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    textAlign: "left",
  },
  link: {
    textDecoration: 'none',
    color: '#424242',
    '&:hover': {
      color: theme.palette.getContrastText(blueGrey[800]),
    },
  },
  linkBtn: {
    '&:hover': {
      color: theme.palette.getContrastText(blueGrey[800]),
      background: blueGrey[800],
    }
  },
  logoutBtn: {
    color: grey[700],
    '&:hover': {
      color: theme.palette.getContrastText(blueGrey[800]),
      background: blueGrey[800],
    }
  }
}));

const AppNavBar = () => {
  const classes = useStyles();
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            className={classes.menuButton} >
          </IconButton>
          <Typography variant="h6" className={classes.title} >
            <Link to="/" className="no-decor" color="inherit">TXTRANS</Link>
          </Typography>
          {
            !isAuthenticated &&
            (
              <Button className={classes.linkBtn} onClick={() => { loginWithRedirect({}) }}>
                Login
                </Button>
            )
          }
          {
            isAuthenticated &&
            (
              <Fragment>
                <Button className={classes.linkBtn} component="button">
                  <Link to="/documents" className={classes.link}>Documents</Link>
                </Button>

                <Button className={classes.logoutBtn} onClick={() => logout({})}>Logout</Button>
              </Fragment>
            )
          }

        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withRouter(AppNavBar);