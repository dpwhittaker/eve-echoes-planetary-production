import React from 'react';
import PropTypes from 'prop-types';

import {
  Grid,
  InputLabel,
  Slider as MUISlider,
} from '@material-ui/core';

function Slider({ label, ...rest }) {
  return (
    <Grid item xs={12} md={6} lg={4}>
      <InputLabel>{label}</InputLabel>
      <MUISlider {...rest} />
    </Grid>
  );
}

Slider.defaultProps = {
  valueLabelDisplay: 'auto',
};

Slider.propTypes = {
  label: PropTypes.string,
  marks: PropTypes.array,
  max: PropTypes.number,
  min: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  step: PropTypes.number,
  value: PropTypes.any.isRequired,
  valueLabelDisplay: PropTypes.string,
};

export default Slider;
