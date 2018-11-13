/* globals __DEV__ */
import Phaser from 'phaser'
import Trafic from '../sprites/Trafic'
import lang from '../lang'
import {QuadTree} from 'phaser-ce'
import trajectory from '../trajectory'

export default class Game extends Phaser.State {
  /** Phaser State functions */
  preload () {
    this.isDown = false
    this.scale = 1
    this.lastX = 0
    this.lastY = 0

    this.cursor = this.game.input.keyboard.createCursorKeys()
    this.camera = this.game.camera
    this.game.input.mouse.capture = true
    this.isDown = false

    this.points = []
    this.lines = []

    this.debugPoints()
  }

  create () {
    this.roadMap = this.game.add.sprite(0, 0, 'road_map')
    this.game.world.setBounds(0, 0, this.roadMap.width, this.roadMap.height)
    this.game.camera.focusOnXY(this.roadMap.width / 2, this.roadMap.height / 2)

    this.testCar = new Trafic({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'top_car',
      trajectoryArray: trajectory.carWestSouth,
      speed: 5,
      type: 'car'
    })
    this.testCar.anchor.set(0.65)
    this.game.add.existing(this.testCar)


    this.currentPoint = this.game.add.image(0, 0, 'centroid')
    this.currentPoint.anchor.set(0.5)
    this.currentPoint.alpha = 0.5
  }

  render () {
    for (let i = 0; i < this.lines.length; i++) {
      this.game.debug.geom(this.lines[i])
    }
  }

  debugPoints () {
    this.game.input.onDown.add(this.mousePressed, this)
    let spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    spacebar.onDown.add(this.spacePressed, this)
    let deleteKnop = this.game.input.keyboard.addKey(Phaser.Keyboard.DELETE)
    deleteKnop.onDown.add(this.deletePressed, this)
  }

  mousePressed (point) {
    if (this.game.input.activePointer.leftButton.isDown) {
      let position = new Phaser.Point(point.worldX, point.worldY)
      this.points.push(position)

      this.lines = []

      let lastPoint = new Phaser.Point(0, 0)
      for (let i = 0; i < this.points.length; i++) {
        let currentPoint = this.points[i]
        if (lastPoint.x !== 0) {
          let line = new Phaser.Line(lastPoint.x, lastPoint.y, currentPoint.x, currentPoint.y)
          this.lines.push(line)
          console.log(this.line)
        }
        lastPoint = currentPoint
      }
    }
  }

  spacePressed () {
    console.log(this.points)

    this.lines = []
    this.points = []
  }

  deletePressed () {
    console.log(this.lines)
    console.log(this.points)

    this.lines.pop()
    this.points.pop()

  }

  update () {
    let pointer = this.game.input.activePointer

    if (pointer.isDown && !this.isDown) {
      this.isDown = true
    }

    if (pointer.isUp && this.isDown) {
      this.isDown = false
    }

    this.updateScale(pointer)
    this.updatePosition(pointer)
  }

  /** Updates the camera scale when scrolling */
  updateScale (pointer) {
    let newScale = this.scale
    if (this.cursor.up.isDown) {
      newScale += 0.01
    }

    if (this.cursor.down.isDown) {
      newScale -= 0.01
    }

    let cameraFocusX = this.roadMap.width / 2
    let cameraFocusY = this.roadMap.height / 2

    if (newScale !== this.scale) {
      // Don't zoom further than 0.7
      if (newScale < 0.7) {
        newScale = 0.7
      }
      this.scale = newScale
      this.game.world.scale.setTo(newScale)
      this.camera.focusOnXY(cameraFocusX * this.scale, cameraFocusY * this.scale)
    }
  }

  /** Updates the camera position when dragging the mouse */
  updatePosition (pointer) {
    if (pointer.isDown) {
      let deltaX = this.lastX - pointer.x
      let deltaY = this.lastY - pointer.y

      this.game.camera.x += deltaX
      this.game.camera.y += deltaY
    }

    this.lastX = pointer.x
    this.lastY = pointer.y
  }
}
