import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Paper,
  Tab as MUITab,
  Tabs as MUITabs,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import usePersistedState from '../../../helpers/usePersistedStorage';

const useStyles = makeStyles({
  root: {
    maxHeight: '100vh',
  },
  paper: {
    flexGrow: 1,
  },
});

function Tabs({ children, tabs }) {
  const [currentTab, setCurrentTab] = usePersistedState('currentTab', 0);
  const classes = useStyles();

  return (
    <Grid
      className={classes.root}
      item
      lg={12}
      md={12}
      xs={12}
    >
      <Paper className={classes.paper}>
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

Tabs.defaultProps = {
  children: [],
  tabs: [],
};

Tabs.propTypes = {
  children: PropTypes.array.isRequired,
  tabs: PropTypes.array.isRequired,
};

export default Tabs;
