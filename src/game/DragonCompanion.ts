import * as THREE from 'three';
import { DragonRig } from './voxelModels';
import { sounds } from '../services/soundEffects';

export class DragonCompanion {
  public position: THREE.Vector3 = new THREE.Vector3(1, 1, 3);
  private targetOffset: THREE.Vector3 = new THREE.Vector3(1.4, 0.7, -1.2);
  private currentAngle: number = 0;

  constructor(public rig: DragonRig) {
    this.rig.root.position.copy(this.position);
  }

  public celebrate() {
    this.rig.celebrate();
    sounds.playDragonChirp();
  }

  public setBirthdayMode(enabled: boolean) {
    this.rig.setBirthdayMode(enabled);
  }

  public update(delta: number, playerPos: THREE.Vector3, playerRotY: number, playerJumping: boolean) {
    // Offset relative to player orientation
    const cos = Math.cos(playerRotY);
    const sin = Math.sin(playerRotY);

    const worldTargetX = playerPos.x + (this.targetOffset.x * cos - this.targetOffset.z * sin);
    const worldTargetY = playerPos.y + this.targetOffset.y + (playerJumping ? 0.8 : 0);
    const worldTargetZ = playerPos.z + (this.targetOffset.x * sin + this.targetOffset.z * cos);

    // Smoothly damp position towards target
    this.position.x = THREE.MathUtils.damp(this.position.x, worldTargetX, 4, delta);
    this.position.y = THREE.MathUtils.damp(this.position.y, worldTargetY, 5, delta);
    this.position.z = THREE.MathUtils.damp(this.position.z, worldTargetZ, 4, delta);
    this.rig.root.position.copy(this.position);

    // Face movement direction or face player
    const distToPlayer = Math.hypot(this.position.x - playerPos.x, this.position.z - playerPos.z);
    const dx = playerPos.x - this.position.x;
    const dz = playerPos.z - this.position.z;
    const targetAngle = Math.atan2(dx, dz);

    this.currentAngle = THREE.MathUtils.damp(this.currentAngle, targetAngle, 5, delta);
    this.rig.root.rotation.y = this.currentAngle;

    const isMoving = distToPlayer > 1.2;
    this.rig.update(delta, isMoving);
  }
}
