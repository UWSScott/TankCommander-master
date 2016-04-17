var myId=0;

var land;

var cursors;

var shadow;
var tank;
var turret;
var player;
var enemies;
var enemyBullets;
var enemiesTotal = 5;
var enemiesAlive = 0;
var tanksList;
var explosions;
var waveCount = 0;
var playerScore = 0;

var x,y;

var A_Key;
var D_Key;

var pickups;
var gas;

var spaceKey;
var single_tank;
var single_tank_turret;

var armour = 30;
var player = player;
var turretRotation =1;
var firingSpeed =500;
var rotationSpeed =1;
var damage =1;
var nextFire = 0;

var ammoCount = 0;
var fuelCount = 0;

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

var bullets;
var fireRate = 100;
var nextFire = 0;

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
    eurecaClient.exports.setId = function(id, size)
    {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        //console.log(id);
        //console.log(size);

        if(size == 2)
            isDriver = false;
        else
            isDriver = true;

        create();
        eurecaServer.handshake();
        ready = true;
    }

    eurecaClient.exports.kill = function(id)
    {
        if (tanksList[id]) {
            tanksList[id].kill();
            console.log('killing ', id, tanksList[id]);
        }
    }

    eurecaClient.exports.spawnEnemy = function(i, x, y)
    {

        if (i == myId) return; //this is me

        //console.log('SPAWN');

      var tnk = new Tank(i, game, tank);
       //var tnk = new Turret_Gunner(i, game, tank);
       tanksList[i] = tnk;
    }

    eurecaClient.exports.updateState = function(id, state)
    {
        if (tanksList[id])
        {
            tanksList[id].cursor = state;
           //if(isDriver)
            //{
                tanksList[id].tank.x = state.x;
                tanksList[id].tank.y = state.y;
                tanksList[id].tank.angle = state.angle;
                tanksList[id].ammoCount = state.ammoCount;
                tanksList[id].fuelCount = state.fuelCount;
                //tanksList[id].currentSpeed = state.currentSpeed;
                //tanksList[id]. = state.fuelCount;
            //} else {
                tanksList[id].turret.rotation = state.rot;
           // }
            tanksList[id].update();
        }
    }
}

Tank = function (index, game, player) {
    this.cursor = {
        left:false,
        right:false,
        up:false,
        fire:false
    }

    this.input = {
        left:false,
        right:false,
        up:false,
        fire:false
    }

    this.x = 0;
    this.y = 0;

    this.game = game;
    this.health = 30;
    this.player = player;
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);

    this.damage =5; //10
    this.armour =5; //10

    this.ammoCount =20;
    this.fuelCount =200;
    this.currentSpeed =0;
    this.nextFire = 0;
    this.fireRate = 500;
    this.dead = false;
    this.alive = true;

    this.shadow = game.add.sprite(this.x, this.y, 'shadow');
    this.tank = game.add.sprite(this.x, this.y, 'single_tank');
    this.turret = game.add.sprite(this.x, this.y, 'single_tank_turret');

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

/*Turret_Gunner = Tank.extend(function (index, game, player)
{
    this.tank.id = index;
    this.game = game;
    this.player = player;

});*/

Tank.prototype.update = function() {

    var inputChanged = (
        this.cursor.left != this.input.left ||
        this.cursor.right != this.input.right ||
        this.cursor.up != this.input.up ||
        this.cursor.fire != this.input.fire
    );


    if (inputChanged) {
        //Handle input change here
        //send new values to the server
        if (this.tank.id == myId) {
            // send latest valid state to the server
            this.input.x = this.tank.x;
            this.input.y = this.tank.y;
            this.input.angle = this.tank.angle;
            this.input.rot = this.turret.rotation;
            this.input.ammoCount = this.ammoCount;
            this.input.fuelCount = this.fuelCount;

            eurecaServer.handleKeys(this.input);
        }
    }

   //if(isDriver) {
        if (this.cursor.left) {
            this.tank.angle -= 1;
        } else if (this.cursor.right) {
            this.tank.angle += 1;
        }

        if (this.cursor.up) {
            //  The speed we'll travel at
            this.currentSpeed = 300;
        } else {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 4;
            }
        }
   // }

    //if(isDriver) {
        if (this.fuelCount <= 0) {
            this.currentSpeed = 0;
            this.tank.body.velocity = 0;
        }

        if (this.currentSpeed > 0 && this.fuelCount > 0) {
            game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
        } else {
            game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
        }
   //}
    if (this.cursor.fire) { this.fire(); }

    //player.cursor.fire = false;
    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;
    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
}

Tank.prototype.damage_Fun = function() {
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

Tank.prototype.fire = function()
{
   if (this.ammoCount <= 0 || this.alive == false) return;

    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {
        player.cursor.fire = true;
        this.nextFire = this.game.time.now + this.fireRate;
        console.log((this.game.time.now + " " + this.fireRate));
        var bullet = bullets.getFirstExists(false); //this.bullets.getFirstDead();
        bullet.reset(this.turret.x, this.turret.y);
        bullet.rotation = turret.rotation+1.5708;
        game.physics.arcade.velocityFromRotation(player.turret.rotation, 500, bullet.body.velocity);
        player.ammoCount--;
    }
}


 function fire ()
 {
     /*if(player.ammoCount <= 0 || player.alive == false)
     return;

     if (game.time.now > nextFire && bullets.countDead() > 0)
     {
         player.cursor.fire = true;
         nextFire = game.time.now + firingSpeed;
         var bullet = bullets.getFirstExists(false);
         bullet.reset(player.turret.x, player.turret.y);
         bullet.rotation = turret.rotation+1.5708;
         game.physics.arcade.velocityFromRotation(player.turret.rotation, 500, bullet.body.velocity);
         player.ammoCount--;
     }*/

     player.fire();
 }


EnemyTank = function (index, game, player, bullets)
{
    var x = game.world.randomX;
    var y = game.world.randomY;

    this.game = game;
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

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

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

function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);
    game.stage.disableVisibilityChange  = true;

    land = game.add.tileSprite(0, 0, 800, 600, 'ground');
    land.fixedToCamera = true;

    tanksList = {};

    player = new Tank(myId, game, tank);
    tanksList[myId] = player;
    player.alive = true;
    tank = player.tank;
    turret = player.turret;
    tank.x=0;
    tank.y=0;
    bullets = player.bullets;
    shadow = player.shadow;

    //  Explosion pool
    // explosions = game.add.group();

    /* for (var i = 0; i < 10; i++)
     {
     var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
     explosionAnimation.anchor.setTo(0.5, 0.5);
     explosionAnimation.animations.add('kaboom');
     }*/

    tank.bringToTop();
    turret.bringToTop();

    A_Key = game.input.keyboard.addKey(Phaser.Keyboard.A);
    D_Key = game.input.keyboard.addKey(Phaser.Keyboard.D);
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    cursors = game.input.keyboard.createCursorKeys();

    pickups = game.add.group();
    pickups.enableBody = true;
    gas = game.add.group();
    gas.enableBody = true;

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    //newWave();
    //spawnPickups();
    game.camera.follow(tank);
    //game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    //game.camera.focusOnXY(0, 0);


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


/*
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
 }*/


function update () {
    //do not update if client not ready
    if (!ready) return;

    //turret.rotation = game.physics.arcade.angleToPointer(turret);
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    player.input.left = cursors.left.isDown;
    player.input.right = cursors.right.isDown;
    player.input.up = cursors.up.isDown;
    player.input.fire = game.input.activePointer.isDown;
    player.input.tx = game.input.x+ game.camera.x;
    player.input.ty = game.input.y+ game.camera.y;

    var tank_count = 0;
    for (var i in tanksList)
    {
        tank_count++;
        //if (!tanksList[i]) continue;
        var curBullets = tanksList[i].bullets;
        if(isDriver)
        {
            player.turret.rotation = tanksList[i].turret.rotation;
            tanksList[i].tank.x = player.tank.x;
            tanksList[i].tank.y = player.tank.y;
            tanksList[i].tank.angle = player.tank.angle;
            tanksList[i].currentSpeed = player.currentSpeed;
            player.ammoCount = tanksList[i].ammoCount;
            tanksList[i].visible = false;
            tanksList[i].turret.bringToTop();

        } else {
            player.fuelCount = tanksList[i].fuelCount;
            player.currentSpeed = tanksList[i].currentSpeed;
            player.tank.x = tanksList[i].tank.x;
            player.tank.y = tanksList[i].tank.y;
            player.tank.angle = tanksList[i].tank.angle;

            player.turret.x = tanksList[i].turret.x;
            player.turret.y = tanksList[i].turret.y;
            tanksList[i].turret.rotation = player.turret.rotation;
            tanksList[i].ammoCount = player.ammoCount;
            player.turret.bringToTop();
            tanksList[i].visible = false;

            //console.log((player.ammoCount + " " +  tanksList[i].ammoCount + " " + i));
            //player.y = tanksList[i].y;
            // player.tank.angle = tanksList.angle;
            // console.log((player.x + " " +  tanksList[i].x));
        }

        var curBullets = tanksList[i].bullets;
        var curTank = tanksList[i].tank;
        for (var j in tanksList)
        {
            if (!tanksList[j]) continue;
            if (j!=i)
            {
                var targetTank = tanksList[j].tank;
                game.physics.arcade.overlap(tank, gas, collectGas, null, this);
                game.physics.arcade.overlap(tank, pickups, collectAmmo, null, this);
                //game.physics.arcade.overlap(curBullets, targetTank, collectAmmo, null, this);
            }
            if (tanksList[j].alive)
            {
                tanksList[j].update();
            }
            //console.log(tanksList[i].turret.rotation + " " +  tanksList[j].turret.rotation + " " + player.turret.rotation);
        }
    }

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
    //bullet.kill();
    //alert( "enemy name: "  + tank.name);
    if (getPenetration(game.rnd.integerInRange(1, 5), player.armour)) {
        player.alive = false;
        player.tank.kill();
        player.turret.kill();
        player.shadow.kill();
    }
}

function bulletHitEnemy (tank, bullet) {
    //bullet.kill();
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
