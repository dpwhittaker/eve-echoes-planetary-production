import React, { useEffect, useMemo, useState } from 'react';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import {
  Slider,
  TextField,
  Typography,
} from '@material-ui/core';

import './App.css';
import data from './data/data.json';

function App() {
  const [baseSystem, setBaseSystem] = useState(null);
  const [distanceRange, setDistanceRange] = useState([0, 10]);
  const [distanceMax, setDistanceMax] = useState(100);
  const [distanceMin, setDistanceMin] = useState(0);

  const systems = useMemo(() => {
    return data.data.map((datum) => ({
      region: datum[0],
      constellation: datum[1],
      system: datum[2],
    }));
  }, [data]);

  return (
    <div className="app-container">
      <div className="input-container">
        <Autocomplete
          filterOptions={createFilterOptions({limit: 100})}
          getOptionLabel={(option) => `${option.region} > ${option.constellation} > ${option.system}`}
          onChange={(event, value) => setBaseSystem(value)}
          options={systems}
          renderInput={(params) => <TextField {...params} label="Base System" variant="outlined" />}
          className="input-wrapper"
          value={baseSystem}
        />
        <div className="input-wrapper slider">
          <span>Distance to System</span>
          <Slider
            max={distanceMax}
            min={distanceMin}
            onChange={(event, value) => setDistanceRange(value)}
            step={1}
            value={distanceRange}
            valueLabelDisplay="on"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
