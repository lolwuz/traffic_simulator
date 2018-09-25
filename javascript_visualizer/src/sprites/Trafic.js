import Phaser from 'phaser'

export default class Trafic extends Phaser.Sprite {
	constructor ({ game, x, y, asset, trajectory_array, speed, socket, type }) {
		super(game, trajectory_array[0].x, trajectory_array[0].y, asset)
		this.socket = socket;
		this.type = type;
		
		this.trajectory_array_passed = [];
		this.trajectory_array = trajectory_array;
		this.speed = speed;
		this.stopped = false;
	}

	traffic_light(point) {
		this.socket.send()
		this.stopped = true;
	}

	is_point_reached(point) {
		let tx = point.x - this.x,
			ty = point.y - this.y,
			distance = Math.sqrt(tx*tx+ty*ty);

		console.log(distance)
		if (distance > 100) {
			return false;
		} else {
			return true;
		}
	}

	move_to_point(point) {
		let tx = point.x - this.x,
			ty = point.y - this.y,
			distance = Math.sqrt(tx*tx+ty*ty),
			rad = Math.atan2(ty,tx),
			angle = rad / Math.PI * 180,
			velocity_x = (tx / distance) * this.speed,
			velocity_y = (ty / distance) * this.speed;

		this.x += velocity_x;
		this.y += velocity_y;
	}

	update () {
		for(let i = 0; i < this.trajectory_array.length; i++) {
			let trajectory_point = this.trajectory_array[i];

			
			// Check if point has been passed
			if(this.trajectory_array_passed.indexOf(trajectory_point) === -1) {

				
				// Is the point reached?
				if(this.is_point_reached(trajectory_point)){
					console.log(trajectory_point)
					this.trajectory_array.push(trajectory_point)
				} else {
					// Move towards point
					this.move_to_point(trajectory_point)
				}
			}
		}
	}
}
