/* globals serverData, socket */
import Phaser from 'phaser'

export default class Trafic extends Phaser.Sprite {
  constructor ({game, x, y, asset, trajectoryArray, speed, type}) {
    super(game, 0, 0, asset)

    this.type = type
    this.trajectoryArrayPassed = []
    this.trajectoryArray = trajectoryArray
    this.speed = speed
    this.stopped = false
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

  getLineXYatPercent (startPt, endPt, percent) {
    let dx = endPt.x - startPt.x
    let dy = endPt.y - startPt.y
    let X = startPt.x + dx * percent
    let Y = startPt.y + dy * percent

    return ({x: X, y: Y})
  }

  getQuadraticBezierXYatPercent (startPt, controlPt, endPt, percent) {
    let x = Math.pow(1 - percent, 2) * startPt.x + 2 * (1 - percent) * percent * controlPt.x + Math.pow(percent, 2) * endPt.x
    let y = Math.pow(1 - percent, 2) * startPt.y + 2 * (1 - percent) * percent * controlPt.y + Math.pow(percent, 2) * endPt.y

    return x, y
  }

  update () {
    for (let i = 0; i < this.trajectoryArray.length; i++) {
      let point = this.trajectoryArray[i]

      if (this.trajectoryArrayPassed.indexOf(i) === -1) {
        this.moveToPoint(point, i)
        return
      }
    }
  }
}
