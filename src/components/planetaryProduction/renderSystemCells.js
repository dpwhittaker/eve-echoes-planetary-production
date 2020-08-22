export default function renderSystemCells() {
  return [
    // render pattern:
    // {
    //   accessor: 'attributeName' // specify attribute
    //   display: (data) => `${data}`, // optional: specify cell's display
    //   header: 'Header Name', // specify column header,
    //   sortable: true, // optional; boolean
    //   width: 100, // optional: specify column width (integers are in px)
    // },
    {
      accessor: 'resource',
      header: 'Resource',
      sortable: true,
      width: '29%',
    },
    {
      accessor: 'planet',
      header: 'Planet',
      sortable: true,
      width: '29%',
    },
    {
      accessor: 'security',
      header: 'Security',
      sortable: true,
      width: '14%',
    },
    {
      accessor: 'jumps',
      header: 'Jumps',
      sortable: true,
      width: '14%',
    },
    {
      accessor: 'richness',
      header: 'Richness',
      sortable: true,
      width: '14%',
    },
  ];
}