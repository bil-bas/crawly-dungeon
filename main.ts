namespace SpriteKind {
    export const Explosion = SpriteKind.create()
    export const Fireball = SpriteKind.create()
    export const Item = SpriteKind.create()
}

// Utilities

// Clear tile to transparency
function clearTile(location: tiles.Location) {
    tiles.setTileAt(location, assets.tile`transparency16`)
}

// Indicate a chage with floating message.
function change_floater(icon: Image, change: number) {
    let text = textsprite.create((change > 0 ? "+" : "") + ("" + change))
    text.setMaxFontHeight(5)
    text.setIcon(icon)
    text.z = 99
    text.setPosition(player.x, player.y)
    timer.after(500, () => {
        sprites.destroy(text)
    })
}

// Create stat label for top of screen.
function create_label(icon: Image, x: number) {
    let label = textsprite.create("x0", 0, 1)
    label.setIcon(icon)
    label.setOutline(1, 6)
    label.setFlag(SpriteFlag.RelativeToCamera, true)
    label.top = 0
    label.left = x
    return label
}

// Player Overlaps - PICK UP
sprites.onOverlap(SpriteKind.Player, SpriteKind.Item, (sprite: Sprite, item: Sprite) => {
    item.destroy()
    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
    let type = sprites.readDataString(item, "type")
    if (type == "mana potion") {
        mana += 1
    } else if (type == "life potion") {
        info.changeLifeBy(1)
    } else if (type == "key") {
        keys += 1
    }
    update_labels()
})

// Player Overlaps - INTERACT

// Player tries to unlock door/chest
scene.onHitWall(SpriteKind.Player, (player: Sprite, location: tiles.Location) => {
    if (tiles.tileAtLocationEquals(location, sprites.dungeon.doorLockedNorth) && keys >= 1) {
        keys += -1
        tiles.setTileAt(location, sprites.dungeon.doorOpenNorth)
        music.play(music.melodyPlayable(music.knock), music.PlaybackMode.InBackground)
        tiles.setWallAt(location, false)
        update_labels()
    } else if (tiles.tileAtLocationEquals(location, sprites.dungeon.chestClosed) && keys >= 1) {
        keys += -1
        tiles.setTileAt(location, sprites.dungeon.chestOpen)
        music.play(music.melodyPlayable(music.knock), music.PlaybackMode.InBackground)
        coins += 100
        update_labels()
    }
})

// Player Overlaps ENEMY
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, (player: Sprite, enemy: Sprite) => {
    music.play(music.melodyPlayable(music.thump), music.PlaybackMode.InBackground)
    
    let type = sprites.readDataString(enemy, "type")

    if (type == "hermit crab") {
        game.setGameOverMessage(false, "Squished by hermit crab!")
        info.setLife(0)
    } else {
        if (type == "monkey" && keys > 0) {
            keys -= 1
            change_floater(assets.image`key`, -1)
        } else if (type == "skeleton" && mana > 0) {
            mana -= 1
            change_floater(assets.image`key`, -1)
        } else {
            game.setGameOverMessage(false, `Killed by a ${type}!`)
            info.changeLifeBy(-1)
            change_floater(assets.image`key`, -1)
        }
        sprites.destroy(enemy)
    }
    update_labels()
})

// Initialisation

// Creat player sprite.
function create_player() : Sprite {
    let wiz = sprites.create(sprites.swamp.witchForward0, SpriteKind.Player)
    scene.cameraFollowSprite(wiz)
    info.setLife(3)

    // UP
    characterAnimations.loopFrames(wiz,
        [sprites.swamp.witchBack0, sprites.swamp.witchBack1, sprites.swamp.witchBack2, sprites.swamp.witchBack3],
        200, characterAnimations.rule(Predicate.MovingUp))
    
    characterAnimations.loopFrames(wiz, [sprites.swamp.witchBack0],
        200, characterAnimations.rule(Predicate.FacingUp))
    
    // DOWN
    characterAnimations.loopFrames(wiz,
        [sprites.swamp.witchForward0, sprites.swamp.witchForward1, sprites.swamp.witchForward2, sprites.swamp.witchForward3],
        200, characterAnimations.rule(Predicate.MovingDown))
    
    characterAnimations.loopFrames(wiz, [sprites.swamp.witchForward0],
        200, characterAnimations.rule(Predicate.FacingDown))
    
    // LEFT
    characterAnimations.loopFrames(wiz,
        [sprites.swamp.witchLeft0, sprites.swamp.witchLeft1, sprites.swamp.witchLeft2, sprites.swamp.witchLeft3],
        200, characterAnimations.rule(Predicate.MovingLeft))
    
    characterAnimations.loopFrames(wiz, [sprites.swamp.witchLeft0],
        200, characterAnimations.rule(Predicate.FacingLeft))
    
    // Right
    characterAnimations.loopFrames(wiz,
        [sprites.swamp.witchRight0, sprites.swamp.witchRight1, sprites.swamp.witchRight2, sprites.swamp.witchRight3],
        200, characterAnimations.rule(Predicate.MovingRight))
    
    characterAnimations.loopFrames(wiz, [sprites.swamp.witchRight0],
        200, characterAnimations.rule(Predicate.FacingRight))
    
    return wiz
}

// Render the level tiles, add player and creatues.
function render_walls() {
    tileUtil.forEachTileInMap(LEVELS[current_level], (column: number, row: number, location: tiles.Location) => {
        switch (tiles.tileImageAtLocation(location)) {
            case sprites.builtin.brick:
            case sprites.dungeon.stairLadder:
            case sprites.dungeon.doorLockedNorth:
                tiles.setWallAt(location, true)
                break
            case sprites.dungeon.stairLarge:
                clearTile(location)
                tiles.placeOnTile(player, location)
                break
            case assets.tile`bat`:
                create_bat(location)
                break
            case assets.tile`skeleton`:
                create_skeleton(location)
                break
            case assets.tile`monkey`:
                create_monkey(location)
                break
            case assets.tile`hermit crab`:
                create_hermit_crab(location)
                break
            case assets.tile`mana potion`:
                createItem("mana potion", sprites.projectile.firework1, location)
                break
            case assets.tile`key tile`:
                createItem("key", assets.image`key`, location)
                break
            case assets.tile`life potion`:
                createItem("life potion", sprites.projectile.heart1, location)
                break
            case assets.tile`chest`:
                tiles.setTileAt(location, sprites.dungeon.chestClosed)
                tiles.setWallAt(location, true)
                break
        }
    })
}

function createItem(type: string, image: Image, location: tiles.Location) {
    clearTile(location)
    let item = sprites.create(image, SpriteKind.Item)
    tiles.placeOnTile(item, location)
    sprites.setDataString(item, "type", type)
}

// Enemy interactions
scene.onHitWall(SpriteKind.Enemy, (enemy: Sprite, location: tiles.Location) => {
    if (sprites.readDataString(enemy, "type") != "hermit crab") return

    if (characterAnimations.matchesRule(enemy, characterAnimations.rule(Predicate.MovingUp))) {
        enemy.setVelocity(-30, 0)
    } else if (characterAnimations.matchesRule(enemy, characterAnimations.rule(Predicate.MovingDown))) {
        enemy.setVelocity(30, 0)
    } else if (characterAnimations.matchesRule(enemy, characterAnimations.rule(Predicate.MovingLeft))) {
        enemy.setVelocity(0, 30)
    } else if (characterAnimations.matchesRule(enemy, characterAnimations.rule(Predicate.MovingRight))) {
        enemy.setVelocity(0, -30)
    }
})

// Casting spells

// Cast starfire pulses
controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
    if (mana < STARFIRE_COST || is_falling) return

    mana -= STARFIRE_COST
    update_labels()

    starfire()

    timer.after(200, () => {
        starfire()

        timer.after(200, () => {
            starfire()
        })
    })
})

// Cast fireball
controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    if (mana < FIREBALL_COST || is_falling) return

    mana -= FIREBALL_COST
    update_labels()

    if (characterAnimations.matchesRule(player, characterAnimations.rule(Predicate.MovingRight)) ||
        characterAnimations.matchesRule(player, characterAnimations.rule(Predicate.NotMoving, Predicate.FacingRight))) {
        
        fireball("right")
    } else if (characterAnimations.matchesRule(player, characterAnimations.rule(Predicate.MovingLeft)) ||
        characterAnimations.matchesRule(player, characterAnimations.rule(Predicate.NotMoving, Predicate.FacingLeft))) {
        
        fireball("left")
    } else if (characterAnimations.matchesRule(player, characterAnimations.rule(Predicate.MovingUp)) ||
        characterAnimations.matchesRule(player, characterAnimations.rule(Predicate.NotMoving, Predicate.FacingUp))) {
        
        fireball("up")
    } else if (characterAnimations.matchesRule(player, characterAnimations.rule(Predicate.MovingDown)) ||
        characterAnimations.matchesRule(player, characterAnimations.rule(Predicate.NotMoving, Predicate.FacingDown))) {
        
        fireball("down")
    }
})

function starfire() {
    ["left", "right", "up", "down"].forEach(fireball)
}

function fireball(direction: string) {
    let vx = 0, vy = 0

    if (direction == "left") {
        vx = -100
    } else if (direction == "right") {
        vx = 100
    } else if (direction == "up") {
        vy = -100
    } else if (direction == "down") {
        vy = 100
    }

    let ball = sprites.createProjectileFromSprite(sprites.projectile.explosion1, player, vx, vy)
    ball.setKind(SpriteKind.Fireball)
    ball.setScale(2)
    ball.startEffect(effects.fire)
}

sprites.onDestroyed(SpriteKind.Fireball, (ball: Sprite) => {
    let explosion = sprites.create(sprites.projectile.explosion2, SpriteKind.Explosion)
    explosion.setPosition(ball.x, ball.y)

    timer.after(50, () => {
        explosion.setImage(sprites.projectile.explosion3)

        timer.after(50, () => {
            explosion.setImage(sprites.projectile.explosion4)

            timer.after(50, () => {
                explosion.destroy()
            })
        })
    })
})

// Spell effects

// Fireball hits ENEMY
sprites.onOverlap(SpriteKind.Fireball, SpriteKind.Enemy, (projectile: Sprite, enemy: Sprite) => {
    sprites.destroy(projectile)

    let life = sprites.readDataNumber(enemy, "life") - 1
    if (life == 0) {
        enemy.destroy()
    } else {
        sprites.setDataNumber(enemy, "life", life)

    }
})

// Creating enemies

// skeleton
function create_skeleton(tile: tiles.Location) {
    clearTile(tile)
    let mySprite = sprites.create(sprites.castle.skellyFront, SpriteKind.Enemy)
    tiles.placeOnTile(mySprite, tile)
    mySprite.vy = 40
    mySprite.setFlag(SpriteFlag.BounceOnWall, true)
    sprites.setDataString(mySprite, "type", "skeleton")
    sprites.setDataNumber(mySprite, "life", 1)

    let down = [sprites.castle.skellyWalkFront1, sprites.castle.skellyWalkFront2]
    characterAnimations.loopFrames(mySprite, down, 200, characterAnimations.rule(Predicate.MovingUp))
    characterAnimations.loopFrames(mySprite, down, 200, characterAnimations.rule(Predicate.MovingDown))
}

// HERMIT CRAB
function create_hermit_crab(tile: tiles.Location) {
    clearTile(tile)
    let mySprite = sprites.create(sprites.builtin.hermitCrabWalk0, SpriteKind.Enemy)
    tiles.placeOnTile(mySprite, tile)
    mySprite.vy = 30
    mySprite.setScale(2)
    sprites.setDataString(mySprite, "type", "hermit crab")
    sprites.setDataNumber(mySprite, "life", 3)

    let walk = [sprites.builtin.hermitCrabWalk0, sprites.builtin.hermitCrabWalk1, sprites.builtin.hermitCrabWalk2, sprites.builtin.hermitCrabWalk3]
    characterAnimations.loopFrames(mySprite, walk, 200, characterAnimations.rule(Predicate.MovingUp))
    characterAnimations.loopFrames(mySprite, walk, 200, characterAnimations.rule(Predicate.MovingDown))
    characterAnimations.loopFrames(mySprite, walk, 200, characterAnimations.rule(Predicate.MovingLeft))
    characterAnimations.loopFrames(mySprite, walk, 200, characterAnimations.rule(Predicate.MovingRight))
}

// BAT
function create_bat(tile: tiles.Location) {
    clearTile(tile)

    let mySprite = sprites.create(sprites.builtin.forestBat0, SpriteKind.Enemy)
    tiles.placeOnTile(mySprite, tile)
    mySprite.vx = 40
    mySprite.setFlag(SpriteFlag.BounceOnWall, true)
    sprites.setDataString(mySprite, "type", "bat")
    sprites.setDataNumber(mySprite, "life", 1)

    let left = [sprites.builtin.forestBat0, sprites.builtin.forestBat1, sprites.builtin.forestBat2, sprites.builtin.forestBat3]
    characterAnimations.loopFrames(mySprite, left, 200,
        characterAnimations.rule(Predicate.MovingLeft))
    
    characterAnimations.loopFrames(mySprite, left, 200,
        characterAnimations.rule(Predicate.MovingRight))
}

// MONKEY
function create_monkey(tile: tiles.Location) {
    clearTile(tile)
    let mySprite = sprites.create(sprites.builtin.forestMonkey0, SpriteKind.Enemy)
    tiles.placeOnTile(mySprite, tile)
    mySprite.vy = 40
    mySprite.setFlag(SpriteFlag.BounceOnWall, true)
    sprites.setDataString(mySprite, "type", "monkey")
    sprites.setDataNumber(mySprite, "life", 1)

    let up = [sprites.builtin.forestMonkey0, sprites.builtin.forestMonkey1, sprites.builtin.forestMonkey2, sprites.builtin.forestMonkey3]
    characterAnimations.loopFrames(mySprite, up, 200,
        characterAnimations.rule(Predicate.MovingUp))
    
    let down = [sprites.builtin.forestMonkey4, sprites.builtin.forestMonkey5, sprites.builtin.forestMonkey2, sprites.builtin.forestMonkey7]
    characterAnimations.loopFrames(mySprite, down, 200,
        characterAnimations.rule(Predicate.MovingDown))
}

function update_labels() {
    magic_label.setText(`x${mana}`)
    key_label.setText(`x${keys}`)
    coin_label.setText(`${coins}`)
    coin_label.right = 150
}

function advance_level() {
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    current_level += 1
    scaling.scaleToPercent(player, 100)
    controller.moveSprite(player, 60, 60)
    tiles.setCurrentTilemap(LEVELS[current_level])
    render_walls()
}

info.onLifeZero(function on_life_zero() {
    info.setScore(coins)
    game.gameOver(false)
})

scene.onOverlapTile(SpriteKind.Player, sprites.dungeon.hazardHole, (player: Sprite, location: tiles.Location) => {
    if (is_falling) return

    is_falling = true
    controller.moveSprite(player, 0, 0)
    tiles.placeOnTile(player, location)

    timer.after(250, () => {
        music.play(music.melodyPlayable(music.jumpDown), music.PlaybackMode.InBackground)
        scaling.scaleToPercent(player, 75)

        timer.after(500, () => {
            scaling.scaleToPercent(player, 50)

            timer.after(500, () => {
                advance_level()
                is_falling = false
            })
        })
    })
})

scene.onHitWall(SpriteKind.Fireball, (sprite: Sprite, location: tiles.Location) => {
    if (tiles.tileAtLocationEquals(location, sprites.dungeon.stairLadder)) {
        tiles.setTileAt(location, assets.tile`transparency16`)
        music.play(music.melodyPlayable(music.knock), music.PlaybackMode.InBackground)
        tiles.setWallAt(location, false)
    }
})

function init_inventory() {
    magic_label = create_label(sprites.projectile.firework1, 40)
    magic_label.top = -2
    
    key_label = create_label(assets.image`key`, 80)
    key_label.top = -2

    let icon = create_label(sprites.builtin.coin0, 150)

    coin_label = textsprite.create("0")
    coin_label.setFlag(SpriteFlag.RelativeToCamera, true)
    coin_label.z = 100
    coin_label.top = 0
    coin_label.right = 150

    update_labels()
}

// SETUP

const INITIAL_MANA = 3
const INITIAL_LIVES = 3
const FIREBALL_COST = 1
const STARFIRE_COST = 3

let coin_label: TextSprite
let key_label: TextSprite
let magic_label: TextSprite
let life_label: TextSprite

let mana = INITIAL_MANA
let keys = 0
let coins = 0


let is_falling = false
let current_level = -1

const LEVELS = [
    tilemap`level 1`,
    tilemap`level 2`,
    tilemap`level 3`
]
const player: Sprite = create_player()

game.setGameOverScoringType(game.ScoringType.HighScore)
init_inventory()
advance_level()