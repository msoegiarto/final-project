import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import image2 from '../images/marie-bellando-mitjans-cBChXxQqEKM-unsplash.jpg';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: '100vw',
    maxHeight: '92vh',
    boxShadow: 'none',
    opacity: '0.8',
  },
  media: {
    height: '82vh',
  },
  myText: {
    position: 'absolute',
    top: '20vh',
    [theme.breakpoints.up('md')]: {
      left: '5vw',
    },
  }
}));

const Home = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image={image2}
        />
        <Typography component="h1" variant="h3" className={classes.myText}>Let's get this sheet done</Typography>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            Photo by <a href="https://unsplash.com/@gabianspirit?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Marie Bellando-Mitjans</a> on <a href="https://unsplash.com">Unsplash</a>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default Home;