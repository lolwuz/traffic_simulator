/* globals __DEV__ */
import Phaser from 'phaser'
import Trafic from '../sprites/Trafic'
import lang from '../lang'
import { QuadTree } from 'phaser-ce';
import trajectory from '../trajectory'


export default class Game extends Phaser.State {
	constructor() {
		super();

		this.socket = new WebSocket('ws://141.252.214.94:5678');	
		this.socket.addEventListener('message', this.receive_socket_message);
		this.receive_socket_message = this.receive_socket_message.bind(this);	
		console.log(trajectory)	;
	}

	preload() {
		this.game.load.image('road_map', './assets/images/road_map_small.png');
		this.game.load.image('top_car', './assets/images/top_car.png');
	}

	create() {
		let s = this.game.add.sprite(0, 0, 'road_map');

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

	receive_socket_message(event) {
		console.log('Message from server ', event.data);
		let data = JSON.parse(event.data)

		this.text.setText(data.time);
	}
}
