import Phaser from 'phaser';
import { generateTextures } from '../textures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Generate all dynamic textures programmatically
    generateTextures(this);

    // Go to preloader scene immediately
    this.scene.start('PreloaderScene');
  }
}
export default BootScene;
