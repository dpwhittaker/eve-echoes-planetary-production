import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import './App.css';
import data from './data/data.json';

let systems = data.data;
let systemIds = [];
for (let i = 0; i < systems.length; i++) systemIds.push(i);

function App() {
  const [baseSystem, setBaseSystem] = React.useState(0);

  return (
    <div className="App">
      <Autocomplete
        id="baseSystem"
        value={baseSystem}
        onChange={(event, newValue) => {
          console.log(newValue);
          setBaseSystem(newValue);
        }}
        options={systemIds}
        getOptionLabel={(option) => `${systems[option][0]} > ${systems[option][1]} > ${systems[option][2]}`}
        style={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Base System" variant="outlined" />}
      />
      
    </div>
  );
}

export default App;
