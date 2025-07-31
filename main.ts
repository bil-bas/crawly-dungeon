 
const levels = [
    tilemap`level 1`,
    tilemap`level 2`,
    tilemap`level 3`
]

tiles.setCurrentTilemap(levels[2])

let player = sprites.create(sprites.swamp.witchForward0, SpriteKind.Player)
controller.moveSprite(player, 50, 50)