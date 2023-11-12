type DropdownConfigType = {
  value: string
  label: string
}

const countries: DropdownConfigType[] = [
  { value: 'de', label: 'German' },
]

const languages: DropdownConfigType[] = [
  { value: 'en', label: 'English' },
  { value: 'si', label: 'Sinhala' },
]

export {
  countries,
  languages,
}
