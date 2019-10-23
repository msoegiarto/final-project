import React, { Component } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
// import languages from './lang_config.json';

const styles = theme => ({
  // root: {
  //   display: 'flex',
  //   flexWrap: 'wrap',
  // },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  menu: {
    width: 200,
  },
});

class Selects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      value: '',
      disabled: []
    };

  }

  handleChange = event => {
    this.setState({ value: event.target.value },
      () => this.props.stateChangeHandler(this)
    );
  };

  render() {
    const { classes } = this.props;

    return (
      // <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formControl}>
          <TextField
            id={this.props.id}
            select
            required
            label={this.props.label}
            name={this.props.name}
            className={classes.textField}
            value={this.state.value}
            onChange={this.handleChange}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            helperText="Required"
            margin="normal"
          >
            {this.props.languages.map((element, index) => (
              <MenuItem key={index} value={element.key}>{element.value}</MenuItem>
            ))}
            {/* <MenuItem value=""><em>None</em></MenuItem> */}
            {/* {
              this.state.toLanguage === '' ?
                languages.map(element => (
                  <MenuItem key={element.code} value={element.code}>{element.value}</MenuItem>
                )) :
                languages.map(element => {
                  if (element.code !== this.state.toLanguage)
                    return (<MenuItem key={element.code} value={element.code}>{element.value}</MenuItem>);
                  return (<></>);
                })
            } */}
          </TextField>
        </FormControl>
      // </form>
    );
  }
}

Selects.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Selects);