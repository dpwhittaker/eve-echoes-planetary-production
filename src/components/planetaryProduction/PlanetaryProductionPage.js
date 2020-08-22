import React, { useMemo, useEffect } from 'react';
import { Grid, Typography } from '@material-ui/core';

import * as query from '../../data/query';
import {
  Autocomplete,
  SelectWithChips,
  Slider,
} from '../common/form';
import { Table } from '../common/table';
import renderSystemCells from './renderSystemCells';

function usePersistedState(key, defaultValue) {
  const [state, setState] = React.useState(
    () => JSON.parse(localStorage.getItem(key)) || defaultValue
  );
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

function PlanetaryProductionPage() {
  const [baseSystem, setBaseSystem] = usePersistedState("baseSystem", 0);
  const [distanceRange, setDistanceRange] = usePersistedState("distanceRange", [0, 10]);
  const [securityRange, setSecurityRange] = usePersistedState("securityRange", [0.5, 1.0]);
  const [richnessRange, setRichnessRange] = usePersistedState("richnessRange", [90, 200]);
  const [resources, setResources] = usePersistedState("resources", ["Lustering Alloy"]);
  console.log(baseSystem, distanceRange, securityRange, richnessRange, resources);
  
  const distanceMax = useMemo(() => query.longestPath(baseSystem), [baseSystem]);
  const resourceNames = useMemo(() => query.getResources(), []);
  const systems = useMemo(() => query.getSystems(), []);

  const matches = useMemo(() => {
    return query.matchingProduction(baseSystem, distanceRange, securityRange, richnessRange, resources);
  }, [baseSystem, distanceRange, securityRange, resources, richnessRange]);

  const distanceMarks = useMemo(() => {
    const marks = [...Array(Math.round(distanceMax / 10)).keys()].map((value) => ({ value: value * 10, label: value * 10 }));
    if (marks[-1] !== distanceMax) {
      marks.push({ value: distanceMax, label: distanceMax });
    }
    return marks;
  }, [distanceMax]);

  return (
    <Grid container spacing={4}>

      <Grid item xs={12} md={12} lg={12}>
        <Typography variant="h4" width={1}>EVE Echoes</Typography>
        <Typography variant="h5" width={1}>Planetary Production</Typography>
      </Grid>

      <Autocomplete
        getOptionLabel={(option) => systems[option].label}
        label="Base System"
        onChange={(event, value) => setBaseSystem(value)}
        options={systems.map((system, index) => index)}
        value={baseSystem}
      />

      <Slider
        label="Distance to System (jumps)"
        marks={distanceMarks}
        max={distanceMax}
        min={0}
        onChange={(event, value) => setDistanceRange(value)}
        step={1}
        value={distanceRange}
      />

      <Slider
        label="System Security"
        marks={[{ value:-1.0, label: '-1.0' }, { value: 0, label: '0.0' }, { value:0.5, label:'0.5' }, { value:1, label: '1.0' }]}
        max={1.0}
        min={-1.0}
        onChange={(event, value) => setSecurityRange(value)}
        step={0.1}
        value={securityRange}
      />

      <SelectWithChips
        id="resources"
        label="Resource Types"
        onChange={(event, value) => setResources(value)}
        options={resourceNames}
        value={resources}
      />

      <Slider
        label="Resource Richness"
        marks={[{ value:25, label: '25' }, { value: 100, label: 'high sec' }, { value:133, label:'low sec' }, { value:200, label: '200' }]}
        max={200}
        min={25}
        onChange={(event, value) => setRichnessRange(value)}
        step={1}
        value={richnessRange}
      />

      <Table
        cells={renderSystemCells()}
        data={matches}
        title="Systems"
      />

    </Grid>
  );
}

export default PlanetaryProductionPage;
