import React from 'react';
import PropTypes from 'prop-types';
import {
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';

function renderValue(values) {
  return (
    <Grid container spacing={1}>
      {values.map((value) => (
        <Grid item key={value}>
          <Chip label={value} />
        </Grid>
      ))}
    </Grid>
  );
}

function SelectWithChips({ id, label, onChange, options, ...rest }) {
  const labelId = `${id}-label`;

  return (
    <Grid item xs={12} md={6} lg={4}>
      <FormControl fullWidth>
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          {...rest}
          displayEmpty
          id={id}
          labelId={labelId}
          multiple
          onChange={(event) => onChange(event, event.target.value)}
          renderValue={renderValue}
        >
          {options.map((option) => (
            <MenuItem
              key={option}
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
}

SelectWithChips.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  value: PropTypes.any.isRequired,
};

export default SelectWithChips;
