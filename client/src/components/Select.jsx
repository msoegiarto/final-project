import React, { Component } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 150,
  },
  menu: {
    width: 150,
  },
});

class Select extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

  }

  handleChange = event => {
    this.setState({ value: event.target.value },
      () => this.props.selectChangeHandler(this)
    );
  };

  render() {
    const { classes } = this.props;

    return (
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
        helperText={this.props.helperText}
        margin="normal"
      >
        {this.props.languages.map((element, index) => (
          <MenuItem key={index} value={element.key}>{element.value}</MenuItem>
        ))}
      </TextField>
    );
  }
}

Select.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Select);