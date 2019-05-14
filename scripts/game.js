var config = {
  type: Phaser.AUTO,
  width: 512,
  height: 512,
  scene: {
    preload: preload,
    create: create,
    update: update,
    extend: {
      launchEnemy: launchEnemy
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0
      }
    }
  },
};

var game = new Phaser.Game(config);

var player;
var cursors;

var arena;
var helpText;

function preload() {
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

}

function create() {

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
  var shader = this.add.shader('dimension', config.width / 2, config.height / 2, config.width, config.height, ['tex']);

  player = this.physics.add.sprite(40, 350, 'player').setDepth(2);
  player.setDamping(true)

  arena = new Phaser.Geom.Rectangle(0, 0, config.width, config.height);

  enemies = this.physics.add.group({
    classType: Enemy,
    maxSize: 60,
    runChildUpdate: true
  });

  this.physics.add.collider(player, layer);

  cursors = this.input.keyboard.createCursorKeys();

  helpText = this.add.text(16, 16, getHelpMessage(), {
    fontSize: '18px',
    fill: '#ffffff'
  });
  helpText.setScrollFactor(0);

  for (var i = 0; i < 6; i++) {
    this.launchEnemy();
  }
}

function launchEnemy() {
  var b = enemies.get();

  if (b) {
    b.launch();
  }
}

function update() {
  if (spawnEnemy()) {
    //this.launchEnemy();
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
}

function getHelpMessage() {
  return 'Arrow keys to move.';
}