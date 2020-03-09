import "../../shared/vendor/pixi.4.5.5.min.js"; //adds PIXI to global scope

let Application = PIXI.Application,
  Container = PIXI.Container,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Graphics = PIXI.Graphics,
  TextureCache = PIXI.utils.TextureCache,
  Sprite = PIXI.Sprite,
  Text = PIXI.Text,
  TextStyle = PIXI.TextStyle;

let target;
function Target({ x, y }) {
  this.x = x;
  this.y = y;
}
Target.prototype.cancel = function () {
  target = undefined;
};

Target.prototype.next = function (player) {
  if (!target || !player) {
    return undefined;
  }
  // look at player's speed and current position
  const diff = {
    x: Math.floor(this.x - player.x),
    y: Math.floor(this.y - player.y)
  };

  // move towards target at player speed
  let vx = 0, vy = 0;
  if (diff.x > 0) {
    vx = (player.speed || 5);
  }
  if (diff.x < 0) {
    vx = -1 * (player.speed || 5);
  }
  if (diff.y > 0) {
    vy = (player.speed || 5);
  }
  if (diff.y < 0) {
    vy = -1 * (player.speed || 5);
  }

  //overshoot problem!

  // sometimes diff is less than player speed
  if (diff.x !== 0 && Math.abs(diff.x) < (player.speed || 5)) {
    vx = diff.x;
  }
  if (diff.y !== 0 && Math.abs(diff.y) < (player.speed || 5)) {
    vy = diff.y;
  }

  if (vx === 0 && vy === 0) {
    this.cancel();
    return undefined;
  }

  // change player's velocity based on speed and distance from target
  return {
    vx, vy
  };
};

function loadImage(app) {
  function loadProgressHandler(loader, resource) {
    console.log("loading: " + resource.url);
    console.log("progress: " + loader.progress + "%");
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let state, explorer, treasure, blobs, chimes, exit, player, dungeon,
    door, healthBar, message, gameScene, gameOverScene, enemies, id;
  const OFFSET_X = 0.5 * window.innerWidth - 256;
  const OFFSET_Y = 70;

  function setup() {

    //Make the game scene and add it to the stage
    gameScene = new Container();
    app.stage.addChild(gameScene);

    //Make the sprites and add them to the `gameScene`
    //Create an alias for the texture atlas frame ids
    id = resources["images/treasureHunter.json"].textures;

    //Dungeon
    function dungeonInteract() {
      const ignoredEvents = [
        'mousemove', 'mouseover', 'mouseout',
        'mouseup', 'touchend'
      ];
      if (arguments[0].type && ignoredEvents.includes(arguments[0].type)) {
        return;
      }
      target = new Target(arguments[0].data.global);
    };
    const dungeon = makeDungeon(id, OFFSET_X, OFFSET_Y, dungeonInteract);
    gameScene.addChild(dungeon);

    //Door
    door = new Sprite(id["door.png"]);
    door.position.set(92 + OFFSET_X, OFFSET_Y);
    gameScene.addChild(door);

    //Explorer
    explorer = new Sprite(id["explorer.png"]);
    explorer.x = 68 + OFFSET_X;
    explorer.y = gameScene.height / 2 - explorer.height / 2 + OFFSET_Y;
    explorer.vx = 0;
    explorer.vy = 0;
    gameScene.addChild(explorer);

    //Treasure
    treasure = new Sprite(id["treasure.png"]);
    treasure.x = OFFSET_X + gameScene.width - treasure.width - 48;
    treasure.y = OFFSET_Y + gameScene.height / 2 - treasure.height / 2;
    gameScene.addChild(treasure);

    //Make the blobs
    let numberOfBlobs = 6,
      spacing = 48,
      xOffset = OFFSET_X + 150,
      speed = 2,
      direction = 1;

    //An array to store all the blob monsters
    blobs = [];

    //Make as many blobs as there are `numberOfBlobs`
    for (let i = 0; i < numberOfBlobs; i++) {

      //Make a blob
      let blob = new Sprite(id["blob.png"]);

      //Space each blob horizontally according to the `spacing` value.
      //`xOffset` determines the point from the left of the screen
      //at which the first blob should be added
      let x = spacing * i + xOffset;

      //Give the blob a random y position
      let y = randomInt(0, app.stage.height - blob.height);

      //Set the blob's position
      blob.x = x;
      blob.y = y;

      //Set the blob's vertical velocity. `direction` will be either `1` or
      //`-1`. `1` means the enemy will move down and `-1` means the blob will
      //move up. Multiplying `direction` by `speed` determines the blob's
      //vertical direction
      blob.vy = speed * direction;

      //Reverse the direction for the next blob
      direction *= -1;

      blob.tint = (Math.random() / 4 + .75) * 0xFFFFFF;

      //Push the blob into the `blobs` array
      blobs.push(blob);


      //Add the blob to the `gameScene`
      gameScene.addChild(blob);
    }

    //Create the health bar
    healthBar = new Container();
    healthBar.position.set(app.stage.width - 170 + OFFSET_X, 4 + OFFSET_Y)
    gameScene.addChild(healthBar);

    //Create the black background rectangle
    let innerBar = new Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    //Create the front red rectangle
    let outerBar = new Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    healthBar.outer = outerBar;

    //Create the `gameOver` scene
    gameOverScene = new Container();
    app.stage.addChild(gameOverScene);

    //Make the `gameOver` scene invisible when the game first starts
    gameOverScene.visible = false;

    //Create the text sprite and add it to the `gameOver` scene
    let style = new TextStyle({
      fontFamily: "Futura",
      fontSize: 64,
      fill: "white"
    });
    message = new Text("The End!", style);
    message.x = OFFSET_X + 120;
    message.y = app.stage.height / 2 - 32 + OFFSET_Y;
    gameOverScene.addChild(message);

    //Capture the keyboard arrow keys
    let left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40);

    //Left arrow key `press` method
    left.press = function () {

      //Change the explorer's velocity when the key is pressed
      explorer.vx = -5;
      explorer.vy = 0;
    };

    //Left arrow key `release` method
    left.release = function () {

      //If the left arrow has been released, and the right arrow isn't down,
      //and the explorer isn't moving vertically:
      //Stop the explorer
      if (!right.isDown && explorer.vy === 0) {
        explorer.vx = 0;
      }
    };

    //Up
    up.press = function () {
      explorer.vy = -5;
      explorer.vx = 0;
    };
    up.release = function () {
      if (!down.isDown && explorer.vx === 0) {
        explorer.vy = 0;
      }
    };

    //Right
    right.press = function () {
      explorer.vx = 5;
      explorer.vy = 0;
    };
    right.release = function () {
      if (!left.isDown && explorer.vy === 0) {
        explorer.vx = 0;
      }
    };

    //Down
    down.press = function () {
      explorer.vy = 5;
      explorer.vx = 0;
    };
    down.release = function () {
      if (!up.isDown && explorer.vx === 0) {
        explorer.vy = 0;
      }
    };

    //Set the game state
    state = play;

    //Start the game loop
    app.ticker.add(delta => gameLoop(delta));
  }


  function gameLoop(delta) {
    if (target) {
      const next = target.next(explorer);
      if (next) {
        explorer.vy = next.vy;
        explorer.vx = next.vx;
        //console.log(JSON.stringify({ next }));
      } else {
        explorer.vy = 0;
        explorer.vx = 0;
      }
    }
    //Update the current game state:
    state(delta);
  }

  function play(delta) {


    //use the explorer's velocity to make it move
    explorer.x += explorer.vx;
    explorer.y += explorer.vy;

    //Contain the explorer inside the area of the dungeon
    contain(explorer, { x: 28 + OFFSET_X, y: 10 + OFFSET_Y, width: 488 + OFFSET_X, height: 480 + OFFSET_Y });
    //contain(explorer, stage);

    //Set `explorerHit` to `false` before checking for a collision
    let explorerHit = false;

    //Loop through all the sprites in the `enemies` array
    blobs.forEach(function (blob) {

      //Move the blob
      blob.y += blob.vy;

      //Check the blob's screen boundaries
      let blobHitsWall = contain(blob, { x: 28 + OFFSET_X, y: 10 + OFFSET_Y, width: 488 + OFFSET_X, height: 480 + OFFSET_Y });

      //If the blob hits the top or bottom of the stage, reverse
      //its direction
      if (blobHitsWall === "top" || blobHitsWall === "bottom") {
        blob.vy *= -1;
      }

      //Test for a collision. If any of the enemies are touching
      //the explorer, set `explorerHit` to `true`
      if (hitTestRectangle(explorer, blob)) {
        explorerHit = true;
      }
    });

    //If the explorer is hit...
    if (explorerHit) {

      //Make the explorer semi-transparent
      explorer.alpha = 0.5;

      //Reduce the width of the health bar's inner rectangle by 1 pixel
      healthBar.outer.width -= 1;

    } else {

      //Make the explorer fully opaque (non-transparent) if it hasn't been hit
      explorer.alpha = 1;
    }

    //Check for a collision between the explorer and the treasure
    if (hitTestRectangle(explorer, treasure)) {

      //If the treasure is touching the explorer, center it over the explorer
      treasure.x = explorer.x + 8;
      treasure.y = explorer.y + 8;
    }

    //Does the explorer have enough health? If the width of the `innerBar`
    //is less than zero, end the game and display "You lost!"
    if (healthBar.outer.width < 0) {
      state = end;
      message.text = "You lost!";
    }

    //If the explorer has brought the treasure to the exit,
    //end the game and display "You won!"
    if (hitTestRectangle(treasure, door)) {
      state = end;
      message.text = "You won!";
    }
  }

  function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
  }

  /* Helper functions */

  function contain(sprite, container) {

    let collision = undefined;

    //Left
    if (sprite.x < container.x) {
      sprite.x = container.x;
      collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
      sprite.y = container.y;
      collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
      sprite.x = container.width - sprite.width;
      collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
      sprite.y = container.height - sprite.height;
      collision = "bottom";
    }

    //Return the `collision` value
    return collision;
  }

  //The `hitTestRectangle` function
  function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

      //A collision might be occurring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {

        //There's definitely a collision happening
        hit = true;
      } else {

        //There's no collision on the y axis
        hit = false;
      }
    } else {

      //There's no collision on the x axis
      hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
  };


  //The `randomInt` helper function
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  //The `keyboard` helper function
  function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function (event) {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function (event) {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
      "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
      "keyup", key.upHandler.bind(key), false
    );
    return key;
  }


  loader
    .add([
      "images/cat.png",
      "images/blob.png",
      "images/tileset.png",
      "images/explorer.png",
      "images/treasureHunter.json"
    ])
    .on("progress", loadProgressHandler)
    .load(setup);
}

function makeDungeon(id, OFFSET_X, OFFSET_Y, interactCallback) {
  const dungeon = new Sprite(id["dungeon.png"]);
  dungeon.position.set(OFFSET_X, OFFSET_Y);

  dungeon
    .on('mousedown', interactCallback)
    .on('touchstart', interactCallback)
    .on('mouseup', interactCallback)
    .on('touchend', interactCallback)
    .on('mouseupoutside', interactCallback)
    .on('touchendoutside', interactCallback)
    .on('mouseover', interactCallback)
    .on('mouseout', interactCallback);
  dungeon.interactive = true;

  return dungeon;
}

function pixi() {
  //OMG danger!!!
  const backupNodeListForEach = NodeList.prototype.forEach;
  NodeList.prototype.forEach = Array.prototype.forEach;

  // Use the native window resolution as the default resolution
  // will support high-density displays when rendering
  PIXI.settings.RESOLUTION = window.devicePixelRatio;

  // Disable interpolation when scaling, will make texture be pixelated
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  const pixiSections = document.querySelectorAll('pixi-section');
  pixiSections.forEach((el) => {
    let app = new Application({
      width: 512,
      height: 512,
      antialiasing: false,
      transparent: true,
      resolution: 2
    });
    app.renderer.view.style.position = "absolute"
    app.renderer.view.style.width = "100%";
    app.renderer.view.style.height = "100%";
    app.renderer.view.style.display = "block";
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.renderer.backgroundColor = "red";

    loadImage(app);

    el.appendChild(app.view);
    el.classList.remove('loading');
  });

  NodeList.prototype.forEach = backupNodeListForEach;
}

export default pixi;
