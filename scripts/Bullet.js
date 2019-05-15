var Bullet = new Phaser.Class({

  Extends: Phaser.Physics.Arcade.Image,
  initialize: function Bullet(scene) {
    Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'space', 'blaster');

    this.setBlendMode(1);
    this.setDepth(1);

    this.speed = 800;
    this.lifespan = 1000;
  },

  fire: function(x, y) {
    this.lifespan = 1000;

    this.setActive(true);
    this.setVisible(true);
    this.setPosition(myGame.player.x, myGame.player.y);

    this.body.reset(myGame.player.x, myGame.player.y);

    this.body.setSize(10, 10, true);

    var angle = Phaser.Geom.Line.Angle(new Phaser.Geom.Line(this.x, this.y, x, y));
    this.setAngle(angle * Phaser.Math.RAD_TO_DEG);

    this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

    this.body.velocity.x *= 2;
    this.body.velocity.y *= 2;
  },

  update: function(time, delta) {
    this.lifespan -= delta;

    if (this.lifespan <= 0) {
      this.kill();
    }
  },

  kill: function() {
    this.setActive(false);
    this.setVisible(false);
    this.body.stop();
  }

});