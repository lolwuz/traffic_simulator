/* globals serverData, socket */
import Phaser from 'phaser'

export default class Trafic extends Phaser.Sprite {
  constructor ({game, x, y, asset, trajectoryArray, speed, type}) {
    super(game, x, y, asset)
    this.game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.enable = true
    this.body.collideWorldBounds = false
    this.body.checkCollision.up = false
    this.body.checkCollision.down = false

    this.type = type
    this.trajectoryArrayPassed = []
    this.trajectoryArray = trajectoryArray
    this.speed = speed
    this.stopped = false
    this.targetAngle = 0
    this.anchor.set(0.5)
    this.alpha = 0
  }

  update () {

    this.game.physics.arcade.collide(sprite, sprite2)

    this.updateFade()

    for (let i = 0; i < this.trajectoryArray.length; i++) {
      let point = this.trajectoryArray[i]

      if (this.trajectoryArrayPassed.indexOf(i) === -1) {
        this.moveToPoint(point, i)
        return
      }
    }

    this.destroy()
  }

  updateFade () {
    if (this.alpha < 1.00) {
      this.alpha += 0.01
    } else {
      this.alpha = 1
    }
  }

  updateAngle () {
    if (this.targetAngle > this.angle) {
      this.angle += 2
    } else {
      this.angle -= 2
    }
  }

  isPointReached (point) {
    let tx = point.x - this.x
    let ty = point.y - this.y
    let distance = Math.sqrt(tx * tx + ty * ty)

    return distance <= 10
  }

  moveToPoint (point, i) {
    this.stopped = false
    if (this.isPointReached(point)) {
      if (typeof point.light !== 'undefined') {
        for (let i = 0; i < serverData.length; i++) {
          let lights = serverData[i]

          if (point.light === lights.light) {
            let sendArray = [point.light]

            socket.send(JSON.stringify(sendArray))

            if (lights.status === 'green') {
              break
            } else if (lights.status === 'orange' || lights.status === 'red') {
              this.stopped = true
              break
            }
          }
        }
      }

      if (!this.stopped) {
        this.trajectoryArrayPassed.push(i)
      }
    } else {
      let tx = point.x - this.x
      let ty = point.y - this.y
      let distance = Math.sqrt(tx * tx + ty * ty)
      let rad = Math.atan2(ty, tx)
      let angle = rad / Math.PI * 180
      let velocityX = (tx / distance) * this.speed
      let velocityY = (ty / distance) * this.speed

      this.x += velocityX
      this.y += velocityY
      this.angle = angle
    }
  }
}
