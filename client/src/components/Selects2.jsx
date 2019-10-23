import React, { Component } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

const currencies = [
  {
    value: "USD",
    label: "$"
  },
  {
    value: "EUR",
    label: "€"
  },
  {
    value: "BTC",
    label: "฿"
  },
  {
    value: "JPY",
    label: "¥"
  }
];

const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  }
});

class Selects extends Component {
  constructor() {
    super();
    this.state = {
      currency: ""
    };
  }

  handleChange = name => event => {
    // this.setState(oldState => ({
    //   ...oldState,
    //   [name]: event.target.value
    // }));
    console.log('1', this.state);
    console.log(event.target.value);

    this.setState({ [name]: event.target.value });

    console.log('2', this.state);
  };

  selectRenderer = () => {
    const { classes } = this.props;
    return (
      <FormControl className={classes.formControl}>
        <TextField
          id="standard-select-currency"
          select
          label="Select"
          // className={classes.textField}
          value={this.state.currency}
          onChange={this.handleChange("currency")}
          SelectProps={{
            MenuProps: {
              // className: classes.menu
            }
          }}
          helperText="Please select your currency"
          margin="normal"
        >
          {
            currencies.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))
          }
        </TextField>
      </FormControl>
    );
  }

  render() {
    return (
      <div>
        {this.selectRenderer()}
        <p>Value:</p>{this.state.currency}
      </div>
    );
  }
}

Selects.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Selects);
