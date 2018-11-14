/* globals serverData */
import Phaser from 'phaser'
import Trafic from '../sprites/Trafic'
import trajectory from '../trajectory'

let lights = [
  {'light': 'A1', 'x': 100, 'y': 50},
  {'light': 'A2', 'x': 300, 'y': 50, 'r': 230},
  {'light': 'A3', 'x': 500, 'y': 50, 'r': 230}
]

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
    this.lightGraphics = []

    this.lastSpawn = new Date().getTime()
    this.nextSpawn = this.lastSpawn + Math.round(Math.random() * (3000 - 500)) + 500

    // this.debugPoints()
  }

  create () {
    this.roadMap = this.game.add.sprite(0, 0, 'road_map')
    this.game.world.setBounds(0, 0, this.roadMap.width, this.roadMap.height)
    this.game.camera.focusOnXY(this.roadMap.width / 2, this.roadMap.height / 2)

    this.currentPoint = this.game.add.image(0, 0, 'centroid')
    this.currentPoint.anchor.set(0.5)
    this.currentPoint.alpha = 0.5

    this.createLights()
    this.randomCar()
  }

  update () {
    let pointer = this.game.input.activePointer

    if (pointer.isDown && !this.isDown) {
      this.isDown = true
    }

    if (pointer.isUp && this.isDown) {
      this.isDown = false
    }

    // Random spawn objects
    let time = new Date().getTime()
    if (this.nextSpawn < time) {
      this.lastSpawn = time
      this.nextSpawn = this.lastSpawn + Math.round(Math.random() * (1000 - 500)) + 100
      this.randomCar()
    }

    this.updateScale(pointer)
    this.updatePosition(pointer)
    this.updateLights()
  }

  render () {
    for (let i = 0; i < this.lines.length; i++) {
      this.game.debug.geom(this.lines[i])
    }
  }

  randomCar () {
    let trajectories = Object.keys(trajectory)
    let key = trajectories[trajectories.length * Math.random() << 0]

    let newCar = new Trafic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: 'top_car',
      trajectoryArray: trajectory[key],
      speed: 4.1,
      type: 'car'
    })

    this.game.add.existing(newCar)
  }

  createLights () {
    for (let property in trajectory) {
      if (trajectory.hasOwnProperty(property)) {
        let lights = trajectory[property]
        for (let i = 0; i < lights.length; i++) {
          if (typeof lights[i].light !== 'undefined' && typeof lights[i].light !== 'undefined') {
            let graphics = this.game.add.graphics(lights[i].x, lights[i].y)

            // draw a circle
            graphics.lineStyle(0)
            graphics.beginFill(0xFF0000, 0.8)
            graphics.drawCircle(470, 40, 40)
            graphics.endFill()

            let light = {
              graphic: graphics,
              light: lights[i].light
            }

            this.lightGraphics.push(light)
          }
        }
      }
    }
  }

  debugPoints () {
    this.game.input.onDown.add(this.mousePressed, this)
    let spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    spacebar.onDown.add(this.spacePressed, this)
    let deleteKnop = this.game.input.keyboard.addKey(Phaser.Keyboard.DELETE)
    deleteKnop.onDown.add(this.deletePressed, this)
    let homeKnop = this.game.input.keyboard.addKey(Phaser.Keyboard.HOME)
    homeKnop.onDown.add(this.homePressed, this)
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

  homePressed () {
    for (let i = 0; i < trajectory.carSouthEast1.length; i++) {
      let newPoint = new Phaser.Point(trajectory.carSouthEast1[i].x, trajectory.carSouthEast1[i].y)
      this.points.push(newPoint)
    }
    console.log(this.lines)
  }

  updateLights () {
    for (let i = 0; i < this.lightGraphics.length; i++) {
      let lightGraphic = this.lightGraphics[i]

      for (let y = 0; y < serverData.length; y++) {
        let light = serverData[y]
        let color = 0xFF0000
        if (light.light === lightGraphic.light) {
          switch (light.status) {
            case 'green':
              color = 0x008000
              break
            case 'orange':
              color = 0xFFD700
              break
            default:
              color = 0xFF0000
          }

          lightGraphic.graphic.clear()
          lightGraphic.graphic.lineStyle(0)
          lightGraphic.graphic.beginFill(color, 0.8)
          lightGraphic.graphic.drawCircle(0, 0, 40)
          lightGraphic.graphic.endFill()
        }
      }
    }
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
