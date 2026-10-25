import { HeroType } from './types';
import { sounds } from '../services/soundEffects';

export interface MovementInput {
  forward: number; // -1 to 1 (in 2D top-down: -1 is down/back, +1 is up/forward)
  right: number;   // -1 to 1 (in 2D top-down: -1 is left, +1 is right)
  jump: boolean;
}

export type Direction = 'down' | 'up' | 'left' | 'right';
export type AnimationState = 'idle' | 'walk' | 'interact' | 'celebrate';

export class Vector3D {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  clone() {
    return new Vector3D(this.x, this.y, this.z);
  }

  copy(v: Vector3D) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  distanceTo(v: Vector3D) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

export class PlayerController {
  public position: Vector3D = new Vector3D(0, 0, 4);
  public velocity: Vector3D = new Vector3D();
  public facingDirection: Direction = 'down';
  public animState: AnimationState = 'idle';
  public animFrame: number = 0;
  public animTimer: number = 0;
  public heroType: HeroType = 'brother';
  public isGrounded: boolean = true;
  public rotationY: number = 0;

  public speed: number = 5.5; // Tile units per second
  private footstepTimer: number = 0;

  constructor(heroType: HeroType = 'brother') {
    this.heroType = heroType;
  }

  public setHeroType(hero: HeroType) {
    this.heroType = hero;
  }

  public setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
  }

  public update(
    delta: number,
    input: MovementInput,
    isObstacle: (x: number, z: number) => boolean
  ) {
    // Top-down movement processing
    // input.forward > 0 -> up/north (z decreasing)
    // input.forward < 0 -> down/south (z increasing)
    // input.right > 0 -> right/east (x increasing)
    // input.right < 0 -> left/west (x decreasing)

    let moveX = input.right;
    let moveZ = -input.forward; // Forward is north (-Z)

    const length = Math.hypot(moveX, moveZ);

    if (length > 0.08) {
      // Normalize diagonal speed
      moveX /= Math.max(1, length);
      moveZ /= Math.max(1, length);

      this.velocity.x = moveX * this.speed;
      this.velocity.z = moveZ * this.speed;

      // Determine facing direction
      if (Math.abs(moveX) > Math.abs(moveZ)) {
        this.facingDirection = moveX > 0 ? 'right' : 'left';
      } else {
        this.facingDirection = moveZ > 0 ? 'down' : 'up';
      }

      this.animState = 'walk';

      // Footstep sound
      this.footstepTimer += delta * this.speed;
      if (this.footstepTimer > 2.2) {
        this.footstepTimer = 0;
        sounds.playFootstep();
      }
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
      if (this.animState === 'walk') {
        this.animState = 'idle';
      }
    }

    // Collision & Movement
    const playerRadius = 0.35;
    const nextX = this.position.x + this.velocity.x * delta;
    const nextZ = this.position.z + this.velocity.z * delta;

    // Check X move
    if (!isObstacle(nextX + (this.velocity.x > 0 ? playerRadius : -playerRadius), this.position.z)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = 0;
    }

    // Check Z move
    if (!isObstacle(this.position.x, nextZ + (this.velocity.z > 0 ? playerRadius : -playerRadius))) {
      this.position.z = nextZ;
    } else {
      this.velocity.z = 0;
    }

    // Update animation timer
    this.animTimer += delta * 8;
    this.animFrame = Math.floor(this.animTimer) % 4;
  }
}
