import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  AutoSizer,
  Column,
  Table,
} from 'react-virtualized';
import { TableCell } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles((theme) => createStyles({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  root: {
    // height = screen height - grid padding
    height: `calc(100vh - (${theme.spacing(4)}px * 3))`,
    marginBottom: theme.spacing(4)
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
}));

function VirtualizedTable({
  columns,
  data,
  headerHeight,
  onRowClick,
  rowHeight,
}) {
  const classes = useStyles();

  const cellClasses = classNames(
    classes.tableCell,
    classes.flexContainer,
    {
      [classes.noClick]: onRowClick == null,
    },
  );

  const getRowClassName = useCallback(({ index }) => {
    return classNames(
      classes.tableRow,
      classes.flexContainer,
      {
        [classes.tableRowHover]: index !== -1 && onRowClick != null,
      },
    );
  }, [classes, onRowClick]);

  const renderCell = useCallback(({ cellData, columnIndex }) => {
    return (
      <TableCell
        align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
        component="div"
        className={cellClasses}
        style={{ height: rowHeight }}
        variant="body"
      >
        {cellData}
      </TableCell>
    )
  }, [cellClasses, columns, rowHeight]);

  const renderHeader = useCallback(({ columnIndex, label, ...rest }) => {
    return (
      <TableCell
        align={columns[columnIndex].numeric || false ? 'right' : 'left'}
        className={classNames(classes.tableCell, classes.flexContainer, classes.noClick)}
        component="div"
        style={{ height: headerHeight }}
        variant="head"
      >
        {label}
      </TableCell>
    );
  }, [classes, columns, headerHeight])

  return (
    <div className={classes.root}>
      <AutoSizer>
        {({ height: screenHeight, width: screenWidth }) => {
          return (
            <Table
              className={classes.table}
              gridStyle={{ direction: 'inherit' }}
              headerHeight={headerHeight}
              height={screenHeight}
              noRowsRenderer={() => <div>No results.</div>}
              rowClassName={getRowClassName}
              rowCount={data.length}
              rowGetter={({index}) => data[index]}
              rowHeight={rowHeight}
              width={screenWidth}
            >
              {columns.map(({ dataKey, width: columnWidth, ...rest }, index) => {
                return (
                  <Column
                    cellRenderer={renderCell}
                    className={classes.flexContainer}
                    dataKey={dataKey}
                    headerRenderer={(headerProps) => renderHeader({ ...headerProps, columnIndex: index })}
                    key={dataKey}
                    width={Number.isInteger(columnWidth) ? columnWidth : columnWidth * screenWidth}
                    {...rest}
                  />
                )
              })}
            </Table>
          );
        }}
      </AutoSizer>
    </div>
  );
}

VirtualizedTable.defaultProps = {
  columns: [],
  data: [],
  headerHeight: 48,
  rowHeight: 48,
};

VirtualizedTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number,
};

export default VirtualizedTable;
