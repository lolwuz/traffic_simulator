import Phaser from 'phaser'


export default class Trafic extends Phaser.Sprite {
  constructor ({game, x, y, asset, trajectory_array, speed, socket, type}) {
	super(game, 0, 0, asset)
	this.socket = socket
	this.type = type

	this.trajectory_array_passed = []
	this.trajectory_array = trajectory_array
	this.speed = speed
	this.stopped = false
  }

  traffic_light (point) {
	this.socket.send()
	this.stopped = true
  }

  is_point_reached (point) {
	let tx = point.x - this.x
	let ty = point.y - this.y
	let distance = Math.sqrt(tx * tx + ty * ty)

	return distance <= 10
  }

  move_to_point (point, i) {
    if(this.is_point_reached(point)){
	  this.trajectory_array_passed.push(i)
	}

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

  update () {
	for (let i = 0; i < this.trajectory_array.length; i++) {
	  let point = this.trajectory_array[i]

	  if(this.trajectory_array_passed.indexOf(i) === -1) {
	    this.move_to_point(point, i)
		return
	  }
	}
  }
}
