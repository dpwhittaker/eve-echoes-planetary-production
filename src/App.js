import React, { useEffect, useMemo, useState } from 'react';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import {
  Slider,
  TextField,
  Typography,
  Select,
  Chip,
  MenuItem
} from '@material-ui/core';

import './App.css';
import * as query from './data/query';

function App() {
  const [baseSystem, setBaseSystem] = useState(0);
  const [distanceRange, setDistanceRange] = useState([0, 10]);
  const [securityRange, setSecurityRange] = useState([0.5, 1.0]);
  const distanceMax = query.longestPath(baseSystem);
  const [resources, setResources] = useState(["Lustering Alloy"]);

  const systems = useMemo(() => query.getSystems());
  const resourceNames = useMemo(() => query.getResources());
  const inRange = query.systemsWithinRange(baseSystem, distanceRange, securityRange);

  return (
    <div className="app-container">
      <div className="input-container">
        <Autocomplete
          filterOptions={createFilterOptions({limit: 100})}
          getOptionLabel={(option) => systems[option].label}
          onChange={(event, value) => setBaseSystem(value)}
          options={systems.map((v, i) => i)}
          renderInput={(params) => <TextField {...params} label="Base System" variant="outlined" />}
          className="input-wrapper"
          value={baseSystem}
        />
        <div className="input-wrapper slider">
          <span>Distance to System</span>
          <Slider
            max={distanceMax}
            min={0}
            onChange={(event, value) => setDistanceRange(value)}
            step={1}
            value={distanceRange}
            valueLabelDisplay="on"
            marks={[{value:0,label: "0 jumps"},{value:distanceMax,label: `${distanceMax} jumps`}]}
          />
        </div>
        <div className="input-wrapper slider">
          <span>System Security</span>
          <Slider
            max={1.0}
            min={-1.0}
            onChange={(event, value) => setSecurityRange(value)}
            step={0.1}
            value={securityRange}
            valueLabelDisplay="on"
            marks={[{value:-1.0,label: "-1.0"},{value: 0, label: "0.0"},{value:0.5,label:"0.5"},{value:1,label: "1.0"}]}
          />
        </div>
        <Select
          multiple
          value={resources}
          onChange={(e, value) => {
            console.log(e.target, value);
            setResources(e.target.value);
          }}
          renderValue={(selected) => (
            <div className="chips">
              {selected.map((value) => (
                <Chip key={value} label={value} className="chip" />
              ))}
            </div>
          )}
          renderInput={(params) => <TextField {...params} label="Resources" variant="outlined" />}
          style={{maxWidth: '300px'}}
        >
          {resourceNames.map((name) => (
            <MenuItem key={name} value={name}>{name}</MenuItem>
          ))}
        </Select>
      </div>
      <div className="output-container">
        <div>{inRange.length} systems</div>
        {inRange.map(s => ( 
          <div>{systems[s].label}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
