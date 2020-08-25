import React from 'react';
import PropTypes from 'prop-types';
import {
  TableCell,
  TableRow,
} from '@material-ui/core';

function PaginatedRow({ columns, data, page, rowsPerPage }) {
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

PaginatedRow.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default PaginatedRow;