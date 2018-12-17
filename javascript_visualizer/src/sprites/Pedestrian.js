import Phaser from 'phaser'
import Traffic from './Trafic'

export default class Pedestrian extends Traffic {
  constructor ({ game, x, y, asset, trajectoryArray, speed }) {
    super(game, x, y, asset, trajectoryArray, speed)
  }

  update () {
    super.update()
  }
}
