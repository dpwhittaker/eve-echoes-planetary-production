import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@material-ui/core';

import { TableHeader, PaginatedRow } from './';

function PaginatedTable({ columns, data }) {
  const [direction, setDirection] = useState(
    columns && columns[0].sortDirection ? columns[0].sortDirection : 'asc'
  );
  const [orderBy, setOrderBy] = useState(columns.length ? columns[0].dataKey : undefined);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => setPage(0), [data]);

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

  return (
    <Grid item xs={12} md={12} lg={12}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableHeader
                  column={column}
                  direction={direction}
                  key={index}
                  onChangeSort={handleChangeSort}
                  orderBy={orderBy}
                />
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <PaginatedRow
              columns={columns}
              data={sortedData}
              page={page}
              rowsPerPage={rowsPerPage}
            />
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
