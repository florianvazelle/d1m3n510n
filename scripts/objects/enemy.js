var Enemy = new Phaser.Class({

  Extends: Phaser.Physics.Arcade.Sprite,

  initialize:

    function Enemy(scene) {
      Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'player');

      this.setDepth(1);

      this.zone = 0;
      this.hit = true;
      this.speed = 100;
      this.target = new Phaser.Geom.Point();
    },

  launch: function() {
    this.play('idle');

    var zone_colors = [0x0c3d6f, 0x764f55, 0x214531, 0xff0000];
    this.zone = Math.floor(Math.random() * zone_colors.length);
    this.setTintFill(zone_colors[this.zone]);

    var p = new Phaser.Geom.Point();
    Phaser.Geom.Rectangle.Random(arena, p);

    this.speed = Phaser.Math.Between(50, 75);

    this.setActive(true);
    this.setVisible(true);
    this.setPosition(p.x, p.y);

    this.body.reset(p.x, p.y);
  },

  update: function(time, delta) {
    var angle = Phaser.Geom.Line.Angle(new Phaser.Geom.Line(this.x, this.y, player.x, player.y));
    this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
  },

  kill: function() {
    this.setActive(false);
    this.setVisible(false);
    this.body.stop();
    this.scene.launchEnemy();
  }

});
