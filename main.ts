namespace SpriteKind {
    export const Snail = SpriteKind.create()
    export const Ghost = SpriteKind.create()
    export const Bat = SpriteKind.create()
    export const Monkey = SpriteKind.create()
}

// Utilities

// Clear tile to transparency
function clearTile(location: tiles.Location) {
    tiles.setTileAt(location, assets.tile`transparency16`)
}

// Indicate a chage with floating message.
function change_floater(icon: Image, change: number) {
    let textSprite = textsprite.create((change > 0 ? "+" : "") + ("" + change))
    textSprite.setMaxFontHeight(5)
    textSprite.setIcon(icon)
    textSprite.z = 99
    textSprite.setPosition(player.x, player.y)
    timer.after(500, () => {
        sprites.destroy(textSprite)
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

// Player picks up LIFE POTION
scene.onOverlapTile(SpriteKind.Player, assets.tile`key`, function on_overlap_tile(sprite: Sprite, location: tiles.Location) {
    clearTile(location)
    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
    info.changeLifeBy(1)
})

// Player picks up MANA POTION
scene.onOverlapTile(SpriteKind.Player, assets.tile`key`, (sprite, location) => {
    clearTile(location)
    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
    mana += 1
    update_labels()
})

// Player picks up KEY
scene.onOverlapTile(SpriteKind.Player, assets.tile`key`, function on_overlap_tile2(sprite: Sprite, location: tiles.Location) {
    clearTile(location)
    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
    keys += 1
    update_labels()
})

// Player Overlaps - INTERACT

// Player tries to unlock door/chest
scene.onHitWall(SpriteKind.Player, (sprite: Sprite, location: tiles.Location) => {
    if (tiles.tileAtLocationEquals(location, sprites.dungeon.doorClosedNorth) && keys >= 1) {
        keys += -1
        clearTile(location)
        music.play(music.melodyPlayable(music.knock), music.PlaybackMode.InBackground)
        tiles.setWallAt(location, false)
        update_labels()
    } else if (tiles.tileAtLocationEquals(location, sprites.dungeon.chestClosed) && keys >= 1) {
        keys += -1
        tiles.setTileAt(location, sprites.dungeon.chestOpen)
        music.play(music.melodyPlayable(music.knock), music.PlaybackMode.InBackground)
        coins += 10
        update_labels()
    }
})

// Player Overlaps ENEMY

// Player overlaps SNAIL
sprites.onOverlap(SpriteKind.Player, SpriteKind.Snail, (sprite: Sprite, otherSprite: Sprite) => {
    music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground)
    game.setGameOverMessage(false, "Slimed by the boss snail!")
    info.changeLifeBy(-10)
})

// Player overlaps BAT
sprites.onOverlap(SpriteKind.Player, SpriteKind.Bat, (sprite: Sprite, otherSprite: Sprite) => {
    music.play(music.melodyPlayable(music.smallCrash), music.PlaybackMode.InBackground)
    sprites.destroy(otherSprite)
    game.setGameOverMessage(false, "Exsanguinated by a vampire!")
    info.changeLifeBy(-1)
    change_floater(assets.image`life`, -1)
})

// Player overlaps GHOST
sprites.onOverlap(SpriteKind.Player, SpriteKind.Ghost, function on_on_overlap3(sprite: Sprite, otherSprite: Sprite) {
    music.play(music.melodyPlayable(music.spooky), music.PlaybackMode.InBackground)
    sprites.destroy(otherSprite)
    if (mana) {
        mana -= 1
        change_floater(assets.image`mana`, -1)
        update_labels()
    } else {
        game.setGameOverMessage(false, "Soul drained by a ghost!")
        info.changeLifeBy(-1)
        change_floater(assets.image`life`, -1)
    }

})

// Player overlaps MONKEY
sprites.onOverlap(SpriteKind.Player, SpriteKind.Monkey, function on_on_overlap4(sprite7: Sprite, otherSprite4: Sprite) {
    music.play(music.melodyPlayable(music.thump), music.PlaybackMode.InBackground)
    sprites.destroy(otherSprite4)
    if (keys) {
        keys -= 1
        change_floater(img`
                . . . . 5 5 5 5 . . . .
                . . . 5 e e e e e . . .
                . . . 5 e c c e e . . .
                . . . 5 e c c e e . . .
                . . . 5 e c c 5 e . . .
                . . . 5 e e 5 e e . . .
                . . . . e e e e . . . .
                . . . . . 5 e . . . . .
                . . . . . 5 e . . . . .
                . . . . . 5 e 5 5 . . .
                . . . . . 5 e e e . . .
                . . . . . 5 e 5 . . . .
                `, -1)
        update_labels()
    } else {
        game.setGameOverMessage(false, "Eyes gouged by evil monkey!")
        info.changeLifeBy(-1)
        change_floater(img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . f f f . f f f . . . .
                . . . . f 3 3 3 f 3 3 3 f . . .
                . . . . f 3 3 3 3 3 1 3 f . . .
                . . . . f 3 3 3 3 3 3 3 f . . .
                . . . . . f 3 b b b 3 f . . . .
                . . . . . f f b b b f f . . . .
                . . . . . . f f b f f . . . . .
                . . . . . . . f f f . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                `, -1)
    }

})

// Initialisation

// Creat player sprite.
function create_wizard(): Sprite {
    let wiz = sprites.create(assets.image`wizard`, SpriteKind.Player)
    info.setLife(3)
    scene.cameraFollowSprite(wiz)
    characterAnimations.loopFrames(wiz, [img`
        . . . . . . c c c . . . . . . .
        . . . . . . c 5 b c . . . . . .
        . . . . c c c 5 5 c c c . . . .
        . . c c c c 5 5 5 5 c b c c . .
        . c b b 5 b 5 5 5 5 b 5 b b c .
        . c b 5 5 b b 5 5 b b 5 5 b c .
        . . c 5 5 5 b b b b 5 5 5 f . .
        . . f f 5 5 5 5 5 5 5 5 f f . .
        . . f f f f f f f f f f f f . .
        . . f f f f f f f f f f f f . .
        . . . f f f f f f f f f f . . .
        . . . e e f f f f f f f e . . .
        . . e b f b 5 b b 5 b c b e . .
        . . e e f 5 5 5 5 5 5 f e e . .
        . . . . c b 5 5 5 5 b c . . . .
        . . . . . f f f f f f . . . . .
    `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . c c . . . . . .
                . . . . . . . c 5 c . . . . . .
                . . . . c c c 5 5 c c c . . . .
                . . c c b c 5 5 5 5 c c c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . f 5 5 5 b b b b 5 5 5 c . .
                . . f f 5 5 5 5 5 5 5 5 f f . .
                . . f f f f f f f f f f f f . .
                . . f f f f f f f f f f f f . .
                . . . f f f f f f f f f f . . .
                . . . e b e e f f f f b b e . .
                . . . e b b e b b 5 5 f e e . .
                . . . . c e e 5 5 5 5 5 f . . .
                . . . . . f f f f f f f . . . .
                `, img`
                . . . . . . . c c c . . . . . .
                . . . . . . c b 5 c . . . . . .
                . . . . c c c 5 5 c c c . . . .
                . . c c b c 5 5 5 5 c c c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . f 5 5 5 b b b b 5 5 5 c . .
                . . f f 5 5 5 5 5 5 5 5 f f . .
                . . f f f f f f f f f f f f . .
                . . f f f f f f f f f f f f . .
                . . . f f f f f f f f f f . . .
                . . . e e f f f f f f e e . . .
                . . e b c b 5 b b 5 b f b e . .
                . . e e f 5 5 5 5 5 5 f e e . .
                . . . . c b 5 5 5 5 b c . . . .
                . . . . . f f f f f f . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . c c . . . . . . . .
                . . . . . . c 5 c . . . . . . .
                . . . . c c c 5 5 c c c . . . .
                . . c c c c 5 5 5 5 c b c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . c 5 5 5 b b b b 5 5 5 f . .
                . . f f 5 5 5 5 5 5 5 5 f f . .
                . . f f f f f f f f f f f f . .
                . . f f f f f f f f f f f f . .
                . . . f f f f f f f e e f . . .
                . . e b b f e e e e e b e . . .
                . . e e f 5 5 b b e b b e . . .
                . . . f 5 5 5 5 5 e e c . . . .
                . . . . f f f f f f f . . . . .
                `], 200, characterAnimations.rule(Predicate.MovingUp))
    characterAnimations.loopFrames(wiz, [img`
            . . . . . . c c c . . . . . . .
            . . . . . . c 5 b c . . . . . .
            . . . . c c c 5 5 c c c . . . .
            . . c c c c 5 5 5 5 c b c c . .
            . c b b 5 b 5 5 5 5 b 5 b b c .
            . c b 5 5 b b 5 5 b b 5 5 b c .
            . . c 5 5 5 b b b b 5 5 5 f . .
            . . f f 5 5 5 5 5 5 5 5 f f . .
            . . f f f f f f f f f f f f . .
            . . f f f f f f f f f f f f . .
            . . . f f f f f f f f f f . . .
            . . . e e f f f f f f f e . . .
            . . e b f b 5 b b 5 b c b e . .
            . . e e f 5 5 5 5 5 5 f e e . .
            . . . . c b 5 5 5 5 b c . . . .
            . . . . . f f f f f f . . . . .
            `], 200, characterAnimations.rule(Predicate.FacingUp))
    characterAnimations.loopFrames(wiz, [img`
                . . . . . . . c c c . . . . . .
                . . . . . . c b 5 c . . . . . .
                . . . . c c c 5 5 c c c . . . .
                . . c c b c 5 5 5 5 c c c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . f 5 5 5 b b b b 5 5 5 c . .
                . . f f 5 5 5 5 5 5 5 5 f f . .
                . . f f f b f e e f b f f f . .
                . . f f f 1 f b b f 1 f f f . .
                . . . f f b b b b b b f f . . .
                . . . e e f e e e e f e e . . .
                . . e b c b 5 b b 5 b f b e . .
                . . e e f 5 5 5 5 5 5 f e e . .
                . . . . c b 5 5 5 5 b c . . . .
                . . . . . f f f f f f . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . c c . . . . . . . .
                . . . . . . c 5 c . . . . . . .
                . . . . c c c 5 5 c c c . . . .
                . . c c c c 5 5 5 5 c b c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . c 5 5 5 b b b b 5 5 5 f . .
                . . f f 5 5 5 5 5 5 5 5 f f . .
                . . f f f b f e e f b f f f . .
                . . f f f 1 f b b f 1 f f f . .
                . . . f f b b b b e e e f . . .
                . . e b b f e e e e b b e . . .
                . . e e f 5 5 b b e b b e . . .
                . . . f 5 5 5 5 5 e e c . . . .
                . . . . f f f f f f f . . . . .
                `, img`
                . . . . . . c c c . . . . . . .
                . . . . . . c 5 b c . . . . . .
                . . . . c c c 5 5 c c c . . . .
                . . c c c c 5 5 5 5 c b c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . c 5 5 5 b b b b 5 5 5 f . .
                . . f f 5 5 5 5 5 5 5 5 f f . .
                . . f f f b f e e f b f f f . .
                . . f f f 1 f b b f 1 f f f . .
                . . . f f b b b b b b f f . . .
                . . . e e f e e e e f e e . . .
                . . e b f b 5 b b 5 b c b e . .
                . . e e f 5 5 5 5 5 5 f e e . .
                . . . . c b 5 5 5 5 b c . . . .
                . . . . . f f f f f f . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . c c . . . . . .
                . . . . . . . c 5 c . . . . . .
                . . . . c c c 5 5 c c c . . . .
                . . c c b c 5 5 5 5 c c c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . f 5 5 5 b b b b 5 5 5 c . .
                . . f f 5 5 5 5 5 5 5 5 f f . .
                . . f f f b f e e f b f f f . .
                . . f f f 1 f b b f 1 f f f . .
                . . . f e e e b b b b f f . . .
                . . . e b b e e e e f b b e . .
                . . . e b b e b b 5 5 f e e . .
                . . . . c e e 5 5 5 5 5 f . . .
                . . . . . f f f f f f f . . . .
                `], 200, characterAnimations.rule(Predicate.MovingDown))
    characterAnimations.loopFrames(wiz, [img`
            . . . . . . . c c c . . . . . .
            . . . . . . c b 5 c . . . . . .
            . . . . c c c 5 5 c c c . . . .
            . . c c b c 5 5 5 5 c c c c . .
            . c b b 5 b 5 5 5 5 b 5 b b c .
            . c b 5 5 b b 5 5 b b 5 5 b c .
            . . f 5 5 5 b b b b 5 5 5 c . .
            . . f f 5 5 5 5 5 5 5 5 f f . .
            . . f f f b f e e f b f f f . .
            . . f f f 1 f b b f 1 f f f . .
            . . . f f b b b b b b f f . . .
            . . . e e f e e e e f e e . . .
            . . e b c b 5 b b 5 b f b e . .
            . . e e f 5 5 5 5 5 5 f e e . .
            . . . . c b 5 5 5 5 b c . . . .
            . . . . . f f f f f f . . . . .
            `], 200, characterAnimations.rule(Predicate.FacingDown))
    characterAnimations.loopFrames(wiz, [img`
                . . . . . . . c c . . . . . . .
                . . . . . . c 5 c . . . . . . .
                . . . . c c 5 5 5 c c c . . . .
                . . c c c c 5 5 5 5 c b c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . c 5 5 5 b b b b 5 5 5 f . .
                . . . f 5 5 5 5 5 5 5 5 f f . .
                . . . . f e e e f b e e f f . .
                . . . . f e b b f 1 b f f f . .
                . . . . f b b b b b b f f . . .
                . . . . . f e e e e f e e . . .
                . . . . . f 5 b b e b b e . . .
                . . . . f 5 5 5 5 e b b e . . .
                . . . . c b 5 5 5 5 e e . . . .
                . . . . . f f f f f f . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . c c . . . . . . .
                . . . . . . c c 5 c . . . . . .
                . . . . c c 5 5 5 c c c . . . .
                . . c c c c 5 5 5 5 c b c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . c 5 5 5 b b b b 5 5 5 f . .
                . . . f 5 5 5 5 5 5 5 5 f f . .
                . . . . f e e e f b e e f f . .
                . . . . f e b b f 1 b f f f . .
                . . . . f b b b b e e f f . . .
                . . . . . f e e e b b e f . . .
                . . . . f 5 b b e b b e . . . .
                . . . . c 5 5 5 5 e e f . . . .
                . . . . . f f f f f f . . . . .
                `, img`
                . . . . . . . c c . . . . . . .
                . . . . . . c 5 c . . . . . . .
                . . . . c c 5 5 5 c c c . . . .
                . . c c c c 5 5 5 5 c b c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . c 5 5 5 b b b b 5 5 5 f . .
                . . . f 5 5 5 5 5 5 5 5 f f . .
                . . . . f e e e f b e e f f . .
                . . . . f e b b f 1 b f f f . .
                . . . . f b b b b b b f f . . .
                . . . . . f e e e e f e e . . .
                . . . . . f 5 b b e b b e . . .
                . . . . f 5 5 5 5 e b b e . . .
                . . . . c b 5 5 5 5 e e . . . .
                . . . . . f f f f f f . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . c c . . . . . . .
                . . . . . . c c 5 c . . . . . .
                . . . . c c 5 5 5 c c c . . . .
                . . c c c c 5 5 5 5 c b c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . c 5 5 5 b b b b 5 5 5 f . .
                . . . f 5 5 5 5 5 5 5 5 f f . .
                . . . . f e e e f b e e f f . .
                . . . . f e b b f 1 b f f f . .
                . . . . f b b b b b b f f . . .
                . . . . . f e e e e e b b e . .
                . . . . f 5 5 b b b e b b e . .
                . . . . c 5 5 5 5 5 e e e . . .
                . . . . . f f f f f f . . . . .
                `], 200, characterAnimations.rule(Predicate.MovingLeft))
    characterAnimations.loopFrames(wiz, [img`
            . . . . . . . c c . . . . . . .
            . . . . . . c 5 c . . . . . . .
            . . . . c c 5 5 5 c c c . . . .
            . . c c c c 5 5 5 5 c b c c . .
            . c b b 5 b 5 5 5 5 b 5 b b c .
            . c b 5 5 b b 5 5 b b 5 5 b c .
            . . c 5 5 5 b b b b 5 5 5 f . .
            . . . f 5 5 5 5 5 5 5 5 f f . .
            . . . . f e e e f b e e f f . .
            . . . . f e b b f 1 b f f f . .
            . . . . f b b b b b b f f . . .
            . . . . . f e e e e f e e . . .
            . . . . . f 5 b b e b b e . . .
            . . . . f 5 5 5 5 e b b e . . .
            . . . . c b 5 5 5 5 e e . . . .
            . . . . . f f f f f f . . . . .
            `], 200, characterAnimations.rule(Predicate.FacingLeft))
    characterAnimations.loopFrames(wiz, [img`
                . . . . . . . c c . . . . . . .
                . . . . . . . c 5 c . . . . . .
                . . . . c c c 5 5 5 c c . . . .
                . . c c b c 5 5 5 5 c c c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . f 5 5 5 b b b b 5 5 5 c . .
                . . f f 5 5 5 5 5 5 5 5 f . . .
                . . f f e e b f e e e f . . . .
                . . f f f b 1 f b b e f . . . .
                . . . f f b b b b b b f . . . .
                . . . e e f e e e e f . . . . .
                . . . e b b e b b 5 f . . . . .
                . . . e b b e 5 5 5 5 f . . . .
                . . . . e e 5 5 5 5 b c . . . .
                . . . . . f f f f f f . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . c c . . . . . . .
                . . . . . . c 5 c c . . . . . .
                . . . . c c c 5 5 5 c c . . . .
                . . c c b c 5 5 5 5 c c c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . f 5 5 5 b b b b 5 5 5 c . .
                . . f f 5 5 5 5 5 5 5 5 f . . .
                . . f f e e b f e e e f . . . .
                . . f f f b 1 f b b e f . . . .
                . . . f f e e b b b b f . . . .
                . . . f e b b e e e f . . . . .
                . . . . e b b e b b 5 f . . . .
                . . . . f e e 5 5 5 5 c . . . .
                . . . . . f f f f f f . . . . .
                `, img`
                . . . . . . . c c . . . . . . .
                . . . . . . . c 5 c . . . . . .
                . . . . c c c 5 5 5 c c . . . .
                . . c c b c 5 5 5 5 c c c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . f 5 5 5 b b b b 5 5 5 c . .
                . . f f 5 5 5 5 5 5 5 5 f . . .
                . . f f e e b f e e e f . . . .
                . . f f f b 1 f b b e f . . . .
                . . . f f b b b b b b f . . . .
                . . . e e f e e e e f . . . . .
                . . . e b b e b b 5 f . . . . .
                . . . e b b e 5 5 5 5 f . . . .
                . . . . e e 5 5 5 5 b c . . . .
                . . . . . f f f f f f . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . c c . . . . . . .
                . . . . . . c 5 c c . . . . . .
                . . . . c c c 5 5 5 c c . . . .
                . . c c b c 5 5 5 5 c c c c . .
                . c b b 5 b 5 5 5 5 b 5 b b c .
                . c b 5 5 b b 5 5 b b 5 5 b c .
                . . f 5 5 5 b b b b 5 5 5 c . .
                . . f f 5 5 5 5 5 5 5 5 f . . .
                . . f f e e b f e e e f . . . .
                . . f f f b 1 f b b e f . . . .
                . . . f f b b b b b b f . . . .
                . . e b b e e e e e f . . . . .
                . . e b b e b b b 5 5 f . . . .
                . . . e e e 5 5 5 5 5 c . . . .
                . . . . . f f f f f f . . . . .
                `], 200, characterAnimations.rule(Predicate.MovingRight))
    characterAnimations.loopFrames(wiz, [img`
            . . . . . . . c c . . . . . . .
            . . . . . . . c 5 c . . . . . .
            . . . . c c c 5 5 5 c c . . . .
            . . c c b c 5 5 5 5 c c c c . .
            . c b b 5 b 5 5 5 5 b 5 b b c .
            . c b 5 5 b b 5 5 b b 5 5 b c .
            . . f 5 5 5 b b b b 5 5 5 c . .
            . . f f 5 5 5 5 5 5 5 5 f . . .
            . . f f e e b f e e e f . . . .
            . . f f f b 1 f b b e f . . . .
            . . . f f b b b b b b f . . . .
            . . . e e f e e e e f . . . . .
            . . . e b b e b b 5 f . . . . .
            . . . e b b e 5 5 5 5 f . . . .
            . . . . e e 5 5 5 5 b c . . . .
            . . . . . f f f f f f . . . . .
            `], 200, characterAnimations.rule(Predicate.FacingRight))
    return wiz
}

// Render the level tiles, add player and creatues.
function render_walls() {
    tileUtil.forEachTileInMap(tileUtil.currentTilemap(), (column: number, row: number, location: tiles.Location) => {
        if (tiles.tileAtLocationIsWall(location)) {
            tiles.setTileAt(location, sprites.builtin.brick)
        } else if (tiles.tileAtLocationEquals(location, sprites.dungeon.stairLarge)) {
            tiles.placeOnTile(wizard, location)
            clearTile(location)
        } else if (tiles.tileAtLocationEquals(location, tileUtil.object4)) {
            create_bat(location)
        } else if (tiles.tileAtLocationEquals(location, tileUtil.object6)) {
            create_ghost(location)
        } else if (tiles.tileAtLocationEquals(location, tileUtil.object12)) {
            create_monkey(location)
        } else if (tiles.tileAtLocationEquals(location, tileUtil.object14)) {
            create_boss(location)
        } else if (tiles.tileAtLocationEquals(location, sprites.dungeon.chestClosed) ||
            tiles.tileAtLocationEquals(location, sprites.dungeon.doorClosedNorth) ||
            tiles.tileAtLocationEquals(location, sprites.dungeon.stairLadder)) {
            tiles.setWallAt(location, true)
        }
    })
}

// Enemy interactions

scene.onHitWall(SpriteKind.Snail, function on_hit_wall2(sprite: Sprite, location: tiles.Location) {
    if (characterAnimations.matchesRule(sprite, characterAnimations.rule(Predicate.MovingUp))) {
        sprite.setVelocity(-30, 0)
    } else if (characterAnimations.matchesRule(sprite, characterAnimations.rule(Predicate.MovingDown))) {
        sprite.setVelocity(30, 0)
    } else if (characterAnimations.matchesRule(sprite, characterAnimations.rule(Predicate.MovingLeft))) {
        sprite.setVelocity(0, 30)
    } else if (characterAnimations.matchesRule(sprite, characterAnimations.rule(Predicate.MovingRight))) {
        sprite.setVelocity(0, -30)
    }
})

// Casting spells

// Cast starfire pulses
controller.B.onEvent(ControllerButtonEvent.Pressed, function on_b_pressed() {
    if (mana < STARFIRE_COST || is_falling) return

    mana -= STARFIRE_COST
    update_labels()

    Starfire()

    timer.after(200, function on_after() {
        Starfire()

        timer.after(200, function on_after2() {
            Starfire()
        })
    })
})

// Cast fireball
controller.A.onEvent(ControllerButtonEvent.Pressed, function on_a_pressed() {
    let projectile: Sprite

    if (mana < FIREBALL_COST || is_falling) return

    mana -= FIREBALL_COST
    update_labels()

    if (characterAnimations.matchesRule(wizard, characterAnimations.rule(Predicate.MovingRight)) ||
        characterAnimations.matchesRule(wizard, characterAnimations.rule(Predicate.NotMoving, Predicate.FacingRight))) {
        projectile = sprites.createProjectileFromSprite(assets.image`fireball right`, wizard, 100, 0)
    } else if (characterAnimations.matchesRule(wizard, characterAnimations.rule(Predicate.MovingLeft)) ||
        characterAnimations.matchesRule(wizard, characterAnimations.rule(Predicate.NotMoving, Predicate.FacingLeft))) {
        projectile = sprites.createProjectileFromSprite(img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . 2 2 2 2 . . . . . . . . .
                . . 2 1 1 1 1 2 2 . . . . . . .
                . . 1 1 1 1 1 1 3 3 2 2 . . . .
                . . 1 1 1 1 1 1 1 1 3 3 3 3 . .
                . . 1 1 1 1 1 1 1 1 1 1 1 1 . .
                . . 1 1 1 1 1 1 1 3 2 2 3 3 . .
                . . 2 1 1 1 1 3 2 2 . . . . . .
                . . . 2 2 2 2 . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                `, wizard, -100, 0)
    } else if (characterAnimations.matchesRule(wizard, characterAnimations.rule(Predicate.MovingUp)) ||
        characterAnimations.matchesRule(wizard, characterAnimations.rule(Predicate.NotMoving, Predicate.FacingUp))) {
        projectile = sprites.createProjectileFromSprite(img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . 2 1 1 1 1 2 . . . . .
                . . . . 2 1 1 1 1 1 1 2 . . . .
                . . . . 2 1 1 1 1 1 1 2 . . . .
                . . . . 2 1 1 1 1 1 1 2 . . . .
                . . . . 2 1 1 1 1 1 1 2 . . . .
                . . . . . 3 1 1 1 1 2 . . . . .
                . . . . . 2 1 1 1 3 2 . . . . .
                . . . . . 2 3 1 1 3 . . . . . .
                . . . . . . 2 1 3 2 . . . . . .
                . . . . . . 2 1 3 2 . . . . . .
                . . . . . . 3 1 3 . . . . . . .
                . . . . . . 3 1 3 . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                `, wizard, 0, -100)
    } else if (characterAnimations.matchesRule(wizard, characterAnimations.rule(Predicate.MovingDown)) ||
        characterAnimations.matchesRule(wizard, characterAnimations.rule(Predicate.NotMoving, Predicate.FacingDown))) {
        projectile = sprites.createProjectileFromSprite(img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . 3 1 3 . . . . . . .
                . . . . . . 3 1 3 . . . . . . .
                . . . . . . 2 1 3 2 . . . . . .
                . . . . . . 2 1 3 2 . . . . . .
                . . . . . 2 3 1 1 3 . . . . . .
                . . . . . 2 1 1 1 3 2 . . . . .
                . . . . . 3 1 1 1 1 2 . . . . .
                . . . . 2 1 1 1 1 1 1 2 . . . .
                . . . . 2 1 1 1 1 1 1 2 . . . .
                . . . . 2 1 1 1 1 1 1 2 . . . .
                . . . . 2 1 1 1 1 1 1 2 . . . .
                . . . . . 2 1 1 1 1 2 . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                `, wizard, 0, 100)
    }

    projectile.startEffect(effects.trail)
})

function Starfire() {
    let projectile = sprites.createProjectileFromSprite(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . 2 2 2 2 . . .
        . . . . . . . 2 2 1 1 1 1 2 . .
        . . . . 2 2 3 3 1 1 1 1 1 1 . .
        . . 3 3 3 3 1 1 1 1 1 1 1 1 . .
        . . 1 1 1 1 1 1 1 1 1 1 1 1 . .
        . . 3 3 2 2 3 1 1 1 1 1 1 1 . .
        . . . . . . 2 2 3 1 1 1 1 2 . .
        . . . . . . . . . 2 2 2 2 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, wizard, 100, 0)
    projectile.startEffect(effects.trail)

    projectile = sprites.createProjectileFromSprite(img`
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . 2 2 2 2 . . . . . . . . .
            . . 2 1 1 1 1 2 2 . . . . . . .
            . . 1 1 1 1 1 1 3 3 2 2 . . . .
            . . 1 1 1 1 1 1 1 1 3 3 3 3 . .
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . .
            . . 1 1 1 1 1 1 1 3 2 2 3 3 . .
            . . 2 1 1 1 1 3 2 2 . . . . . .
            . . . 2 2 2 2 . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            `, wizard, -100, 0)
    projectile.startEffect(effects.trail)

    projectile = sprites.createProjectileFromSprite(img`
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . 2 1 1 1 1 2 . . . . .
            . . . . 2 1 1 1 1 1 1 2 . . . .
            . . . . 2 1 1 1 1 1 1 2 . . . .
            . . . . 2 1 1 1 1 1 1 2 . . . .
            . . . . 2 1 1 1 1 1 1 2 . . . .
            . . . . . 3 1 1 1 1 2 . . . . .
            . . . . . 2 1 1 1 3 2 . . . . .
            . . . . . 2 3 1 1 3 . . . . . .
            . . . . . . 2 1 3 2 . . . . . .
            . . . . . . 2 1 3 2 . . . . . .
            . . . . . . 3 1 3 . . . . . . .
            . . . . . . 3 1 3 . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            `, wizard, 0, -100)
    projectile.startEffect(effects.trail)

    projectile = sprites.createProjectileFromSprite(img`
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . 3 1 3 . . . . . . .
            . . . . . . 3 1 3 . . . . . . .
            . . . . . . 2 1 3 2 . . . . . .
            . . . . . . 2 1 3 2 . . . . . .
            . . . . . 2 3 1 1 3 . . . . . .
            . . . . . 2 1 1 1 3 2 . . . . .
            . . . . . 3 1 1 1 1 2 . . . . .
            . . . . 2 1 1 1 1 1 1 2 . . . .
            . . . . 2 1 1 1 1 1 1 2 . . . .
            . . . . 2 1 1 1 1 1 1 2 . . . .
            . . . . 2 1 1 1 1 1 1 2 . . . .
            . . . . . 2 1 1 1 1 2 . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            `, wizard, 0, 100)
    projectile.startEffect(effects.trail)
}

// Spell effects

// Fireball hits GHOST
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Ghost, function on_on_overlap5(sprite: Sprite, otherSprite: Sprite) {
    sprites.destroy(sprite)
    sprites.destroy(otherSprite, effects.fire, 100)
})

// Fireball hits BAT
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Bat, function on_on_overlap6(sprite: Sprite, otherSprite: Sprite) {
    sprites.destroy(sprite)
    sprites.destroy(otherSprite, effects.fire, 100)
})

// Fireball hits SNAIL
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Snail, function on_on_overlap7(sprite: Sprite, otherSprite: Sprite) {
    sprites.destroy(sprite)
})

// Creating enemies

// GHOST
function create_ghost(tile: tiles.Location) {
    clearTile(tile)
    let mySprite = sprites.create(img`
            ........................
            ........................
            ........................
            ........................
            ..........ffff..........
            ........ff1111ff........
            .......fb111111bf.......
            .......f11111111f.......
            ......fd11111111df......
            ......fd11111111df......
            ......fddd1111dddf......
            ......fbdbfddfbdbf......
            ......fcdcf11fcdcf......
            .......fb111111bf.......
            ......fffcdb1bdffff.....
            ....fc111cbfbfc111cf....
            ....f1b1b1ffff1b1b1f....
            ....fbfbffffffbfbfbf....
            .........ffffff.........
            ...........fff..........
            ........................
            ........................
            ........................
            ........................
            `, SpriteKind.Ghost)
    tiles.placeOnTile(mySprite, tile)
    mySprite.vy = 40
    mySprite.setFlag(SpriteFlag.BounceOnWall, true)
    characterAnimations.loopFrames(mySprite, [img`
                ........................
                ........................
                ........................
                ........................
                ..........ffff..........
                ........ff1111ff........
                .......fb111111bf.......
                .......f11111111f.......
                ......fd11111111df......
                ......fd11111111df......
                ......fddd1111dddf......
                ......fbdbfddfbdbf......
                ......fcdcf11fcdcf......
                .......fb111111bf.......
                ......fffcdb1bdffff.....
                ....fc111cbfbfc111cf....
                ....f1b1b1ffff1b1b1f....
                ....fbfbffffffbfbfbf....
                .........ffffff.........
                ...........fff..........
                ........................
                ........................
                ........................
                ........................
                `, img`
                ........................
                ........................
                ........................
                ........................
                ..........ffff..........
                ........ff1111ff........
                .......fb111111bf.......
                .......f11111111f.......
                ......fd11111111df......
                ......fd11111111df......
                ......fddd1111dddf......
                ......fbdbfddfbdbf......
                ......fcdcf11fcdcf......
                .......fb111111ffff.....
                ......fffcdb1bc111cf....
                ....fc111cbfbf1b1b1f....
                ....f1b1b1ffffbfbfbf....
                ....fbfbfffffff.........
                .........fffff..........
                ..........fff...........
                ........................
                ........................
                ........................
                ........................
                `, img`
                ........................
                ........................
                ........................
                ........................
                ..........ffff..........
                ........ff1111ff........
                .......fb111111bf.......
                .......f11111111f.......
                ......fd11111111df......
                ......fd11111111df......
                ......fddd1111dddf......
                ......fbdbfddfbdbf......
                ......fcdcf11fcdcf......
                .......fb111111bf.......
                ......fffcdb1bdffff.....
                ....fc111cbfbfc111cf....
                ....f1b1b1ffff1b1b1f....
                ....fbfbffffffbfbfbf....
                .........ffffff.........
                ...........fff..........
                ........................
                ........................
                ........................
                ........................
                `, img`
                ........................
                ........................
                ........................
                ........................
                ..........ffff..........
                ........ff1111ff........
                .......fb111111bf.......
                .......f11111111f.......
                ......fd11111111df......
                ......fd11111111df......
                ......fddd1111dddf......
                ......fbdbfddfbdbf......
                ......fcdcf11fcdcf......
                .....ffff111111bf.......
                ....fc111cdb1bdfff......
                ....f1b1bcbfbfc111cf....
                ....fbfbfbffff1b1b1f....
                .........fffffffbfbf....
                ..........fffff.........
                ...........fff..........
                ........................
                ........................
                ........................
                ........................
                `], 200, characterAnimations.rule(Predicate.MovingUp))
    characterAnimations.loopFrames(mySprite, [img`
                ........................
                ........................
                ........................
                ........................
                ..........ffff..........
                ........ff1111ff........
                .......fb111111bf.......
                .......f11111111f.......
                ......fd11111111df......
                ......fd11111111df......
                ......fddd1111dddf......
                ......fbdbfddfbdbf......
                ......fcdcf11fcdcf......
                .......fb111111bf.......
                ......fffcdb1bdffff.....
                ....fc111cbfbfc111cf....
                ....f1b1b1ffff1b1b1f....
                ....fbfbffffffbfbfbf....
                .........ffffff.........
                ...........fff..........
                ........................
                ........................
                ........................
                ........................
                `, img`
                ........................
                ........................
                ........................
                ........................
                ..........ffff..........
                ........ff1111ff........
                .......fb111111bf.......
                .......f11111111f.......
                ......fd11111111df......
                ......fd11111111df......
                ......fddd1111dddf......
                ......fbdbfddfbdbf......
                ......fcdcf11fcdcf......
                .......fb111111ffff.....
                ......fffcdb1bc111cf....
                ....fc111cbfbf1b1b1f....
                ....f1b1b1ffffbfbfbf....
                ....fbfbfffffff.........
                .........fffff..........
                ..........fff...........
                ........................
                ........................
                ........................
                ........................
                `, img`
                ........................
                ........................
                ........................
                ........................
                ..........ffff..........
                ........ff1111ff........
                .......fb111111bf.......
                .......f11111111f.......
                ......fd11111111df......
                ......fd11111111df......
                ......fddd1111dddf......
                ......fbdbfddfbdbf......
                ......fcdcf11fcdcf......
                .......fb111111bf.......
                ......fffcdb1bdffff.....
                ....fc111cbfbfc111cf....
                ....f1b1b1ffff1b1b1f....
                ....fbfbffffffbfbfbf....
                .........ffffff.........
                ...........fff..........
                ........................
                ........................
                ........................
                ........................
                `, img`
                ........................
                ........................
                ........................
                ........................
                ..........ffff..........
                ........ff1111ff........
                .......fb111111bf.......
                .......f11111111f.......
                ......fd11111111df......
                ......fd11111111df......
                ......fddd1111dddf......
                ......fbdbfddfbdbf......
                ......fcdcf11fcdcf......
                .....ffff111111bf.......
                ....fc111cdb1bdfff......
                ....f1b1bcbfbfc111cf....
                ....fbfbfbffff1b1b1f....
                .........fffffffbfbf....
                ..........fffff.........
                ...........fff..........
                ........................
                ........................
                ........................
                ........................
                `], 200, characterAnimations.rule(Predicate.MovingDown))
}

// BOSS
function create_boss(tile: tiles.Location) {
    clearTile(tile)
    let mySprite = sprites.create(img`
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . c c . . .
            . . . . . . . c c c c 6 3 c . .
            . . . . . . c 6 3 3 3 3 6 c . .
            . . . . . c 6 6 3 3 3 3 3 3 c .
            . . . . c 6 6 6 6 3 3 3 3 3 3 c
            . c c c c c 6 6 c c 3 3 3 3 3 c
            b 5 5 c 3 3 c c 5 5 c 3 3 3 c c
            f f 5 c c c 3 c 5 f f 6 6 6 c c
            f f 5 c c c c c 5 f f 3 3 3 3 c
            . b 5 5 3 c 3 5 5 c 3 3 3 3 3 c
            . c 4 4 5 5 5 5 4 c c 3 3 3 c .
            c 4 5 5 4 4 4 4 5 5 4 c b b . .
            c 5 5 5 c 4 c 5 5 5 c 4 c 5 c .
            c 5 5 5 5 c 5 5 5 5 c 4 c 5 c .
            . c c c c c c c c c . . c c c .
            `, SpriteKind.Snail)
    tiles.placeOnTile(mySprite, tile)
    mySprite.vy = 30
    mySprite.setScale(2, ScaleAnchor.Middle)
    characterAnimations.loopFrames(mySprite, [img`
                . . . . . . . . . . . c c . . .
                . . . . . . . c c c c 6 3 c . .
                . . . . . . c 6 3 3 3 3 6 c . .
                . . c c . c 6 c c 3 3 3 3 3 c .
                . b 5 5 c 6 c 5 5 c 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 6 3 3 3 c c
                . b 5 5 3 c 3 5 5 c 6 6 6 6 c c
                . . b 5 5 3 5 5 c 3 3 3 3 3 3 c
                . . c 5 5 5 5 b c c 3 3 3 3 3 c
                . . c 4 5 5 4 b 5 5 c 3 3 3 c .
                . c 5 b 4 4 b b 5 c c b b b . .
                . c 4 4 b 5 5 5 4 c 4 4 4 5 b .
                . c 5 4 c 5 5 5 c 4 4 4 c 5 c .
                . c 5 c 5 5 5 5 c 4 4 4 c c c .
                . . c c c c c c c . . . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . c c . . . .
                . . . . . . c c c c 6 3 c . . .
                . . . . . c 6 6 3 3 3 6 c . . .
                . . . . c 6 6 3 3 3 3 3 3 c . .
                b c c c 6 6 c c 3 3 3 3 3 3 c .
                b 5 5 c 6 c 5 5 c 3 3 3 3 3 c .
                f f 5 c 6 c 5 f f 6 3 3 3 c c .
                f f 5 c c c 5 f f 6 6 6 6 c c .
                . b 5 5 3 5 5 c 3 3 3 3 3 3 c .
                . c 5 5 5 5 4 c c c 3 3 3 3 c .
                . c 4 5 5 4 4 b 5 5 c 3 3 c . .
                . c 5 b 4 4 b b 5 c b b c . . .
                . c c 5 4 c 5 5 5 c c 5 c . . .
                . . . c c 5 5 5 5 c c c c . . .
                . . . . c c c c c c . . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . c c . . .
                . . . . . . . c c c c 6 3 c . .
                . . . . . . c 6 6 3 3 3 6 c . .
                . . . . . c 6 6 3 3 3 3 3 3 c .
                . b c c c 6 6 c c 3 3 3 3 3 3 c
                . b 5 5 c 6 c 5 5 c 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 6 3 3 3 c c
                . f f 5 c c c 5 f f 6 6 6 6 c c
                . . b 5 5 3 5 5 c c c 3 3 3 3 c
                . . c 5 5 5 5 5 b 5 5 c 3 3 3 c
                . c 4 4 5 5 4 4 b b 5 c 3 3 c .
                . c 5 5 b 4 4 4 b 5 5 5 b c . .
                . c 5 5 5 4 4 4 c 5 5 5 c b . .
                . . c c c c 4 c 5 5 5 5 c c . .
                . . . . c c c c c c c c c c . .
                `, img`
                . . . . . . . . . . . c c . . .
                . . . . . . . c c c c 6 3 c . .
                . . . . . . c 6 3 3 3 3 6 c . .
                . . c c . c 6 c c 3 3 3 3 3 c .
                . b 5 5 c 6 c 5 5 c 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 6 3 3 3 c c
                . b 5 5 3 c 3 5 5 c 6 6 6 6 c c
                . . b 5 5 3 5 5 c 3 3 3 3 3 3 c
                . c c 5 5 5 5 4 c c 3 3 3 3 3 c
                c 5 5 4 5 5 4 c 5 5 c 3 3 3 c .
                b 5 4 b 4 4 4 c 5 5 5 b c c . .
                c 4 5 5 b 4 4 c 5 5 5 c b b . .
                c 5 5 5 c 4 c 5 5 5 5 c c 5 b .
                c 5 5 5 5 c 4 c c c c c c 5 c .
                . c c c c c c . . . . . c c c .
                `], 200, characterAnimations.rule(Predicate.MovingUp))
    characterAnimations.loopFrames(mySprite, [img`
                . . . c c . . . . . . . . . . .
                . . c 3 6 c c c c . . . . . . .
                . . c 6 3 3 3 3 6 c . . . . . .
                . c 3 3 3 3 3 c c 6 c . c c . .
                c 3 3 3 3 3 c 5 5 c 6 c 5 5 b .
                c 3 3 3 3 3 f f 5 c 6 c 5 f f .
                c c 3 3 3 6 f f 5 c 6 c 5 f f .
                c c 6 6 6 6 c 5 5 3 c 3 5 5 b .
                c 3 3 3 3 3 3 c 5 5 3 5 5 b . .
                c 3 3 3 3 3 c c b 5 5 5 5 c . .
                . c 3 3 3 c 5 5 b 4 5 5 4 c . .
                . . b b b c c 5 b b 4 4 b 5 c .
                . b 5 4 4 4 c 4 5 5 5 b 4 4 c .
                . c 5 c 4 4 4 c 5 5 5 c 4 5 c .
                . c c c 4 4 4 c 5 5 5 5 c 5 c .
                . . . . . . . c c c c c c c . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . c c . . . . . . . . . .
                . . . c 3 6 c c c c . . . . . .
                . . . c 6 3 3 3 6 6 c . . . . .
                . . c 3 3 3 3 3 3 6 6 c . . . .
                . c 3 3 3 3 3 3 c c 6 6 c c c b
                . c 3 3 3 3 3 c 5 5 c 6 c 5 5 b
                . c c 3 3 3 6 f f 5 c 6 c 5 f f
                . c c 6 6 6 6 f f 5 c c c 5 f f
                . c 3 3 3 3 3 3 c 5 5 3 5 5 b .
                . c 3 3 3 3 c c c 4 5 5 5 5 c .
                . . c 3 3 c 5 5 b 4 4 5 5 4 c .
                . . . c b b c 5 b b 4 4 b 5 c .
                . . . c 5 c c 5 5 5 c 4 5 c c .
                . . . c c c c 5 5 5 5 c c . . .
                . . . . . . c c c c c c . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . c c . . . . . . . . . . .
                . . c 3 6 c c c c . . . . . . .
                . . c 6 3 3 3 6 6 c . . . . . .
                . c 3 3 3 3 3 3 6 6 c . . . . .
                c 3 3 3 3 3 3 c c 6 6 c c c b .
                c 3 3 3 3 3 c 5 5 c 6 c 5 5 b .
                c c 3 3 3 6 f f 5 c 6 c 5 f f .
                c c 6 6 6 6 f f 5 c c c 5 f f .
                c 3 3 3 3 c c c 5 5 3 5 5 b . .
                c 3 3 3 c 5 5 b 5 5 5 5 5 c . .
                . c 3 3 c 5 b b 4 4 5 5 4 4 c .
                . . c b 5 5 5 b 4 4 4 b 5 5 c .
                . . b c 5 5 5 c 4 4 4 5 5 5 c .
                . . c c 5 5 5 5 c 4 c c c c . .
                . . c c c c c c c c c c . . . .
                `, img`
                . . . c c . . . . . . . . . . .
                . . c 3 6 c c c c . . . . . . .
                . . c 6 3 3 3 3 6 c . . . . . .
                . c 3 3 3 3 3 c c 6 c . c c . .
                c 3 3 3 3 3 c 5 5 c 6 c 5 5 b .
                c 3 3 3 3 3 f f 5 c 6 c 5 f f .
                c c 3 3 3 6 f f 5 c 6 c 5 f f .
                c c 6 6 6 6 c 5 5 3 c 3 5 5 b .
                c 3 3 3 3 3 3 c 5 5 3 5 5 b . .
                c 3 3 3 3 3 c c 4 5 5 5 5 c c .
                . c 3 3 3 c 5 5 c 4 5 5 4 5 5 c
                . . c c b 5 5 5 c 4 4 4 b 4 5 b
                . . b b c 5 5 5 c 4 4 b 5 5 4 c
                . b 5 c c 5 5 5 5 c 4 c 5 5 5 c
                . c 5 c c c c c c 4 c 5 5 5 5 c
                . c c c . . . . . c c c c c c .
                `], 200, characterAnimations.rule(Predicate.MovingDown))
    characterAnimations.loopFrames(mySprite, [img`
                . . . . . . . . . . . c c . . .
                . . . . . . . c c c c 6 3 c . .
                . . . . . . c 6 3 3 3 3 6 c . .
                . . c c . c 6 c c 3 3 3 3 3 c .
                . b 5 5 c 6 c 5 5 c 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 6 3 3 3 c c
                . b 5 5 3 c 3 5 5 c 6 6 6 6 c c
                . . b 5 5 3 5 5 c 3 3 3 3 3 3 c
                . . c 5 5 5 5 b c c 3 3 3 3 3 c
                . . c 4 5 5 4 b 5 5 c 3 3 3 c .
                . c 5 b 4 4 b b 5 c c b b b . .
                . c 4 4 b 5 5 5 4 c 4 4 4 5 b .
                . c 5 4 c 5 5 5 c 4 4 4 c 5 c .
                . c 5 c 5 5 5 5 c 4 4 4 c c c .
                . . c c c c c c c . . . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . c c . . . .
                . . . . . . c c c c 6 3 c . . .
                . . . . . c 6 6 3 3 3 6 c . . .
                . . . . c 6 6 3 3 3 3 3 3 c . .
                b c c c 6 6 c c 3 3 3 3 3 3 c .
                b 5 5 c 6 c 5 5 c 3 3 3 3 3 c .
                f f 5 c 6 c 5 f f 6 3 3 3 c c .
                f f 5 c c c 5 f f 6 6 6 6 c c .
                . b 5 5 3 5 5 c 3 3 3 3 3 3 c .
                . c 5 5 5 5 4 c c c 3 3 3 3 c .
                . c 4 5 5 4 4 b 5 5 c 3 3 c . .
                . c 5 b 4 4 b b 5 c b b c . . .
                . c c 5 4 c 5 5 5 c c 5 c . . .
                . . . c c 5 5 5 5 c c c c . . .
                . . . . c c c c c c . . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . c c . . .
                . . . . . . . c c c c 6 3 c . .
                . . . . . . c 6 6 3 3 3 6 c . .
                . . . . . c 6 6 3 3 3 3 3 3 c .
                . b c c c 6 6 c c 3 3 3 3 3 3 c
                . b 5 5 c 6 c 5 5 c 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 6 3 3 3 c c
                . f f 5 c c c 5 f f 6 6 6 6 c c
                . . b 5 5 3 5 5 c c c 3 3 3 3 c
                . . c 5 5 5 5 5 b 5 5 c 3 3 3 c
                . c 4 4 5 5 4 4 b b 5 c 3 3 c .
                . c 5 5 b 4 4 4 b 5 5 5 b c . .
                . c 5 5 5 4 4 4 c 5 5 5 c b . .
                . . c c c c 4 c 5 5 5 5 c c . .
                . . . . c c c c c c c c c c . .
                `, img`
                . . . . . . . . . . . c c . . .
                . . . . . . . c c c c 6 3 c . .
                . . . . . . c 6 3 3 3 3 6 c . .
                . . c c . c 6 c c 3 3 3 3 3 c .
                . b 5 5 c 6 c 5 5 c 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 3 3 3 3 3 c
                . f f 5 c 6 c 5 f f 6 3 3 3 c c
                . b 5 5 3 c 3 5 5 c 6 6 6 6 c c
                . . b 5 5 3 5 5 c 3 3 3 3 3 3 c
                . c c 5 5 5 5 4 c c 3 3 3 3 3 c
                c 5 5 4 5 5 4 c 5 5 c 3 3 3 c .
                b 5 4 b 4 4 4 c 5 5 5 b c c . .
                c 4 5 5 b 4 4 c 5 5 5 c b b . .
                c 5 5 5 c 4 c 5 5 5 5 c c 5 b .
                c 5 5 5 5 c 4 c c c c c c 5 c .
                . c c c c c c . . . . . c c c .
                `], 200, characterAnimations.rule(Predicate.MovingLeft))
    characterAnimations.loopFrames(mySprite, [img`
                . . . c c . . . . . . . . . . .
                . . c 3 6 c c c c . . . . . . .
                . . c 6 3 3 3 3 6 c . . . . . .
                . c 3 3 3 3 3 c c 6 c . c c . .
                c 3 3 3 3 3 c 5 5 c 6 c 5 5 b .
                c 3 3 3 3 3 f f 5 c 6 c 5 f f .
                c c 3 3 3 6 f f 5 c 6 c 5 f f .
                c c 6 6 6 6 c 5 5 3 c 3 5 5 b .
                c 3 3 3 3 3 3 c 5 5 3 5 5 b . .
                c 3 3 3 3 3 c c b 5 5 5 5 c . .
                . c 3 3 3 c 5 5 b 4 5 5 4 c . .
                . . b b b c c 5 b b 4 4 b 5 c .
                . b 5 4 4 4 c 4 5 5 5 b 4 4 c .
                . c 5 c 4 4 4 c 5 5 5 c 4 5 c .
                . c c c 4 4 4 c 5 5 5 5 c 5 c .
                . . . . . . . c c c c c c c . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . c c . . . . . . . . . .
                . . . c 3 6 c c c c . . . . . .
                . . . c 6 3 3 3 6 6 c . . . . .
                . . c 3 3 3 3 3 3 6 6 c . . . .
                . c 3 3 3 3 3 3 c c 6 6 c c c b
                . c 3 3 3 3 3 c 5 5 c 6 c 5 5 b
                . c c 3 3 3 6 f f 5 c 6 c 5 f f
                . c c 6 6 6 6 f f 5 c c c 5 f f
                . c 3 3 3 3 3 3 c 5 5 3 5 5 b .
                . c 3 3 3 3 c c c 4 5 5 5 5 c .
                . . c 3 3 c 5 5 b 4 4 5 5 4 c .
                . . . c b b c 5 b b 4 4 b 5 c .
                . . . c 5 c c 5 5 5 c 4 5 c c .
                . . . c c c c 5 5 5 5 c c . . .
                . . . . . . c c c c c c . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . c c . . . . . . . . . . .
                . . c 3 6 c c c c . . . . . . .
                . . c 6 3 3 3 6 6 c . . . . . .
                . c 3 3 3 3 3 3 6 6 c . . . . .
                c 3 3 3 3 3 3 c c 6 6 c c c b .
                c 3 3 3 3 3 c 5 5 c 6 c 5 5 b .
                c c 3 3 3 6 f f 5 c 6 c 5 f f .
                c c 6 6 6 6 f f 5 c c c 5 f f .
                c 3 3 3 3 c c c 5 5 3 5 5 b . .
                c 3 3 3 c 5 5 b 5 5 5 5 5 c . .
                . c 3 3 c 5 b b 4 4 5 5 4 4 c .
                . . c b 5 5 5 b 4 4 4 b 5 5 c .
                . . b c 5 5 5 c 4 4 4 5 5 5 c .
                . . c c 5 5 5 5 c 4 c c c c . .
                . . c c c c c c c c c c . . . .
                `, img`
                . . . c c . . . . . . . . . . .
                . . c 3 6 c c c c . . . . . . .
                . . c 6 3 3 3 3 6 c . . . . . .
                . c 3 3 3 3 3 c c 6 c . c c . .
                c 3 3 3 3 3 c 5 5 c 6 c 5 5 b .
                c 3 3 3 3 3 f f 5 c 6 c 5 f f .
                c c 3 3 3 6 f f 5 c 6 c 5 f f .
                c c 6 6 6 6 c 5 5 3 c 3 5 5 b .
                c 3 3 3 3 3 3 c 5 5 3 5 5 b . .
                c 3 3 3 3 3 c c 4 5 5 5 5 c c .
                . c 3 3 3 c 5 5 c 4 5 5 4 5 5 c
                . . c c b 5 5 5 c 4 4 4 b 4 5 b
                . . b b c 5 5 5 c 4 4 b 5 5 4 c
                . b 5 c c 5 5 5 5 c 4 c 5 5 5 c
                . c 5 c c c c c c 4 c 5 5 5 5 c
                . c c c . . . . . c c c c c c .
                `], 200, characterAnimations.rule(Predicate.MovingRight))
}

// BAT
function create_bat(tile: tiles.Location) {
    clearTile(tile)

    let mySprite = sprites.create(img`
            . . f f f . . . . . . . . f f f
            . f f c c . . . . . . f c b b c
            f f c c . . . . . . f c b b c .
            f c f c . . . . . . f b c c c .
            f f f c c . c c . f c b b c c .
            f f c 3 c c 3 c c f b c b b c .
            f f b 3 b c 3 b c f b c c b c .
            . c b b b b b b c b b c c c . .
            . c 1 b b b 1 b b c c c c . . .
            c b b b b b b b b b c c . . . .
            c b c b b b c b b b b f . . . .
            f b 1 f f f 1 b b b b f c . . .
            f b b b b b b b b b b f c c . .
            . f b b b b b b b b c f . . . .
            . . f b b b b b b c f . . . . .
            . . . f f f f f f f . . . . . .
            `, SpriteKind.Bat)
    tiles.placeOnTile(mySprite, tile)
    mySprite.vx = 40
    mySprite.setFlag(SpriteFlag.BounceOnWall, true)
    characterAnimations.loopFrames(mySprite, [img`
                . . f f f . . . . . . . . f f f
                . f f c c . . . . . . f c b b c
                f f c c . . . . . . f c b b c .
                f c f c . . . . . . f b c c c .
                f f f c c . c c . f c b b c c .
                f f c 3 c c 3 c c f b c b b c .
                f f b 3 b c 3 b c f b c c b c .
                . c b b b b b b c b b c c c . .
                . c 1 b b b 1 b b c c c c . . .
                c b b b b b b b b b c c . . . .
                c b c b b b c b b b b f . . . .
                f b 1 f f f 1 b b b b f c . . .
                f b b b b b b b b b b f c c . .
                . f b b b b b b b b c f . . . .
                . . f b b b b b b c f . . . . .
                . . . f f f f f f f . . . . . .
                `, img`
                . . f f f . . . . . . . . . . .
                f f f c c . . . . . . . . f f f
                f f c c . . c c . . . f c b b c
                f f c 3 c c 3 c c f f b b b c .
                f f b 3 b c 3 b c f b b c c c .
                . c b b b b b b c f b c b c c .
                . c b b b b b b c b b c b b c .
                c b 1 b b b 1 b b b c c c b c .
                c b b b b b b b b c c c c c . .
                f b c b b b c b b b b f c . . .
                f b 1 f f f 1 b b b b f c c . .
                . f b b b b b b b b c f . . . .
                . . f b b b b b b c f . . . . .
                . . . f f f f f f f . . . . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . c c . . c c . . . . . . . .
                . . c 3 c c 3 c c c . . . . . .
                . c b 3 b c 3 b c c c . . . . .
                . c b b b b b b b b f f . . . .
                c c b b b b b b b b f f . . . .
                c b 1 b b b 1 b b c f f f . . .
                c b b b b b b b b f f f f . . .
                f b c b b b c b c c b b b . . .
                f b 1 f f f 1 b f c c c c . . .
                . f b b b b b b f b b c c . . .
                c c f b b b b b c c b b c . . .
                c c c f f f f f f c c b b c . .
                . c c c . . . . . . c c c c c .
                . . c c c . . . . . . . c c c c
                . . . . . . . . . . . . . . . .
                `, img`
                . f f f . . . . . . . . f f f .
                f f c . . . . . . . f c b b c .
                f c c . . . . . . f c b b c . .
                c f . . . . . . . f b c c c . .
                c f f . . . . . f f b b c c . .
                f f f c c . c c f b c b b c . .
                f f f c c c c c f b c c b c . .
                . f c 3 c c 3 b c b c c c . . .
                . c b 3 b c 3 b b c c c c . . .
                c c b b b b b b b b c c . . . .
                c b 1 b b b 1 b b b b f c . . .
                f b b b b b b b b b b f c c . .
                f b c b b b c b b b b f . . . .
                . f 1 f f f 1 b b b c f . . . .
                . . f b b b b b b c f . . . . .
                . . . f f f f f f f . . . . . .
                `], 200, characterAnimations.rule(Predicate.MovingLeft))
    characterAnimations.loopFrames(mySprite, [img`
                f f f . . . . . . . . f f f . .
                c b b c f . . . . . . c c f f .
                . c b b c f . . . . . . c c f f
                . c c c b f . . . . . . c f c f
                . c c b b c f . c c . c c f f f
                . c b b c b f c c 3 c c 3 c f f
                . c b c c b f c b 3 c b 3 b f f
                . . c c c b b c b b b b b b c .
                . . . c c c c b b 1 b b b 1 c .
                . . . . c c b b b b b b b b b c
                . . . . f b b b b c b b b c b c
                . . . c f b b b b 1 f f f 1 b f
                . . c c f b b b b b b b b b b f
                . . . . f c b b b b b b b b f .
                . . . . . f c b b b b b b f . .
                . . . . . . f f f f f f f . . .
                `, img`
                . . . . . . . . . . . f f f . .
                f f f . . . . . . . . c c f f f
                c b b c f . . . c c . . c c f f
                . c b b b f f c c 3 c c 3 c f f
                . c c c b b f c b 3 c b 3 b f f
                . c c b c b f c b b b b b b c .
                . c b b c b b c b b b b b b c .
                . c b c c c b b b 1 b b b 1 b c
                . . c c c c c b b b b b b b b c
                . . . c f b b b b c b b b c b f
                . . c c f b b b b 1 f f f 1 b f
                . . . . f c b b b b b b b b f .
                . . . . . f c b b b b b b f . .
                . . . . . . f f f f f f f . . .
                . . . . . . . . . . . . . . . .
                . . . . . . . . . . . . . . . .
                `, img`
                . . . . . . . . . . . . . . . .
                . . . . . . . . c c . . c c . .
                . . . . . . c c c 3 c c 3 c . .
                . . . . . c c c b 3 c b 3 b c .
                . . . . f f b b b b b b b b c .
                . . . . f f b b b b b b b b c c
                . . . f f f c b b 1 b b b 1 b c
                . . . f f f f b b b b b b b b c
                . . . b b b c c b c b b b c b f
                . . . c c c c f b 1 f f f 1 b f
                . . . c c b b f b b b b b b f .
                . . . c b b c c b b b b b f c c
                . . c b b c c f f f f f f c c c
                . c c c c c . . . . . . c c c .
                c c c c . . . . . . . c c c . .
                . . . . . . . . . . . . . . . .
                `, img`
                . f f f . . . . . . . . f f f .
                . c b b c f . . . . . . . c f f
                . . c b b c f . . . . . . c c f
                . . c c c b f . . . . . . . f c
                . . c c b b f f . . . . . f f c
                . . c b b c b f c c . c c f f f
                . . c b c c b f c c c c c f f f
                . . . c c c b c b 3 c c 3 c f .
                . . . c c c c b b 3 c b 3 b c .
                . . . . c c b b b b b b b b c c
                . . . c f b b b b 1 b b b 1 b c
                . . c c f b b b b b b b b b b f
                . . . . f b b b b c b b b c b f
                . . . . f c b b b 1 f f f 1 f .
                . . . . . f c b b b b b b f . .
                . . . . . . f f f f f f f . . .
                `], 200, characterAnimations.rule(Predicate.MovingRight))
}

// MONKEY
function create_monkey(tile: tiles.Location) {
    tiles.setTileAt(tile, assets.tile`transparency16`)
    let mySprite = sprites.create(img`
            . . . . f f f f f . . . . . . .
            . . . f e e e e e f . . . . . .
            . . f d d d d e e e f . . . . .
            . c d f d d f d e e f f . . . .
            . c d f d d f d e e d d f . . .
            c d e e d d d d e e b d c . . .
            c d d d d c d d e e b d c . f f
            c c c c c d d d e e f c . f e f
            . f d d d d d e e f f . . f e f
            . . f f f f f e e e e f . f e f
            . . . . f e e e e e e e f f e f
            . . . f e f f e f e e e e f f .
            . . . f e f f e f e e e e f . .
            . . . f d b f d b f f e f . . .
            . . . f d d c d d b b d f . . .
            . . . . f f f f f f f f f . . .
            `, SpriteKind.Monkey)
    tiles.placeOnTile(mySprite, tile)
    mySprite.vy = 40
    mySprite.setFlag(SpriteFlag.BounceOnWall, true)
    characterAnimations.loopFrames(mySprite, [img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f . . . . . .
                . . f d d d d e e e f . . . . .
                . c d f d d f d e e f f . . . .
                . c d f d d f d e e d d f . . .
                c d e e d d d d e e b d c . . .
                c d d d d c d d e e b d c . f f
                c c c c c d d d e e f c . f e f
                . f d d d d d e e f f . . f e f
                . . f f f f f e e e e f . f e f
                . . . . f e e e e e e e f f e f
                . . . f e f f e f e e e e f f .
                . . . f e f f e f e e e e f . .
                . . . f d b f d b f f e f . . .
                . . . f d d c d d b b d f . . .
                . . . . f f f f f f f f f . . .
                `, img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f . . . . . .
                . . f d d d d e e e f . . . . .
                . c d f d d f d e e f . . . . .
                . c d f d d f d e e f f . . . .
                c d e e d d d d e e d d f . . .
                c d d d d c d d e e b d c . . .
                c c c c c d d e e e b d c . f f
                . f d d d d e e e f f c . f e f
                . f f f f f f e e e e f . f e f
                . f f f f e e e e e e e f f e f
                f d d f d d f e f e e e e f f .
                f d b f d b f e f e e e e f . .
                f f f f f f f f f f f f e f . .
                . . . . . . . . . f c d d f . .
                . . . . . . . . . . f f f f . .
                `, img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f . . . . . .
                . . f d d d d e e e f f . . . .
                . c d d d d d d e e d d f . . .
                . c d f d d f d e e b d c . . .
                c d d f d d f d e e b d c . f f
                c d e e d d d d e e f c . f e f
                c d d d d c d e e e f . . f e f
                . f c c c d e e e f f . . f e f
                . . f f f f f e e e e f . f e f
                . . . . f e e e e e e e f f f .
                . . f f e f e e f e e e e f . .
                . f e f f e e f f f e e e f . .
                f d d b d d c f f f f f f b f .
                f d d c d d d f . . f c d d f .
                . f f f f f f f . . . f f f . .
                `, img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f f f . . . .
                . . f d d d e e e e d d f . . .
                . c d d d d d e e e b d c . . .
                . c d d d d d d e e b d c . . .
                c d d f d d f d e e f c . f f .
                c d d f d d f d e e f . . f e f
                c d e e d d d d e e f . . f e f
                . f d d d c d e e f f . . f e f
                . . f f f d e e e e e f . f e f
                . . . . f e e e e e e e f f f .
                . . . . f f e e e e e b f f . .
                . . . f e f f e e c d d f f . .
                . . f d d b d d c f f f . . . .
                . . f d d c d d d f f . . . . .
                . . . f f f f f f f . . . . . .
                `, img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f . . . . . .
                . . f d d d d e e e f . . . . .
                . c d f d d f d e e f f . . . .
                . c d f d d f d e e d d f . . .
                c d e e d d d d e e b d c . . .
                c d d d d c d d e e b d c . . .
                c c c c c d d e e e f c . . . .
                . f d d d d e e e f f . . . . .
                . . f f f f f e e e e f . . . .
                . . . . f f e e e e e e f . f f
                . . . f e e f e e f e e f . e f
                . . f e e f e e f e e e f . e f
                . f b d f d b f b b f e f f e f
                . f d d f d d f d d b e f f f f
                . . f f f f f f f f f f f f f .
                `], 200, characterAnimations.rule(Predicate.MovingUp))
    characterAnimations.loopFrames(mySprite, [img`
                . . . . . . . f f f f f . . . .
                . . . . . . f e e e e e f . . .
                . . . . . f e e e d d d d f . .
                . . . . f f e e d f d d f d c .
                . . . f d d e e d f d d f d c .
                . . . c d b e e d d d d e e d c
                f f . c d b e e d d c d d d d c
                f e f . c f e e d d d c c c c c
                f e f . . f f e e d d d d d f .
                f e f . f e e e e f f f f f . .
                f e f f e e e e e e e f . . . .
                . f f e e e e f e f f e f . . .
                . . f e e e e f e f f e f . . .
                . . . f e f f b d f b d f . . .
                . . . f d b b d d c d d f . . .
                . . . f f f f f f f f f . . . .
                `, img`
                . . . . . . . f f f f f . . . .
                . . . . . . f e e e e e f . . .
                . . . . . f e e e d d d d f . .
                . . . . . f e e d f d d f d c .
                . . . . f f e e d f d d f d c .
                . . . f d d e e d d d d e e d c
                . . . c d b e e d d c d d d d c
                f f . c d b e e e d d c c c c c
                f e f . c f f e e e d d d d f .
                f e f . f e e e e f f f f f f .
                f e f f e e e e e e e f f f f .
                . f f e e e e f e f d d f d d f
                . . f e e e e f e f b d f b d f
                . . f e f f f f f f f f f f f f
                . . f d d c f . . . . . . . . .
                . . f f f f . . . . . . . . . .
                `, img`
                . . . . . . . f f f f f . . . .
                . . . . . . f e e e e e f . . .
                . . . . f f e e e d d d d f . .
                . . . f d d e e d d d d d d c .
                . . . c d b e e d f d d f d c .
                f f . c d b e e d f d d f d d c
                f e f . c f e e d d d d e e d c
                f e f . . f e e e d c d d d d c
                f e f . . f f e e e d c c c f .
                f e f . f e e e e f f f f f . .
                . f f f e e e e e e e f . . . .
                . . f e e e e f e e f e f f . .
                . . f e e e f f f e e f f e f .
                . f b f f f f f f c d d b d d f
                . f d d c f . . f d d d c d d f
                . . f f f . . . f f f f f f f .
                `, img`
                . . . . . . . f f f f f . . . .
                . . . . f f f e e e e e f . . .
                . . . f d d e e e e d d d f . .
                . . . c d b e e e d d d d d c .
                . . . c d b e e d d d d d d c .
                . f f . c f e e d f d d f d d c
                f e f . . f e e d f d d f d d c
                f e f . . f e e d d d d e e d c
                f e f . . f f e e d c d d d f .
                f e f . f e e e e e d f f f . .
                . f f f e e e e e e e f . . . .
                . . f f b e e e e e f f . . . .
                . . f f d d c e e f f e f . . .
                . . . . f f f c d d b d d f . .
                . . . . . f f d d d c d d f . .
                . . . . . . f f f f f f f . . .
                `, img`
                . . . . . . . f f f f f . . . .
                . . . . . . f e e e e e f . . .
                . . . . . f e e e d d d d f . .
                . . . . f f e e d f d d f d c .
                . . . f d d e e d f d d f d c .
                . . . c d b e e d d d d e e d c
                . . . c d b e e d d c d d d d c
                . . . . c f e e e d d c c c c c
                . . . . . f f e e e d d d d f .
                . . . . f e e e e f f f f f . .
                f f . f e e e e e e f f . . . .
                f e . f e e f e e f e e f . . .
                f e . f e e e f e e f e e f . .
                f e f f e f b b f b d f d b f .
                f f f f e b d d f d d f d d f .
                . f f f f f f f f f f f f f . .
                `], 200, characterAnimations.rule(Predicate.MovingDown))
    characterAnimations.loopFrames(mySprite, [img`
                . . . . . . . f f f f f . . . .
                . . . . . . f e e e e e f . . .
                . . . . . f e e e d d d d f . .
                . . . . f f e e d f d d f d c .
                . . . f d d e e d f d d f d c .
                . . . c d b e e d d d d e e d c
                f f . c d b e e d d c d d d d c
                f e f . c f e e d d d c c c c c
                f e f . . f f e e d d d d d f .
                f e f . f e e e e f f f f f . .
                f e f f e e e e e e e f . . . .
                . f f e e e e f e f f e f . . .
                . . f e e e e f e f f e f . . .
                . . . f e f f b d f b d f . . .
                . . . f d b b d d c d d f . . .
                . . . f f f f f f f f f . . . .
                `, img`
                . . . . . . . f f f f f . . . .
                . . . . . . f e e e e e f . . .
                . . . . . f e e e d d d d f . .
                . . . . . f e e d f d d f d c .
                . . . . f f e e d f d d f d c .
                . . . f d d e e d d d d e e d c
                . . . c d b e e d d c d d d d c
                f f . c d b e e e d d c c c c c
                f e f . c f f e e e d d d d f .
                f e f . f e e e e f f f f f f .
                f e f f e e e e e e e f f f f .
                . f f e e e e f e f d d f d d f
                . . f e e e e f e f b d f b d f
                . . f e f f f f f f f f f f f f
                . . f d d c f . . . . . . . . .
                . . f f f f . . . . . . . . . .
                `, img`
                . . . . . . . f f f f f . . . .
                . . . . . . f e e e e e f . . .
                . . . . f f e e e d d d d f . .
                . . . f d d e e d d d d d d c .
                . . . c d b e e d f d d f d c .
                f f . c d b e e d f d d f d d c
                f e f . c f e e d d d d e e d c
                f e f . . f e e e d c d d d d c
                f e f . . f f e e e d c c c f .
                f e f . f e e e e f f f f f . .
                . f f f e e e e e e e f . . . .
                . . f e e e e f e e f e f f . .
                . . f e e e f f f e e f f e f .
                . f b f f f f f f c d d b d d f
                . f d d c f . . f d d d c d d f
                . . f f f . . . f f f f f f f .
                `, img`
                . . . . . . . f f f f f . . . .
                . . . . f f f e e e e e f . . .
                . . . f d d e e e e d d d f . .
                . . . c d b e e e d d d d d c .
                . . . c d b e e d d d d d d c .
                . f f . c f e e d f d d f d d c
                f e f . . f e e d f d d f d d c
                f e f . . f e e d d d d e e d c
                f e f . . f f e e d c d d d f .
                f e f . f e e e e e d f f f . .
                . f f f e e e e e e e f . . . .
                . . f f b e e e e e f f . . . .
                . . f f d d c e e f f e f . . .
                . . . . f f f c d d b d d f . .
                . . . . . f f d d d c d d f . .
                . . . . . . f f f f f f f . . .
                `, img`
                . . . . . . . f f f f f . . . .
                . . . . . . f e e e e e f . . .
                . . . . . f e e e d d d d f . .
                . . . . f f e e d f d d f d c .
                . . . f d d e e d f d d f d c .
                . . . c d b e e d d d d e e d c
                . . . c d b e e d d c d d d d c
                . . . . c f e e e d d c c c c c
                . . . . . f f e e e d d d d f .
                . . . . f e e e e f f f f f . .
                f f . f e e e e e e f f . . . .
                f e . f e e f e e f e e f . . .
                f e . f e e e f e e f e e f . .
                f e f f e f b b f b d f d b f .
                f f f f e b d d f d d f d d f .
                . f f f f f f f f f f f f f . .
                `], 200, characterAnimations.rule(Predicate.MovingRight))
    characterAnimations.loopFrames(mySprite, [img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f . . . . . .
                . . f d d d d e e e f . . . . .
                . c d f d d f d e e f f . . . .
                . c d f d d f d e e d d f . . .
                c d e e d d d d e e b d c . . .
                c d d d d c d d e e b d c . f f
                c c c c c d d d e e f c . f e f
                . f d d d d d e e f f . . f e f
                . . f f f f f e e e e f . f e f
                . . . . f e e e e e e e f f e f
                . . . f e f f e f e e e e f f .
                . . . f e f f e f e e e e f . .
                . . . f d b f d b f f e f . . .
                . . . f d d c d d b b d f . . .
                . . . . f f f f f f f f f . . .
                `, img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f . . . . . .
                . . f d d d d e e e f . . . . .
                . c d f d d f d e e f . . . . .
                . c d f d d f d e e f f . . . .
                c d e e d d d d e e d d f . . .
                c d d d d c d d e e b d c . . .
                c c c c c d d e e e b d c . f f
                . f d d d d e e e f f c . f e f
                . f f f f f f e e e e f . f e f
                . f f f f e e e e e e e f f e f
                f d d f d d f e f e e e e f f .
                f d b f d b f e f e e e e f . .
                f f f f f f f f f f f f e f . .
                . . . . . . . . . f c d d f . .
                . . . . . . . . . . f f f f . .
                `, img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f . . . . . .
                . . f d d d d e e e f f . . . .
                . c d d d d d d e e d d f . . .
                . c d f d d f d e e b d c . . .
                c d d f d d f d e e b d c . f f
                c d e e d d d d e e f c . f e f
                c d d d d c d e e e f . . f e f
                . f c c c d e e e f f . . f e f
                . . f f f f f e e e e f . f e f
                . . . . f e e e e e e e f f f .
                . . f f e f e e f e e e e f . .
                . f e f f e e f f f e e e f . .
                f d d b d d c f f f f f f b f .
                f d d c d d d f . . f c d d f .
                . f f f f f f f . . . f f f . .
                `, img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f f f . . . .
                . . f d d d e e e e d d f . . .
                . c d d d d d e e e b d c . . .
                . c d d d d d d e e b d c . . .
                c d d f d d f d e e f c . f f .
                c d d f d d f d e e f . . f e f
                c d e e d d d d e e f . . f e f
                . f d d d c d e e f f . . f e f
                . . f f f d e e e e e f . f e f
                . . . . f e e e e e e e f f f .
                . . . . f f e e e e e b f f . .
                . . . f e f f e e c d d f f . .
                . . f d d b d d c f f f . . . .
                . . f d d c d d d f f . . . . .
                . . . f f f f f f f . . . . . .
                `, img`
                . . . . f f f f f . . . . . . .
                . . . f e e e e e f . . . . . .
                . . f d d d d e e e f . . . . .
                . c d f d d f d e e f f . . . .
                . c d f d d f d e e d d f . . .
                c d e e d d d d e e b d c . . .
                c d d d d c d d e e b d c . . .
                c c c c c d d e e e f c . . . .
                . f d d d d e e e f f . . . . .
                . . f f f f f e e e e f . . . .
                . . . . f f e e e e e e f . f f
                . . . f e e f e e f e e f . e f
                . . f e e f e e f e e e f . e f
                . f b d f d b f b b f e f f e f
                . f d d f d d f d d b e f f f f
                . . f f f f f f f f f f f f f .
                `], 200, characterAnimations.rule(Predicate.MovingLeft))
}



function update_labels() {
    magic_label.setText(`x${mana}`)
    key_label.setText(`x${keys}`)
    coin_label.setText(`x${coins}`)
}

function advance_level() {
    current_level += 1
    wizard.setScale(1, ScaleAnchor.Middle)
    controller.moveSprite(wizard, 60, 60)
    tiles.setCurrentTilemap(levels[current_level])
    render_walls()
}

scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile2`, function on_overlap_tile3(sprite: Sprite, location: tiles.Location) {
    clearTile(location)
    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
    mana += 1
    update_labels()
})

info.onLifeZero(function on_life_zero() {
    info.setScore(coins)
    game.gameOver(false)
})

scene.onOverlapTile(SpriteKind.Player, sprites.dungeon.hazardHole, function on_overlap_tile4(sprite: Sprite, location: tiles.Location) {
    if (!is_falling) {
        is_falling = true
        controller.moveSprite(sprite, 0, 0)
        tiles.placeOnTile(sprite, location)

        timer.after(250, function on_after4() {
            music.play(music.melodyPlayable(music.jumpDown), music.PlaybackMode.InBackground)
            sprite.setScale(0.75, ScaleAnchor.Middle)

            timer.after(500, function on_after5() {
                sprite.setScale(0.5, ScaleAnchor.Middle)

                timer.after(500, function on_after6() {
                    advance_level()
                    is_falling = false
                })
            })
        })
    }

})

scene.onHitWall(SpriteKind.Projectile, function on_hit_wall3(sprite: Sprite, location: tiles.Location) {
    if (tiles.tileAtLocationEquals(location, sprites.dungeon.stairLadder)) {
        tiles.setTileAt(location, assets.tile`transparency16`)
        music.play(music.melodyPlayable(music.knock), music.PlaybackMode.InBackground)
        tiles.setWallAt(location, false)
    }

})

function init_inventory() {
    key_label = create_label(img`
            . . . . 5 5 5 5 . . . .
            . . . 5 e e e e e . . .
            . . . 5 e c c e e . . .
            . . . 5 e c c e e . . .
            . . . 5 e c c 5 e . . .
            . . . 5 e e 5 e e . . .
            . . . . e e e e . . . .
            . . . . . 5 e . . . . .
            . . . . . 5 e . . . . .
            . . . . . 5 e 5 5 . . .
            . . . . . 5 e e e . . .
            . . . . . 5 e 5 . . . .
            `, 85)
    key_label.z += 100

    magic_label = create_label(img`
            . . . . . 3 3 . . . . .
            . . . . 3 1 1 3 . . . .
            . . . . 3 1 1 3 . . . .
            3 2 2 3 1 1 1 1 3 2 2 .
            3 3 1 1 1 1 1 1 1 1 3 3
            3 3 1 1 1 1 1 1 1 1 3 3
            . 3 1 1 1 1 1 1 1 1 3 .
            . . 3 1 1 1 1 1 1 3 . .
            . . 2 1 1 1 1 1 1 2 . .
            . . 2 1 1 3 3 1 1 2 . .
            . . 3 3 3 2 2 2 3 3 . .
            . . . . . . . . . . . .
            `, 55)
    magic_label.z += 100

    coin_label = create_label(img`
        . . . . . . . . . . . .
        . . . . . . . . . . . .
        . . . . b b b b . . . .
        . . . b 5 5 5 5 b . . .
        . . b 5 d 3 3 d 5 b . .
        . . b 5 3 5 5 1 5 b . .
        . . c 5 3 5 5 1 d c . .
        . . c d d 1 1 d d c . .
        . . . f d d d d f . . .
        . . . . f f f f . . . .
        . . . . . . . . . . . .
        . . . . . . . . . . . .
    `, 115)
    coin_label.z += 100

    update_labels()
}

// SETUP

const INITIAL_MANA = 3
const INITIAL_LIVES = 3
const FIREBALL_COST = 1
const STARFIRE_COST = 3

let coin_label: TextSprite = null
let key_label: TextSprite = null
let magic_label: TextSprite = null
let mana = INITIAL_MANA
let coins = 0
let keys = 0
let is_falling = false
let current_level = -1


const LEVELS = [
    tilemap`level 1`,
    tilemap`level 2`,
    tilemap`level 3`
]

tiles.setCurrentTilemap(LEVELS[0])

const player = sprites.create(sprites.swamp.witchForward0, SpriteKind.Player)
controller.moveSprite(player, 50, 50)