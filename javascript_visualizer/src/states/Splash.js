import Phaser from 'phaser'
import {centerGameObjects} from '../utils'

export default class extends Phaser.State {
  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('road_map', './assets/images/road_map_small.png')
    this.load.image('regular_car_1', './assets/images/regular_traffic/regular_1.png')
    this.load.image('regular_car_2', './assets/images/regular_traffic/regular_2.png')
    this.load.image('regular_car_3', './assets/images/regular_traffic/regular_3.png')
    this.load.image('regular_car_4', './assets/images/regular_traffic/regular_4.png')
    this.load.image('regular_car_5', './assets/images/regular_traffic/regular_5.png')
    this.load.image('regular_car_6', './assets/images/regular_traffic/regular_6.png')
    this.load.image('regular_car_7', './assets/images/regular_traffic/regular_7.png')

    this.load.image('race_car_1', '/assets/images/regular_traffic/race_1.png')
    this.load.image('race_car_2', '/assets/images/regular_traffic/race_2.png')
    this.load.image('race_car_3', '/assets/images/regular_traffic/race_3.png')
    this.load.image('race_car_4', '/assets/images/regular_traffic/race_4.png')
    this.load.image('race_car_5', '/assets/images/regular_traffic/race_5.png')

    this.load.image('motor_1', './assets/images/regular_traffic/motor_1.png')
    this.load.image('motor_2', './assets/images/regular_traffic/motor_2.png')
    this.load.image('motor_3', './assets/images/regular_traffic/motor_3.png')

    this.load.image('bicycle_1', './assets/images/bicycles/bicycle_1.png')
    this.load.image('bicycle_2', './assets/images/bicycles/bicycle_2.png')

    this.load.image('van_1', './assets/images/regular_traffic/van_1.png')

    this.load.image('train_1', './assets/images/trains/train_1.png')

    this.load.image('bus_1', './assets/images/busses/bus_1.png')

    this.load.image('motorcycle_1', './assets/images/bicycles/motorcycle_1.png')

    this.load.image('truck_1', './assets/images/regular_traffic/truck_1.png')

    this.load.spritesheet('pedestrian_1', './assets/images/pedestrians/pedestrian_1.png', 11, 11, 2)

    // Easter eggs
    this.load.image('david', './assets/images/easter_eggs/david.png')
    this.load.image('wesket', './assets/images/easter_eggs/wesket.png')
    this.load.image('bas', './assets/images/easter_eggs/bas.png')
    this.load.image('victor', './assets/images/easter_eggs/victor.png')
    // this.load.image('simon', './assets/images/easter_eggs/simon.png')
    this.load.image('mariska', './assets/images/easter_eggs/mariska.png')
    // Particles
    this.game.load.image('fire1', 'assets/images/fire1.png')
    this.game.load.image('fire2', 'assets/images/fire2.png')
    this.game.load.image('fire3', 'assets/images/fire3.png')
    this.game.load.image('smoke', 'assets/images/smoke-puff.png')
  }

  create () {
    this.state.start('Game')
  }
}
