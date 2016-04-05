/**
 * Created by B00252403 && B00231451 on 22/03/2016.
 */

var land;
var shadow;
var tank;
var turret;
var player;
//var cursors;
var currentSpeed;
var currentSpeed = 0;
var cursors;

var enemies;
var enemyBullets;
var enemiesTotal = 5;
var enemiesAlive = 0;
var tanksList;

var armour = 30;
var player = player;
var turretRotation =1;
var firingSpeed =500;
var rotationSpeed =1;
var damage =1;
var nextFire = 0;

var ammoCount = 0;
var fuelCount = 0;

var bullets;
var waveCount = 0;
var playerScore = 0;

var spaceKey;
var single_tank;
var single_tank_turret;

var A_Key;
var D_Key;

var pickups;
var gas;

var fire_Button;
var rotate_Button_L;
var rotate_Button_R;
var drive_Button_U;
var drive_Button_D;
var drive_Rotate_Button_L;
var drive_Rotate_Button_R;

var gas_pickups = new Array();
var ammo_pickups = new Array();
var funvariable  = 0;

var isDriver = true;

var b_left_down = false;
var b_right_down = false;
var b_up_down = false;
var b_down_down = false;


var ready = false;
var eurecaServer;
//this function will handle client communication with the server
var eurecaClientSetup = function() {
    //create an instance of eureca.io client
    var eurecaClient = new Eureca.Client();

    eurecaClient.ready(function (proxy) {
        eurecaServer = proxy;
    });

    //methods defined under "exports" namespace become available in the server side
    eurecaClient.exports.setId = function(id)
    {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    }

    eurecaClient.exports.kill = function(id)
    {
        if (enemies[id]) {
            enemies[id].kill();
            console.log('killing ', id, enemies[id]);
        }
    }

    eurecaClient.exports.spawnEnemy = function(i, x, y)
    {
        if (i == myId) return; //this is me

        console.log('SPAWN');
        var tnk = new Tank(i, game, tank);
        enemies[i] = tnk;
    }

    eurecaClient.exports.updateState = function(id, state)
    {
        if (enemies[id]) {
            enemies[id].cursor = state;
            enemies[id].tank.x = state.x;
            enemies[id].tank.y = state.y;
            enemies[id].tank.angle = state.angle;
            enemies[id].turret.rotation = state.rot;
            enemies[id].update();
        }
    }
}


Tank = function (index, game, player) {

    /*this.cursor = {
        left:false,
        right:false,
        up:false,
        fire:false
    }*/
    this.cursor = game.input.keyboard.createCursorKeys();

    this.input = {
        left:false,
        right:false,
        up:false,
        fire:false
    }

    var xPosition = 0;
    var yPosition = 0;

    this.game = game;
    this.player = player;

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);

    this.turretRotation =1;
    this.firingSpeed =500;
    this.rotationSpeed =1;

    this.damage =5; //10
    this.armour =5; //10

    this.ammoCount =20;
    this.fuelCount =200;
    this.currentSpeed =0;
    this.nextFire = 0;
    this.dead = false;

    this.shadow = game.add.sprite(xPosition, yPosition, 'shadow');
    this.tank = game.add.sprite(xPosition, yPosition, 'single_tank');
    this.turret = game.add.sprite(xPosition, yPosition, 'single_tank_turret');

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.id = index;
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);

    this.tank.angle = 0;

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
};

Tank.prototype.update = function() {

    //alert("alive: " + this.alive);
    //console.log("is alive? " + this.alive);

    if(this.alive)
    {
        if (isDriver) {
            if (cursors.left.isDown) {
                drive_rotate_Left();
            }
            else if (cursors.right.isDown) {
                drive_rotate_Right();
            }

            if (cursors.up.isDown) {
                this.currentSpeed = 300;
            }
            else {
                if (this.currentSpeed > 0) {
                    this.currentSpeed -= 4;
                }
            }
        } else {
            if (A_Key.isDown) {
                rotate_turret_left();
            }
            if (D_Key.isDown) {
                rotate_turret_right();
            }
        }
    }

    if (this.fuelCount <= 0) {
        this.currentSpeed = 0;
        this.tank.body.velocity = 0;
    }

    if (this.currentSpeed > 0 && this.fuelCount > 0) {
        this.fuelCount -= 0.1;
        game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
    }

    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;
    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;

    if (spaceKey.isDown) { fire(); }
};

Tank.prototype.damage_Fun = function()
{
    this.shadow.kill();
    this.tank.kill();
    this.turret.kill();
}

Tank.prototype.kill = function() {
    this.alive = false;
    this.tank.kill();
    this.turret.kill();
    this.shadow.kill();
}


EnemyTank = function (index, game, player, bullets)
{
    var x = game.world.randomX;
    var y = game.world.randomY;

    this.game = game;
    this.health = 3;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;

    this.damage = game.rnd.integerInRange(1, 5);
    this.armour = game.rnd.integerInRange(1, 5);

    this.shadow = game.add.sprite(x, y, 'shadow');
    this.tank = game.add.sprite(x, y, 'single_tank');
    this.turret = game.add.sprite(x, y, 'single_tank_turret');

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);

    this.tank.angle = game.rnd.angle();
    //this.tank.rotation = this.tank.angle;

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);
};

EnemyTank.prototype.damage_Fun = function()
{
    this.alive = false;
    this.shadow.kill();
    this.tank.kill();
    this.turret.kill();
}

EnemyTank.prototype.update = function()
{
    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;
    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300)
    {
        if (this.game.time.now > this.nextFire /*&& this.bullets.countDead() > 0*/)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.turret.x, this.turret.y);
            bullet.rotation = this.turret.rotation+1.5708;
            game.physics.arcade.velocityFromRotation(this.turret.rotation, 500, bullet.body.velocity);
        }
    }
};

function fire ()
{
    if(player.ammoCount <= 0 || player.alive == false)
        return;

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + firingSpeed;
        var bullet = bullets.getFirstExists(false);
        bullet.reset(player.turret.x, player.turret.y);
        bullet.rotation = turret.rotation+1.5708;
        game.physics.arcade.velocityFromRotation(player.turret.rotation, 500, bullet.body.velocity);
        player.ammoCount--;
    }
}

//var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Tank Commander', { preload: preload, create: create, update: update, render: render });
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Tank Commander', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload ()
{
    game.load.image('rotateButton_L', 'assets/arrow_L.png');
    game.load.image('rotateButton_R', 'assets/arrow_R.png');
    game.load.image('rotateButton_U', 'assets/arrow_U.png');
    game.load.image('rotateButton_D', 'assets/arrow_D.png');

    game.load.image('fireButton', 'assets/fireButton.png');
    game.load.image('shadow', 'assets/shadow.png');
    game.load.image('single_tank_turret', 'assets/Tank_Turret_001.png');
    game.load.image('single_tank', 'assets/Tank_001.png');
    game.load.image('ground', 'assets/Terrain_Snow.jpg');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('pickups', 'assets/ammo.png');
    game.load.image('gas', 'assets/gas.png');
}

function create ()
{
    game.world.setBounds(-1000, -1000, 2000, 2000);
    game.stage.disableVisibilityChange  = true;
    land = game.add.tileSprite(0, 0, 800, 600, 'ground');
    land.fixedToCamera = true;

    enemies = [];
    player = new Tank(0, game, tank);
    player.alive = true;
    tank = player.tank;
    enemies[myId] = player;

    turret = player.turret;
    tank.x=0;
    tank.y=0;
    shadow = player.shadow;


    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    A_Key = game.input.keyboard.addKey(Phaser.Keyboard.A);
    D_Key = game.input.keyboard.addKey(Phaser.Keyboard.D);
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    cursors = game.input.keyboard.createCursorKeys();

    tank.bringToTop();
    turret.bringToTop();

    pickups = game.add.group();
    pickups.enableBody = true;
    gas = game.add.group();
    gas.enableBody = true;

   // newWave();
    //spawnPickups();
    game.camera.follow(tank);


    if(isDriver == false) {
        fire_Button = game.add.button(650, 450, 'fireButton', fire, this, 2, 1, 0);
        fire_Button.fixedToCamera = true;

        rotate_Button_L = game.add.button(10, 450, 'rotateButton_L', rotate_turret_left, this, 2, 1, 0);
        rotate_Button_R = game.add.button(200, 450, 'rotateButton_R', rotate_turret_right, this, 2, 1, 0);
        rotate_Button_L.fixedToCamera = true;
        rotate_Button_R.fixedToCamera = true;
    } else {
        drive_Button_U = game.add.button(650, 350, 'rotateButton_U', drive_forward, this, 2, 1, 0);
        drive_Button_D = game.add.button(650, 500, 'rotateButton_D', drive_pause, this, 2, 1, 0);
        drive_Button_U.fixedToCamera = true;
        drive_Button_D.fixedToCamera = true;

        drive_Rotate_Button_L = game.add.button(10, 450, 'rotateButton_L', drive_rotate_Left, this, 2, 1, 0);
        drive_Rotate_Button_R = game.add.button(200, 450, 'rotateButton_R', drive_rotate_Right, this, 2, 1, 0);
        drive_Rotate_Button_L.fixedToCamera = true;
        drive_Rotate_Button_R.fixedToCamera = true;
    }
}

function update () {
    if (!ready) return;

    game.physics.arcade.overlap(enemyBullets, tank, bulletHitPlayer, null, this);
    enemiesAlive = 0;

   /* for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].alive){
            enemiesAlive++;
            game.physics.arcade.collide(tank, enemies[i].tank);
            game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }*/

   // if (enemiesAlive == 0) { newWave(); }


    //player.update();

    for (var i in enemies)
    {
        if (!enemies[i]) continue;
        var curBullets = enemies[i].bullets;
        var curTank = enemies[i].tank;
        for (var j in enemies)
        {
            if (!enemies[j]) continue;
            if (j!=i)
            {

                var targetTank = enemies[j].tank;

                game.physics.arcade.overlap(curBullets, targetTank, bulletHitPlayer, null, this);

            }
            if (enemies[j].alive)
            {
                enemies[j].update();
            }
        }
    }

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    game.physics.arcade.overlap(tank, gas, collectGas, null, this);
    game.physics.arcade.overlap(tank, pickups, collectAmmo, null, this);
}

function collectGas (player2, gas)
{
    gas.kill();
    player.fuelCount += 250;
    funvariable++;
    //alert("fuel gas: " + player.fuelCount)
}

function collectAmmo(player2, pickups)
{
    pickups.kill();
    player.ammoCount += 25;
    funvariable++;
}

function newWave(player, pickups)
{
    spawnPickups();
    waveCount++;
    enemies = [];
    enemiesTotal++;// = 20;
    enemiesAlive = enemiesTotal;

    for (var i = 0; i < enemiesTotal; i++)
    {
        enemies.push(new EnemyTank(i, game, tank, enemyBullets));
    }
}

function spawnPickups()
{
    funvariable = 0;
    for (var i = 0; i <= 4; i++)
    {
        ammo_pickups.push(pickups.create(game.rnd.integerInRange(-1000, 2000), game.rnd.integerInRange(-1000, 2000), 'pickups'));
        gas_pickups.push(gas.create(game.rnd.integerInRange(-1000, 2000), game.rnd.integerInRange(-1000, 2000), 'gas'));
    }
}


function rotateTurret_Right()
{
    player.turret.rotation += 0.1;
}

function bulletHitPlayer (tank, bullet)
{
    bullet.kill();
    //alert( "enemy name: "  + tank.name);
    if (getPenetration(game.rnd.integerInRange(1, 5), player.armour)) {
        player.alive = false;
        player.tank.kill();
        player.turret.kill();
        player.shadow.kill();
    }
}

function bulletHitEnemy (tank, bullet) {
    bullet.kill();
    if (getPenetration(player.damage, enemies[tank.name].armour))
    {
        playerScore += 10;
        enemies[tank.name].damage_Fun();
    }
}

function render () {
    if (!ready) return;

    if(player.alive) {
        game.debug.text('Wave Count: ' + waveCount, 600, 15);
        game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 600, 30);
        game.debug.text('Ammo: ' + player.ammoCount, 600, 45);
        game.debug.text('Fuel: ' + player.fuelCount, 600, 60);
        game.debug.text('Player Score: ' + playerScore, 600, 75);
    } else {
        game.debug.text('No more fun variable for you.' , 270, 300);
    }
}


function getPenetration(damageValue, armourValue)
{
    var Dmg = game.rnd.integerInRange(0, damageValue);
    var Arm = game.rnd.integerInRange(0, armourValue);
    if(Dmg > Arm)
        return true;
    return false;
}




function rotate_turret_left() { player.turret.rotation -= 0.1; }
function rotate_turret_right() { player.turret.rotation += 0.1; }

function drive_forward() { player.currentSpeed = 300; }
function drive_pause() { player.currentSpeed -= 4; if(player.currentSpeed <0) player.currentSpeed = 0; }
function drive_rotate_Right() { player.tank.angle += 4; }
function drive_rotate_Left() { player.tank.angle -= 4; }



function set_button_left_f() { b_left_down = false; }
function set_button_right_f() { b_right_down = false; }
function set_button_left_t() { b_left_down = true; }
function set_button_right_t() { b_right_down = true; }

function set_button_up(setTo) { b_up_down = setTo; }
function set_button_down(setTo) { b_down_down = setTo; }