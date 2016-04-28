//Menu Vars
var player_1_Ready = false;
var player_2_Ready = false;
var inMenu = true;
var background;
var TitleText;
var Player_1_Text;
var Player_2_Text;
var music;
var style = { font: "65px Arial Black", fill: "#8F5402", align: "center" }; //Impact
var normalStyle = { font: "22px Arial Black", fill: "#ff0044", align: "center" }; //Impact

//Game Vars
var myId=0;
var land;
var cursors;
var shadow;
var tank;
var turret;
var player;
var enemies;
var enemyBullets;
var enemiesTotal = 4;
var enemiesAlive = 0;
var tanksList;
var explosions;
var waveCount = 0;
var playerScore = 0;
var x,y;

var A_Key;
var D_Key;

var gas_pickups = new Array();
var ammo_pickups = new Array();
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

var explosions;
var ready = false;
var eurecaServer;
var locationOfData;


var locationT = {
    x:40,
    y:50
}

var fb = new Firebase("https://tankcommander.firebaseio.com/"), locations = {}, result_box = document.getElementById("result");
var ItemLocation = fb.child("/ItemPickups")

if (fb) {
    // This gets a reference to the 'location" node.
    //console.log(locationOfData);
   /* var fbLocation = fb.child("/location");
    // Now we can install event handlers for nodes added, changed and removed.
    fbLocation.on('child_added', function (sn) {
        var data = sn.val();
        console.dir({'added': data});
        locations[sn.key()] = data;
    });
    fbLocation.on('child_changed', function (sn) {
        var data = sn.val();
        locations[sn.key()] = data;
        console.dir({'moved': data})
    });
    fbLocation.on('child_removed', function (sn) {
        var data = sn.val();
        delete locations[sn.key()];
        console.dir(({'removed': data}));
    });*/
}

function getKey(name){
    var loc;
    for(loc in locations){
        if(locations[loc].player === name){
            return loc;
        }
    }
    return null;
}
function addLocation(database, x, y) {
    // Prevent a duplicate name...
    if (getKey(name)) return;
    // Name is valid - go ahead and add it...
    fb.child("/location").push({
        player: name,
        x: x,
        y: y,
        timestamp: Firebase.ServerValue.TIMESTAMP
    }, function(err) {
        if(err) console.dir(err);
    });
}

function pickupItems(database, name, x, y) {
    if (getKey(name)) return;
    fb.child("/"+database).push({
        itemName: name,
        x: x,
        y: y,
    }, function(err) {
        if(err) console.dir(err);
    });
}

function sendTankInfo(database, name, x, y, rotation, currentSpeed, damage, armour) {
    if (getKey(name)) return;
    fb.child("/"+database).push({
        tankID: name,
        x: x,
        y: y,
        rotation: rotation,
        speed: currentSpeed,
        turretDmg: damage,
        tankArm: armour
    }, function(err) {
        if(err) console.dir(err);
    });
}


function setTankInformation(database, name, x, y, rotation, currentSpeed, damage, armour) {
    //if (getKey(name)) return;
   // console.log(rotation);
    fb.child("/"+database+"/"+name).set({
        tankID: name,
        x: x,
        y: y,
        rotation: rotation,
        speed: currentSpeed,
        turretDmg: damage,
        tankArm: armour
    });
}

function getTankInformation(database, name, index)
{
   var messagesRef = fb.child("/"+database+"/"+name);
    messagesRef.on("value", function (allMessagesSnapshot) {
        var xPos = allMessagesSnapshot.child("x").val();
        var yPos = allMessagesSnapshot.child("y").val();
        var rotation = allMessagesSnapshot.child("rotation").val();
        var turretDMG = allMessagesSnapshot.child("turretDmg").val();
        var tankARM = allMessagesSnapshot.child("tankArm").val();

        //console.log("HERE "+ xPos + " " + yPos + " " + rotation);

        enemies[index].tank.x = xPos;
        enemies[index].tank.y = yPos;
        enemies[index].tank.angle = rotation;
        enemies[index].damage = turretDMG;
        enemies[index].armour = tankARM;
    });
}

function getPickupItems(database, name, index, arr){
    var messagesRef = fb.child("/"+database);
        messagesRef.on("value", function (allMessagesSnapshot) {
            allMessagesSnapshot.forEach(function (messageSnapshot) {
                if (messageSnapshot.child("itemName").val() == name) {
                    var xPos = messageSnapshot.child("x").val();
                    var yPos = messageSnapshot.child("y").val();
                    if (arr === "AMMO") {
                        ammo_pickups[index].x = xPos;
                        ammo_pickups[index].y = yPos;
                    } else if (arr === "FUEL") {
                        gas_pickups[index].x = xPos;
                        gas_pickups[index].y = yPos;
                    } else {
                        //console.log(("DISASTER!"));
                    }
                }
            });
        });
}

function clearPickupItems(database)
{
    fb.child("/"+database).remove();
  /*  var messagesRef = fb.child("/"+database);
    console.log((messagesRef.text));

    messagesRef.on("value", function (allMessagesSnapshot)
    {
        allMessagesSnapshot.forEach(function (messageSnapshot)
        {
            fb.child("/"+database).remove();
        });
    });*/
}

function updateTankData(database)
{
    var messagesRef = fb.child("/"+database);
    //console.log((messagesRef.text));

     messagesRef.on("value", function (allMessagesSnapshot)
     {
         allMessagesSnapshot.forEach(function (messageSnapshot)
         {
            fb.child("/"+database).remove();

         });
     });
}

function removeLocation(ref){
    fb.child("/"+ ref).set(null, function(err){
        if (err) console.dir(err);
    });
}

function updateLocation(ref, database, name, x, y){
    fb.child("/"+database+"/" + ref).set({
        player: name,
        x: x,
        y: y,
        timestamp: Firebase.ServerValue.TIMESTAMP
    }, function(err) {
        if(err) {
            console.dir(err);
        }
    });
}

//this function will handle client communication with the server
var eurecaClientSetup = function() {
    //create an instance of eureca.io client
    var eurecaClient = new Eureca.Client();

    eurecaClient.ready(function (proxy) {
        eurecaServer = proxy;
    });

    //methods defined under "exports" namespace become available in the server side
    eurecaClient.exports.setId = function(id, size)//, s_ammoPickups, s_gasPickups)
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
        /*if(s_ammoPickups != null && s_gasPickups != null)
        {
            player.ammo_pickups = s_ammoPickups;
            player.gas_pickups = s_gasPickups;
        }*/

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
                tanksList[id].currentSpeed = state.currentSpeed;
                tanksList[id].isInGame = state.isInGame;
               // tanksList[id].ammo_pickups = state.ammo_pickups;
               // tanksList[id].gas_pickups = state.gas_pickups;
                tanksList[id].turret.rotation = state.rot;
           // }
            tanksList[id].update();
        }
    }
}

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
    this.tank.body.immovable = false;
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

        /*if (this.cursor.up) {
            //  The speed we'll travel at
            this.currentSpeed = 300;
        } else if(this) {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 4;
            }
        }*/
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

function fire ()
{
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

    this.turretdamage = game.rnd.integerInRange(1, 5);
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
    this.tank.body.bounce.setTo(100, 100);

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
    game.physics.arcade.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);

    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300)
    {
        if (this.game.time.now > this.nextFire /*&& this.bullets.countDead() > 0*/)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstExists(false); //this.bullets.getFirstDead();
            bullet.reset(this.turret.x, this.turret.y);
            bullet.rotation = this.turret.rotation+1.5708;
            game.physics.arcade.velocityFromRotation(this.turret.rotation, 500, bullet.body.velocity);
        }
    }
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Tank Commander', { preload: preload, create: eurecaClientSetup, update: update, render: render });

var button_Start;
var button_End;
var Image_Player_1;
var Image_Player_2;
/*var mainState = {
    preload: function() {
        game.load.image('start_Button', 'assets/start_button.png');
        game.load.image('exit_Button', 'assets/exit-button-md.png');
        game.load.image('image_Ready', 'assets/statusReady.png');
    },

    create: function() {
        button_Start = game.add.button(game.world.centerX - 95, 450, 'start_Button', exit_Program, this, 2, 1, 0);
        button_End = game.add.button(game.world.centerX - 95, 600, 'exit_Button', exit_Program, this, 2, 1, 0);
        //button = game.add.button(game.world.centerX - 95, 400, 'button', actionOnClick, this, 2, 1, 0);
    },

    update: function() {
        // This function is called 60 times per second
        // It contains the game's logic
    },
};*/
//game.state.add('main', mainState, true);

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
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);

    game.load.image('start_Button', 'assets/start_button.png');
    game.load.image('exit_Button', 'assets/exit-button-md.png');
    game.load.image('image_Ready', 'assets/statusReady.png');
    game.load.image('image_Menu', 'assets/MenuImage.png');
    game.load.audio('Menu_Music', ['assets/Menu_Music.mp3', 'assets/audio/bodenstaendig_2000_in_rock_4bit.ogg']);
}

function create () {
    game.world.setBounds(-1000, -1000, 2000, 2000);
    game.stage.disableVisibilityChange  = true;

    land = game.add.tileSprite(0, 0, 800, 600, 'ground');
    land.fixedToCamera = true;

    tanksList = {};

    if(isDriver) { //To prevent both windows playing music at the same time (for demo purposes).
        music = game.add.audio('Menu_Music');
        music.play();
    }

    player = new Tank(myId, game, tank);
    tanksList[myId] = player;
    player.alive = true;
    tank = player.tank;
    turret = player.turret;
    tank.x=0;
    tank.y=0;
    bullets = player.bullets;
    shadow = player.shadow;
    player.isInGame =  false;;//(player_1_Ready && player_2_Ready);
    //console.log(player_1_Ready && player_2_Ready);

    explosions = game.add.group();
    for (var i = 0; i < 10; i++)
    {
         var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
         explosionAnimation.anchor.setTo(0.5, 0.5);
         explosionAnimation.animations.add('kaboom');
    }

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

    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    newWave();

    if(isDriver)
    {
        for (var i = 0; i < enemies.length; i++)
        {
            sendTankInfo("TankData", enemies[i].tank.name, enemies[i].tank.x, enemies[i].tank.y, enemies[i].tank.angle, enemies[i].tank.body.velocity, enemies[i].turretdamage, enemies[i].armour);
        }
    } else {
        for (var i = 0; i < enemies.length; i++)
        {
            getTankInformation("TankData", enemies[i].tank.name, i); //"TankData", enemies[i].tank.name, enemies[i].tank.x, enemies[i].tank.y, enemies[i].tank.rotation);
           // console.log(enemies[i].tank.name + " " + enemies[i].tank.x + " " + enemies[i].tank.y + " " + enemies[i].tank.angle);
        }
    }

    if(isDriver) {
        for (var i = 0; i <= 4; i++) {
            pickupItems("GasItems", "Gas"+i, gas_pickups[i].x, gas_pickups[i].y);
        }
        for (var i = 0; i <= 4; i++) {
            pickupItems("ItemPickups", "Items" + i, ammo_pickups[i].x, ammo_pickups[i].y);
        }
    } else {
        for (var i = 0; i <= 4; i++) {
            getPickupItems("GasItems", "Gas" + i, i, "FUEL");
        }
        for (var i = 0; i <= 4; i++) {
            getPickupItems("ItemPickups", "Items" + i, i, "AMMO");
        }
    }

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

    background = game.add.button(0, 0, 'image_Menu', exit_Program, this, 2, 1, 0);
    Image_Player_1 = game.add.button(30, 40, 'image_Ready', exit_Program, this, 2, 1, 0);
    Image_Player_2 = game.add.button(600, 40, 'image_Ready', exit_Program, this, 2, 1, 0);
    button_Start = game.add.button(250, 450, 'start_Button', start_Program, this, 2, 1, 0);
    Player_1_Text = game.add.text(-360, -280, "Player 1:", normalStyle);
    Player_2_Text = game.add.text(210, -280, "Player 2:", normalStyle);
    TitleText = game.add.text(-350, 70, "TANK COMMANDER", style);
    TitleText.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 0);
    Image_Player_1.fixedToCamera = true;
    Image_Player_2.fixedToCamera = true;
    background.fixedToCamera = true;
    button_Start.fixedToCamera = true;

    if(isDriver)
        game.time.events.add(Phaser.Timer.SECOND * 4, tankTimedUpdate, this);
    else
        game.time.events.add(Phaser.Timer.SECOND * 5, tankTimedUpdate, this);
 }


function update () {
    //do not update if client not ready
    if (!ready) return;

    //inMenu = true;
    //background.visible = inMenu;
    //!player.isInGame;

    console.log(isDriver + " ingame: " + player.isInGame);

    if(player.isInGame == false)
    {
        background.visible = true;
        Image_Player_1.visible = player_1_Ready;
        Image_Player_2.visible = player_2_Ready;
        button_Start.visible = true;
        TitleText.visible = true;
        Player_1_Text.visible = true;
        Player_2_Text.visible = true;
        tank.visible = false;

        var offset = moveToXY(game.input.activePointer, TitleText.x, TitleText.y, 8);
        TitleText.setShadow(offset.x, offset.y, 'rgba(0, 0, 0, 0.5)', distanceToPointer(TitleText, game.input.activePointer) / 30);

        var tankCount = 0;
        for (var i in tanksList) { tankCount++; tanksList[i].tank.visible = false; tanksList[i].turret.visible = false; tanksList[i].shadow.visible = false; }
        for (var i = 0; i < enemies.length; i++) { enemies[i].visible = false; }

        tank.visible = false;

        if(tankCount > 1)
        {
            player_1_Ready = true;
            player_2_Ready = true;
        }

    } else {
        background.visible = false;
        Image_Player_1.visible = false;
        Image_Player_2.visible = false;
        button_Start.visible = false;
        TitleText.visible = false;
        tank.visible = true;
        player.tank.visible = true;
        player.turret.visible = true;
        player.shadow.visible = true;
        Player_1_Text.visible = false;
        Player_2_Text.visible = false;

        //turret.rotation = game.physics.arcade.angleToPointer(turret);
        land.tilePosition.x = -game.camera.x;
        land.tilePosition.y = -game.camera.y;

        player.input.left = cursors.left.isDown;
        player.input.right = cursors.right.isDown;
        player.input.up = cursors.up.isDown;
        player.input.fire = game.input.activePointer.isDown;
        player.input.tx = game.input.x + game.camera.x;
        player.input.ty = game.input.y + game.camera.y;


        var tank_count = 0;
        for (var i in tanksList) {
            tank_count++;
            var curBullets = tanksList[i].bullets;
            if (isDriver) {
                player.turret.rotation = tanksList[i].turret.rotation;
                tanksList[i].tank.x = player.tank.x;
                tanksList[i].tank.y = player.tank.y;
                tanksList[i].tank.angle = player.tank.angle;
                tanksList[i].currentSpeed = player.currentSpeed;
                player.ammoCount = tanksList[i].ammoCount;
                tanksList[i].visible = false;
                //player.isInGame = tanksList[i].isInGame;
                tanksList[i].turret.bringToTop();
            } else {
                player.fuelCount = tanksList[i].fuelCount;
                player.currentSpeed = tanksList[i].currentSpeed;
                player.tank.x = tanksList[i].tank.x;
                player.tank.y = tanksList[i].tank.y;
                player.tank.angle = tanksList[i].tank.angle;
                player.turret.x = tanksList[i].turret.x;
                player.turret.y = tanksList[i].turret.y;
                player.isInGame = tanksList[i].isInGame;
                tanksList[i].turret.rotation = player.turret.rotation;
                player.turret.bringToTop();
                tanksList[i].visible = false;
            }

            var curBullets = tanksList[i].bullets;
            var curTank = tanksList[i].tank;
            for (var j in tanksList) {
                if (!tanksList[j]) continue;
                if (j != i) {
                    var targetTank = tanksList[j].tank;
                    game.physics.arcade.overlap(tank, gas, collectGas, null, this);
                    game.physics.arcade.overlap(tank, pickups, collectAmmo, null, this);
                    //game.physics.arcade.overlap(curBullets, targetTank, collectAmmo, null, this);
                }
                if (tanksList[j].alive) {
                    tanksList[j].update();
                }
            }
        }

        enemiesAlive = 0;

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].alive) {
                enemiesAlive++;
                enemies[i].visible = true;
                game.physics.arcade.collide(tank, enemies[i].tank);
                game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
                enemies[i].update();
            }
        }

        if (enemiesAlive == 0) {
            newWave();
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
    enemiesTotal++;
    enemiesAlive = enemiesTotal;

    for (var i = 0; i < enemiesTotal; i++) { enemies.push(new EnemyTank(i, game, tank, enemyBullets)); }
}

function spawnPickups()
{
    funvariable = 0;
    for (var i = 0; i <= 4; i++) {
        ammo_pickups.push(pickups.create(game.rnd.integerInRange(-1000, 2000), game.rnd.integerInRange(-1000, 2000), 'pickups'));
        gas_pickups.push(gas.create(game.rnd.integerInRange(-1000, 2000), game.rnd.integerInRange(-1000, 2000), 'gas'));
    }

    if(isDriver) {
        clearPickupItems("GasItems");
        clearPickupItems("ItemPickups");

        for (var i = 0; i <= 4; i++) {
            pickupItems("GasItems", "Gas"+i, gas_pickups[i].x, gas_pickups[i].y);
        }
        for (var i = 0; i <= 4; i++) {
            pickupItems("ItemPickups", "Items" + i, ammo_pickups[i].x, ammo_pickups[i].y);
        }
    } else {
        for (var i = 0; i <= 4; i++) {
            getPickupItems("GasItems", "Gas" + i, i, "FUEL");
        }
        for (var i = 0; i <= 4; i++) {
            getPickupItems("ItemPickups", "Items" + i, i, "AMMO");
        }
    }
}

function rotateTurret_Right()
{
    player.turret.rotation += 0.1;
}

function bulletHitPlayer (tank, bullet)
{
    if (getPenetration(game.rnd.integerInRange(1, 5), player.armour)) {
        player.alive = false;
        player.tank.kill();
        player.turret.kill();
        player.shadow.kill();
        inMenu = true;
    }
}

function bulletHitEnemy (tank, bullet) {

    if (getPenetration(player.damage, enemies[tank.name].armour))
    {
        playerScore += 10;
        enemies[tank.name].damage_Fun();
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }
}

function render () {
    if (!ready || player.isInGame == false) return;

    if(player.alive) {
        game.debug.text('Wave Count: ' + waveCount, 600, 15);
        game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 600, 30);
        game.debug.text('Ammo: ' + player.ammoCount, 600, 45);
        game.debug.text('Fuel: ' + player.fuelCount, 600, 60);
        game.debug.text('Player Score: ' + playerScore, 600, 75);
        if(enemies[0] != null)
            game.debug.text('Enemy: ' + enemies[0].tank.x + " " + enemies[0].tank.y + " rot: " + enemies[0].tank.angle, 50, 100);
    } else {
        game.debug.text('No more fun variable for you.' , 270, 300);
    }
}

function tankTimedUpdate()
{
    for (var i = 0; i < enemies.length; i++)
    {
        if(isDriver){ setTankInformation("TankData", enemies[i].tank.name, enemies[i].tank.x, enemies[i].tank.y, enemies[i].tank.angle, enemies[i].tank.body.velocity, enemies[i].turretdamage, enemies[i].armour); game.time.events.add(Phaser.Timer.SECOND * 4, tankTimedUpdate, this); }
        else { getTankInformation("TankData", enemies[i].tank.name, i); game.time.events.add(Phaser.Timer.SECOND * 5, tankTimedUpdate, this); }
    }
}

function getPenetration(damageValue, armourValue) {
    var Dmg = game.rnd.integerInRange(0, damageValue);
    var Arm = game.rnd.integerInRange(0, armourValue);
    if(Dmg > Arm)
        return true;
    return false;
}

function rotate_turret_left() { player.turret.rotation -= 0.1; }
function rotate_turret_right() { player.turret.rotation += 0.1; }

function drive_forward() { player.currentSpeed = 300; }
function drive_pause() { player.currentSpeed -= 100; if(player.currentSpeed <0) player.currentSpeed = 0; }
function drive_rotate_Right() { player.tank.angle += 4; }
function drive_rotate_Left() { player.tank.angle -= 4; }

function set_button_left_f() { b_left_down = false; }
function set_button_right_f() { b_right_down = false; }
function set_button_left_t() { b_left_down = true; }
function set_button_right_t() { b_right_down = true; }

function set_button_up(setTo) { b_up_down = setTo; }
function set_button_down(setTo) { b_down_down = setTo; }

function start_Program()
{
    if(player_1_Ready && player_2_Ready) {
        if(isDriver)
            music.stop();
        player.isInGame = true;
    }
    //inMenu = false;
}

function exit_Program()
{
    console.log("I am error.");
}



function distanceToPointer(displayObject, pointer) {

    this._dx = displayObject.x - pointer.x;
    this._dy = displayObject.y - pointer.y;

    return Math.sqrt(this._dx * this._dx + this._dy * this._dy);

}

function moveToXY(displayObject, x, y, speed) {

    var _angle = Math.atan2(y - displayObject.y, x - displayObject.x);

    var x = Math.cos(_angle) * speed;
    var y = Math.sin(_angle) * speed;

    return { x: x, y: y };

}