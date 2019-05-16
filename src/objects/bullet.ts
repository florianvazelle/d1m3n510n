export class Bullet extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  private lifespan: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);
  }

  init(): void {
    this.setBlendMode(1);
    this.setDepth(1);

    this.speed = 800;
    this.lifespan = 1000;
  }

  fire(player: Phaser.Physics.Arcade.Sprite, x: number, y: number): void {
    this.lifespan = 1000;

    this.setActive(true);
    this.setVisible(true);
    this.setPosition(player.x, player.y);

    this.body.reset(player.x, player.y);

    this.body.setSize(10, 10);

    var angle = Phaser.Geom.Line.Angle(new Phaser.Geom.Line(this.x, this.y, x, y));
    this.setAngle(angle * Phaser.Math.RAD_TO_DEG);

    this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

    this.body.velocity.x *= 2;
    this.body.velocity.y *= 2;
  }

  update(time: number, delta: number): void {
    this.lifespan -= delta;

    if (this.lifespan <= 0) {
      this.kill();
    }
  }

  kill(): void {
    this.setActive(false);
    this.setVisible(false);
    this.body.stop();
  }

}
