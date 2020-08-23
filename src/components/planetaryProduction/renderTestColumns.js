export default function renderTestColumns() {
  return [
    {
      accessor: 'resource',
      header: 'Resource',
      sortable: true,
      width: '60%',
    },
    {
      accessor: 'richness',
      header: 'Richness',
      sortable: true,
      width: '40%',
    },
  ];
}