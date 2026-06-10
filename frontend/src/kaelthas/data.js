import {
  HomeIcon,
  ShieldIcon,
  HelpIcon,
  DiscordIcon,
  ChatIcon,
} from './icons.jsx';

export const navItems = [
  { label: 'Start',     href: '/',                   Icon: HomeIcon },
  { label: 'Armory',    href: '/account',            Icon: ShieldIcon },
  { label: 'Forum',     href: '/forum',              Icon: ChatIcon },
  { label: 'Hilfe',     href: '/forum/support',      Icon: HelpIcon },
  { label: 'Discord',   href: 'https://discord.gg/', Icon: DiscordIcon, external: true },
];

export const realmlist = 'set realmlist logon.kaelthas.com';

export const heroImage =
  'https://storage.googleapis.com/bit-generated-images/images/image_epic_world_of_warcraft_wrath_o_0_1780527313549.png';

export const logoImage =
  'https://customer-assets.emergentagent.com/job_ashikuya-bb/artifacts/kils9qlc_logo4.png';

export const customRaces = [
  'Leerelfen',
  'Goblins',
  'Vulpera',
  'Pandaren',
  'Worgen',
  'Nachtgeborene',
];

export const features = [
  {
    title: 'Eigene Völker',
    description:
      'Erlebe Wrath of the Lich King mit neuen spielbaren Völkern, die Nordend noch nie gesehen hat!',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_fantasy_portrait_of_a_void_elf_0_1780527313227.png',
  },
  {
    title: 'High Rates',
    description:
      'Erhöhte XP-Raten machen das Leveln deiner Charaktere, Berufe und Rufe zum Kinderspiel.',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_fantasy_portrait_of_a_fierce_o_0_1780527312897.png',
  },
  {
    title: 'Skalierung',
    description:
      'Keine LFG-Wartezeiten mehr und keinen Stress beim Raid-Aufbau. Dungeons skalieren mit dir.',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_dark_gothic_haunted_castle_kee_0_1780527328528.png',
  },
  {
    title: 'Cross-Faction',
    description:
      'Du willst mit deinen Allianz-Freunden spielen, aber mit Horde-Style? Jetzt kannst du das!',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_fantasy_portrait_of_a_goblin_c_0_1780527328506.png',
  },
  {
    title: 'Transmog',
    description:
      'Verleihe deinem Charakter den feinsten Seiden- oder rauesten Plattenlook – ohne Werte zu opfern!',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_fantasy_portrait_of_a_beautifu_0_1780527328679.png',
  },
  {
    title: 'Paragon',
    description:
      'Werde auch nach Stufe 80 und Best-in-Slot-Equipment noch stärker. Dein Fortschritt endet nie!',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_fantasy_portrait_of_a_powerful_0_1780527329106.png',
  },
];

export const communityStats = {
  registeredAccounts: 9585,
  createdCharacters: 20030,
  playersOnline: 482,
  realmName: 'Kaelthas',
  expansion: 'Wrath of the Lich King 3.3.5a',
};
