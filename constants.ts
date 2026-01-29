import { Brawler } from './types';

// Map is now much larger for the camera follow mechanic
export const GAME_WIDTH = 2000;
export const GAME_HEIGHT = 2000;
export const WIN_SCORE = 15; // Increased from 10 to make match longer

export const DEFAULT_BRAWLERS: Brawler[] = [
  {
    id: 'shelly_bot',
    name: 'Shotgun Shelly',
    description: 'A balanced fighter with a spread shot.',
    role: 'Controller',
    color: '#a855f7', // Purple
    projectileColor: '#e9d5ff',
    stats: {
      health: 1200,
      damage: 150, // Per pellet (shoots 3)
      speed: 5, // Slightly faster for big map
      range: 350,
      reloadSpeed: 50,
      superChargeRate: 15,
    },
    superDescription: 'Blasts a massive wave of shells destroying obstacles.',
  },
  {
    id: 'colt_bot',
    name: 'Sheriff Colt',
    description: 'High damage sharpshooter with dual pistols.',
    role: 'Sharpshooter',
    color: '#ef4444', // Red
    projectileColor: '#fecaca',
    stats: {
      health: 800,
      damage: 100, // Per bullet
      speed: 5.5,
      range: 550,
      reloadSpeed: 40,
      superChargeRate: 10,
    },
    superDescription: 'Unleashes a barrage of bullets that shred cover.',
  },
  {
    id: 'primo_bot',
    name: 'El Primo',
    description: 'A tanky wrestler who punches close range.',
    role: 'Tank',
    color: '#22c55e', // Green
    projectileColor: '#ffffff', // Melee visual
    stats: {
      health: 2400,
      damage: 200,
      speed: 6,
      range: 100, // Melee
      reloadSpeed: 30,
      superChargeRate: 20,
    },
    superDescription: 'Leaps into the air and crashes down on enemies.',
  }
];

// More obstacles for the larger map
export const OBSTACLES = [
  // Center structures
  { x: 900, y: 900, w: 200, h: 200 },
  
  // Outer rings
  { x: 400, y: 400, w: 150, h: 150 },
  { x: 1450, y: 400, w: 150, h: 150 },
  { x: 400, y: 1450, w: 150, h: 150 },
  { x: 1450, y: 1450, w: 150, h: 150 },

  // Corridors
  { x: 950, y: 400, w: 100, h: 300 },
  { x: 950, y: 1300, w: 100, h: 300 },
  { x: 400, y: 950, w: 300, h: 100 },
  { x: 1300, y: 950, w: 300, h: 100 },
];
