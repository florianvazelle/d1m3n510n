var config = {
    type: Phaser.AUTO,
    width: 720,
    heigth: 560,
    scene: {
        preload: preload,
        create: create,
        update: update
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

var layers = [];

function preload() {
    this.load.image('player', './assets/link.png');

    this.load.image('map', './assets/map.png');
    this.load.image('tiles', './assets/dungeon-tileset.png');
    this.load.tilemapCSV('map2', './assets/map.csv');

    this.load.glsl('dimension', './shaders/basic.frag');
}

function create() {
    /*var map = this.make.tilemap({
        key: 'map',
        tileWidth: 16,
        tileHeight: 16
    });
    var tileset = map.addTilesetImage('tiles');
    layers.push(map.createStaticLayer(0, tileset, (800 - 720) / 2, (600 - 560)));

    map.setCollision(1, 3, 4, 19, 21, 22, 23, 39);*/

    var shader = this.add.shader('dimension', 360, 280, 720, 560, ['map']);

    player = this.physics.add.sprite(40, 300, 'player');
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
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
}