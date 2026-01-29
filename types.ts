export interface Vector2 {
  x: number;
  y: number;
}

export interface BrawlerStats {
  health: number;
  damage: number;
  speed: number;
  range: number;
  reloadSpeed: number; // Frames per ammo
  superChargeRate: number; // Per hit
}

export interface Brawler {
  id: string;
  name: string;
  description: string;
  role: 'Tank' | 'Sharpshooter' | 'Support' | 'Assassin' | 'Controller';
  stats: BrawlerStats;
  color: string; // Hex code for visual
  projectileColor: string;
  superDescription: string;
  isAiGenerated?: boolean;
}

export interface Entity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  type: 'player' | 'enemy' | 'projectile' | 'crystal' | 'obstacle' | 'shockwave';
  active: boolean;
}

export interface CharacterEntity extends Entity {
  brawler: Brawler;
  currentHealth: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  ammoCooldown: number;
  superCharge: number; // 0 to 100
  team: 'blue' | 'red';
  isMoving: boolean;
  angle: number; // Facing direction in radians
  // Effects
  superActiveTimer?: number; // For duration based supers like Colt
  // AI Brain
  aiState?: 'IDLE' | 'ATTACK' | 'RETREAT' | 'COLLECT';
  aiTargetPos?: Vector2;
}

export interface ProjectileEntity extends Entity {
  damage: number;
  team: 'blue' | 'red';
  ownerId: string;
  travelled: number;
  maxRange: number;
  isSuper?: boolean; // Is this a super projectile?
  piercing?: boolean; // Does it go through enemies?
}

export interface Particle {
  id: string;
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export enum GameStatus {
  MENU = 'MENU',
  MATCHMAKING = 'MATCHMAKING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  GENERATING = 'GENERATING'
}

export interface GameResult {
  winner: 'blue' | 'red';
  playerKills: number;
  playerDeaths: number;
  crystalsCollected: number;
  duration: number;
}
