import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Paper,
  Tab as MUITab,
  Tabs as MUITabs,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    maxHeight: '100vh',
  },
  paper: {
    flexGrow: 1,
  },
};

// function Tabs({ children, tabs }) {
class Tabs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 0,
    };

    this.setCurrentTab = this.setCurrentTab.bind(this);
  }

  setCurrentTab(currentTab) {
    this.setState({ currentTab });
  }

  render() {
    const { children, classes, subNav, tabs } = this.props;
    const { currentTab } = this.state;

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
            onChange={(event, index) => this.setCurrentTab(index)}
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
        {subNav}
        {children[currentTab]}
      </Grid>
    );
  }
}

Tabs.defaultProps = {
  children: [],
  tabs: [],
};

Tabs.propTypes = {
  children: PropTypes.array.isRequired,
  subNav: PropTypes.node,
  tabs: PropTypes.array.isRequired,
};

export default withStyles(styles)(Tabs);
