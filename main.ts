 
const levels = [
    tilemap`level 1`,
    tilemap`level 2`,
    tilemap`level 3`
]

tiles.setCurrentTilemap(levels[1])

let mySprite = sprites.create(assets.image`witchForward0`, SpriteKind.Player)
controller.moveSprite(mySprite, 50, 50)