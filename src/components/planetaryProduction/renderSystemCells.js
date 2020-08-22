export default function renderSystemCells() {
  return [
    // render pattern:
    // {
    //   cell: (row) => row.nameOfAttribute, // specify attribute
    //   display: (data) => `${data}`, // optional: specify cell's display
    //   header: 'Header Name', // specify column header,
    //   width: 100, // optional: specify column width (integers are in px)
    // },
    {
      getAttribute: (data) => data.region,
      header: 'Region',
      width: '30%',
    },
    {
      getAttribute: (data) => data.constellation,
      header: 'Constellation',
      width: '30%',
    },
    {
      getAttribute: (data) => data.system,
      header: 'System',
      width: '40%',
    },
  ];
}