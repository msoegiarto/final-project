import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { deepPurple } from '@material-ui/core/colors';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import image from '../images/document-translation45.jpg';
import { NONAME } from 'dns';


const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: '100vw',
    boxShadow: 'none',
  },
  action: {
    maxHeight: '82vh',
  },
  media: {
    height: '112vh',
    opacity: '0.3',
  },
  title: {
    position: 'absolute',
    top: '30vh',
    padding: '0 2.5rem',
    textShadow:
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 1px 1px 4px #673ab7',
    [theme.breakpoints.up('md')]: {
      top: '70vh',
      left: '5vw',
      padding: '0',
    }
  },
  description: {
    position: 'absolute',
    fontSize: '20px',
    top: '15vh',
    padding: '0 2.5rem',
    textShadow:
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 2px 2px 0 #ccc',
    letterSpacing: '1px',
    [theme.breakpoints.up('md')]: {
      top: '60vh',
      left: '5vw',
      padding: '0',
      textShadow:
        '-1px -1px 1px #fff, 1px -1px 1px #fff, -1px 1px 1px #fff, 1px 1px 1px #fff'
    },
  },
  credits: {
    color: deepPurple[900],
    textDecoration: 'none',
    '&:hover': {
      color: deepPurple['A700'],
    }
  },
}));

const Home = () => {
  const classes = useStyles();

  return (
    <div>
      <Card className={classes.card}>
        <CardActionArea className={classes.action}>
          <CardMedia
            className={classes.media}
            image={image}
          />
          <Typography component="p" className={classes.description}>There’s no better feeling than being clear:</Typography>
          <Typography component="h1" variant="h4" className={classes.title}>drop your documents and get this sheet done</Typography>
        </CardActionArea>
      </Card>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            Image by <a href="https://www.translatemedia.com/" className={classes.credits}>translatemedia</a>, Copywriting by <a href="https://twitter.com/absolute_basura" className={classes.credits}>Lilia Paz</a>, Font-styling by <a href="https://twitter.com/naomiquinones" className={classes.credits}>Naomi Quiñones</a>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;