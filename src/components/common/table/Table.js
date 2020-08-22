import React, { useState } from 'react';
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
  Typography,
} from '@material-ui/core';

function renderHeaders(cells, data) {
  return cells.map((cell, index) => (
    <TableCell key={index}>{cell.header}</TableCell>
  ));
}

function renderRows({ cells, data, page, rowsPerPage }) {
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  return data.slice(startIndex, endIndex).map((row, rowIndex) => (
    <TableRow key={rowIndex}>
      {cells.map((cell, cellIndex) => {
        const attribute = cell.getAttribute(row);
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

function DataTable({ cells, data, title }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  function handleChangeRowsPerPage(event) {
    const startIndex = page * rowsPerPage;
    const newRowsPerPage = event.target.value;
    const newPage = startIndex / newRowsPerPage;
    setPage(newPage);
    setRowsPerPage(newRowsPerPage);
  }

  return (
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {renderHeaders(cells, data)}
              </TableRow>
            </TableHead>
            <TableBody>
              {renderRows({ cells, data, page, rowsPerPage })}
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

DataTable.defaultProps = {
  cells: [],
  data: [],
};

DataTable.propTypes = {
  cells: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
};

export default DataTable;