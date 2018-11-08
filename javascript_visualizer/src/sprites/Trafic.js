import Phaser from 'phaser'


export default class Trafic extends Phaser.Sprite {
	constructor({ game, x, y, asset, trajectory_array, speed, type }) {
		super(game, 0, 0, asset)
		
		this.type = type
		this.trajectory_array_passed = []
		this.trajectory_array = trajectory_array
		this.speed = speed
		this.stopped = false
	}


	is_point_reached(point) {
		let tx = point.x - this.x
		let ty = point.y - this.y
		let distance = Math.sqrt(tx * tx + ty * ty)

		return distance <= 10
	}

	move_to_point(point, i) {
		this.stopped = false
		if (this.is_point_reached(point)) {
			if (typeof point.light != "undefined") {
				for (let i = 0; i < server_data.length; i++) {
					let lights = server_data[i]

					if (point.light == lights.light) {
						let send_array = [point.light] 
						
						socket.send(JSON.stringify(send_array))
						

						if (lights.status == "green") {
							break
						}
						else if (lights.status == "orange" || lights.status == "red") {
							this.stopped = true
							break
						}
					}
				}
			}
			
			if(!this.stopped) {
				this.trajectory_array_passed.push(i)
			}


		} else {
			let tx = point.x - this.x
			let ty = point.y - this.y
			let distance = Math.sqrt(tx * tx + ty * ty)
			let rad = Math.atan2(ty, tx)
			let angle = rad / Math.PI * 180
			let velocity_x = (tx / distance) * this.speed
			let velocity_y = (ty / distance) * this.speed

			this.x += velocity_x
			this.y += velocity_y
			this.angle = angle
		}

	}

	update() {
		for (let i = 0; i < this.trajectory_array.length; i++) {
			let point = this.trajectory_array[i]

			if (this.trajectory_array_passed.indexOf(i) === -1) {
				this.move_to_point(point, i)
				return
			}
		}
	}
}
