import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';

const GreenButton = withStyles(theme => ({
  root: {
    color: green['A700'],
    backgroundColor: '#fff',
    borderColor: green['A700'],
    '&:hover': {
      color: theme.palette.getContrastText(green['A700']),
      backgroundColor: green['A700'],
    },
    minWidth: 175,
    [theme.breakpoints.down('sm')]: {
      minWidth: 50,
    },
  },
}))(Button);

const DownloadButton = props => {
  const { handleDownload, label, btnType, ...other } = props;

  const handleClick = () => {
    handleDownload();
  }

  return (
    <Fragment>
      <Hidden smDown>
        <GreenButton
          size="medium"
          variant="outlined"
          startIcon={<CloudDownloadOutlinedIcon color="inherit" />}
          onClick={handleClick}
          {...other}
  >Download{btnType ? ' ' + btnType : ''}</GreenButton>
      </Hidden>
      <Hidden mdUp>
        <GreenButton
          size="medium"
          variant="outlined"
          {...other}>
          <CloudDownloadOutlinedIcon color="inherit" />{btnType ? <span style={{marginLeft: '1vw'}}>{btnType}</span> : ''}
        </GreenButton>
      </Hidden>
    </Fragment>
  );
}

export default DownloadButton;