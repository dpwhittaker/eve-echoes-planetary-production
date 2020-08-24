export default function renderOverviewColumns() {
  return [
    {
      dataKey: 'totalRichness',
      label: 'Total Richness',
      sortable: true,
      width: 0.25,
    },
    {
      dataKey: 'roundTrip',
      label: 'Round Trip',
      sortable: true,
      width: 0.25,
    },
    {
      dataKey: 'planets',
      label: 'Planets',
      sortable: true,
      width: 0.25,
    },
    {
      dataKey: 'systems',
      label: 'systems',
      sortable: true,
      width: 0.25,
    },
  ];
}
