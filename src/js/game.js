var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var isItRain = false;
var space;

var Game;

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
        // get player coordinates by ip
        $.ajax({
            type: 'POST',
            url: 'http://api.openweathermap.org/data/2.5/weather?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&appid=be8f9e0703a284102160943a4de841e0',
            success: function (e) {
                console.log('place: ' + e.name + ', weather: ' + e.weather[0].main);
                if (e.weather[0].main == 'rain') isItRain = true;
            }
        })
    });
} else {
    console.log('Geolocation is not supported for this Browser/OS version yet.');
}


function preload() {
    this.load.tilemapTiledJSON('map', 'maps/tilemap.json');
    this.load.image('sky', 'images/bg.jpg');
    this.load.image('ground', 'images/platform.png');
    this.load.image('star', 'images/star.png');
    this.load.image('bomb', 'images/bomb.png');
    this.load.image('rain', 'images/rain.png');
    this.load.spritesheet('hero1', 'images/girl1.png', { frameWidth: 113.77, frameHeight: 113.83 });
    this.load.spritesheet('hero2', 'images/girl2.png', { frameWidth: 113.77, frameHeight: 113.83 });
    this.load.spritesheet('blocks', 'images/tile2.png', { frameWidth: 70, frameHeight: 69.8 });
}

function create() {
    //  A simple background for our game
    var bg = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'sky');
    bg.width *= (this.game.config.height / bg.height);
    //bg.scale.y = bg.scale.x;

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, this.game.config.height - 32, 'ground').setScale(2).refreshBody();
    platforms.create(1200, this.game.config.height - 32, 'ground').setScale(2).refreshBody();
    platforms.create(2000, this.game.config.height - 32, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    function addPlatform(x, y, length, block) {
        for (let i = 0; i < length; i++) {
            let numb = 80;
            if (length != 1) {
                numb = (i === 0 ? block + 12 : (i === length - 1 ? block - 12 : block));
            }
            platforms.create(i * 70 + x, y, 'blocks', numb);
        }
    }

    addPlatform(720, 250, 4, 56);
    addPlatform(600, 400, 4, 56);
    addPlatform(50, 250, 4, 56);
    addPlatform(300, 600, 3, 56);
    addPlatform(500, 500, 1, 56);
    addPlatform(1200, 400, 5, 56);
    addPlatform(1500, 250, 3, 56);

    for (let i = 0; i < 1920 / 70; i++) {
        platforms.create(i * 70, this.game.config.height - 32, 'blocks', 103);
    }



    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'hero1');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('hero2', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: this.anims.generateFrameNumbers('hero2', { start: 6, end: 8 }),
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('hero1', { start: 6, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'fight',
        frames: this.anims.generateFrameNumbers('hero2', { start: 5, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 25,
        setXY: { x: 100, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    // rain
    //createRain(this);

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    this.cameras.main.startFollow(player);
    this.cameras.main.useBounds = true;

    function createRain(Game) {
        var particles = Game.add.particles('rain');
        var emitter = particles.createEmitter({
            x: { min: 0, max: 1000 },
            y: 0,
            speed: { min: 300, max: 500 },
            angle: 90,
            lifespan: 2000
        });
        emitter.setScale(0.5);
    };

    if (isItRain) createRain(this);
}

function update() {
    if (gameOver) {
        return;
    }

    space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else if (cursors.space.isDown) {
        player.anims.play('fight', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

export default Game = {
    preload: preload,
    create: create,
    update: update
}
