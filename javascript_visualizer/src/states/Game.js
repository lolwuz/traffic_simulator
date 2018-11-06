/* globals __DEV__ */
import Phaser from 'phaser'
import Trafic from '../sprites/Trafic'
import lang from '../lang'
import { QuadTree } from 'phaser-ce';
import trajectory from '../trajectory'


export default class Game extends Phaser.State {
	
	preload() {
		this.game.load.image('road_map', './assets/images/road_map_small.png');
		this.game.load.image('top_car', './assets/images/top_car.png');
	}

	create() {
		let road_map = this.game.add.sprite(0, 0, 'road_map');

		

		this.test_car = new Trafic({
			game: this.game,
			x: this.world.centerX,
			y: this.world.centerY,
			asset: 'top_car',
			trajectory_array: trajectory.car_west_south,
			speed: 5,
			socket: this.socket,
			type: "car"
		});

		this.game.add.existing(this.test_car)
	}

}
