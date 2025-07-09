const data: {
  rules: string
  spots: Array<{
    background?: string
    backgroundRotate?: boolean
    category?: string
    difficulty: string
    id?: number
    text: string
    events: string[]
  }>
  title: {
    prefixes: string[]
    suffixes: string[]
  }
} = {
  rules: `KeyForge Bingo - forge 3 rows, columns, or diagonals to unlock the power and knowledge hidden within the Vaults!\n\n - Don't interrupt your game to mark off spots - wait until\n   after your match is finished or you might get DQed!\n - Consider the entire board state and both players - your \n   opponent's gameplay can help you to forge keys!\n - Do as much as you can - interpret the spots liberally!\n - Unofficial and not endorsed by GG - submit any issues\n   or suggestions to @dmikalova on Discord!`,
  title: {
    prefixes: [
      '[REDACTED]',
      'ascended',
      'bad',
      'black-market',
      'bootleg',
      'called',
      'clashed',
      'collided',
      'conspiracied',
      'contraband',
      'discovered',
      'exchanged',
      'extralegal',
      'felonious',
      'forbidden',
      'fraudulent',
      'hunted',
      'illicit',
      'informal',
      'keyrakened',
      'mastered',
      'measured',
      'menageried',
      'misprinted',
      'mutated',
      'non-authorized',
      'non-official',
      'non-sanctioned',
      'non-sanctumed',
      'noname',
      'prohibited',
      'prophesied',
      'prophetic',
      'radioactive',
      'rejected',
      'reminded',
      'renegade',
      'rogue',
      'sacrosanctum',
      'shady',
      'skiesed',
      'sneklifted',
      'sure gamble',
      'taboo',
      'unaccredited',
      'unallowed',
      'unapproved',
      'unauthorized',
      'uncertified',
      'unchained',
      'unfathomable',
      'unlicensed',
      'unofficial',
      'unsanctioned',
      'unsanctumable',
      'unsanctumed',
      'verboten',
      'wrongful',
    ],
    suffixes: [
      'Æmber Bingo',
      'Auto-Bingoder',
      'Babbling Bingophile',
      'Baldric the Bingo',
      'Belligerent Bingo',
      'Bilgum Bingolance',
      'Bingioditus',
      'Bingle Bingobingo',
      'Bingo Ambassador',
      'Bingo Bangbang',
      'Bingo Buggy',
      'Bingo Nithing',
      'Bingo the Fanatic',
      'Bingo Monkey',
      'Bingo the Redeemed',
      'Bingoed Auctioneer',
      'Bingohemoth',
      'Bingoing Patrizate',
      'Bingomagus',
      'Bingor Flamewing',
      'Bingotwig',
      'Bingowarden',
      'Blue Bingodrake',
      'Bot Bingoton',
      'Brillix Bingo',
      'Bringo Nastee',
      'Brunx and Bingo',
      'Bumblebingo',
      'Cursed Bingo',
      'D.B. Bingobber',
      'Distributor Bingoont',
      'Eldest Bingominder',
      'Floor is Bingo',
      'Forge Bingo',
      'Grenade Ognib',
      'Harbinger of Bingoom',
      'Hymn to Bingo',
      'Jehu the Bingocrat',
      'Memory Bingo',
      'Monty Bingo',
      'Moor Wolf Bingo',
      'Nepenthe Bingo',
      'Quartermaster "Bingo"',
      'Quixxle Bingo',
      'Reassembling Bingoton',
      'Red Bingodrake',
      'Sacro-Bingo',
      'Scoobingoo',
      'Shard of Bingo',
      'Sir Bingo',
      'Skollenbingozz',
      'Skybingo Squadron',
      'Truebingoru',
      'Tutor Bin-Bingo',
      'Ulfberht Bingo',
      'Yellow Bingodrake',
      'Yxilo Bingo',
    ],
  },
  spots: [
    // free spots
    {background: 'aember1', backgroundRotate: true, difficulty: 'free', events: ['day', 'weekend'], text: 'free Æmber'},
    {background: 'aember2', backgroundRotate: true, difficulty: 'free', events: ['day', 'weekend'], text: 'free Æmber'},
    {background: 'aember3', backgroundRotate: true, difficulty: 'free', events: ['day', 'weekend'], text: 'free Æmber'},
    {background: 'aember4', backgroundRotate: true, difficulty: 'free', events: ['day', 'weekend'], text: 'free Æmber'},
    {background: 'aember5', backgroundRotate: true, difficulty: 'free', events: ['day', 'weekend'], text: 'free Æmber'},
    {background: 'aember6', backgroundRotate: true, difficulty: 'free', events: ['day', 'weekend'], text: 'free Æmber'},

    // out of game
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'play a goofy giggly game'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'play an intense sweaty game'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'play a TCO friend'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'play a good friend'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'play an intimidating opponent'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'teach someone a new trick'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'learn a new trick'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'learn a new rule'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'thank your TOs'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'thank the GG crew'},
    {
      background: 'cool-moor',
      category: 'social',
      difficulty: 'medium',
      events: ['weekend'],
      text: 'play a Moor Wolf Pack member',
    },
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'tell a friend about KeyForge'},
    {category: 'social', difficulty: 'easy', events: ['day', 'weekend'], text: 'exclaim "You\'ve fallen into my trap card!"'},

    // player
    {
      category: 'perspective',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'immediately regret playing a card',
    },
    {
      category: 'perspective',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'do something really good with a really bad card',
    },
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'come back after giving up'},
    {
      category: 'perspective',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'wrong choice for the right reasons',
    },
    {
      category: 'perspective',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'right choice for the wrong reasons',
    },
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'discover a new to you combo'},
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'forgot this card existed'},
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'misremember a card'},
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'misunderstand a card'},
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'play a clean game'},
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: "read your opponent's tells"},
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'go on an epic quest'},
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'form a plan, execute on plan'},
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'funny deck name'},
    {category: 'perspective', difficulty: 'easy', events: ['day', 'weekend'], text: 'call a random discard or purge'},
    {category: 'perspective', difficulty: 'medium', events: ['day', 'weekend'], text: 'get annoyed by your deck'},
    {difficulty: 'medium', events: ['day', 'weekend'], text: 'win a tourney ie 2LO, side pod'},
    {difficulty: 'medium', events: ['day', 'weekend'], text: 'make a dis pun'},
    {difficulty: 'medium', events: ['day', 'weekend'], text: 'emphatic KEY FORGED!'},

    // matchup
    {category: 'decks', difficulty: 'easy', events: ['day', 'weekend'], text: 'both decks have no matching houses'},
    {category: 'decks', difficulty: 'easy', events: ['day', 'weekend'], text: 'both decks have 3 matching houses'},
    {category: 'decks', difficulty: 'easy', events: ['day', 'weekend'], text: 'both deck names share a word'},
    {category: 'time-rules', difficulty: 'easy', events: ['day', 'weekend'], text: 'go to time'},
    {category: 'time-rules', difficulty: 'medium', events: ['day', 'weekend'], text: 'lose by going to time'},
    {
      category: 'time-rules',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'extended tiebreaker - chains, creatures, or first player',
    },
    {background: 'sanctum', difficulty: 'hard', events: ['day', 'weekend'], text: 'Redemption vs Sanctum matchup'},

    // forging
    {
      background: 'key-forged',
      category: 'key-cheat',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'cheat a key',
    },
    {
      background: 'key-forged',
      category: 'key-cheat',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'forge 2 keys in one turn',
    },
    {
      background: 'key-forged',
      category: 'key-cheat',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'cheat 2 keys',
    },
    {
      background: 'key-forged',
      category: 'key-cheat',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: 'cheat 3 keys',
    },
    {
      background: 'key-forged',
      category: 'key-cheat',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: 'forge 3 keys in one turn',
    },

    {
      background: 'key-forged',
      category: 'key-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'lose a game with 0 keys',
    },
    {
      background: 'key-forged',
      category: 'key-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'forge the wrong color key',
    },
    {
      background: 'key-forged',
      category: 'key-count',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: 'lose a game with 0 keys 0 Æmber',
    },
    {
      background: 'key-forged',
      category: 'key-count',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: 'forge 4+ keys',
    },

    {
      background: 'key-forged',
      category: 'forge-cost',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'forge for 9+ Æmber',
    },
    {
      background: 'key-forged',
      category: 'forge-cost',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'forge for 12+ Æmber',
    },
    {
      background: 'key-forged',
      category: 'forge-cost',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'forge 2 keys for 9+ Æmber',
    },
    {
      background: 'key-forged',
      category: 'forge-cost',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'forge 3 keys for 9+ Æmber',
    },
    {
      background: 'key-forged',
      category: 'forge-cost',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: 'forge for 0 cost',
    },

    // tokens
    {
      background: 'enrage',
      category: 'enrage-count',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '1+ enraged creatures',
    },
    {
      background: 'enrage',
      category: 'enrage-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2+ enraged creatures',
    },
    {
      background: 'enrage',
      category: 'enrage-count',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: '3+ enraged creatures',
    },
    {
      background: 'stun',
      category: 'stun-count',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '1+ stunned creatures',
    },
    {
      background: 'stun',
      category: 'stun-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2+ stunned creatures',
    },
    {
      background: 'stun',
      category: 'stun-count',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: '3+ stunned creatures',
    },
    {
      background: 'ward',
      category: 'ward-count',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '1+ warded creatures',
    },
    {
      background: 'ward',
      category: 'ward-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2+ warded creatures',
    },
    {
      background: 'ward',
      category: 'ward-count',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: '3+ warded creatures',
    },
    {
      background: 'generic-token',
      category: 'game-tokens',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'generic counter ie doom, time',
    },
    // {category: 'game-tokens', difficulty: 'hard', events: ["day", "weekend"], text: 'have over 100 of a token (ie Æmber, +1 power, damage)'},
    {category: 'game-tokens', difficulty: 'hard', events: ['day', 'weekend'], text: 'run out of your own Æmber tokens'},

    // bonus icons
    {
      background: 'pip',
      category: 'bonus-count',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'card with 3 bonus icons',
    },
    {
      background: 'pip',
      category: 'bonus-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'card with 4 bonus icons',
    },
    {
      background: 'pip',
      category: 'bonus-count',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: 'card with 5 bonus icons',
    },
    {
      background: 'pip',
      category: 'bonus-count',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'card with 2+ Æmber pips',
    },
    {
      background: 'pip',
      category: 'bonus-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'card with 2+ draw pips',
    },
    {
      background: 'pip',
      category: 'bonus-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'card with 2+ damage pips',
    },
    {
      background: 'pip',
      category: 'bonus-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'card with 2+ discard pips',
    },
    {
      background: 'pip',
      category: 'bonus-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'card with 2+ capture pips',
    },

    // aember
    {
      background: 'aember',
      category: 'interrupt',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'stop check 2 turns in a row',
    },
    {
      background: 'aember',
      category: 'interrupt',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'stop check 4 turns in a row',
    },
    {
      background: 'aember',
      category: 'interrupt',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'stop check 6 turns in a row',
    },
    {
      background: 'aember',
      category: 'aember-loss',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'lose with 6+ Æmber',
    },
    {
      background: 'aember',
      category: 'aember-loss',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'lose with 12+ Æmber',
    },
    {
      background: 'aember',
      category: 'aember-loss',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'lose with 18+ Æmber',
    },
    {
      background: 'aember',
      category: 'capture-steal',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'take or spend captured Æmber',
    },
    {
      background: 'aember',
      category: 'capture-steal',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'capture 4+ Æmber in one action',
    },
    {
      background: 'aember',
      category: 'capture-steal',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'capture 6+ Æmber in one action',
    },
    {
      background: 'aember',
      category: 'capture-steal',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'capture 8+ Æmber in one action',
    },
    {
      background: 'aember',
      category: 'capture-steal',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'steal 4+ Æmber in one turn',
    },
    {
      background: 'aember',
      category: 'capture-steal',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'steal 6+ Æmber in one turn',
    },
    {
      background: 'aember',
      category: 'capture-steal',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'steal 8+ Æmber in one turn',
    },
    {
      background: 'aember',
      category: 'aember-gen',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'gain 6+ Æmber in one turn',
    },
    {
      background: 'aember',
      category: 'aember-gen',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'gain 9+ Æmber in one turn',
    },
    {
      background: 'aember',
      category: 'aember-gen',
      difficulty: 'difficult',
      events: ['day', 'weekend'],
      text: 'gain 12+ Æmber in one turn',
    },

    // deck
    {difficulty: 'easy', events: ['day', 'weekend'], text: 'reveal or tokenize with empty deck'},
    {difficulty: 'hard', events: ['day', 'weekend'], text: 'ruin opponents combo by causing them to draw cards'},
    {category: 'shuffle count', difficulty: 'easy', events: ['day', 'weekend'], text: 'shuffle deck 3 times'},
    {category: 'shuffle count', difficulty: 'medium', events: ['day', 'weekend'], text: 'shuffle deck 4 times'},
    {category: 'shuffle count', difficulty: 'hard', events: ['day', 'weekend'], text: 'shuffle deck 5 times'},
    {difficulty: 'impossible', events: ['day', 'weekend'], text: 'foreign language card'},

    // hand
    {category: 'discard-type', difficulty: 'easy', events: ['day', 'weekend'], text: 'discard action'},
    {category: 'discard-type', difficulty: 'easy', events: ['day', 'weekend'], text: 'discard artifact'},
    {category: 'discard-type', difficulty: 'easy', events: ['day', 'weekend'], text: 'discard creature'},
    {category: 'discard-type', difficulty: 'easy', events: ['day', 'weekend'], text: 'discard upgrade'},
    {category: 'hand-mgmt', difficulty: 'easy', events: ['day', 'weekend'], text: '2/2/2 hand 3 turns in a row'},
    {category: 'hand-mgmt', difficulty: 'easy', events: ['day', 'weekend'], text: 'mulligan for a worse hand'},
    {category: 'hand-mgmt', difficulty: 'easy', events: ['day', 'weekend'], text: 'play no cards in a turn'},
    {category: 'hand-mgmt', difficulty: 'easy', events: ['day', 'weekend'], text: 'play whole hand in a turn'},
    {category: 'hand-mgmt', difficulty: 'easy', events: ['day', 'weekend'], text: 'return card to hand'},
    {category: 'hand-mgmt', difficulty: 'impossible', events: ['day', 'weekend'], text: "discard opponent's hand"},

    {category: 'draw-count', difficulty: 'easy', events: ['day', 'weekend'], text: 'draw 2+ cards during turn'},
    {category: 'draw-count', difficulty: 'medium', events: ['day', 'weekend'], text: 'draw 3+ cards during turn'},
    {category: 'draw-count', difficulty: 'hard', events: ['day', 'weekend'], text: 'draw 4+ cards during turn'},

    // abilities
    {category: 'usage', difficulty: 'hard', events: ['day', 'weekend'], text: "player doesn't reap for game"},
    {category: 'usage', difficulty: 'hard', events: ['day', 'weekend'], text: "player doesn't fight for game"},
    {category: 'abilities', difficulty: 'medium', events: ['day', 'weekend'], text: 'avoid a Destroyed: ability'},
    {
      category: 'abilities',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'creature with 2 After Reap: abilities',
    },
    {
      category: 'abilities',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'creature with 2 After Fight: abilities',
    },
    {category: 'abilities', difficulty: 'hard', events: ['day', 'weekend'], text: 'creature with 2 Action: abilities'},
    {
      category: 'abilities',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'creature with 2 Desroyed: abilities',
    },
    {category: 'abilities', difficulty: 'hard', events: ['day', 'weekend'], text: '6+ Elusive creatures'},
    {category: 'abilities', difficulty: 'hard', events: ['day', 'weekend'], text: '6+ Taunt creatures'},
    {category: 'abilities', difficulty: 'impossible', events: ['day', 'weekend'], text: 'Hazardous 4+ creature'},
    {category: 'abilities', difficulty: 'impossible', events: ['day', 'weekend'], text: 'Assault 4+ creature'},
    {category: 'abilities', difficulty: 'hard', events: ['day', 'weekend'], text: '6+ creatures with 2+ abilities'},
    {category: 'abilities', difficulty: 'hard', events: ['day', 'weekend'], text: 'creature(s) cannot be dealt damage'},
    {category: 'abilities', difficulty: 'impossible', events: ['day', 'weekend'], text: 'creature with Invulnerable'},
    {category: 'abilities', difficulty: 'impossible', events: ['day', 'weekend'], text: 'graft card'},
    {category: 'abilities', difficulty: 'medium', events: ['day', 'weekend'], text: 'versatile card'},
    {category: 'abilities', difficulty: 'hard', events: ['day', 'weekend'], text: 'treachery card'},

    {difficulty: 'easy', events: ['day', 'weekend'], text: 'accidentally fight into elusive'},
    {difficulty: 'easy', events: ['day', 'weekend'], text: 'intentionally fight into elusive once'},
    {
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'fight and die with 4+ creatures to take out 1 creature (can be multiple turns)',
    },
    {difficulty: 'easy', events: ['day', 'weekend'], text: "board wipe 6+ of your creatures for 3- of your opponent's"},
    {difficulty: 'medium', events: ['day', 'weekend'], text: 'game with no board wipes'},
    {difficulty: 'easy', events: ['day', 'weekend'], text: 'board wipe'},

    {difficulty: 'hard', events: ['day', 'weekend'], text: 'Æmber pun in card name'},
    {difficulty: 'hard', events: ['day', 'weekend'], text: 'Key or Forge pun in card name'},
    {difficulty: 'medium', events: ['day', 'weekend'], text: 'flavor text references another card'},
    {difficulty: 'hard', events: ['day', 'weekend'], text: 'blank text box'},
    {difficulty: 'impossible', events: ['day', 'weekend'], text: 'copy another card'},

    // zones
    {
      category: 'out-of-play-zones-count',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '1 extra out of play zones ie card under card',
    },
    {
      category: 'out-of-play-zones-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 extra out of play zones ie card under card',
    },
    {
      category: 'out-of-play-zones-count',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: '3 extra out of play zones ie card under card',
    },

    {difficulty: 'hard', events: ['day', 'weekend'], text: 'shuffle or discard entire archive'},
    {difficulty: 'impossible', events: ['day', 'weekend'], text: 'return a card from purge'},

    {category: 'purged-count', difficulty: 'easy', events: ['day', 'weekend'], text: '4+ purged cards'},
    {category: 'purged-count', difficulty: 'medium', events: ['day', 'weekend'], text: '6+ purged cards'},
    {category: 'purged-count', difficulty: 'hard', events: ['day', 'weekend'], text: '8+ purged cards'},
    {category: 'purged-count', difficulty: 'impossible', events: ['day', 'weekend'], text: '12+ purged cards'},
    {category: 'archive-count', difficulty: 'easy', events: ['day', 'weekend'], text: '6+ archived cards'},
    {category: 'archive-count', difficulty: 'medium', events: ['day', 'weekend'], text: '9+ archived cards'},
    {category: 'archive-count', difficulty: 'hard', events: ['day', 'weekend'], text: '12+ archived cards'},
    {category: 'archive-count', difficulty: 'impossible', events: ['day', 'weekend'], text: '18+ archived cards'},
    {category: 'control-change', difficulty: 'easy', events: ['day', 'weekend'], text: 'change control of 2+ cards'},
    {category: 'control-change', difficulty: 'medium', events: ['day', 'weekend'], text: 'change control of 3+ cards'},
    {category: 'control-change', difficulty: 'hard', events: ['day', 'weekend'], text: 'change control of 4+ cards'},

    // battleline
    {
      background: 'armor',
      category: 'creature-power',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'creature with 5+ shield',
    },
    {
      background: 'power',
      category: 'creature-power',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '12+ power creature',
    },
    {
      background: 'power',
      category: 'creature-power',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '16+ power creature',
    },
    {
      background: 'power',
      category: 'creature-power',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: '20+ power creature',
    },
    {
      background: 'power',
      category: 'creature-power',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'creatures with powers 2 to 5 in play',
    },
    {
      background: 'power',
      category: 'creature-power',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'creatures with powers 1 to 5 in play',
    },
    {
      background: 'power',
      category: 'creature-power',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'creatures with powers 1 to 6 in play',
    },
    {category: 'upgrade-count', difficulty: 'easy', events: ['day', 'weekend'], text: 'card with 2+ upgrades'},
    {category: 'upgrade-count', difficulty: 'medium', events: ['day', 'weekend'], text: 'card with 3+ upgrades'},
    {category: 'upgrade-count', difficulty: 'hard', events: ['day', 'weekend'], text: 'card with 4+ upgrades'},
    {category: 'upgrade-count', difficulty: 'easy', events: ['day', 'weekend'], text: '4+ upgrades in play'},
    {category: 'upgrade-count', difficulty: 'medium', events: ['day', 'weekend'], text: '6+ upgrades in play'},
    {category: 'upgrade-count', difficulty: 'hard', events: ['day', 'weekend'], text: '8+ upgrades in play'},
    {
      category: 'token-creature-count',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '6+ token creatures in play',
    },
    {
      category: 'token-creature-count',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '12+ token creatures in play',
    },
    {
      category: 'token-creature-count',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: '18+ token creatures in play',
    },

    {difficulty: 'impossible', events: ['day', 'weekend'], text: 'destroy just the upgrade'},
    {difficulty: 'impossible', events: ['day', 'weekend'], text: 'flip a token creature'},

    // artifacts
    {category: 'artifacts', difficulty: 'easy', events: ['day', 'weekend'], text: '6+ artifacts in play'},
    {category: 'artifacts', difficulty: 'medium', events: ['day', 'weekend'], text: '8+ artifacts in play'},
    {category: 'artifacts', difficulty: 'hard', events: ['day', 'weekend'], text: '10+ artifacts in play'},
    {category: 'artifacts', difficulty: 'easy', events: ['day', 'weekend'], text: 'game warping artifact'},

    {category: 'artifacts', difficulty: 'hard', events: ['day', 'weekend'], text: 'overcome a curse'},
    {category: 'artifacts', difficulty: 'hard', events: ['day', 'weekend'], text: 'useless artifact'},

    // types
    {category: 'type-change', difficulty: 'hard', events: ['day', 'weekend'], text: 'creature as upgrade'},
    {category: 'type-change', difficulty: 'medium', events: ['day', 'weekend'], text: 'creature as artifact'},
    {category: 'type-change', difficulty: 'hard', events: ['day', 'weekend'], text: 'artifact as creature'},
    {category: 'type-change', difficulty: 'hard', events: ['day', 'weekend'], text: 'action as upgrade'},

    // combos
    {category: 'c-c-combos', difficulty: 'impossible', events: ['day', 'weekend'], text: 'infinite loop'},
    {category: 'c-c-combos', difficulty: 'impossible', events: ['day', 'weekend'], text: 'total lock out'},
    {category: 'c-c-combos', difficulty: 'easy', events: ['day', 'weekend'], text: 'rule of 6'},
    {category: 'c-c-combos', difficulty: 'easy', events: ['day', 'weekend'], text: 'bottom deck key card'},
    {category: 'c-c-combos', difficulty: 'medium', events: ['day', 'weekend'], text: 'randomly discard key card'},
    {category: 'c-c-combos', difficulty: 'easy', events: ['day', 'weekend'], text: 'accidental board wipe'},
    {
      category: 'c-c-combos',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'plow through obvious trap ie redline',
    },
    {category: 'c-c-combos', difficulty: 'easy', events: ['day', 'weekend'], text: "neutralize opponent's trap"},

    // formats
    {category: 'kf-adventure', difficulty: 'hard', events: ['day', 'weekend'], text: 'play Vault Assault'},
    {category: 'kf-adventure', difficulty: 'hard', events: ['day', 'weekend'], text: 'play a game with 3+ players'},
    {category: 'kf-adventure', difficulty: 'hard', events: ['day', 'weekend'], text: 'play a KeyForge Adventure'},
    {category: 'kf-adventure', difficulty: 'impossible', events: ['day', 'weekend'], text: 'gain stratoflight'},
    {category: 'format', difficulty: 'impossible', events: ['day', 'weekend'], text: 'play adaptive'},

    // sets
    {
      background: 'cota',
      category: 'set',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Call of the Archons deck',
    },
    {background: 'aoa', category: 'set', difficulty: 'hard', events: ['day', 'weekend'], text: 'Age of Ascension deck'},
    {background: 'wc', category: 'set', difficulty: 'hard', events: ['day', 'weekend'], text: 'Worlds Collide deck'},
    {background: 'mm', category: 'set', difficulty: 'hard', events: ['day', 'weekend'], text: 'Mass Mutation deck'},
    {background: 'dt', category: 'set', difficulty: 'hard', events: ['day', 'weekend'], text: 'Dark Tidings deck'},
    {
      background: 'woe',
      category: 'set',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: 'Winds of Exchange deck',
    },
    {background: 'gr', category: 'set', difficulty: 'easy', events: ['day', 'weekend'], text: 'Grim Reminders deck'},
    {background: 'as', category: 'set', difficulty: 'easy', events: ['day', 'weekend'], text: 'Æmber Skies deck'},
    {background: 'toc', category: 'set', difficulty: 'easy', events: ['day', 'weekend'], text: 'Tokens of Change deck'},
    {
      background: 'pv',
      category: 'set',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: 'Prophetic Visions deck',
    },
    {category: 'set', difficulty: 'impossible', events: ['day', 'weekend'], text: 'Crucible Clash deck'},
    {
      background: 'vm',
      category: 'set',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: 'Vault Master 2023 deck',
    },
    {background: 'vm', category: 'set', difficulty: 'hard', events: ['day', 'weekend'], text: 'Vault Master 2024 deck'},
    {background: 'vm', category: 'set', difficulty: 'easy', events: ['day', 'weekend'], text: 'Vault Master 2025 deck'},
    {background: 'momu', category: 'set', difficulty: 'medium', events: ['day', 'weekend'], text: 'More Mutation deck'},
    {background: 'disc', category: 'set', difficulty: 'medium', events: ['day', 'weekend'], text: 'Discovery deck'},
    {background: 'uc', category: 'set', difficulty: 'impossible', events: ['day', 'weekend'], text: 'Unchained deck'},
    {background: 'mn', category: 'set', difficulty: 'impossible', events: ['day', 'weekend'], text: 'Menagerie deck'},

    // rarities
    {category: 'rarity', difficulty: 'easy', events: ['day', 'weekend'], text: '4+ copies of a card'},
    {category: 'rarity', difficulty: 'easy', events: ['day', 'weekend'], text: '4+ rares in a deck'},
    {category: 'rarity', difficulty: 'medium', events: ['day', 'weekend'], text: '5+ rares in a deck'},
    {category: 'rarity', difficulty: 'hard', events: ['day', 'weekend'], text: '6+ rares in a deck'},
    {category: 'rarity', difficulty: 'medium', events: ['day', 'weekend'], text: 'maverick card'},
    {category: 'rarity', difficulty: 'medium', events: ['day', 'weekend'], text: 'legacy card'},
    {category: 'rarity', difficulty: 'medium', events: ['day', 'weekend'], text: 'anomaly card'},
    {category: 'rarity', difficulty: 'medium', events: ['day', 'weekend'], text: 'skybeast card'},
    {category: 'rarity', difficulty: 'hard', events: ['day', 'weekend'], text: 'revenant card'},
    // {category: 'rarity', difficulty: 'medium', events: ["day", "weekend"], text: 'elder card'},
    {category: 'rarity', difficulty: 'impossible', events: ['day', 'weekend'], text: 'evil twin card'},

    // houses
    {difficulty: 'easy', events: ['day', 'weekend'], text: 'play or use cards from 2+ houses in a turn'},
    {difficulty: 'hard', events: ['day', 'weekend'], text: 'play or use cards from 3+ houses in a turn'},
    {category: 'house-choice', difficulty: 'hard', events: ['day', 'weekend'], text: 'only use 2 houses'},
    {category: 'house-choice', difficulty: 'impossible', events: ['day', 'weekend'], text: 'only use 1 house'},
    {
      category: 'house-choice',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '4+ house choices at start of turn',
    },
    {
      category: 'house-choice',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: '5+ house choices at start of turn',
    },
    {
      category: 'house-choice',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: '6+ house choices at start of turn',
    },

    {
      background: 'brobnar',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Brobnar',
    },
    {background: 'dis', category: 'house', difficulty: 'easy', events: ['day', 'weekend'], text: 'deck with Dis'},
    {
      background: 'ekwidon',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Ekwidon',
    },
    {
      background: 'geistoid',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Geistoid',
    },
    {
      background: 'keyraken',
      category: 'house',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: 'deck with Keyraken',
    },
    {background: 'logos', category: 'house', difficulty: 'easy', events: ['day', 'weekend'], text: 'deck with Logos'},
    {background: 'mars', category: 'house', difficulty: 'easy', events: ['day', 'weekend'], text: 'deck with Mars'},
    {
      background: 'redemption',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Redemption',
    },
    {
      background: 'sanctum',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Sanctum',
    },
    {
      background: 'saurian',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Saurian',
    },
    {
      background: 'shadows',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Shadows',
    },
    {
      background: 'skyborn',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Skyborn',
    },
    {
      background: 'star-alliance',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Star alliance',
    },
    {
      background: 'unfathomable',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Unfathomable',
    },
    {
      background: 'untamed',
      category: 'house',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: 'deck with Untamed',
    },

    // traits

    // anomaly 1 Psion
    // artifact 1 Quest
    // artifact 1 Redacted
    // artifacts 2 Ally
    // artifacts 2 Plan
    // artifacts 5 Treasure
    // artifacts 10 Law
    // artifacts 10 Shard
    // artifacts 24 Power
    // artifacts 86 Location
    // artifacts 120 Item
    // brobnar 1 Phoenix
    // brobnar 4 Brakken
    // brobnar 21 Goblin
    // brobnar 24 Weapon
    // brobnar 80 Giant
    // dis 1 Changeling
    // dis 7 Sin
    // dis 25 Imp
    // dis 72 Demon
    // ekwidon 1 Analyst
    // ekwidon 1 Diplomat
    // ekwidon 4 Buggy
    // ekwidon 6 Artisan
    // ekwidon 15 Merchant
    // ekwidon 28 Getrookya
    // geistoid 3 Clock
    // geistoid 65 Specter
    // geistoid 83 Robot
    // logos 1 Equation
    // logos 4 Experiment
    // logos 10 AI
    // logos 43 Cyborg
    // logos 85 Scientist
    // mars 1 Elder
    // mars 1 Rebel
    // mars 2 Agent
    // mars 5 Ironyx
    // mars 45 Soldier
    // mars 55 Martian
    // mixed 3 Assassin
    // mixed 5 Shapeshifter
    // mixed 7 Recruiter
    // mixed 8 Curse
    // mixed 8 Dragon
    // mixed 8 Pilot
    // mixed 10 Leader
    // mixed 12 Vehicle
    // mixed 18 Ship
    // mixed 126 Mutant
    // mixed 150 Beast
    // mixed 177 Human
    // sanctum 3 Angel
    // sanctum 4 Horsemen
    // sanctum 7 Priest
    // sanctum 16 Monk
    // sanctum 29 Spirit
    // sanctum 72 Knight
    // saurian 1 Egg
    // Saurian 14 Philosopher
    // saurian 25 Politician
    // saurian 73 Dinosaur
    // shadows 1 Rat
    // shadows 70 Elf
    // shadows 91 Thief
    // skybeast 1 Cloud
    // skybeast 1 Myth
    // skybeasts 5 Leviathan
    // skyborn 1 Cirrus
    // skyborn 1 J'reen
    // skyborn 1 Pirate
    // skyborn 2 Adagion
    // skyborn 3 Hunter
    // skyborn 5 Halyard
    // skyborn 5 Raptrix
    // skyborn 6 Stormkin
    // staralliance 1 Jelly
    // staralliance 1 Sylicate
    // staralliance 2 Handuhan
    // staralliance 2 Proximan
    // staralliance 4 Krxix
    // staralliance 33 Alien
    // unfathomable 1 Arm
    // unfathomable 1 Cultist
    // unfathomable 49 Aquan
    // untamed 1 Elemental
    // untamed 2 Fisher
    // untamed 2 Tree
    // untamed 2 Wolf
    // untamed 3 Fungus
    // untamed 3 Ranger
    // untamed 4 Cat
    // untamed 5 Niffle
    // untamed 11 Faerie
    // untamed 14 Insect
    // untamed 27 Witch

    {
      background: 'brobnar',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Giant trait cards in play',
    },
    {
      background: 'brobnar',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Goblin trait cards in play',
    },
    {
      background: 'brobnar',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Bräkken trait card in play',
    },
    {
      background: 'dis',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Demon trait cards in play',
    },
    {
      background: 'dis',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Imp trait cards in play',
    },
    {
      background: 'dis',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Sin trait card in play',
    },
    {
      background: 'ekwidon',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Merchant trait cards in play',
    },
    {
      background: 'ekwidon',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Getrookya trait cards in play',
    },
    {
      background: 'ekwidon',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Artisan trait card in play',
    },
    {
      background: 'geistoid',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Specter trait cards in play',
    },
    {
      background: 'geistoid',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Robot trait cards in play',
    },
    {
      background: 'geistoid',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Clock trait card in play',
    },
    {
      background: 'logos',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Cyborg trait cards in play',
    },
    {
      background: 'logos',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Scientist trait cards in play',
    },
    {
      background: 'logos',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Shapeshifter trait card in play',
    },
    {
      background: 'mars',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Martian trait cards in play',
    },
    {
      background: 'mars',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Soldier trait cards in play',
    },
    {
      background: 'mars',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Ironyx trait card in play',
    },
    {
      background: 'sanctum',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Knight trait cards in play',
    },
    {
      background: 'sanctum',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Monk trait cards in play',
    },
    {
      background: 'sanctum',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Spirit trait card in play',
    },
    {
      background: 'saurian',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Dinosaur trait cards in play',
    },
    {
      background: 'saurian',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Politician trait cards in play',
    },
    {
      background: 'saurian',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Philosopher trait card in play',
    },
    {
      background: 'shadows',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Thief trait cards in play',
    },
    {
      background: 'shadows',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Elf trait cards in play',
    },
    {
      background: 'shadows',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Rat trait card in play',
    },
    {
      background: 'skyborn',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Stormkin trait cards in play',
    },
    {
      background: 'skyborn',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Raptrix trait cards in play',
    },
    {
      background: 'skyborn',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: "J'Reen trait card in play",
    },
    {
      background: 'star-alliance',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Alien trait cards in play',
    },
    {
      background: 'star-alliance',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Krxix trait cards in play',
    },
    {
      background: 'star-alliance',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Handuhan trait card in play',
    },
    {
      background: 'unfathomable',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Aquan trait cards in play',
    },
    {
      background: 'unfathomable',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Arm trait cards in play',
    },
    {
      background: 'unfathomable',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: '1 Priest trait card in play',
    },
    {
      background: 'untamed',
      category: 'trait',
      difficulty: 'easy',
      events: ['day', 'weekend'],
      text: '3 Witch trait cards in play',
    },
    {
      background: 'untamed',
      category: 'trait',
      difficulty: 'medium',
      events: ['day', 'weekend'],
      text: '2 Insect trait cards in play',
    },
    {
      background: 'untamed',
      category: 'trait',
      difficulty: 'hard',
      events: ['day', 'weekend'],
      text: 'Niffle trait card in play',
    },

    {category: 'trait', difficulty: 'easy', events: ['day', 'weekend'], text: '3 Item trait cards in play'},
    {category: 'trait', difficulty: 'medium', events: ['day', 'weekend'], text: '2 Location trait cards in play'},
    {category: 'trait', difficulty: 'hard', events: ['day', 'weekend'], text: '1 Curse trait card in play'},

    {category: 'trait', difficulty: 'easy', events: ['day', 'weekend'], text: '1 Dragon trait card in play'},
    {category: 'trait', difficulty: 'easy', events: ['day', 'weekend'], text: '1 Leviathan trait card in play'},
    {category: 'trait', difficulty: 'easy', events: ['day', 'weekend'], text: '1 Pilot trait card in play'},
    {category: 'trait', difficulty: 'easy', events: ['day', 'weekend'], text: '2 Ship trait cards in play'},
    {category: 'trait', difficulty: 'easy', events: ['day', 'weekend'], text: '4 Beast trait cards in play'},
    {category: 'trait', difficulty: 'easy', events: ['day', 'weekend'], text: '4 Human trait cards in play'},
    {category: 'trait', difficulty: 'easy', events: ['day', 'weekend'], text: '4 Mutant trait cards in play'},
    {category: 'trait', difficulty: 'medium', events: ['day', 'weekend'], text: '1 Leader trait card in play'},
    {category: 'trait', difficulty: 'medium', events: ['day', 'weekend'], text: '6+ cards with 2 traits in play'},
    {category: 'trait', difficulty: 'impossible', events: ['day', 'weekend'], text: 'card with 3 traits in play'},
    {
      background: 'cool-moor',
      category: 'trait',
      difficulty: 'impossible',
      events: ['day', 'weekend'],
      text: '1 Wolf trait card in play',
    },

    {difficulty: 'easy', events: ['day', 'weekend'], text: '6+ creatures with same trait in play'},
  ],
}

export default data
