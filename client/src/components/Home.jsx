import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import image from '../images/document-translation45.jpg';


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
    [theme.breakpoints.down('md')]: {
      opacity: '0.3',
    },
  },
  title: {
    position: 'absolute',
    top: '50vh',
    left: '5vw',
    textShadow:
      '-1px -1px 0 #fff, 1px -1px 0 #fff,-1px 1px 0 #fff,1px 1px 0 #fff, 1px 1px 4px #673ab7',
    [theme.breakpoints.down('sm')]: {
      left: 0,
      top: '20vh',
    }
  },
  description: {
    position: 'absolute',
    fontSize: '20px',
    top: '40vh',
    padding: '0 2.5rem',
    textShadow:
      '-1px -1px 0 #fff, 1px -1px 0 #fff,-1px 1px 0 #fff,1px 1px 0 #fff, 2px 2px 0 #ccc',
    letterSpacing: '1px',
    [theme.breakpoints.up('md')]: {
      top: '62vh',
      left: '5vw',
      padding: '0',
      textShadow:
        '-1px -1px 1px #fff, 1px -1px 1px #fff,-1px 1px 1px #fff,1px 1px 1px #fff'
    },
  }
}));

const Home = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardActionArea className={classes.action}>
        <CardMedia
          className={classes.media}
          image={image}
        />
        <Typography component="h1" variant="h3" className={classes.title}>Let's get this sheet done</Typography>
        <Typography component="p" className={classes.description}>Translating documents is as easy as uploading and downloading</Typography>
      </CardActionArea>
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          Photo by <a href="https://www.translatemedia.com/">translatemedia</a>
        </Typography>
      </CardContent>
    </Card>
  );
}

export default Home;