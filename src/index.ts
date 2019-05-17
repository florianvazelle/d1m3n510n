import "phaser";
import { CONST } from "./const/const";
import { GamePlay } from "./scenes/gamePlay";

const config: Phaser.Types.Core.GameConfig = {
  title: "d1m3n510n",
  url: "https://github.com/florianvazelle/d1m3n510n",
  version: "1.0",
  width: CONST.WIDTH,
  height: CONST.HEIGHT,
  type: Phaser.AUTO,
  parent: "game",
  scene: GamePlay,
  input: {
    keyboard: true,
    mouse: true,
    touch: false,
    gamepad: false
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 0
      }
    }
  },
  backgroundColor: "#000000",
  render: { pixelArt: false, antialias: true }
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener("load", () => {
  new Game(config);
});
