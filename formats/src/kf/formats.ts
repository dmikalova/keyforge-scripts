// https://archonarcana.com/Formats_and_variants
// Formats can be archon, sealed, alliance, multiplayer, team, draft, adventures, or more

const formats = ['archon', 'sealed', 'multiplayer', 'adventures', 'draft']

const alliance = [
  {
    description: 'Open 3 decks and alliance them',
    dokFilter: '',
    fn() {},
    formats: 'sealed',
    tco: true,
    variant: 'alliance',
  },
  {
    description: '',
    dokFilter: '',
    fn() {},
    formats: 'archon',
    tco: true,
    variant: 'alliance',
  },
]

export default {formats}
