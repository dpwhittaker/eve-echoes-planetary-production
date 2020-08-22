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
      getAttribute: (data) => data.resource,
      header: 'Resource',
      width: '29%',
    },
    {
      getAttribute: (data) => data.planet,
      header: 'Planet',
      width: '29%',
    },
    {
      getAttribute: (data) => data.security,
      header: 'Security',
      width: '14%',
    },
    {
      getAttribute: (data) => data.jumps,
      header: 'Jumps',
      width: '14%',
    },
    {
      getAttribute: (data) => data.richness,
      header: 'Richness',
      width: '14%',
    },
  ];
}