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
    this.pedestrian_sprites = ['pedestrian_1']
    this.bus_sprites = ['bus_1']
    this.train_sprites = ['train_1']
    this.truck_sprites = ['truck_1']
    this.easter_egg_sprites = ['david', 'wesket', 'bas', 'victor']

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

    this.trafficGroup = this.physics.p2.createCollisionGroup()

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
      this.nextSpawn = this.lastSpawn + Math.round(Math.random() * 250) + 250
      // console.log('lastSpawn: ' + this.lastSpawn + ' nextSpawn: ' + this.nextSpawn)
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
    let percentage = Math.floor(Math.random() * 101)
    let trajectories
    let trajectIndex
    let key
    let sprite
    let speed
    let type
    let mass
    let position
    let isPedestrian = false

    if (percentage <= 30) {
      // Car
      trajectories = Object.keys(trajectory).slice(0, 11 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      sprite = this.regular_sprites[Math.floor(Math.random() * this.regular_sprites.length)]
      speed = 50
      type = 'car'
      mass = 750
      position = this.checkTrajectory(trajectIndex, key)
      console.log(position)
    } else if (percentage <= 32) {
      // Van
      trajectories = Object.keys(trajectory).slice(0, 11 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      sprite = this.van_sprites[Math.floor(Math.random() * this.van_sprites.length)]
      speed = 50
      type = 'van'
      mass = 800
      // if (!this.checkTrajectory(trajectIndex, key)) return
    } else if (percentage <= 34) {
      // Motor
      trajectories = Object.keys(trajectory).slice(0, 11 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      speed = 50
      sprite = this.motor_sprites[Math.floor(Math.random() * this.motor_sprites.length)]
      type = 'motor'
      mass = 700
      // if (!this.checkTrajectory(trajectIndex, key)) return
    } else if (percentage <= 64) {
      // Pedestrian
      trajectories = Object.keys(trajectory).slice(24, 29 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      sprite = this.pedestrian_sprites[Math.floor(Math.random() * this.pedestrian_sprites.length)]
      speed = 15
      type = 'pedestrian'
      mass = 300
      isPedestrian = true
    } else if (percentage <= 92) {
      // Bicycle
      trajectories = Object.keys(trajectory).slice(13, 19 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      sprite = this.bicycle_sprites[Math.floor(Math.random() * this.bicycle_sprites.length)]
      speed = 20
      type = 'bicycle'
      mass = 500
    } else if (percentage <= 94) {
      // Motorcycle
      trajectories = Object.keys(trajectory).slice(13, 19 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      sprite = this.motorcycle_sprites[Math.floor(Math.random() * this.motorcycle_sprites.length)]
      speed = 30
      type = 'motorcycle'
      mass = 600
    } else if (percentage <= 96) {
      // Bus
      trajectories = Object.keys(trajectory).slice(0, 12 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      sprite = this.bus_sprites[Math.floor(Math.random() * this.bus_sprites.length)]
      speed = 50
      type = 'bus'
      mass = 900
      // if (!this.checkTrajectory(trajectIndex, key)) return
    } else if (percentage <= 98) {
      // Truck
      trajectories = Object.keys(trajectory).slice(0, 11 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      sprite = this.truck_sprites[Math.floor(Math.random() * this.truck_sprites.length)]
      speed = 50
      type = 'truck'
      mass = 950
      // if (!this.checkTrajectory(trajectIndex, key)) return
    } else if (percentage <= 99) {
      // Train
      trajectories = Object.keys(trajectory).slice(20, 23 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      sprite = this.train_sprites[Math.floor(Math.random() * this.train_sprites.length)]
      speed = 75
      type = 'train'
      mass = 1000
    } else {
      // Easter egg
      if (!this.easter_eggs_enabled) return
      trajectories = Object.keys(trajectory).slice(0, 12 + 1)
      trajectIndex = trajectories.length * Math.random() << 0
      key = trajectories[trajectIndex]
      sprite = this.easter_egg_sprites[Math.floor(Math.random() * this.easter_egg_sprites.length)]
      speed = 50
      type = 'easter_egg'
      mass = 10
    }

    let newTraffic = new Traffic({
      game: this.game,
      x: trajectory[key][0].x,
      y: trajectory[key][0].y,
      asset: sprite,
      trajectoryArray: trajectory[key],
      speed: speed,
      type: type,
      anchorPoint: 0.5,
      mass: mass,
      group: this.trafficGroup
    })
    if (isPedestrian) {
      newTraffic.animations.add('walk')
      newTraffic.animations.play('walk', 5, true)
    }
    this.game.add.existing(newTraffic)
  }

  checkTrajectory (trajectIndex, key) {
    let currentTrajectory = trajectory[key]
    let allChildren = this.game.world.children
    let laneLength = 0
    let carsInLane = 0
    let carsWidth = 0
    let position

    for (let i = 0; i < allChildren.length; i++) {
      if (allChildren[i].constructor === Traffic) {
        if (allChildren[i].trajectoryArray === currentTrajectory) {
          for (let j = 0; j < allChildren[i].trajectoryArray.length; j++) {
            let light = allChildren[i].trajectoryArray[j]
            if (typeof light.light !== 'undefined') {
              laneLength = Math.sqrt(Math.pow((light.x) - (allChildren[i].trajectoryArray[0].x), 2) + Math.pow((light.y) - (allChildren[i].trajectoryArray[0].y), 2))
              if (allChildren[i].trajectoryArrayPassed.length >= 0) {
                carsInLane += allChildren[i].width
                if (carsInLane >= laneLength) {
                  carsWidth += allChildren[i].width
                }
              }
            }
          }
          console.log(carsWidth)
        }
      }
    }
    position = { x: trajectory[key][0].x, y: trajectory[key][0].y - carsWidth }
    return position
  }

  createLights () {
    for (let property in trajectory) {
      if (trajectory.hasOwnProperty(property)) {
        let lights = trajectory[property]
        for (let i = 0; i < lights.length; i++) {
          if (typeof lights[i].light !== 'undefined' && typeof lights[i].light !== 'undefined') {
            let graphics = this.game.add.graphics(lights[i].x, lights[i].y)

            // draw a circle
            // graphics.name = 'A'
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
    for (let i = 0; i < trajectory.bicycleNorthEast.length; i++) {
      let newPoint = new Phaser.Point(trajectory.bicycleNorthEast[i].x, trajectory.bicycleNorthEast[i].y)
      this.points.push(newPoint)
    }
    console.log(this.lines)
  }

  updateLights () {
    // console.log(serverData)
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
  updateScale () {
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
      if (newScale < 0.4) {
        newScale = 0.4
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
