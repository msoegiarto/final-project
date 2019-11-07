import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

const NotFound = () => {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Typography color="textSecondary" variant="h2" component="h2" gutterBottom>
        404
        </Typography>
      <Typography variant="h5" component="h2">
        THE PAGE YOU REQUESTED COULD NOT BE FOUND
        </Typography>
      <Button className={classes.button} size="medium" variant="contained" color="primary">
        <Link to="/" className="no-decor">
          Go to Homepage
            </Link>
      </Button>
    </Container>
  );
}

export default NotFound;