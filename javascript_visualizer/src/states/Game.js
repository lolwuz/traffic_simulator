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
  }

  create () {
    this.roadMap = this.game.add.sprite(0, 0, 'road_map')
    this.game.world.setBounds(0, 0, this.roadMap.width, this.roadMap.height)

    this.test_car = new Trafic({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'top_car',
      trajectoryArray: trajectory.car_west_south,
      speed: 5,
      type: 'car'
    })

    this.game.add.existing(this.test_car)
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
