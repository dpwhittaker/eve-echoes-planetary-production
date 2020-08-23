import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@material-ui/core';

function renderHeaders({ cells, data, direction, onChangeSort, orderBy }) {
  return cells.map((cell, index) => {
    if (cell.sortable) {
      const active = orderBy === cell.accessor;
      return (
        <TableCell
          key={cell.accessor}
          sortDirection={active ? direction : false}
        >
          <TableSortLabel
            active={active}
            direction={active ? direction : 'asc'}
            onClick={() => onChangeSort(cell.accessor, active ? (direction === 'asc' ? 'desc' : 'asc') : 'asc')}
          >
            {cell.header}
          </TableSortLabel>
        </TableCell>
      );
    } else {
      return <TableCell key={index}>{cell.header}</TableCell>;
    }
  });
}

function renderRows({ cells, data, page, rowsPerPage }) {
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  return data.slice(startIndex, endIndex).map((row, rowIndex) => (
    <TableRow key={rowIndex}>
      {cells.map((cell, cellIndex) => {
        const attribute = row[cell.accessor];
        const display = cell.display ? cell.display(attribute) : attribute;

        const style = {};
        if (cell.width) style.width = cell.width;

        return (
          <TableCell
            key={cellIndex}
            style={style}
          >
            {display}
          </TableCell>
        );
      })}
    </TableRow>
  ));
}

function PaginatedTable({ cells, data, title }) {
  const [direction, setDirection] = useState('asc');
  const [orderBy, setOrderBy] = useState(cells.length ? cells[0].accessor : undefined);
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
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {renderHeaders({
                  cells,
                  data: sortedData,
                  direction,
                  onChangeSort: handleChangeSort,
                  orderBy
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {renderRows({
                cells,
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
      </Paper>
    </Grid>
  );
}

PaginatedTable.defaultProps = {
  cells: [],
  data: [],
};

PaginatedTable.propTypes = {
  cells: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.string,
};

export default PaginatedTable;