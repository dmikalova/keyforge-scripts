// Modifiers change how the game is played

const modifiers = [
  {
    category: "sets",
    description: "",
    modifier: "not set",
  },
  {
    category: "sets",
    description: "",
    modifier: "any set",
  },
  {
    category: "sets",
    description: "",
    modifier: "2 sets",
  },
  {
    category: "sets",
    description: "",
    modifier: "3 sets",
  },
  {
    category: "sets",
    description: "",
    modifier: "CotA",
  },
  {
    category: "sets",
    description: "",
    modifier: "AoA",
  },
  {
    category: "sets",
    description: "",
    modifier: "WC",
  },
  {
    category: "sets",
    description: "",
    modifier: "MM",
  },
  {
    category: "sets",
    description: "",
    modifier: "DT",
  },
  {
    category: "sets",
    description: "",
    modifier: "WoE",
  },
  {
    category: "sets",
    description: "",
    modifier: "GR",
  },
  {
    category: "sets",
    description: "",
    modifier: "AS",
  },
  {
    category: "sets",
    description: "",
    modifier: "VM",
  },
  {
    category: "sets",
    description: "",
    modifier: "Unchained",
  },
  {
    category: "sets",
    description: "",
    modifier: "Menagerie",
  },
  {
    category: "houses",
    description: "",
    modifier: "Brobnar",
  },
  {
    category: "houses",
    description: "",
    modifier: "Dis",
  },
  {
    category: "houses",
    description: "",
    modifier: "Ekwidon",
  },
  {
    category: "houses",
    description: "",
    modifier: "Geistoid",
  },
  {
    category: "houses",
    description: "",
    modifier: "Keyraken",
  },
  {
    category: "houses",
    description: "",
    modifier: "Logos",
  },
  {
    category: "houses",
    description: "",
    modifier: "Mars",
  },
  {
    category: "houses",
    description: "",
    modifier: "Sanctum",
  },
  {
    category: "houses",
    description: "",
    modifier: "Saurian",
  },
  {
    category: "houses",
    description: "",
    modifier: "Shadows",
  },
  {
    category: "houses",
    description: "",
    modifier: "Skyborn",
  },
  {
    category: "houses",
    description: "",
    modifier: "Star Alliance",
  },
  {
    category: "houses",
    description: "",
    modifier: "Unfathomable",
  },
  {
    category: "houses",
    description: "",
    modifier: "Untamed",
  },
  {
    category: "houses",
    description: "",
    modifier: "2 houses",
  },
  {
    category: "houses",
    description: "",
    modifier: "3 houses",
  },
  {
    category: "houses",
    description: "one house must be coming back in the new set",
    modifier: "hi",
  },
  {
    category: "houses",
    description: "one house must be leaving in the new set",
    modifier: "bye",
  },
  {
    category: "houses",
    description: "",
    modifier: "hi/bye",
  },
  {
    category: "sas",
    description: "",
    modifier: "60 sas cap",
  },
  {
    category: "sas",
    description: "",
    modifier: "weather sas cap",
  },
  {
    category: "sas",
    description: "",
    modifier: "prime numbers",
  },
  {
    category: "",
    description: "each round players start with a permanent double sided artifact that is randomly chosen",
    modifier: "sigilforge",
  },
  {
    category: "",
    description:
      "at start of game players put an sigil artifact from deck into play that is permanent",
    modifier: "permafact",
  },
//   Each Artifact Gains:
// Invulnerable, Versatile, Vigilant, Stasis
// Invulnerable -> Can't Be Destroyed or Dealt Damage
// Versatile -> Can Be Used as if it Belonged to the Active House
// Vigilant -> Cannot be Exhausted on the Opponent's Turn
// Stasis -> Cannot be Removed From Play (returned to hand or purged)
//   One player:
// Annihilation Ritual
// Autocannon
// Brackish Shoreline
// Curia Saurus
// Doom Sigil
// Edict Of Nerotaurus
// Evasion Sigil
// Fangtooth Cavern
// Gambling Den
// Grump Buggy
// Heavy Subsidies
// Kiligog's Trench
// Orb Of Invidius
// Pestergrove
// Pincerator
// Quixxle Stone
// Ragwarg
// Saurarium
// Shattered Throne
// Snag's Mirror
// Soul Snatcher
// Speed Sigil
// The First Scroll
// The Howling Pit
// Ulfberht Device
// Widespread Corruption

// Both players:
// Aember Conduction Unit
// Aembitrage
// Ancient Battleground
// Auto-Encoder
// Haedroth's Wall
// Isotropic Core
// Pile Of Skulls
// Proclamation 346e
// Redhand Registry
// Sobogg's Thingamabob
// The Floor Is Lava
// Whirlpool
  {
    category: "",
    description:
      "decks must have a profession in the title (doctor, gardener, cobbler)",
    modifier: "career fair",
  },
  {
    category: "",
    description:
      "opponent's play the same deck, randomly determine whose deck to play",
    modifier: "mirror match",
  },
  {
    category: "",
    description:
      "present deck, search collection for a counter, Bo3 pairs, then winning decks",
    modifier: "hard counter",
  },
  {
    category: "",
    description: "Use TCO to choose a random deck",
    modifier: "TCO sealed",
  },
  {
    category: "",
    description: "Play 3 games, winner is who won in least number of turns",
    modifier: "sprint",
  },
  {
    category: "",
    description: "decks stay in the matchup and players move to the next seat",
    modifier: "belle of the ball",
  },
  {
    category: "",
    description:
      "choose a house and put all cards of that house into play and discard actions. That house cannot be called until turn 6",
    modifier: "hot house",
  },
  {
    category: "",
    description: "exhaust your draw pile 3 times to win",
    modifier: "recursion sprint",
  },
  {
    category: "",
    description: "your opponent picks your house",
    modifier: "mind games",
  },
  {
    category: "",
    description: "you cannot play actions",
    modifier: "action ban",
  },
  {
    category: "",
    description: "each player draws an extra card",
    modifier: "howling mine",
  },
  {
    category: "",
    description: "cannot bring a deck with steal, capture, or exalt",
    modifier: "honorable registry",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X expected aember (13)",
  },
  {
    description: "bring a named or saviour deck",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "named and saviour decks",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X bonus aember",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: ">X expected aember",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: ">X bonus aember",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X aember control",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: ">X aember control",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X creature control",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X efficiency",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: ">X efficiency",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X effective power",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: ">X effective power",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: ">X creature count",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X creature count",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: ">X action count",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X action count",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: ">X artifact count",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X artifact count",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: ">X upgrade count",
  },
  {
    description: "",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "<X upgrade count",
  },
  {
    description: "any mavericks",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "mavericks",
  },
  {
    description: "only mavericks other cards don't create",
    dok_filter: "",
    format: "archon",
    fn: () => {},
    tco: true,
    variant: "natural mavericks",
  },
];
