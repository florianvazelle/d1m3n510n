import myGame from "./GlobalVariables.js"

import Bullet from "./Bullet.js"
import Enemy from "./Enemy.js"
import Utils from "./Utils.js"

import idleImg from "../assets/idle.png"

import mapImg from "../assets/map.png"
import tilesImg from "../assets/dungeon-tileset.png"
import mapCsv from "../assets/map.csv"

import basicSha from "../shaders/basic.frag"

import spaceImg from "../assets/space.png"
import spaceJso from "../assets/space.json"

import explosionImg from "../assets/explosion.png"
import explosionJso from "../assets/explosion.json"

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
    this.load.spritesheet(
      "player",
      idleImg, {
        frameWidth: 16,
        frameHeight: 16
      });

    this.load.image('tex', mapImg);
    this.load.image('tiles', tilesImg);
    this.load.tilemapCSV('map', mapCsv);

    this.load.glsl('dimension', basicSha);

    this.load.atlas('space', spaceImg, spaceJso);
    this.load.atlas('explosion', explosionImg, explosionJso);
  },

  create: function() {
    var map = this.make.tilemap({
      key: 'map',
      tileWidth: 16,
      tileHeight: 16
    });
    var tileset = map.addTilesetImage('tiles');
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
    var shader = this.add.shader('dimension', myGame.width / 2, myGame.height / 2, myGame.width, myGame.height, ['tex']);

    myGame.player = this.physics.add.sprite(40, 350, 'player').setDepth(2);
    myGame.player.setDamping(true);

    this.physics.add.collider(myGame.player, layer);

    var dimensions = [];
    dimensions.push(new Phaser.Geom.Rectangle(0, 0, myGame.width / 2, myGame.height / 2));
    dimensions.push(new Phaser.Geom.Rectangle(myGame.width / 2, 0, myGame.width / 2, myGame.height / 2));
    dimensions.push(new Phaser.Geom.Rectangle(0, myGame.height / 2, myGame.width / 2, myGame.height / 2));
    dimensions.push(new Phaser.Geom.Rectangle(myGame.width / 2, myGame.height / 2, myGame.width / 2, myGame.height / 2));

    /* Define Groups */
    myGame.enemies = this.physics.add.group({
      classType: Enemy,
      maxSize: 60,
      runChildUpdate: true
    });

    myGame.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 30,
      runChildUpdate: true
    });

    /* Settings */
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.mouse.disableContextMenu();

    this.helpText = this.add.text(16, 16, Utils.updateText(this.score, this.life), {
      fontSize: '18px',
      fill: '#ffffff'
    });
    this.helpText.setScrollFactor(0);

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

    this.physics.add.overlap(myGame.bullets, myGame.enemies,
      (bullet, enemy) => {
        xparticles.emitParticleAt(enemy.x, enemy.y);
        this.cameras.main.shake(500, 0.01);

        bullet.kill();
        enemy.kill();

        this.score++;
      },
      (bullet, enemy) => {
        return (bullet.active && enemy.active && Phaser.Geom.Rectangle.ContainsPoint(dimensions[enemy.zone], new Phaser.Geom.Point(enemy.x, enemy.y)));
      }, this);

    this.physics.add.collider(myGame.player, myGame.enemies,
      (player, enemy) => {
        xparticles.emitParticleAt(player.x, player.y);
        this.cameras.main.shake(500, 0.01);

        myGame.enemies.clear(true, true);
        this.life--;

        if (this.life == 0) {
          this.scene.restart();
          this.score = 0;
          this.life = 5;
        }
      },
      (player, enemy) => {
        return enemy.active
      }, this);
  },

  launchEnemy: function() {
    var b = myGame.enemies.get();
    if (b) b.launch();
  },

  update: function(time) {
    this.helpText.text = Utils.updateText(this.score, this.life);

    if (Utils.spawnEnemy()) {
      this.launchEnemy();
    }

    /* Control */
    myGame.player.body.setVelocity(0);
    if (this.cursors.left.isDown) {
      myGame.player.body.setVelocityX(-100);
    } else if (this.cursors.right.isDown) {
      myGame.player.body.setVelocityX(100);
    }
    if (this.cursors.up.isDown) {
      myGame.player.body.setVelocityY(-100);
    } else if (this.cursors.down.isDown) {
      myGame.player.body.setVelocityY(100);
    }

    /* Animation */
    if (this.cursors.left.isDown || this.cursors.right.isDown ||
      this.cursors.up.isDown || this.cursors.down.isDown) {
      myGame.player.anims.stop();
    } else {
      myGame.player.anims.play('idle', true);
    }

    /* Shoot */
    var pointer = this.input.activePointer;
    if (pointer.isDown && time > myGame.lastFire) {
      var bullet = myGame.bullets.get();
      if (bullet) {
        bullet.fire(pointer.x, pointer.y);
        myGame.lastFire = time + 100;
      }
    }
  }
});

myGame.scenes.push(gamePlayState);

export default myGame;