import React, { useMemo, useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  LinearProgress,
} from '@material-ui/core';

import * as Comlink from 'comlink';
/* eslint-disable import/no-webpack-loader-syntax */
import Query from 'worker-loader!../../data/query';
import usePersistedState from '../../helpers/usePersistedStorage';
import {
  Autocomplete,
  SelectWithChips,
  Slider,
} from '../common/form';
import { VirtualizedTable } from '../common/table';
import { Tabs } from '../common/tabs';
import renderSystemColumns from './renderSystemColumns';
import renderOverviewColumns from './renderOverviewColumns';
const query = Comlink.wrap(new Query());

function PlanetaryProductionPage() {
  console.log("render Planetary Production Page");
  const [baseSystem, setBaseSystem] = usePersistedState('baseSystem', 0);
  const [distanceRange, setDistanceRange] = usePersistedState('distanceRange', [0, 10]);
  const [securityRange, setSecurityRange] = usePersistedState('securityRange', [0.5, 1.0]);
  const [richnessRange, setRichnessRange] = usePersistedState('richnessRange', [90, 200]);
  const [resources, setResources] = usePersistedState('resources', ['Lustering Alloy']);
  const [planetology, setPlanetology] = usePersistedState('planetology', 1);
  const [bestMatches, setBestMatches] = useState([]);
  const [working, setWorking] = useState(false);
  const [distanceMax, setDistanceMax] = useState(65);
  const [resourceNames, setResourceNames] = useState(['Lustering Alloy']);
  const [systems, setSystems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [details, setDetails] = useState([]);
  console.log(baseSystem, distanceRange, securityRange, richnessRange, resources);
  
  useEffect(() => { query.longestPath(baseSystem).then(m => setDistanceMax(m)) }, [baseSystem]);
  useEffect(() => { query.getResources().then(r => setResourceNames(r)) }, []);
  useEffect(() => { query.getSystems().then(s => setSystems(s)) }, []);

  useEffect(() => {
    query.matchingProduction(baseSystem, distanceRange, securityRange, richnessRange, resources)
      .then(m => {setMatches(m); setDetails(m);});
  }, [baseSystem, distanceRange, securityRange, resources, richnessRange]);

  useEffect(() => {
    query.findBestMatches(matches, baseSystem, resources, planetology, Comlink.proxy(setBestMatches), Comlink.proxy(setWorking))
  }, [matches, baseSystem, resources, planetology]);

  const distanceMarks = useMemo(() => {
    const marks = [...Array(Math.round(distanceMax / 10)).keys()].map((value) => ({ value: value * 10, label: value * 10 }));
    if (marks[-1] !== distanceMax) {
      marks.push({ value: distanceMax, label: distanceMax });
    }
    return marks;
  }, [distanceMax]);

  const tableConfigs = useMemo(() => [
    {
      Component: VirtualizedTable,
      data: bestMatches,
      label: 'Overview',
      renderColumns: renderOverviewColumns,
    },
    {
      Component: VirtualizedTable,
      data: matches,
      label: 'Systems',
      renderColumns: renderSystemColumns,
    },
  ], [bestMatches, matches]);

  console.log("working", working);
  if (systems.length === 0)
    return (<Typography>Loading...</Typography>);
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

      <Slider
        label="Planets (Planetology max development)"
        marks={[{ value:1, label: '1' }, { value: 6, label: '6' }]}
        max={6}
        min={1}
        onChange={(event, value) => setPlanetology(value)}
        step={1}
        value={planetology}
      />

      <Grid item xs={12}>
        <LinearProgress value={100} variant={working ? 'indeterminate' : 'determinate'}/>
      </Grid>

      {/*
      <Tabs tabs={tableConfigs}>
        {tableConfigs.map((tab) => (
          <tab.Component
            columns={tab.renderColumns()}
            data={tab.data}
          />
        ))}
      </Tabs>      
      */}
      <Grid item xs={12} lg={6}>
        <VirtualizedTable data={bestMatches} columns={renderOverviewColumns()} onRowClick={({rowData}) => setDetails(rowData.matches)}/>
      </Grid>
      <Grid item xs={12} lg={6}>
        <VirtualizedTable data={details} columns={renderSystemColumns()}/>
      </Grid>

    </Grid>
  );
}

export default PlanetaryProductionPage;
