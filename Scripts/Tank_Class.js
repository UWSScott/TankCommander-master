/**
 * Created by B00252403 on 22/03/2016.
 */
var land;
var shadow;
var tank;
var turret;
var player;
var cursors;
var currentSpeed;
var currentSpeed = 0;
var cursors;


var armour = 30;
var player = player;
var turretRotation =1;
var firingSpeed =500;
var rotationSpeed =1;
var damage =1;
var nextFire = 0;
var bullets;
var spaceKey;
var single_tank;
var single_tank_turret;
var A_Key;
var D_Key;

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

    var xPosition = 0;
    var yPosition = 0;

    this.game = game;
    this.armour = 30;
    this.player = player;
    this.turretRotation =1;
    this.firingSpeed =500;
    this.rotationSpeed =1;
    this.damage =1;


    this.currentSpeed =0;

    this.nextFire = 0;
    this.dead = false;

    this.shadow = game.add.sprite(xPosition, yPosition, 'enemy', 'shadow');
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

/*Tank.prototype.update = function() {
    alert("got here");


    for (var i in this.input) this.cursors[i] = this.input[i];
    if (this.cursor.left)
    {
        alert("hi");
        this.tank.angle -= 1;
    }
    else if (this.cursors.right) // this works
    {
        this.tank.angle += 1;
    }
    if (this.cursors.up)
    {
        //  The speed we'll travel at
        this.currentSpeed = 300;
    }
    else
    {
        if (this.currentSpeed > 0)
        {
            this.currentSpeed -= 4;
        }
    }

    if (this.currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
    }
    else
    {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
    }

    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
};*/

Tank.prototype.update = function() {

    for (var i in this.input) this.cursor[i] = this.input[i];



    if (this.cursor.left)
    {
        alert("HIHIHIHIH");
        this.tank.angle -= 1;
    }
    else if (this.cursor.right)
    {
        this.tank.angle += 1;
    }
    if (this.cursor.up)
    {
        //  The speed we'll travel at
        this.currentSpeed = 300;
    }
    else
    {
        if (this.currentSpeed > 0)
        {
            this.currentSpeed -= 4;
        }
    }
    if (this.cursor.fire)
    {
        this.fire({x:this.cursor.tx, y:this.cursor.ty});
    }



    if (this.currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
    }
    else
    {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
    }



    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
};

function fire ()
{
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + firingSpeed;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        //bullet.rotation = turretRotation;
        alert("turret rotation:" + turret.rotation);
       game.physics.arcade.velocityFromRotation(turret.rotation, 500, bullet.body.velocity);
    }

}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Tank Commander', { preload: preload, create: create, update: update, render: render });

function preload () {
    game.load.image('single_tank_turret', 'assets/Tank_Turret_001.png');
    game.load.image('single_tank', 'assets/Tank_001.png');
    game.load.image('ground', 'assets/Terrain_Snow.jpg');
}



function create ()
{
    game.world.setBounds(-1000, -1000, 2000, 2000);
    game.stage.disableVisibilityChange  = true;

    land = game.add.tileSprite(0, 0, 800, 600, 'ground');
    land.fixedToCamera = true;

    player = new Tank(0, game, tank);
    tank = player.tank;
    turret = player.turret;
    tank.x=0;
    tank.y=0;
    shadow = player.shadow;

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

    tank.bringToTop();
    turret.bringToTop();

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    //cursor = game.input.keyboard.createCursorKeys();
    cursors = game.input.keyboard.createCursorKeys();

}

/*function update () {
    player.input.left = cursors.left.isDown;
    player.input.right = cursors.right.isDown;
    player.input.up = cursors.up.isDown;
    player.input.fire = game.input.activePointer.isDown;
    player.input.tx = game.input.x+ game.camera.x;
    player.input.ty = game.input.y+ game.camera.y;

    turret.rotation = game.physics.arcade.angleToPointer(turret);
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;
    player.tank.update();

}*/

function update () {

    if (cursors.left.isDown)
    {
        tank.angle -= 4;
    }
    else if (cursors.right.isDown)
    {
        tank.angle += 4;
    }

    if (cursors.up.isDown)
    {
        //  The speed we'll travel at
        currentSpeed = 300;
    }
    else
    {
        if (currentSpeed > 0)
        {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
    }

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    //  Position all the parts and align rotations
    shadow.x = tank.x;
    shadow.y = tank.y;
    shadow.rotation = tank.rotation;

    turret.x = tank.x;
    turret.y = tank.y;

    if (A_Key.isDown)
    {
        turret.rotation -= 0.1;
    }
    else if (D_Key.isDown)
    {
        turret.rotation += 0.1;
    }

    //turret.rotation = game.physics.arcade.angleToPointer(turret);

    if (spaceKey.isDown)//  activePointer.isDown)
    {
        fire();
    }
}

function render () {}

