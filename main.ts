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
    textSprite.setPosition(wizard.x, wizard.y)
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



const LEVELS = [
    tilemap`level 1`,
    tilemap`level 2`,
    tilemap`level 3`
]

tiles.setCurrentTilemap(LEVELS[0])

const player = sprites.create(sprites.swamp.witchForward0, SpriteKind.Player)
controller.moveSprite(player, 50, 50)