import { Bullet } from "../objects/bullet";
import { Enemy } from "../objects/enemy";
import { CONST } from "../const/const";

import * as idleImg from "../assets/idle.png";

import * as mapImg from "../assets/map.png";
import * as tilesImg from "../assets/dungeon-tileset.png";
import * as mapCsv from "../assets/map.csv";

import * as basicSha from "../shaders/basic.frag";

import * as spaceImg from "../assets/space.png";
import * as spaceJson from "../assets/space.json";

import * as explosionImg from "../assets/explosion.png";
import * as explosionJson from "../assets/explosion.json";


export class GamePlay extends Phaser.Scene {
  private score: number;
  private life: number;
  private lastFire: number;

  private player: Phaser.Physics.Arcade.Sprite;
  private enemies: Phaser.Physics.Arcade.Group;
  private bullets: Phaser.Physics.Arcade.Group;

  private helpText: Phaser.GameObjects.Text;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "GamePlay" });
  }

  init() {
    this.score = 0;
    this.life = 5;
    this.lastFire = 0;
  }

  preload(): void {
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

    this.load.atlas('space', spaceImg, spaceJson);
    this.load.atlas('explosion', explosionImg, explosionJson);
  }

  create(): void {
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

    this.add.shader('dimension', CONST.WIDTH / 2, CONST.HEIGHT / 2, CONST.WIDTH, CONST.HEIGHT, ['tex']);

    this.player = this.physics.add.sprite(40, 350, 'player').setDepth(2);
    this.player.setDamping(true);

    this.physics.add.collider(this.player, layer);

    var dimensions = [];
    dimensions.push(new Phaser.Geom.Rectangle(0, 0, CONST.WIDTH / 2, CONST.HEIGHT / 2));
    dimensions.push(new Phaser.Geom.Rectangle(CONST.WIDTH / 2, 0, CONST.WIDTH / 2, CONST.HEIGHT / 2));
    dimensions.push(new Phaser.Geom.Rectangle(0, CONST.HEIGHT / 2, CONST.WIDTH / 2, CONST.HEIGHT / 2));
    dimensions.push(new Phaser.Geom.Rectangle(CONST.WIDTH / 2, CONST.HEIGHT / 2, CONST.WIDTH / 2, CONST.HEIGHT / 2));

    /* Define Groups */
    this.enemies = this.physics.add.group({
      /* classType: Enemy, */
      maxSize: 60,
      runChildUpdate: true
    });

    let conf: Phaser.Types.GameObjects.Group.GroupCreateConfig = {
      classType: Bullet,
      maxSize: 30,
      runChildUpdate: true
    };

    this.bullets = this.physics.add.group(conf);

    /* Settings */
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.mouse.disableContextMenu();

    this.helpText = this.add.text(16, 16, this.updateText(), {
      fontSize: '18px',
      fill: '#ffffff'
    });
    this.helpText.setScrollFactor(0);

    var xparticles = this.add.particles('explosion');

    xparticles.createEmitter({
      frame: 'red',
      angle: { min: 0, max: 360, steps: 32 },
      lifespan: 1000,
      speed: 400,
      quantity: 32,
      scale: { start: 0.3, end: 0 },
      on: false
    });

    xparticles.createEmitter({
      frame: 'muzzleflash2',
      lifespan: 200,
      scale: { start: 2, end: 0 },
      rotate: { start: 0, end: 180 },
      on: false
    });

    this.physics.add.overlap(this.bullets, this.enemies,
      (bullet: Bullet, enemy: Enemy) => {
        xparticles.emitParticleAt(enemy.x, enemy.y);
        this.cameras.main.shake(500, 0.01);

        bullet.kill();
        enemy.kill();

        this.score++;
      },
      (bullet: Bullet, enemy: Enemy) => {
        return (bullet.active && enemy.active && Phaser.Geom.Rectangle.ContainsPoint(dimensions[enemy.getZone()], new Phaser.Geom.Point(enemy.x, enemy.y)));
      }, this);

    this.physics.add.collider(this.player, this.enemies,
      (player: Phaser.Physics.Arcade.Sprite, enemy: Enemy) => {
        xparticles.emitParticleAt(player.x, player.y);
        this.cameras.main.shake(500, 0.01);

        this.enemies.clear(true, true);
        this.life--;

        if (this.life == 0) {
          this.scene.restart();
          this.score = 0;
          this.life = 5;
        }
      },
      (player: Phaser.Physics.Arcade.Sprite, enemy: Enemy) => {
        return enemy.active
      }, this);
  }

  update(time: number): void {
    this.enemies.children.each((enemy: Enemy) => {
      let angle = Phaser.Geom.Line.Angle(new Phaser.Geom.Line(enemy.x, enemy.y, this.player.x, this.player.y));
      this.physics.velocityFromRotation(angle, enemy.getSpeed(), enemy.body.velocity);
    }, this);

    this.helpText.text = this.updateText();

    if (this.spawnEnemy()) {
      this.launchEnemy();
    }

    /* Control */
    this.player.setVelocity(0);
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-100);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(100);
    }
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-100);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(100);
    }

    /* Animation */
    if (this.cursors.left.isDown || this.cursors.right.isDown ||
      this.cursors.up.isDown || this.cursors.down.isDown) {
      this.player.anims.stop();
    } else {
      this.player.anims.play('idle', true);
    }

    /* Shoot */
    var pointer = this.input.activePointer;
    if (pointer.isDown && time > this.lastFire) {
      var bullet: Bullet = this.bullets.get();
      if (bullet) {
        bullet.fire(this.player, pointer.x, pointer.y);
        this.lastFire = time + 100;
      }
    }
  }

  private launchEnemy(): void {
    var b: Enemy = this.enemies.get();
    if (b) b.launch(this.player);
  }

  private spawnEnemy(): boolean {
    return (Math.random() > 0.99);
  }

  private updateText(): string {
    return (this.score == 0) ? 'Arrow keys to move.\nLeft click to shoot.\nWe must kill the enemies in their dimensions.' : 'Score : ' + this.score + '\nLife : ' + this.life;
  }

}
