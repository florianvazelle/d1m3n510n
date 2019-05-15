var gamePlayState = new Phaser.Class({

  Extends: Phaser.Scene,
  initialize: function GamePlay() {
    Phaser.Scene.call(this, {
      key: 'GamePlay'
    });

    this.score = 0;
    this.life = 5;
  },

  preload: function() {
    this.load.image('tex', 'assets/map.png');
    this.load.spritesheet(
      "player",
      "assets/idle.png", {
        frameWidth: 16,
        frameHeight: 16
      });

    this.load.image('tiles', './assets/dungeon-tileset.png');
    this.load.tilemapCSV('map', './assets/map.csv');

    this.load.glsl('dimension', 'shaders/basic.frag');

    this.load.atlas('space', 'assets/space.png', 'assets/space.json');
    this.load.atlas('explosion', 'assets/explosion.png', 'assets/explosion.json');
  },

  create: function() {
    var map = this.make.tilemap({
      key: 'map',
      tileWidth: 16,
      tileHeight: 16
    });
    //var tileset = map.addTilesetImage('tiles');
    var layer = map.createStaticLayer(0, tileset, 0, 0);

    map.setCollision([1, 3, 4, 19, 21, 22, 23, 39]);

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 1
      }),
      frameRate: 5,
      repeat: -1
    });
    var shader = this.add.shader('dimension', config.width / 2, config.height / 2, config.width, config.height, ['tex']);

    player = this.physics.add.sprite(40, 350, 'player').setDepth(2);
    player.setDamping(true)

    arena = new Phaser.Geom.Rectangle(0, 0, config.width, config.height);
    var dimensions = [];
    dimensions.push(new Phaser.Geom.Rectangle(0, 0, config.width / 2, config.height / 2));
    dimensions.push(new Phaser.Geom.Rectangle(config.width / 2, 0, config.width / 2, config.height / 2));
    dimensions.push(new Phaser.Geom.Rectangle(0, config.height / 2, config.width / 2, config.height / 2));
    dimensions.push(new Phaser.Geom.Rectangle(config.width / 2, config.height / 2, config.width / 2, config.height / 2));

    enemies = this.physics.add.group({
      classType: Enemy,
      maxSize: 60,
      runChildUpdate: true
    });

    bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 30,
      runChildUpdate: true
    });

    this.physics.add.collider(player, layer);

    cursors = this.input.keyboard.createCursorKeys();

    helpText = this.add.text(16, 16, () => {
      return (this.score == 0) ? 'Arrow keys to move.' : 'Score : ' + this.score + '\nLife : ' + this.life;
    }, {
      fontSize: '18px',
      fill: '#ffffff'
    });
    helpText.setScrollFactor(0);

    for (var i = 0; i < 6; i++) {
      //this.launchEnemy();
    }

    var xparticles = this.add.particles('explosion');
    xparticles.createEmitter({
      frame: 'red',
      angle: {
        min: 0,
        max: 360,
        steps: 32
      },
      lifespan: 1000,
      speed: 400,
      quantity: 32,
      scale: {
        start: 0.3,
        end: 0
      },
      on: false
    });

    xparticles.createEmitter({
      frame: 'muzzleflash2',
      lifespan: 200,
      scale: {
        start: 2,
        end: 0
      },
      rotate: {
        start: 0,
        end: 180
      },
      on: false
    });

    this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
      xparticles.emitParticleAt(enemy.x, enemy.y);

      this.cameras.main.shake(500, 0.01);
      this.score += 1;

      bullet.kill();
      enemy.kill();
    }, (bullet, enemy) => {
      return (bullet.active && enemy.active && Phaser.Geom.Rectangle.ContainsPoint(dimensions[enemy.zone], new Phaser.Geom.Point(enemy.x, enemy.y)))
    }, this);

    this.physics.add.collider(player, enemies, (player, enemy) => {
      xparticles.emitParticleAt(player.x, player.y);

      this.cameras.main.shake(500, 0.01);
      this.life--;

      enemies.clear(true, true);

      if (this.life == 0) {
        this.scene.restart();
      }
    }, (player, enemy) => {
      return enemy.active
    }, this);

    this.input.mouse.disableContextMenu();
  },

  extend: {
    launchEnemy: function() {
      var b = enemies.get();

      if (b) {
        b.launch();
      }
    }
  },

  update: function() {
    if (spawnEnemy()) {
      this.launchEnemy();
    }

    player.body.setVelocity(0);
    if (cursors.left.isDown) {
      player.body.setVelocityX(-100);
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(100);
    }

    if (cursors.up.isDown) {
      player.body.setVelocityY(-100);
    } else if (cursors.down.isDown) {
      player.body.setVelocityY(100);
    }

    if (cursors.left.isDown || cursors.right.isDown ||
      cursors.up.isDown || cursors.down.isDown) {
      player.anims.stop();
    } else {
      player.anims.play('idle', true);
    }

    var pointer = this.input.activePointer;

    if (pointer.isDown && time > lastFire) {
      var bullet = bullets.get();

      if (bullet) {
        bullet.fire(pointer.x, pointer.y);

        lastFire = time + 100;
      }
    }
  }
});

myGame.scenes.push(gamePlayState);