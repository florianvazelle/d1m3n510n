import Phaser from "phaser";
import myGame from "./scripts/GamePlay.js";

const config = {
  type: Phaser.AUTO,
  width: myGame.width,
  height: myGame.height,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0
      }
    }
  },
  scene: myGame.scenes
};

const game = new Phaser.Game(config);