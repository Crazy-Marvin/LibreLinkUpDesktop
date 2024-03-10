type DropdownConfigType = {
  value: string
  label: string
}

const countries: DropdownConfigType[] = [
  { value: 'de', label: 'Germany' },
  { value: 'eu', label: 'European Union' },
  { value: 'eu2', label: 'European Union 2' },
  { value: 'us', label: 'United States' },
  { value: 'ap', label: 'Asia/Pacific' },
  { value: 'ca', label: 'Canada' },
  { value: 'jp', label: 'Japan' },
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'fr', label: 'France' },
  { value: 'au', label: 'Australia' },
]

const languages: DropdownConfigType[] = [
  { value: 'de', label: 'German' },
  { value: 'en', label: 'English' },
  { value: 'si', label: 'Sinhala' },
  { value: 'no', label: 'Norwegian' },
]

const themes: DropdownConfigType[] = [
  {
    label: 'Dark',
    value: 'dark',
  },
  {
    label: 'Light',
    value: 'light',
  },
  {
    label: 'System',
    value: 'system',
  },
];

export {
  countries,
  languages,
  themes,
}
