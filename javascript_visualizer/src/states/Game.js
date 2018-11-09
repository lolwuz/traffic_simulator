/* globals __DEV__ */
import Phaser from 'phaser'
import Trafic from '../sprites/Trafic'
import lang from '../lang'
import {QuadTree} from 'phaser-ce'
import trajectory from '../trajectory'

export default class Game extends Phaser.State {
<<<<<<< HEAD
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
=======
  preload () {
    this.game.load.image('road_map', './assets/images/road_map_small.png')
    this.game.load.image('top_car', './assets/images/top_car.png')
    this.game.load.image('centroid', '/assets/images/centroid.png')
    this.isDown = false
    this.points = []
    this.over = false
    this.currentPoint
  }

  create () {
    let roadMap = this.game.add.sprite(0, 0, 'road_map')
>>>>>>> 74baf472f3e44d24f256b01c9fc2e9a7f2ca703a

    this.testCar = new Trafic({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'top_car',
      trajectoryArray: trajectory.carWestSouth,
      speed: 5,
      type: 'car'
    })

    this.game.add.existing(this.testCar)

    this.currentPoint = this.game.add.image(0, 0, 'centroid')
    this.currentPoint.anchor.set(0.5)
    this.currentPoint.alpha = 0.5

    this.game.input.onTap.add(this.onTapHandler, this)
  }

  onTapHandler () {
    console.log(this.over)
    if (!this.over) {
      let img = this.game.add.sprite(this.game.input.activePointer.position.x, this.game.input.activePointer.position.y, 'centroid', 0)
      this.points.push(img.position)

      img.anchor.set(0.5)
      img.alpha = 0.25
      img.inputEnabled = true
      img.input.enableDrag(true)
      img.defaultCursor = 'move'

      img.events.onInputOver.add(function () {
        this.alpha = 1
        this.scale.setTo(1.2, 1.2)
        this.over = true
      }, img)

<<<<<<< HEAD
    if (pointer.isUp && this.isDown) {
      this.isDown = false
=======
      img.events.onInputOut.add(function () {
        this.alpha = 0.25
        this.scale.setTo(1, 1)
        this.over = false
      }, img)
>>>>>>> 74baf472f3e44d24f256b01c9fc2e9a7f2ca703a
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

  update () {
    this.currentPoint.position.copyFrom(this.game.input.activePointer.position)
    // let pointer = this.game.input.activePointer
    //
    // if (pointer.isDown && !this.isDown) {
    //   this.isDown = true
    // }
    //
    // if (pointer.isUp && this.isDown) {
    //   console.log('click')
    //   this.isDown = false
    // }
  }

  render () {
    this.game.world.forEachAlive(function (child) {
      this.game.debug.text(Phaser.Math.roundTo(child.x, 0) + ',' + Phaser.Math.roundTo(child.y, 0),
        child.x - 10, child.y + 25, '#ff1e00', '12px Courier')
    }.bind(this))
  }
}
