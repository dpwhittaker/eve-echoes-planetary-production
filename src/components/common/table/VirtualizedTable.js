import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AutoSizer,
  Column,
  Table,
} from 'react-virtualized';

const styles = (theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  table: {
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    '& .ReactVirtualized__Table__headerRow': {
      flip: false,
      paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
    },
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableCell: {
    flex: 1,
  },
  noClick: {
    cursor: 'initial',
  },
});



class VirtualizedTable extends React.PureComponent {
  render() {
    const {
      classes,
      columns,
      headerHeight,
      rowHeight,
      ...tableProps
    } = this.props;

    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            // className={classes.table}
            gridStyle={{ direction: 'inherit' }}
            headerHeight={headerHeight}
            height={height}
            // rowClassName={this.getRowClassName}
            rowHeight={rowHeight}
            width={width}
          >
            {}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

VirtualizedTable.defaultProps = {
  cells: [],
  data: [],
  headerHeight: 48,
  rowHeight: 48,
};

VirtualizedTable.propTypes = {
  cells: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  headerHeight: PropTypes.number,
  rowHeight: PropTypes.number,
  title: PropTypes.string,
};

export default VirtualizedTable;