import React, { useState, useEffect } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import languages from '../../languages.json';

const useStyle = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 175,
  },
  menuItem: {
    width: 175,
  },
}));

const Select = props => {
  const classes = useStyle();
  const { propsValue, excludeValue, onValueChange, ...other } = props;

  const [value, setValue] = useState('');
  const [languageSelection, setLanguageSelection] = useState([]);

  useEffect(() => {
    setValue(propsValue);
  }, [propsValue]);

  useEffect(() => {
    const newLanguageSelection = languages.filter(element => element.key !== excludeValue);
    setLanguageSelection(newLanguageSelection);
  }, [excludeValue]);

  const handleChange = event => {
    onValueChange(event.target.value);
  }

  return (
    <TextField
      select
      required
      className={classes.textField}
      value={value}
      onChange={handleChange}
      {...other}
      SelectProps={{
        MenuProps: {
          className: classes.menuItem,
        },
      }}
      helperText="required"
      margin="normal"
    >
      {
        languageSelection.map((element, index) => (
          <MenuItem key={index} value={element.key}>{element.value}</MenuItem>
        ))
      }
    </TextField>
  );
}

export default Select;