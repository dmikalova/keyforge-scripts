// The league format is best played by a group of people who play best-of-3 matches, usually at a cadence of one match a week.

const variants_league = [
  {
    description:
      "start with a sas limit, wins/losses increase/decrease the limit",
    dok_filter: "",
    fn: () => {},
    format: "archon",
    in_person: "league",
    variant: "sascalator",
  },
  {
    description: "winning decks cannot be used again",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    in_person: "league",
    variant: "shootout",
  },
  {
    description:
      "two player teams - 1 plays archon, the other reversal, with the same deck",
    dok_filter: "",
    fn: () => {},
    format: "archon",
    in_person: "league",
    variant: "teams archon/reversal",
  },
  {
    description: "a random set is assigned to each player each week",
    dok_filter: "",
    fn: () => {},
    format: "archon",
    in_person: "league",
    variant: "chaos portal",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    in_person: "league",
    variant: "adaptive",
  },
  // triad could be done for casual in person thursdays. Sealed triad probably wouldn't be league
  {
    description: "present 3 decks, ban 1, choose other",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    in_person: "league",
    variant: "triad_archon",
  },
  {
    description: "present 3 decks, ban 1 based only on houses, choose other",
    dok_filter: "",
    format: "sealed",
    fn: () => {},
    in_person: "league",
    variant: "triad_sealed",
  },
  {
    description:
      "bring 6 decks, ban protect, ban decks, play BO3 with the 4 decks left",
    dok_filter: "",
    fn: () => {},
    format: "archon",
    in_person: "league",
    variant: "nordic hexad",
  },
  {
    description:
      "play sets in sequence and then back down with sealed decks - ie cota, aoa, wc, etc",
    dok_filter: "",
    fn: () => {},
    format: "sealed",
    in_person: "league",
    variant: "journey through keyforge",
  },
];
