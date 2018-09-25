import Phaser from 'phaser'
import Trafic from './Trafic'

export default class Pedestrian extends Trafic {
	constructor ({ game, x, y, asset, trajectory_array, speed }) {
		super(game, x, y, asset, trajectory_array, speed)
	}

	update () {
		super.update()
	}
}
