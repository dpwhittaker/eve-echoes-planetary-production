import React from 'react';
import PropTypes from 'prop-types';
import {
  TableCell,
  TableSortLabel,
} from '@material-ui/core';

function TableHeader({
  column,
  direction,
  onChangeSort,
  orderBy,

  // deconstructing the following avoid React warnings
  columnData,
  dataKey,
  disableSort,
  sortBy,

  ...rest
}) {
  const active = orderBy === column.dataKey;

  const cellProps = {
      align: column.numeric || false ? 'right' : 'left',
      key: column.dataKey,
      sortDirection: active ? direction : false,
  };

  if (column.sortable) {
    cellProps.children = (
      <TableSortLabel
        active={active}
        direction={active ? direction : 'asc'}
        onClick={() => onChangeSort(column.dataKey, active ? (direction === 'asc' ? 'desc' : 'asc') : 'asc')}
      >
        {column.label}
      </TableSortLabel>
    );
  } else {
    cellProps.children = column.label;
  }
  
  return <TableCell {...rest} {...cellProps} />;
}

TableHeader.propTypes = {
  column: PropTypes.object.isRequired,
  direction: PropTypes.string.isRequired,
  onChangeSort: PropTypes.func.isRequired,
  orderBy: PropTypes.string.isRequired,
};

export default TableHeader;