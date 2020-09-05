import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AutoSizer,
  Column,
  Table,
} from 'react-virtualized';
import {
  TableCell,
  Typography
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

import { TableHeader } from './';

// h5 component height + bottom margin (32 + 8.4)
const tableTitleHeight = 32;
const tableTitleAdjustment = tableTitleHeight + 8.4;

const useStyles = makeStyles((theme) => createStyles({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  root: {
    // height = screen height - grid padding
    height: `calc(100vh - (${theme.spacing(4)}px * 2))`,
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
      backgroundColor: theme.palette.grey[800],
    },
  },
  tableCell: {
    flex: 1,
  },
  title: {
    height: tableTitleHeight,
    marginLeft: theme.spacing(1),
    width: 'max-content',
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
  title,
  selectedId,
  isSmallScreen,
  marginTop
}) {
  const classes = useStyles();

  const [direction, setDirection] = useState(
    columns && columns[0].sortDirection ? columns[0].sortDirection : 'asc'
  );
  const [orderBy, setOrderBy] = useState(columns.length ? columns[0].dataKey : undefined);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const modifier = direction === 'asc' ? 1 : -1;

      if (a[orderBy] === b[orderBy]) {
        return 0;
      } else {
        return a[orderBy] > b[orderBy] ? 1 * modifier : -1 * modifier;
      }
    });
  }, [data, direction, orderBy]);

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
        style={{ height: rowHeight, padding: 5 }}
        variant="body"
        size="small"
        padding="none"
      >
        {cellData}
      </TableCell>
    )
  }, [cellClasses, columns, rowHeight]);

  const renderHeader = useCallback(({ column, ...rest }) => {
    return (
      <TableHeader
        className={classNames(classes.tableCell, classes.flexContainer, classes.noClick)}
        column={column}
        component="div"
        style={{ height: headerHeight, padding: 5 }}
        variant="head"
        size="small"
        padding="none"
        {...rest}
      >
        {column.label}
      </TableHeader>
    );
  }, [classes, headerHeight]);

  function handleChangeSort(orderBy, direction) {
    setOrderBy(orderBy);
    setDirection(direction);
  }

  return (
    <div style={{height: `calc(${isSmallScreen ? 100 : 50}vh - (40px))`, marginTop}}>
      <AutoSizer>
        {({ height: screenHeight, width: screenWidth }) => {
          const tableHeight = title ? screenHeight - tableTitleAdjustment : screenHeight;
          return (
            <>
              <Typography
                className={classes.title}
                gutterBottom
                variant="h5"
              >
                {title}
              </Typography>
              <Table
                className={classes.table}
                gridStyle={{ direction: 'inherit' }}
                headerHeight={headerHeight}
                height={tableHeight}
                noRowsRenderer={() => <div>No results.</div>}
                rowClassName={getRowClassName}
                rowCount={sortedData.length}
                rowGetter={({index}) => sortedData[index]}
                rowHeight={rowHeight}
                width={screenWidth}
                sortBy={orderBy}
                rowStyle={({index}) => index > -1 && sortedData[index].id === selectedId ? {backgroundColor: '#666'} : {undefined}}
                onRowClick={onRowClick}
              >
                {columns.map((column, index) => {
                  const rendererProps = {
                    column,
                    direction,
                    onChangeSort: handleChangeSort,
                    orderBy,
                  };

                  return (
                    <Column
                      cellRenderer={renderCell}
                      className={classes.flexContainer}
                      dataKey={column.dataKey}
                      headerRenderer={(headerProps) => renderHeader({ ...rendererProps, ...headerProps })}
                      key={index}
                      width={Number.isInteger(column.width) ? column.width : column.width * screenWidth}
                    />
                  )
                })}
              </Table>
            </>
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
  selectedId: 0
};

VirtualizedTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number,
  selectedId: PropTypes.number,
};

export default VirtualizedTable;
