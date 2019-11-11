import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import gifImg from '../images/tenor_rabbit.gif';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
  },
  card: {
    maxHeight: '50vh',
    maxWidth: '100vw',
    boxShadow: 'none',
  },
  media: {
    height: '35vh',
  },
  content: {
    marginTop: theme.spacing(2),
  },
  content2: {
    marginTop: theme.spacing(5),
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(12),
    },
  },
}));

const NotFound = () => {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Typography color="textSecondary" variant="h2" component="h2" gutterBottom>
        404
        </Typography>
      <Card className={classes.card}>
        <img src={gifImg} className={classes.media} alt=""/>
      </Card>
      <Typography variant="h5" component="h2" className={classes.content}>
        THE BUNNY STOLE THE PAGE
        </Typography>
      <Button className={classes.content} size="medium" variant="contained" color="primary">
        <Link to="/" className="no-decor">
          Go to Homepage
            </Link>
      </Button>
      <Typography variant="body2" color="textSecondary" component="p" className={classes.content2}>
        Image by <a href="https://tenor.com/view/cute-rabbit-running-happy-gif-13520034">tenor.com</a>
      </Typography>
    </Container>
  );
}

export default NotFound;