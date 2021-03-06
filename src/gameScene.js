import Phaser from "phaser";

class GameScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'game'
        });
        this.xCursors = null;
        this.xPlayer = null;
        this.xStars = null;
        this.xScore = 0;
        this.xScoreText = '';
        this.xGameOver = false;
        this.xBombs = null;
        this.xBonuses = null;
        this.xLevel = 0;
    }

    init(data) { }
    preload() { }

    create(data) {
        this.xGameOver = false;
        this.xScore = 0;
        this.xLevel = 0;
        this.add.image(400, 300, 'sky');

        let platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        this.xPlayer = this.physics.add.sprite(100, 450, 'dude');

        this.xPlayer.setBounce(0);
        this.xPlayer.setCollideWorldBounds(true);

        this.xPlayer.body.setGravityY(300)

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });


        this.xCursors = this.input.keyboard.createCursorKeys();

        this.xStars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.xStars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        this.xBonuses = this.physics.add.group();

        this.xScoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        this.xBombs = this.physics.add.group();

        this.physics.add.collider(this.xBombs, platforms);
        this.physics.add.collider(this.xPlayer, this.xBombs, this.hitBomb, null, this);

        this.physics.add.collider(this.xPlayer, platforms);
        this.physics.add.collider(this.xStars, platforms);
        this.physics.add.overlap(this.xPlayer, this.xStars, this.collectStar, null, this);

        this.physics.add.collider(this.xBonuses, platforms);
        this.physics.add.overlap(this.xPlayer, this.xBonuses, this.collectBonus, null, this);
    }
    update(time, delta) {
        if (this.xCursors.left.isDown) {
            this.xPlayer.setVelocityX(-160);

            if (!this.xGameOver) this.xPlayer.anims.play('left', true);
        }
        else if (this.xCursors.right.isDown) {
            this.xPlayer.setVelocityX(160);
            if (!this.xGameOver) this.xPlayer.anims.play('right', true);
        }
        else {
            this.xPlayer.setVelocityX(0);
            if (!this.xGameOver) this.xPlayer.anims.play('turn');
        }

        if (this.xCursors.up.isDown && this.xPlayer.body.touching.down) {
            this.sound.play('jump', { loop: false });
            this.xPlayer.setVelocityY(-550);
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        this.sound.play('oof', { loop: false });
        this.xGameOver = true;
        setTimeout(() => {
            this.scene.start("menu");
        }, 1500);
    }

    collectBonus(player, bonus) {
        bonus.disableBody(true, true);
        this.xScore += 100;
        this.xScoreText.setText('Score: ' + this.xScore);
        this.sound.play('point', { loop: false });
    }

    collectStar(player, star) {
        star.disableBody(true, true);
        this.xScore += 10;
        this.xScoreText.setText('Score: ' + this.xScore);

        if (this.xStars.countActive(true) === 0) {
            this.xLevel += 1;
            this.xStars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);

            });

            this.xBonuses.children.iterate(function (child) {

                child.disableBody(true, true);

            });

            let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            let bomb = this.xBombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

            let pos = random_item(bonusPos);
            let bonus = this.xBonuses.create(pos.x, pos.y, 'bonus');
            bonus.setCollideWorldBounds(true);

            this.sound.play('lvlUp', { loop: false });
        }
        else {
            this.sound.play('point', { loop: false });
        }

    }
}

let bonusPos = [
    { x: 30, y: 420 },
    { x: 180, y: 130 },
    { x: 400, y: 240 }
]

function random_item(items) {

    return items[Math.floor(Math.random() * items.length)];

}

export default GameScene;

