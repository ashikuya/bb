import {
  HomeIcon,
  ShieldIcon,
  StarIcon,
  HelpIcon,
  DiscordIcon,
  ChatIcon,
} from './icons.jsx';

export const navItems = [
  { label: 'Home',         href: '/',       Icon: HomeIcon },
  { label: 'Armory',       href: '/#armory', Icon: ShieldIcon },
  { label: 'Forum',        href: '/forum',  Icon: ChatIcon },
  { label: 'Vote',         href: '/#vote',  Icon: StarIcon },
  { label: 'Help',         href: '/#support', Icon: HelpIcon },
  { label: 'Discord',      href: '/#discord', Icon: DiscordIcon },
];

export const realmlist = 'set realmlist logon.kaelthas.com';

export const heroImage =
  'https://storage.googleapis.com/bit-generated-images/images/image_epic_world_of_warcraft_wrath_o_0_1780527313549.png';

export const logoImage =
  'https://storage.googleapis.com/bit-generated-images/images/image_epic_wow_private_server_crest__0_1780530002978.png';

export const customRaces = [
  'Void Elves',
  'Goblins',
  'Vulpera',
  'Pandaren',
  'Worgen',
  'Nightborne',
];

export const features = [
  {
    title: 'Custom Races',
    description:
      'Experience Wrath of the Lich King with new playable races never seen in Northrend before!',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_fantasy_portrait_of_a_void_elf_0_1780527313227.png',
  },
  {
    title: 'High Rates',
    description:
      'High experience gain makes leveling your characters, professions and factions a breeze.',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_fantasy_portrait_of_a_fierce_o_0_1780527312897.png',
  },
  {
    title: 'Scaling',
    description:
      "Don't wait for LFG invites and stop stressing about getting that raid together. Dungeons scale to you.",
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_dark_gothic_haunted_castle_kee_0_1780527328528.png',
  },
  {
    title: 'Cross-Faction',
    description:
      'Want to play with your alliance friends while rocking that horde style? Now you can!',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_fantasy_portrait_of_a_goblin_c_0_1780527328506.png',
  },
  {
    title: 'Transmog',
    description:
      'Make your character dress in finest silk or roughest armor without sacrificing stats!',
    image:
      'https://storage.googleapis.com/bit-generated-images/images/image_fantasy_portrait_of_a_beautifu_0_1780527328679.png',
  },
  {
    title: 'Paragon',
    description:
      'Keep getting stronger even after reaching level 80 and getting all the best equipment!',
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
