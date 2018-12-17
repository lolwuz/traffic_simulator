/* globals serverData, socket */
import Phaser from 'phaser'
import intersects from '../intersects.json'
import { ArrayBufferToString, StringToArrayBuffer } from '../binairyframe'

export default class Traffic extends Phaser.Sprite {
  constructor ({game, x, y, asset, trajectoryArray, speed, type, anchorPoint, mass, lookAhead}) {
    super(game, x, y, asset)
    this.game.physics.p2.enable(this, false)

    this.events.onKilled.add(this.onKilled, this, 1)

    this.body.setRectangle(this.width - 4, this.height - 4)
    this.body.enable = true
    this.body.onBeginContact.add(this.contact, this)
    this.body.motionState = 0
    this.body.damping = mass / 1000
    this.body.angularDamping = mass / 1000
    this.body.mass = mass

    this.type = type
    this.trajectoryArrayPassed = []
    this.trajectoryArray = trajectoryArray
    this.lookAhead = lookAhead
    this.speed = speed
    this.stopped = false
    this.isClose = false
    this.isColliding = false
    this.targetAngle = 0
    this.anchor.x = anchorPoint
    this.alpha = 0

    this.intersects = intersects
  }

  update () {
    if (this.isColliding) {
      return
    }

    if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
      this.animations.stop('walk')
    } else {
      this.animations.play('walk', 5, true)
    }

    this.updateFade()
    this.isClose = this.isCloseTo()

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

  isCloseTo () {
    let children = this.game.world.children
    for (let x = 0; x < children.length; x++) {
      let traffic = children[x]
      if (traffic.constructor === Traffic && traffic !== this) {
        let tx = traffic.x - this.x
        let ty = traffic.y - this.y
        let distance = Math.sqrt(tx * tx + ty * ty)
        if (distance < (this.width / 2 + traffic.width / 2) + 20) {
          if (traffic.trajectoryArrayPassed.length > this.trajectoryArrayPassed.length &&
            this.trajectoryArray === traffic.trajectoryArray && !traffic.isColliding) {
            return true
          }
        }
      }
    }
    return false
  }

  contact (bodyB, shapeA, shapeB, contactEquations) {
    if (bodyB != null) {
      let bodyName = bodyB.sprite.getLightName()
      let thisName = this.getLightName()

      let isColliding = this.isIntersect(bodyName, thisName)

      if (isColliding || bodyB.sprite.isColliding || this.isColliding) {
        bodyB.sprite.isColliding = true
        this.isColliding = true

        this.body.motionState = 1
        bodyB.sprite.body.motionState = 1

        this.lifespan = 3000
        bodyB.sprite.lifespan = 3000
      }
    }
  }

  onKilled () {
    console.log('IM KILLED')
    this.destroy()
  }

  isPointReached (point) {
    let tx = point.x - this.x
    let ty = point.y - this.y
    let distance = Math.sqrt(tx * tx + ty * ty)

    return distance <= 10
  }

  moveToPoint (point, i) {
    this.body.setZeroVelocity()
    this.stopped = false
    if (this.isPointReached(point)) {
      if (typeof point.light !== 'undefined') {
        for (let i = 0; i < serverData.length; i++) {
          let lights = serverData[i]

          if (point.light === lights.light) {
            let sendArray = [point.light]
            let jsonString = JSON.stringify(sendArray)
            // let arrayBuffer = StringToArrayBuffer(jsonString)

            socket.send(jsonString)

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
      this.move(point)
    }
  }

  move (point) {
    let tx = point.x - this.x
    let ty = point.y - this.y
    let distance = Math.sqrt(tx * tx + ty * ty)

    let rad = Math.atan2(ty, tx)
    let angle = rad / Math.PI * 180
    let velocityX = (tx / distance) * this.speed
    let velocityY = (ty / distance) * this.speed

    if (!(this.isClose || this.isColliding)) {
      this.body.angle = angle
      this.body.velocity.x = velocityX * 4
      this.body.velocity.y = velocityY * 4
    }
  }

  angleBetween (angle) {
    return Math.abs(this.body.angle - angle)
  }

  getLightName () {
    let index = this.trajectoryArrayPassed.length - 1

    for (let x = index; x >= 0; x--) {
      let point = this.trajectoryArray[x]

      if (typeof point.light !== 'undefined') {
        return point.light
      }
    }

    for (let x = 0; x < this.trajectoryArray.length; x++) {
      let point = this.trajectoryArray[x]

      if (typeof point.light !== 'undefined') {
        return point.light
      }
    }
    return null
  }

  isIntersect (nameA, nameB) {
    if (nameA == null || nameB == null || nameA === nameB) {
      return false
    }

    let aIndex = this.getIntersectIndex(nameA)
    let bIndex = this.getIntersectIndex(nameB)

    return this.intersects[aIndex][bIndex + 1] === '1'
  }

  getIntersectIndex (name) {
    for (let x = 0; x < this.intersects.length; x++) {
      let intersect = this.intersects[x]
      if (intersect[0] === name) {
        return x
      }
    }
  }
}
