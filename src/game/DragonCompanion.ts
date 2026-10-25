import { Direction, Vector3D } from './PlayerController';
import { sounds } from '../services/soundEffects';

export class DragonCompanion {
  public position: Vector3D = new Vector3D(1, 0, 3);
  public animFrame: number = 0;
  public animTimer: number = 0;
  public isCelebrating: boolean = false;
  public celebrateTimer: number = 0;
  public isBirthdayMode: boolean = false;

  constructor() {}

  public setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
  }

  public celebrate() {
    this.isCelebrating = true;
    this.celebrateTimer = 2.0;
    sounds.playDragonChirp();
  }

  public setBirthdayMode(enabled: boolean) {
    this.isBirthdayMode = enabled;
  }

  public update(delta: number, playerPos: Vector3D, facingDir: Direction) {
    let targetX = playerPos.x;
    let targetZ = playerPos.z;

    if (facingDir === 'down') { targetZ -= 0.9; targetX += 0.6; }
    else if (facingDir === 'up') { targetZ += 0.9; targetX -= 0.6; }
    else if (facingDir === 'left') { targetX += 0.9; targetZ += 0.5; }
    else if (facingDir === 'right') { targetX -= 0.9; targetZ += 0.5; }

    this.position.x += (targetX - this.position.x) * Math.min(1, delta * 4);
    this.position.z += (targetZ - this.position.z) * Math.min(1, delta * 4);

    this.animTimer += delta * 6;
    this.animFrame = Math.floor(this.animTimer) % 4;

    if (this.isCelebrating) {
      this.celebrateTimer -= delta;
      if (this.celebrateTimer <= 0) {
        this.isCelebrating = false;
      }
    }
  }
}
