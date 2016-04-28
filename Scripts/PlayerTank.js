/**
 * Created by Scott on 28/04/2016.
 */
Tank = function (index, game, player)
{
    this.cursor = {
        left:false,
        right:false,
        up:false,
        fire:false,
        inGame:false
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

    //this.isInGame = false;
    this.damage =5; //10
    this.armour =5; //10

    //this.ammo_pickups = new Array();
    //this.gas_pickups = new Array();

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
    this.tank.body.immovable = true;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);
    this.tank.angle = 0;

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);

    if(isDriver)
    {
        player_1_Ready = true;
    } else {
        player_1_Ready = true;
        player_2_Ready = true;
    }

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
        this.cursor.fire != this.input.fire ||
        this.cursor.isInGame != this.input.isInGame
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
            this.input.currentSpeed = this.currentSpeed;
            this.input.isInGame = this.isInGame;
            eurecaServer.handleKeys(this.input);
        }
    }

    if (this.cursor.left) {
        this.tank.angle -= 1;
    } else if (this.cursor.right) {
        this.tank.angle += 1;
    }

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

Tank.prototype.fire = function() {
    if (this.ammoCount <= 0 || this.alive == false) return;

    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {
        //player.cursor.fire = true;
        this.nextFire = this.game.time.now + this.fireRate;
        console.log((this.game.time.now + " " + this.fireRate));
        var bullet = bullets.getFirstExists(false); //this.bullets.getFirstDead();
        bullet.reset(this.turret.x, this.turret.y);
        bullet.rotation = turret.rotation+1.5708;
        game.physics.arcade.velocityFromRotation(player.turret.rotation, 500, bullet.body.velocity);

        // if(isDriver)
        player.ammoCount--;
    }
}