import React, { useMemo, useState } from 'react';
import { Grid, Typography } from '@material-ui/core';

import * as query from '../../data/query';
import resourceRichnessTypes from '../../constants/resourceRichnessTypes';
import {
  Autocomplete,
  SelectWithChips,
  Slider,
} from '../common/form';
import { Table } from '../common/table';
import renderSystemCells from './renderSystemCells';

function PlanetaryProductionPage() {
  const [baseSystem, setBaseSystem] = useState(0);
  const [distanceRange, setDistanceRange] = useState([0, 10]);
  const [securityRange, setSecurityRange] = useState([0.5, 1.0]);
  const [resources, setResources] = useState(["Lustering Alloy"]);
  const [resourceRichness, setResourceRichness] = useState([]);
  
  const distanceMax = useMemo(() => query.longestPath(baseSystem), [baseSystem]);
  const resourceNames = useMemo(() => query.getResources(), []);
  const systems = useMemo(() => query.getSystems(), []);

  const inRange = useMemo(() => {
    return query.systemsWithinRange(baseSystem, distanceRange, securityRange);
  }, [baseSystem, distanceRange, securityRange]);

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

      <SelectWithChips
        id="resource-richness"
        label="Resource Richness"
        onChange={(event, value) => setResourceRichness(value)}
        options={resourceRichnessTypes}
        value={resourceRichness}
      />

      <Table
        cells={renderSystemCells()}
        data={systems}
        title="Systems"
      />

    </Grid>
  );
}

export default PlanetaryProductionPage;
