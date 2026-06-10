/**
 * Lookup tables mapping AzerothCore numeric race/class ids to display
 * names, used to render character summaries in the control panel.
 */

/** WotLK playable race ids → names. */
export const raceNames = {
  1: 'Mensch',
  2: 'Orc',
  3: 'Zwerg',
  4: 'Nachtelf',
  5: 'Untoter',
  6: 'Tauren',
  7: 'Gnom',
  8: 'Troll',
  9: 'Goblin',
  10: 'Blutelf',
  11: 'Draenei',
  22: 'Worgen',
};

/** WotLK class ids → names. */
export const classNames = {
  1: 'Krieger',
  2: 'Paladin',
  3: 'Jäger',
  4: 'Schurke',
  5: 'Priester',
  6: 'Todesritter',
  7: 'Schamane',
  8: 'Magier',
  9: 'Hexenmeister',
  11: 'Druide',
};

/** Class theme colors (official WoW class colors). */
export const classColors = {
  1: '#C79C6E',
  2: '#F58CBA',
  3: '#ABD473',
  4: '#FFF569',
  5: '#FFFFFF',
  6: '#C41F3B',
  7: '#0070DE',
  8: '#69CCF0',
  9: '#9482C9',
  11: '#FF7D0A',
};

/** Class icon URLs (Wowhead CDN, free hotlink for WoW fansites). */
const CLASS_SLUGS = {
  1: 'warrior', 2: 'paladin', 3: 'hunter', 4: 'rogue', 5: 'priest',
  6: 'deathknight', 7: 'shaman', 8: 'mage', 9: 'warlock', 11: 'druid',
};
export function classIcon(classId) {
  const slug = CLASS_SLUGS[classId];
  return slug ? `https://wow.zamimg.com/images/wow/icons/large/classicon_${slug}.jpg` : null;
}

/** Race icon URLs (Wowhead CDN). */
const RACE_SLUGS = {
  1: 'race_human_male', 2: 'race_orc_male', 3: 'race_dwarf_male', 4: 'race_nightelf_male',
  5: 'race_scourge_male', 6: 'race_tauren_male', 7: 'race_gnome_male', 8: 'race_troll_male',
  10: 'race_bloodelf_male', 11: 'race_draenei_male',
};
export function raceIcon(raceId) {
  const slug = RACE_SLUGS[raceId];
  return slug ? `https://wow.zamimg.com/images/wow/icons/large/${slug}.jpg` : null;
}

/** Convert copper (AzerothCore money unit) to gold/silver/copper. */
export function formatMoney(copper) {
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  return `${gold}g ${silver}s ${c}c`;
}

/** Convert total playtime (seconds) to a human-readable hours string. */
export function formatPlaytime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}T ${hours % 24}h`;
  return `${hours}h`;
}

/** Vote sites for the Voten tab. */
export const voteSites = [
  {
    id: 'gtop100',
    name: 'Gtop100',
    description: 'Top WoW Private Server Liste',
    color: '#ff7a3d',
    cooldown: '12h',
    reward: '1 Vote-Token',
    url: 'https://gtop100.com/topsites/World-of-Warcraft',
  },
  {
    id: 'xtremetop100',
    name: 'XtremeTop100',
    description: 'Stimme für Kaelthas auf XtremeTop100',
    color: '#3dd9ff',
    cooldown: '12h',
    reward: '1 Vote-Token',
    url: 'https://www.xtremetop100.com/in.php?site=1132380745',
  },
  {
    id: 'topwowservers',
    name: 'TopWoWServers',
    description: 'Die größte WoW-Server-Liste',
    color: '#7fffd4',
    cooldown: '12h',
    reward: '1 Vote-Token',
    url: 'https://topwowservers.com/wow-private-servers/',
  },
  {
    id: 'wowgamingserv',
    name: 'WoW-Gaming',
    description: 'Deutsche WoW-Server-Toplist',
    color: '#e8c373',
    cooldown: '24h',
    reward: '2 Vote-Token',
    url: 'https://www.wow-gaming.de/',
  },
  {
    id: 'arenatop100',
    name: 'ArenaTop100',
    description: 'PvP-Fokussierte WoW-Server',
    color: '#c41f3b',
    cooldown: '12h',
    reward: '1 Vote-Token',
    url: 'https://www.arena-top100.com/',
  },
  {
    id: 'mmotop',
    name: 'MMOTop',
    description: 'Internationale MMO-Toplist',
    color: '#9482c9',
    cooldown: '12h',
    reward: '1 Vote-Token',
    url: 'https://mmotop.eu/',
  },
];
