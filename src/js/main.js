import Game from './game';
import Menu from './menu';
import Phaser from 'phaser';

var config;

const h = window.innerHeight;
const w = window.innerWidth;

// changing canvas size after window resize
/*
window.onresize = () => {
    if (game) {
        game.canvas.height = window.innerHeight;
        game.canvas.width = game.canvas.height * (2040 / 768);
    }
}
*/

config = {
    type: Phaser.AUTO,
    width: w,
    height: h,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    // scene: {
    //    preload: preload,
    //    create: create,
    //    update: update
    // }
};

var game;

// Создание объекта game

function play() {
    game = new Phaser.Game(config);

    game.scene.add('Menu', Menu);
    game.scene.add('Game', Game);

    game.scene.start('Menu');
}

export default play;
