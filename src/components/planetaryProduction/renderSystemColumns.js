export default function renderSystemColumns() {
  return [
    // render pattern:
    // {
    //   dataKey: 'attributeName' // specify attribute
    //   display: (data) => `${data}`, // optional: specify cell's display
    //   label: 'Header Name', // specify column label,
    //   sortable: true, // optional; boolean
    // column width:
    // - integer = px
    // - float/fraction = percentage of screen width
    //   width: 100, 
    // },
    {
      dataKey: 'resource',
      label: 'Resource',
      sortable: true,
      width: 0.29,
    },
    {
      dataKey: 'planet',
      label: 'Planet',
      sortable: true,
      width: 0.29,
    },
    {
      dataKey: 'security',
      label: 'Security',
      numeric: true,
      sortable: true,
      width: 0.14,
    },
    {
      dataKey: 'jumps',
      label: 'Jumps',
      numeric: true,
      sortable: true,
      width: 0.14,
    },
    {
      dataKey: 'richness',
      label: 'Richness',
      numeric: true,
      sortable: true,
      width: 0.14,
    },
  ];
}