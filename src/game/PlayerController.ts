import * as THREE from 'three';
import { CharacterRig } from './voxelModels';
import { sounds } from '../services/soundEffects';

export interface MovementInput {
  forward: number; // -1 to 1
  right: number;   // -1 to 1
  jump: boolean;
}

export class PlayerController {
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 4);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public isGrounded: boolean = true;
  public rotationY: number = 0;
  public targetRotationY: number = 0;

  private speed: number = 6.2;
  private jumpForce: number = 8.5;
  private gravity: number = 22.0;
  private footstepTimer: number = 0;

  constructor(public rig: CharacterRig) {
    this.rig.root.position.copy(this.position);
  }

  public setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.rig.root.position.copy(this.position);
  }

  public update(
    delta: number,
    input: MovementInput,
    getGroundHeight: (x: number, z: number) => number,
    isObstacle: (x: number, z: number) => boolean,
    cameraAngle: number
  ) {
    // 1. Calculate horizontal movement relative to camera orientation
    const moveX = input.right;
    const moveZ = input.forward;
    const hasInput = Math.hypot(moveX, moveZ) > 0.08;

    let targetVelX = 0;
    let targetVelZ = 0;

    if (hasInput) {
      // Rotate input by camera angle
      const inputAngle = Math.atan2(moveX, moveZ);
      const moveAngle = inputAngle + cameraAngle;

      const inputMag = Math.min(1, Math.hypot(moveX, moveZ));
      targetVelX = Math.sin(moveAngle) * this.speed * inputMag;
      targetVelZ = Math.cos(moveAngle) * this.speed * inputMag;

      // Face direction of movement
      this.targetRotationY = moveAngle;
    }

    // Smooth horizontal velocity
    this.velocity.x = THREE.MathUtils.damp(this.velocity.x, targetVelX, 14, delta);
    this.velocity.z = THREE.MathUtils.damp(this.velocity.z, targetVelZ, 14, delta);

    // Smooth rotation
    // Calculate shortest angular distance
    let diff = (this.targetRotationY - this.rotationY) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    this.rotationY += diff * Math.min(1, delta * 12);
    this.rig.root.rotation.y = this.rotationY;

    // 2. Jumping & Gravity
    if (input.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      sounds.playJump();
    }

    this.velocity.y -= this.gravity * delta;

    // 3. Horizontal Collision & Move
    const nextX = this.position.x + this.velocity.x * delta;
    const nextZ = this.position.z + this.velocity.z * delta;

    if (!isObstacle(nextX, this.position.z)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = 0;
    }

    if (!isObstacle(this.position.x, nextZ)) {
      this.position.z = nextZ;
    } else {
      this.velocity.z = 0;
    }

    // 4. Vertical Collision & Ground Clamping
    const nextY = this.position.y + this.velocity.y * delta;
    const groundY = getGroundHeight(this.position.x, this.position.z);

    if (nextY <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.position.y = nextY;
      this.isGrounded = false;
    }

    // Fall safety respawn if player drops off the floating island
    if (this.position.y < -10) {
      this.setPosition(0, 2, 4);
      this.velocity.set(0, 0, 0);
    }

    this.rig.root.position.copy(this.position);

    // 5. Update character animation
    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (!this.isGrounded) {
      this.rig.updateAnimation('jump', horizSpeed, delta);
    } else if (horizSpeed > 0.4) {
      this.rig.updateAnimation('walk', horizSpeed, delta);
      // Footsteps
      this.footstepTimer += delta * horizSpeed;
      if (this.footstepTimer > 2.8) {
        this.footstepTimer = 0;
        sounds.playFootstep();
      }
    } else {
      this.rig.updateAnimation('idle', 0, delta);
    }
  }
}
