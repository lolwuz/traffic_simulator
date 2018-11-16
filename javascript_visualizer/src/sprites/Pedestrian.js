import Phaser from 'phaser'
import Traffic from './Trafic'

export default class Pedestrian extends Traffic {
	constructor ({ game, x, y, asset, trajectory_array, speed }) {
		super(game, x, y, asset, trajectory_array, speed)
	}

	update () {
		super.update()
	}
}
