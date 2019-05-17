import { CONST } from "../const/const";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private zone: number;
  private speed: number;

  public getZone(): number {
    return this.zone;
  }

  public getSpeed(): number {
    return this.speed;
  }

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'player');

    this.zone = 0;
    this.speed = 100;
  }

  launch(player: Phaser.Physics.Arcade.Sprite): void {
    this.play('idle');

    var zone_colors = [0x0c3d6f, 0x764f55, 0x214531, 0xff0000];
    this.zone = Math.floor(Math.random() * zone_colors.length);
    this.setTintFill(zone_colors[this.zone]);

    var p = new Phaser.Geom.Point();
    var arenaOuter = new Phaser.Geom.Rectangle(0, 0, CONST.WIDTH, CONST.HEIGHT);
    var arenaInner = new Phaser.Geom.Rectangle(player.x - 50 / 2, player.y - 50 / 2, 50, 50);
    Phaser.Geom.Rectangle.RandomOutside(arenaOuter, arenaInner, p);

    this.speed = Phaser.Math.Between(50, 75);

    this.setActive(true);
    this.setVisible(true);
    this.setPosition(p.x, p.y);

    this.body.reset(p.x, p.y);
  }

  kill(): void {
    this.setActive(false);
    this.setVisible(false);
    this.body.stop();
  }
}
