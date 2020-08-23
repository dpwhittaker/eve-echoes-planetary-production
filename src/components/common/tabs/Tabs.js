import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Tab as MUITab,
  Tabs as MUITabs,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import usePersistedState from '../../../helpers/usePersistedStorage';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

function Tabs({ children, tabs }) {
  const [currentTab, setCurrentTab] = usePersistedState('currentTab', 0);
  const classes = useStyles();

  return (
    <Grid item xs={12} md={12} lg={12}>
      <Paper className={classes.root}>
        <MUITabs
          centered
          onChange={(event, index) => setCurrentTab(index)}
          value={currentTab}
          variant="fullWidth"
        >
          {tabs.map((tab, index) => (
            <MUITab
              key={index}
              label={tab.label}
            />
          ))}
        </MUITabs>
      </Paper>
      {children[currentTab]}
    </Grid>
  );
}

export default Tabs;