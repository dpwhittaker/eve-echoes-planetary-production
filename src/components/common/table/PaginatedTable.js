import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';

function renderHeaders({ columns, data, direction, onChangeSort, orderBy }) {
  return columns.map((column, index) => {
    if (column.sortable) {
      const active = orderBy === column.dataKey;
      return (
        <TableCell
          align={column.numeric || false ? 'right' : 'left'}
          key={column.dataKey}
          sortDirection={active ? direction : false}
        >
          <TableSortLabel
            active={active}
            direction={active ? direction : 'asc'}
            onClick={() => onChangeSort(column.dataKey, active ? (direction === 'asc' ? 'desc' : 'asc') : 'asc')}
          >
            {column.label}
          </TableSortLabel>
        </TableCell>
      );
    } else {
      return <TableCell key={index}>{column.label}</TableCell>;
    }
  });
}

function renderRows({ columns, data, page, rowsPerPage }) {
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  return data.slice(startIndex, endIndex).map((row, rowIndex) => (
    <TableRow key={rowIndex}>
      {columns.map((column, columnIndex) => {
        const attribute = row[column.dataKey];
        const display = column.display ? column.display(attribute) : attribute;

        const style = {};
        if (column.width) style.width = column.width;

        return (
          <TableCell
            align={column.numeric || false ? 'right' : 'left'}
            key={columnIndex}
            style={style}
          >
            {display}
          </TableCell>
        );
      })}
    </TableRow>
  ));
}

function PaginatedTable({ columns, data }) {
  const [direction, setDirection] = useState('asc');
  const [orderBy, setOrderBy] = useState(columns.length ? columns[0].dataKey : undefined);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  function handleChangeRowsPerPage(event) {
    const startIndex = page * rowsPerPage;
    const newRowsPerPage = event.target.value;
    const newPage = startIndex / newRowsPerPage;
    setPage(newPage);
    setRowsPerPage(newRowsPerPage);
  }

  function handleChangeSort(orderBy, direction) {
    setOrderBy(orderBy);
    setDirection(direction);
  }

  useEffect(() => {
    setPage(0);
  }, [data])

  return (
    <Grid item xs={12} md={12} lg={12}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {renderHeaders({
                columns,
                data: sortedData,
                direction,
                onChangeSort: handleChangeSort,
                orderBy
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderRows({
              columns,
              data: sortedData,
              page,
              rowsPerPage
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        onChangePage={(event, value) => setPage(value)}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Grid>
  );
}

PaginatedTable.defaultProps = {
  columns: [],
  data: [],
};

PaginatedTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
};

export default PaginatedTable;