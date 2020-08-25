export default function renderOverviewColumns() {
  return [
    {
      dataKey: 'totalRichness',
      label: 'Total Richness',
      sortable: true,
      sortDirection: 'desc',
      width: 0.25,
    },
    {
      dataKey: 'roundTrip',
      label: 'Round Trip',
      numeric: true,
      sortable: true,
      width: 0.25,
    },
    {
      dataKey: 'planets',
      label: 'Planets',
      numeric: true,
      sortable: true,
      width: 0.25,
    },
    {
      dataKey: 'systems',
      label: 'Systems',
      numeric: true,
      sortable: true,
      width: 0.25,
    },
  ];
}
