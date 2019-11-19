import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      '"Open Sans"'
    ].join(','),
  },
  palette: {
    background: {
      default: '#fff',
    }
  }
});

export default theme;