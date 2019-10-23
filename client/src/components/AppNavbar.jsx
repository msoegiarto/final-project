import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { useAuth0 } from '../auth0/react-auth0-wrapper';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    textAlign: "left",
  },
}));

const ButtonAppBar = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            className={classes.menuButton} >
          </IconButton>
          <Typography variant="h6" className={classes.title} >
            <Link to="/" className="no-decor" color="secondary">MTL</Link>
          </Typography>
          {!isAuthenticated && (
            <Button color="inherit" onClick={() => { loginWithRedirect({ redirect_uri: 'http://localhost:3000/documents' }) }}>
              Login
            </Button>
          )}
          {isAuthenticated && (
            <>
              <Button color="inherit">
                <Link to="/documents" className="no-decor">Documents</Link>
              </Button>
              <Button color="inherit" style={{color:'#616161'}} onClick={() => logout({})}>Logout</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withRouter(ButtonAppBar);