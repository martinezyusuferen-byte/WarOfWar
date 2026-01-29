
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text, SoftShadows, Environment, RoundedBox, Float, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Brawler, CharacterEntity, Entity, GameResult, Particle, ProjectileEntity } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, OBSTACLES, WIN_SCORE } from '../constants';
import { Skull } from 'lucide-react';
import { playSound, playIntroMusic, stopMusic } from '../services/audio';

interface GameCanvasProps {
  playerBrawler: Brawler;
  onGameOver: (result: GameResult) => void;
  onExit: () => void;
}

// --- 3D ENVIRONMENT COMPONENTS ---

const NatureFloor: React.FC<{ onPointerMove: (pt: THREE.Vector3) => void }> = ({ onPointerMove }) => {
  return (
    <group>
        {/* Raycast Plane */}
        <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[GAME_WIDTH / 2, -0.1, GAME_HEIGHT / 2]} 
            onPointerMove={(e) => onPointerMove(e.point)}
            visible={false}
        >
            <planeGeometry args={[GAME_WIDTH + 1000, GAME_HEIGHT + 1000]} />
        </mesh>

        {/* Grass Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GAME_WIDTH / 2, -1, GAME_HEIGHT / 2]} receiveShadow>
             <planeGeometry args={[GAME_WIDTH + 2000, GAME_HEIGHT + 2000]} />
             <meshStandardMaterial color="#4ade80" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* The River */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GAME_WIDTH / 2, -0.5, GAME_HEIGHT / 2]}>
             {/* River flowing diagonally */}
             <planeGeometry args={[GAME_WIDTH + 2000, 300]} />
             <meshPhysicalMaterial 
                color="#3b82f6" 
                transmission={0.6} 
                opacity={0.8} 
                roughness={0.2} 
                metalness={0.1} 
                transparent
             />
        </mesh>
    </group>
  );
};

const Tree: React.FC<{ x: number, z: number, scale?: number }> = ({ x, z, scale = 1 }) => {
    return (
        <group position={[x, 0, z]} scale={scale}>
            {/* Trunk */}
            <mesh position={[0, 15, 0]} castShadow>
                <cylinderGeometry args={[5, 8, 30, 8]} />
                <meshStandardMaterial color="#5d4037" />
            </mesh>
            {/* Leaves Layers */}
            <mesh position={[0, 40, 0]} castShadow>
                <coneGeometry args={[25, 40, 8]} />
                <meshStandardMaterial color="#166534" roughness={0.8} />
            </mesh>
            <mesh position={[0, 60, 0]} castShadow>
                <coneGeometry args={[20, 35, 8]} />
                <meshStandardMaterial color="#15803d" roughness={0.8} />
            </mesh>
            <mesh position={[0, 80, 0]} castShadow>
                <coneGeometry args={[15, 30, 8]} />
                <meshStandardMaterial color="#22c55e" roughness={0.8} />
            </mesh>
        </group>
    );
};

const StoneObstacle: React.FC<{ x: number, y: number, w: number, h: number }> = ({ x, y, w, h }) => {
    return (
        <group position={[x + w/2, 30, y + h/2]}>
            <RoundedBox args={[w, 60, h]} radius={4} smoothness={4} castShadow receiveShadow>
                <meshStandardMaterial color="#64748b" roughness={0.9} />
            </RoundedBox>
            {/* Moss/Grass on top */}
            <mesh position={[0, 31, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[w * 0.9, h * 0.9]} />
                <meshStandardMaterial color="#4ade80" />
            </mesh>
        </group>
    );
};

// Procedurally generate decoration trees around the map
const MapDecorations = () => {
    const trees = useMemo(() => {
        const items = [];
        // Random trees outside the play area
        for(let i=0; i<40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 1200 + Math.random() * 500; // Far out
            items.push({
                x: GAME_WIDTH/2 + Math.cos(angle) * dist,
                z: GAME_HEIGHT/2 + Math.sin(angle) * dist,
                scale: 1.5 + Math.random()
            });
        }
        // Some trees inside (avoiding center logic handled simply here)
        for(let i=0; i<15; i++) {
            items.push({
                x: Math.random() * GAME_WIDTH,
                z: Math.random() * GAME_HEIGHT,
                scale: 0.8 + Math.random() * 0.4
            });
        }
        return items;
    }, []);

    return (
        <group>
            {trees.map((t, i) => <Tree key={i} x={t.x} z={t.z} scale={t.scale} />)}
        </group>
    );
};

const Character3D: React.FC<{ entity: CharacterEntity }> = ({ entity }) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, entity.position.x, 0.4);
            groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, entity.position.y, 0.4);
            groupRef.current.rotation.y = -entity.angle; 
            
            if (entity.isMoving && bodyRef.current) {
               bodyRef.current.position.y = 24 + Math.sin(state.clock.elapsedTime * 15) * 2;
               bodyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.1; // Run wobble
            }
        }
    });

    const isDead = entity.currentHealth <= 0;
    if (isDead) return null;

    return (
        <group ref={groupRef} position={[entity.position.x, 0, entity.position.y]}>
            {/* Shadow Blob */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 1, 0]}>
                <circleGeometry args={[14, 32]} />
                <meshBasicMaterial color="black" opacity={0.3} transparent />
            </mesh>

            {/* Body */}
            <mesh ref={bodyRef} position={[0, 24, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[16, 20, 4, 8]} />
                <meshStandardMaterial color={entity.team === 'blue' ? entity.brawler.color : '#ef4444'} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 42, 0]} castShadow>
                <boxGeometry args={[22, 22, 22]} /> {/* Blocky Head style */}
                <meshStandardMaterial color="#fcd34d" /> 
            </mesh>
            {/* Eyes */}
            <mesh position={[6, 45, 11]}>
                <planeGeometry args={[4, 4]} />
                <meshBasicMaterial color="black" />
            </mesh>
             <mesh position={[-6, 45, 11]}>
                <planeGeometry args={[4, 4]} />
                <meshBasicMaterial color="black" />
            </mesh>

            {/* Weapon */}
            <mesh position={[18, 24, 8]} castShadow>
                <boxGeometry args={[20, 10, 10]} />
                <meshStandardMaterial color="#334155" />
            </mesh>

            {/* Health Bar */}
            <Billboard position={[0, 75, 0]}>
                 <mesh position={[0, 0, -0.1]}>
                     <planeGeometry args={[64, 10]} />
                     <meshBasicMaterial color="black" />
                 </mesh>
                 <mesh position={[-30 + (30 * (entity.currentHealth/entity.maxHealth)), 0, 0]}>
                     <planeGeometry args={[60 * (entity.currentHealth/entity.maxHealth), 6]} />
                     <meshBasicMaterial color={entity.team === 'blue' ? '#4ade80' : '#ef4444'} />
                 </mesh>
                 {entity.type === 'player' && (
                     <Text position={[0, 16, 0]} fontSize={14} color="white" outlineWidth={2} outlineColor="#2563eb" fontWeight="bold">
                         SEN
                     </Text>
                 )}
            </Billboard>
        </group>
    );
};

const Projectile3D: React.FC<{ entity: ProjectileEntity }> = ({ entity }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if(meshRef.current) {
            meshRef.current.position.set(entity.position.x, 20, entity.position.y);
            meshRef.current.rotation.z += 0.5;
        }
    });
    
    return (
        <mesh ref={meshRef} position={[entity.position.x, 20, entity.position.y]}>
            <icosahedronGeometry args={[entity.isSuper ? entity.radius * 1.3 : entity.radius, 0]} />
            <meshStandardMaterial 
                color={entity.isSuper ? '#fbbf24' : (entity.team === 'blue' ? '#60a5fa' : '#ef4444')} 
                emissive={entity.isSuper ? '#fbbf24' : (entity.team === 'blue' ? '#60a5fa' : '#ef4444')}
                emissiveIntensity={2}
            />
        </mesh>
    );
};

const Crystal3D: React.FC<{ entity: Entity }> = ({ entity }) => {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group position={[entity.position.x, 15, entity.position.y]}>
                <mesh castShadow>
                    <octahedronGeometry args={[14, 0]} />
                    <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.5} roughness={0.1} />
                </mesh>
                <pointLight distance={80} intensity={2} color="#d8b4fe" />
            </group>
        </Float>
    );
};

// --- LOGIC CONTROLLER (Kept mostly same, adjusted camera phases) ---
const GameLogic = ({ 
    gameStateRef, 
    keysPressed, 
    mousePosRef, 
    introPhase, 
    onGameOver,
    setCameraTarget,
    triggerSuperRef
}: any) => {
    const { camera } = useThree();
    const frameCount = useRef(0);
    
    useFrame((state, delta) => {
        frameCount.current++;
        const stateData = gameStateRef.current;
        const currentPhase = introPhase;

        let targetX = GAME_WIDTH / 2;
        let targetZ = GAME_HEIGHT / 2;
        let camOffsetZ = 500;
        let camHeight = 800;

        if (stateData.player) {
            targetX = stateData.player.position.x;
            targetZ = stateData.player.position.y;
            camHeight = 700;
            camOffsetZ = 500;
        }

        // Cinematic overrides
        if (currentPhase === 'PAN_ENEMIES') {
            targetX = GAME_WIDTH - 300;
            targetZ = GAME_HEIGHT / 2;
        }

        camera.position.x += (targetX - camera.position.x) * 0.1;
        camera.position.z += ((targetZ + camOffsetZ) - camera.position.z) * 0.1;
        camera.position.y += (camHeight - camera.position.y) * 0.1;
        camera.lookAt(targetX, 0, targetZ);
        if (setCameraTarget) setCameraTarget({x: targetX, y: targetZ});

        if (currentPhase === 'PLAY' && !stateData.gameOver) {
             // ... [Existing Game Logic Code - truncated for brevity as logic didn't change, only visuals] ...
             // PLAYER MOVEMENT & LOGIC
            if (stateData.player && stateData.player.currentHealth > 0) {
                const p = stateData.player;
                let speed = p.brawler.stats.speed;
                
                if ((keysPressed.current['Space'] || triggerSuperRef.current) && p.superCharge >= 100) {
                    p.superCharge = 0;
                    p.superActiveTimer = 300;
                    playSound('super');
                    triggerSuperRef.current = false;
                }

                if (p.superActiveTimer && p.superActiveTimer > 0) {
                    p.superActiveTimer--;
                    speed *= 1.5;
                }

                let dx = 0; let dy = 0;
                if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) dy -= speed;
                if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) dy += speed;
                if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) dx -= speed;
                if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) dx += speed;

                p.isMoving = (dx !== 0 || dy !== 0);
                if (dx !== 0 && dy !== 0) {
                    const length = Math.sqrt(dx * dx + dy * dy);
                    dx = (dx / length) * speed;
                    dy = (dy / length) * speed;
                }

                const nextX = p.position.x + dx;
                const nextY = p.position.y + dy;

                let colX = false; let colY = false;
                OBSTACLES.forEach(obs => {
                    if (nextX > obs.x - p.radius && nextX < obs.x + obs.w + p.radius &&
                        p.position.y > obs.y - p.radius && p.position.y < obs.y + obs.h + p.radius) colX = true;
                });
                if (!colX) p.position.x = Math.max(p.radius, Math.min(GAME_WIDTH - p.radius, nextX));

                OBSTACLES.forEach(obs => {
                    if (p.position.x > obs.x - p.radius && p.position.x < obs.x + obs.w + p.radius &&
                        nextY > obs.y - p.radius && nextY < obs.y + obs.h + p.radius) colY = true;
                });
                if (!colY) p.position.y = Math.max(p.radius, Math.min(GAME_HEIGHT - p.radius, nextY));

                p.angle = Math.atan2(mousePosRef.current.y - p.position.y, mousePosRef.current.x - p.position.x);

                if (p.ammo < p.maxAmmo) {
                    let reloadRate = p.brawler.stats.reloadSpeed;
                    if (p.superActiveTimer && p.superActiveTimer > 0) reloadRate = 10;
                    p.ammoCooldown++;
                    if (p.ammoCooldown >= reloadRate) { p.ammo++; p.ammoCooldown = 0; }
                }

                if (keysPressed.current['MouseLeft'] && p.ammo >= 1) {
                    const now = Date.now();
                    const isSuper = p.superActiveTimer && p.superActiveTimer > 0;
                    const fireRate = isSuper ? 100 : 250;
                    if (!p["lastFireTime"] || now - p["lastFireTime"] > fireRate) {
                        p.ammo--;
                        p["lastFireTime"] = now;
                        playSound('shoot');
                        stateData.projectiles.push({
                            id: Math.random().toString(), type: 'projectile', team: p.team, ownerId: p.id,
                            position: { ...p.position }, velocity: { x: Math.cos(p.angle) * 14, y: Math.sin(p.angle) * 14 },
                            radius: isSuper ? 12 : 6, damage: isSuper ? p.brawler.stats.damage * 1.5 : p.brawler.stats.damage,
                            active: true, travelled: 0, maxRange: p.brawler.stats.range, isSuper, piercing: isSuper
                        });
                    }
                }
            }

            // ENEMY AI
            stateData.enemies.forEach((bot: CharacterEntity) => {
                if (!bot.active) return;
                if (frameCount.current % 15 === 0) {
                    const nearestGem = stateData.crystals.find((c: Entity) => c.active);
                    let distToGem = 9999;
                    if (nearestGem) distToGem = Math.sqrt(Math.pow(nearestGem.position.x - bot.position.x, 2) + Math.pow(nearestGem.position.y - bot.position.y, 2));
                    if (bot.currentHealth < bot.maxHealth * 0.3) { bot.aiState = 'RETREAT'; } 
                    else if (nearestGem && distToGem < 500) { bot.aiState = 'COLLECT'; bot.aiTargetPos = nearestGem.position; } 
                    else if (stateData.player && stateData.player.active) { bot.aiState = 'ATTACK'; bot.aiTargetPos = stateData.player.position; } 
                    else { bot.aiState = 'IDLE'; }
                }
                
                let moveAngle = bot.angle; let shouldMove = false; let shouldShoot = false;
                if (bot.aiState === 'COLLECT' && bot.aiTargetPos) {
                     moveAngle = Math.atan2(bot.aiTargetPos.y - bot.position.y, bot.aiTargetPos.x - bot.position.x); shouldMove = true;
                } else if (bot.aiState === 'ATTACK' && bot.aiTargetPos) {
                     moveAngle = Math.atan2(bot.aiTargetPos.y - bot.position.y, bot.aiTargetPos.x - bot.position.x);
                     const dist = Math.sqrt(Math.pow(bot.aiTargetPos.x - bot.position.x, 2) + Math.pow(bot.aiTargetPos.y - bot.position.y, 2));
                     if (dist > bot.brawler.stats.range * 0.6) shouldMove = true;
                     else if (dist < 100) { moveAngle += Math.PI; shouldMove = true; }
                     else { moveAngle += Math.PI / 2; shouldMove = Math.random() > 0.5; }
                     shouldShoot = true;
                } else if (bot.aiState === 'RETREAT' && stateData.player) {
                     moveAngle = Math.atan2(bot.position.y - stateData.player.position.y, bot.position.x - stateData.player.position.x); shouldMove = true;
                     if(Math.random()<0.05) shouldShoot = true;
                }
                if (shouldMove) {
                    const nextX = bot.position.x + Math.cos(moveAngle) * 3; const nextY = bot.position.y + Math.sin(moveAngle) * 3;
                    let canMove = true;
                    OBSTACLES.forEach(obs => { if (nextX > obs.x && nextX < obs.x + obs.w && nextY > obs.y && nextY < obs.y + obs.h) canMove = false; });
                    if (canMove) { bot.position.x = nextX; bot.position.y = nextY; bot.isMoving = true; }
                    bot.angle = moveAngle;
                }
                if (shouldShoot && stateData.player && Math.random() < 0.02 && bot.ammo >= 1) {
                    bot.ammo--; playSound('shoot');
                    stateData.projectiles.push({
                        id: Math.random().toString(), type: 'projectile', team: bot.team, ownerId: bot.id,
                        position: { ...bot.position }, velocity: { x: Math.cos(bot.angle) * 10, y: Math.sin(bot.angle) * 10 },
                        radius: 6, damage: bot.brawler.stats.damage, active: true, travelled: 0, maxRange: bot.brawler.stats.range
                    });
                }
                if (bot.ammo < bot.maxAmmo) { bot.ammoCooldown++; if (bot.ammoCooldown > 60) { bot.ammo++; bot.ammoCooldown = 0; } }
            });

            // PROJECTILES
            stateData.projectiles.forEach((proj: ProjectileEntity) => {
                 if (!proj.active) return;
                 proj.position.x += proj.velocity.x; proj.position.y += proj.velocity.y; 
                 proj.travelled += Math.sqrt(proj.velocity.x**2 + proj.velocity.y**2);
                 if (proj.travelled > proj.maxRange) proj.active = false;
                 OBSTACLES.forEach(obs => {
                     if (proj.position.x > obs.x && proj.position.x < obs.x + obs.w && proj.position.y > obs.y && proj.position.y < obs.y + obs.h) proj.active = false;
                 });
                 const targets = proj.team === 'blue' ? stateData.enemies : (stateData.player ? [stateData.player] : []);
                 targets.forEach((target: CharacterEntity) => {
                     if (!target.active) return;
                     const dx = target.position.x - proj.position.x; const dy = target.position.y - proj.position.y;
                     if (dx*dx + dy*dy < (target.radius + proj.radius + 10)**2) {
                         if (!proj.piercing) proj.active = false;
                         target.currentHealth -= proj.damage; playSound('hit');
                         if (proj.ownerId === stateData.player?.id) { stateData.player.superCharge = Math.min(100, stateData.player.superCharge + stateData.player.brawler.stats.superChargeRate); }
                         if (target.currentHealth <= 0) {
                             target.active = false; playSound('die');
                             if (target.team === 'red') stateData.score.blue += 2; else stateData.score.red += 2;
                             setTimeout(() => { if (!stateData.gameOver) { target.active = true; target.currentHealth = target.maxHealth; target.position = target.team === 'red' ? {x: GAME_WIDTH - 200, y: Math.random() * GAME_HEIGHT} : {x: 200, y: GAME_HEIGHT/2}; } }, 4000);
                         }
                     }
                 });
             });
             stateData.projectiles = stateData.projectiles.filter((p: Entity) => p.active);

             // CRYSTALS
             if (Math.random() < 0.01 && stateData.crystals.length < 15) {
                 const x = GAME_WIDTH / 2 + (Math.random() * 400 - 200); const y = GAME_HEIGHT / 2 + (Math.random() * 400 - 200);
                 stateData.crystals.push({ id: `gem_${Date.now()}_${Math.random()}`, position: { x, y }, velocity: { x: 0, y: 0 }, radius: 12, type: 'crystal', active: true });
             }
             stateData.crystals.forEach((gem: Entity) => {
                 if (!gem.active) return;
                 [stateData.player, ...stateData.enemies].filter(c => c && c.active).forEach((char: any) => {
                     const dx = char.position.x - gem.position.x; const dy = char.position.y - gem.position.y;
                     if (dx*dx + dy*dy < (char.radius + gem.radius + 10)**2) {
                         gem.active = false; playSound('gem');
                         if (char.team === 'blue') stateData.score.blue++; else stateData.score.red++;
                     }
                 });
             });
             stateData.crystals = stateData.crystals.filter((c: Entity) => c.active);

             // CHECK GAME OVER
             const elapsed = (Date.now() - stateData.startTime) / 1000;
             if (180 - elapsed <= 0 || stateData.score.blue >= WIN_SCORE || stateData.score.red >= WIN_SCORE) {
                 stateData.gameOver = true; playSound('win');
                 onGameOver({ winner: stateData.score.blue >= stateData.score.red ? 'blue' : 'red', playerKills: stateData.score.blue, playerDeaths: stateData.score.red, crystalsCollected: stateData.score.blue, duration: Math.min(180, elapsed) });
             }
        }
    });
    return null;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ playerBrawler, onGameOver, onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hudState, setHudState] = useState({ health: 0, maxHealth: 1, ammo: 0, maxAmmo: 1, blueScore: 0, redScore: 0, timeLeft: 180, superCharge: 0 });
  const [introPhase, setIntroPhase] = useState<'TEXT' | 'PAN_ENEMIES' | 'PAN_PLAYER' | 'PLAY'>('TEXT');
  const [cameraTarget, setCameraTarget] = useState({ x: 0, y: 0 }); 
  
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const triggerSuperRef = useRef(false);

  const gameStateRef = useRef<{
    player: CharacterEntity | null; enemies: CharacterEntity[]; projectiles: ProjectileEntity[]; crystals: Entity[]; particles: Particle[];
    score: { blue: number; red: number }; startTime: number; gameOver: boolean;
  }>({
    player: null, enemies: [], projectiles: [], crystals: [], particles: [],
    score: { blue: 0, red: 0 }, startTime: Date.now(), gameOver: false,
  });

  const handleSuperClick = useCallback(() => { triggerSuperRef.current = true; }, []);

  useEffect(() => {
    const state = gameStateRef.current;
    
    state.player = {
        id: 'player', type: 'player', team: 'blue', position: { x: 200, y: GAME_HEIGHT / 2 },
        velocity: { x: 0, y: 0 }, radius: 24, brawler: playerBrawler,
        currentHealth: playerBrawler.stats.health, maxHealth: playerBrawler.stats.health,
        ammo: 3, maxAmmo: 3, ammoCooldown: 0, superCharge: 0, active: true, isMoving: false, angle: 0, aiState: 'IDLE'
    };

    const botBrawler: Brawler = {
        id: 'bot', name: 'Bot', description: '', role: 'Tank', color: '#ef4444', projectileColor: '#fecaca',
        stats: { health: 1400, damage: 90, speed: 4.5, range: 400, reloadSpeed: 65, superChargeRate: 10 }, superDescription: ''
    };

    state.enemies = [
      { ...state.player, id: 'e1', type: 'enemy', team: 'red', position: { x: GAME_WIDTH - 200, y: 300 }, brawler: botBrawler, active: true, angle: Math.PI },
      { ...state.player, id: 'e2', type: 'enemy', team: 'red', position: { x: GAME_WIDTH - 200, y: GAME_HEIGHT/2 }, brawler: botBrawler, active: true, angle: Math.PI },
      { ...state.player, id: 'e3', type: 'enemy', team: 'red', position: { x: GAME_WIDTH - 200, y: GAME_HEIGHT - 300 }, brawler: botBrawler, active: true, angle: Math.PI },
    ];
    
    for(let i=0; i<5; i++) {
        const x = GAME_WIDTH / 2 + (Math.random() * 300 - 150); const y = GAME_HEIGHT / 2 + (Math.random() * 300 - 150);
        state.crystals.push({ id: `g${i}`, position: {x,y}, velocity: {x:0,y:0}, radius: 12, type: 'crystal', active: true });
    }

    playIntroMusic();
    setTimeout(() => setIntroPhase('PAN_ENEMIES'), 2500); 
    setTimeout(() => setIntroPhase('PAN_PLAYER'), 6000);
    setTimeout(() => { setIntroPhase('PLAY'); state.startTime = Date.now(); }, 8500);

    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.code] = false; };
    const handleMouseDown = () => { keysPressed.current['MouseLeft'] = true; };
    const handleMouseUp = () => { keysPressed.current['MouseLeft'] = false; };

    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown); window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown); window.removeEventListener('mouseup', handleMouseUp);
      stopMusic();
    };
  }, [playerBrawler]);

  useEffect(() => {
      const interval = setInterval(() => {
          const stateData = gameStateRef.current;
          if (stateData.player && introPhase === 'PLAY') {
             const elapsed = (Date.now() - stateData.startTime) / 1000;
             setHudState({
                 health: Math.max(0, stateData.player.currentHealth), maxHealth: stateData.player.maxHealth,
                 ammo: stateData.player.ammo, maxAmmo: stateData.player.maxAmmo,
                 blueScore: stateData.score.blue, redScore: stateData.score.red,
                 timeLeft: Math.max(0, 180 - elapsed), superCharge: stateData.player.superCharge
             });
          }
      }, 100);
      return () => clearInterval(interval);
  }, [introPhase]);

  return (
    <div className="relative w-full h-full bg-black" ref={containerRef}>
      <Canvas shadows camera={{ position: [0, 800, 600], fov: 45 }}>
          {/* DAYLIGHT LIGHTING */}
          <SoftShadows size={40} samples={12} focus={0.5} />
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[500, 1500, 500]} 
            intensity={1.8} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-1000} shadow-camera-right={1000} shadow-camera-top={1000} shadow-camera-bottom={-1000}
          />
          <Environment preset="park" />

          <GameLogic 
            gameStateRef={gameStateRef} 
            keysPressed={keysPressed} 
            mousePosRef={mousePos}
            introPhase={introPhase}
            onGameOver={onGameOver}
            setCameraTarget={setCameraTarget}
            triggerSuperRef={triggerSuperRef}
          />

          <NatureFloor onPointerMove={(pt) => { mousePos.current = { x: pt.x, y: pt.z }; }} />
          <MapDecorations />

          {OBSTACLES.map((obs, i) => (
              <StoneObstacle key={i} x={obs.x} y={obs.y} w={obs.w} h={obs.h} />
          ))}

          {gameStateRef.current.player && <Character3D entity={gameStateRef.current.player} />}
          {gameStateRef.current.enemies.map(e => <Character3D key={e.id} entity={e} />)}
          {gameStateRef.current.projectiles.map(p => <Projectile3D key={p.id} entity={p} />)}
          {gameStateRef.current.crystals.map(c => <Crystal3D key={c.id} entity={c} />)}
      </Canvas>

      {/* 2D UI OVERLAYS (HUD) */}
      <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
        {introPhase === 'PLAY' && (
            <div className="flex justify-between items-start w-full">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    {/* Health */}
                    <div className="w-56 h-8 bg-gray-900/80 rounded-full border-2 border-gray-600 overflow-hidden relative shadow-lg">
                        <div className="h-full bg-green-500 transition-all duration-200" style={{ width: `${(hudState.health / hudState.maxHealth) * 100}%` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white text-outline tracking-wider">
                            {Math.ceil(hudState.health)} / {hudState.maxHealth}
                        </div>
                    </div>
                    {/* Ammo */}
                    <div className="flex gap-1 ml-2">
                        {[...Array(hudState.maxAmmo)].map((_, i) => (
                            <div key={i} className={`w-8 h-3 rounded-sm border border-black transform -skew-x-12 ${i < hudState.ammo ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                        ))}
                    </div>
                </div>

                {/* Score & Time */}
                <div className="flex flex-col items-center">
                    <div className="text-4xl text-white font-brawl mb-2 drop-shadow-lg">{Math.floor(hudState.timeLeft)}s</div>
                    <div className="flex items-center gap-6 bg-black/60 px-6 py-2 rounded-xl backdrop-blur-md border border-white/10">
                        <div className="text-blue-400 font-black text-3xl drop-shadow-md">{hudState.blueScore}</div>
                        <div className="text-red-500 font-black text-3xl drop-shadow-md">{hudState.redScore}</div>
                    </div>
                </div>

                <div className="pointer-events-auto">
                    <button onClick={onExit} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded shadow border-b-4 border-red-900 text-xs">ÇIKIŞ</button>
                </div>
            </div>
        )}

        {/* Super Button HUD */}
        {introPhase === 'PLAY' && (
            <div className="absolute bottom-8 right-8 pointer-events-auto flex flex-col items-center gap-2">
                <button 
                    onClick={handleSuperClick}
                    className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation
                    ${hudState.superCharge >= 100 
                        ? 'bg-yellow-400 border-yellow-200 animate-pulse shadow-[0_0_30px_#facc15] scale-110 cursor-pointer' 
                        : 'bg-gray-800 border-gray-600 grayscale opacity-80 cursor-not-allowed'}`}
                >
                    <Skull className={`w-12 h-12 ${hudState.superCharge >= 100 ? 'text-black animate-spin-slow' : 'text-gray-500'}`} />
                </button>
                {hudState.superCharge < 100 && (
                    <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                        <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${hudState.superCharge}%` }}></div>
                    </div>
                )}
                <span className="text-white font-black text-outline text-sm tracking-wide bg-black/50 px-2 rounded">
                    SÜPER {hudState.superCharge >= 100 ? '(HAZIR!)' : '(SPACE)'}
                </span>
            </div>
        )}
      </div>

      {/* Cinematic Overlays */}
      {introPhase !== 'PLAY' && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {introPhase === 'TEXT' && (
                 <div className="flex flex-col items-center animate-bounce">
                     <h1 className="text-8xl font-brawl text-blue-400 text-outline mb-4">KRİSTALLERİ</h1>
                     <h1 className="text-8xl font-brawl text-purple-400 text-outline">TOPLA</h1>
                 </div>
             )}
         </div>
      )}
    </div>
  );
};
