import React from 'react';
import PropTypes from 'prop-types';
import MUIAutocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { Grid, TextField } from '@material-ui/core';

function Autocomplete({ label, limit, ...rest }) {
  return (
    <Grid item xs={12} md={6} lg={4}>
      <MUIAutocomplete
        {...rest}
        filterOptions={createFilterOptions({limit})}
        renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      />
    </Grid>
  );
}

Autocomplete.defaultProps = {
  limit: 100,
};

Autocomplete.propTypes = {
  getOptionLabel: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  limit: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
};

export default Autocomplete;