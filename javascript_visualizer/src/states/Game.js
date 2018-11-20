/* globals serverData */
import Phaser from 'phaser'
import Traffic from '../sprites/Traffic'
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
    this.easter_eggs_enabled = false

    this.points = []
    this.lines = []
    this.lightGraphics = []

    this.regular_sprites = ['regular_car_1', 'regular_car_2', 'regular_car_3', 'regular_car_4', 'regular_car_5', 'regular_car_6', 'regular_car_7', 'race_car_1', 'race_car_2', 'race_car_3', 'race_car_4', 'race_car_5']
    this.van_sprites = ['van_1']
    this.motor_sprites = ['motor_1', 'motor_2', 'motor_3']
    this.bicycle_sprites = ['bicycle_1', 'bicycle_2']
    this.motorcycle_sprites = ['motorcycle_1']
    this.pedestrian_sprites = []
    this.bus_sprites = ['bus_1']
    this.train_sprites = ['train_1']
    this.truck_sprites = ['truck_1']
    this.easter_egg_sprites = ['david', 'wesket', 'bas', 'victor', 'mariska']

    // this.available_sprites = ['regular_car_1', 'regular_car_2', 'race_car_1', 'race_car_2', 'race_car_3', 'race_car_4', 'race_car_5']
    // this.available_sprites.anchors = []

    this.lastSpawn = new Date().getTime()
    this.nextSpawn = this.lastSpawn + Math.round(Math.random() * (3000 - 500)) + 500
    // this.debugPoints()
  }

  create () {
    this.game.physics.startSystem(Phaser.Physics.P2JS)
    this.game.physics.p2.restitution = 0.2

    this.roadMap = this.game.add.sprite(0, 0, 'road_map')
    this.game.world.setBounds(0, 0, this.roadMap.width, this.roadMap.height)
    this.game.camera.focusOnXY(this.roadMap.width / 2, this.roadMap.height / 2)

    this.currentPoint = this.game.add.image(0, 0, 'centroid')
    this.currentPoint.anchor.set(0.5)
    this.currentPoint.alpha = 0.5

    this.createLights()
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
      this.nextSpawn = this.lastSpawn + Math.round(Math.random() * (1000 - 500)) + 500
      this.randomVehicle()
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

  randomVehicle () {
    switch (Math.floor(Math.random() * 9)) {
      case 0:
        // Regular car
        let trajectories = Object.keys(trajectory).slice(0, 11 + 1)
        let trajectIndex = trajectories.length * Math.random() << 0
        let key = trajectories[trajectIndex]
        if (this.checkTrajectory(trajectIndex, key)) {
          this.game.add.existing(this.randomCar(key))
        }
        break
      case 1:
        // Motor
        trajectories = Object.keys(trajectory).slice(0, 11 + 1)
        trajectIndex = trajectories.length * Math.random() << 0
        key = trajectories[trajectIndex]
        if (this.checkTrajectory(trajectIndex, key)) {
          this.game.add.existing(this.randomMotor(key))
        }
        break
      case 2:
        // Bicycle
        this.game.add.existing(this.randomBicycle())
        break
      case 3:
        // Motorcycle
        this.game.add.existing(this.randomMotorcycle())
        break
      case 4:
        // Truck
        trajectories = Object.keys(trajectory).slice(0, 11 + 1)
        trajectIndex = trajectories.length * Math.random() << 0
        key = trajectories[trajectIndex]
        if (this.checkTrajectory(trajectIndex, key)) {
          this.game.add.existing(this.randomTruck(key))
        }
        break
      case 5:
        // Bus
        trajectories = Object.keys(trajectory).slice(0, 11 + 1)
        trajectIndex = trajectories.length * Math.random() << 0
        key = trajectories[trajectIndex]
        if (this.checkTrajectory(trajectIndex, key)) {
          this.game.add.existing(this.randomBus(key))
        }
        break
      case 6:
        // van
        trajectories = Object.keys(trajectory).slice(0, 11 + 1)
        trajectIndex = trajectories.length * Math.random() << 0
        key = trajectories[trajectIndex]
        if (this.checkTrajectory(trajectIndex, key)) {
          this.game.add.existing(this.randomVan(key))
        }
        break
      case 7:
        // Train
        this.game.add.existing(this.randomTrain())
        break
      case 8:
        // Easter egg
        if (this.easter_eggs_enabled) {
          this.game.add.existing(this.easter_egg())
        }
    }
  }

  randomCar (key) {
    return new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: this.regular_sprites[Math.floor(Math.random() * this.regular_sprites.length)],
      trajectoryArray: trajectory[key],
      speed: 50,
      type: 'car',
      anchorPoint: 0.5,
      mass: 750
    })
  }

  randomBicycle () {
    let trajectories = Object.keys(trajectory).slice(12, 17 + 1)
    let key = trajectories[trajectories.length * Math.random() << 0]

    return new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: this.bicycle_sprites[Math.floor(Math.random() * this.bicycle_sprites.length)],
      trajectoryArray: trajectory[key],
      speed: 50,
      type: 'bicycle',
      anchorPoint: 0.5,
      mass: 500
    })
  }

  randomMotorcycle () {
    let trajectories = Object.keys(trajectory).slice(12, 17 + 1)
    let key = trajectories[trajectories.length * Math.random() << 0]

    return new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: this.motorcycle_sprites[Math.floor(Math.random() * this.motorcycle_sprites.length)],
      trajectoryArray: trajectory[key],
      speed: 50,
      type: 'motorcycle',
      anchorPoint: 0.5,
      mass: 700
    })
  }

  randomMotor (key) {
    return new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: this.motor_sprites[Math.floor(Math.random() * this.motor_sprites.length)],
      trajectoryArray: trajectory[key],
      speed: 50,
      type: 'motor',
      anchorPoint: 0.5,
      mass: 700
    })
  }

  randomTruck (key) {
    return new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: this.truck_sprites[Math.floor(Math.random() * this.truck_sprites.length)],
      trajectoryArray: trajectory[key],
      speed: 50,
      type: 'truck',
      anchorPoint: 0.5,
      mass: 950
    })
  }

  randomBus (key) {
    return new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: this.bus_sprites[Math.floor(Math.random() * this.bus_sprites.length)],
      trajectoryArray: trajectory[key],
      speed: 50,
      type: 'bus',
      anchorPoint: 0.5,
      mass: 900
    })
  }

  randomVan (key) {
    return new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: this.van_sprites[Math.floor(Math.random() * this.van_sprites.length)],
      trajectoryArray: trajectory[key],
      speed: 50,
      type: 'van',
      anchorPoint: 0.5,
      mass: 800
    })
  }

  randomTrain () {
    let trajectories = Object.keys(trajectory).slice(18, 19 + 1)
    let key = trajectories[trajectories.length * Math.random() << 0]

    return new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: this.train_sprites[Math.floor(Math.random() * this.train_sprites.length)],
      trajectoryArray: trajectory[key],
      speed: 50,
      type: 'train',
      anchorPoint: 0.5,
      mass: 1000
    })
  }

  checkTrajectory (trajectIndex, key) {
    let currentTrajectory = trajectory[key]
    let allChildren = this.game.world.children
    let counterCars = 0
    let counterASix = 0
    let ASix = false
    for (let i = 0; i < allChildren.length; i++) {
      if (allChildren[i].constructor === Traffic) {
        if (allChildren[i].trajectoryArray === currentTrajectory) {
          for (let j = 0; j < allChildren[i].trajectoryArray.length; j++) {
            let light = allChildren[i].trajectoryArray[j]
            if (typeof light.light !== 'undefined') {
              let indexLight = j
              if (allChildren[i].trajectoryArrayPassed.length <= indexLight) {
                if (trajectIndex === 6 || trajectIndex === 7) {
                  ASix = true
                  let trajectIndexTemp = (trajectIndex === 6 ? trajectIndex + 1 : trajectIndex)
                  let trajectoriesTemp = Object.keys(trajectory).slice(0, 11 + 1)
                  let keyTemp = trajectoriesTemp[trajectIndexTemp]
                  let currentTrajectoryTemp = trajectory[keyTemp]
                  for (let k = 0; k < allChildren.length; k++) {
                    if (allChildren[k].trajectoryArray === currentTrajectoryTemp) {
                      for (let l = 0; l < allChildren[k].trajectoryArray.length; l++) {
                        let lightTemp = allChildren[k].trajectoryArray[l]
                        if (typeof lightTemp.light !== 'undefined') {
                          let indexLightTemp = l
                          if (allChildren[k].trajectoryArrayPassed.length <= indexLightTemp) {
                            counterASix++
                          }
                        }
                      }
                    }
                  }
                }
              }
              if (counterASix !== 5) {
                counterCars++
              }
            }
          }
        }
      }
    }

    if (ASix && (counterCars + counterASix) <= 5) {
      return true
    } else if (!ASix && counterCars < 5) {
      return true
    } else {
      return false
    }
  }
  easterEgg () {
    let trajectories = Object.keys(trajectory)
    let key = trajectories[trajectories.length * Math.random() << 0]

    return new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: this.easter_egg_sprites[Math.floor(Math.random() * this.easter_egg_sprites.length)],
      trajectoryArray: trajectory[key],
      speed: 50,
      type: 'easter_egg',
      anchorPoint: 0.5,
      mass: 1000
    })
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
