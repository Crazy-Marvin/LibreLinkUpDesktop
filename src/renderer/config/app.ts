type DropdownConfigType = {
  value: string
  label: string
}

const countries: DropdownConfigType[] = [
  { value: 'de', label: 'Germany' },
]

const languages: DropdownConfigType[] = [
  { value: 'en', label: 'English' },
  { value: 'si', label: 'Sinhala' },
  { value: 'no', label: 'Norwegian' },
]

export {
  countries,
  languages,
}
