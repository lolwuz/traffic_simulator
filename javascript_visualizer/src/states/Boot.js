import Phaser from 'phaser'
import WebFont from 'webfontloader'
import config from '../config'

export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#000000'
    this.stage.disableVisibilityChange = true
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)

    console.log(this.game.input)
  }

  preload () {
    if (config.webfonts.length) {
      WebFont.load({
        google: {
          families: config.webfonts
        },
        active: this.fontsLoaded
      })
    }

    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', {
      font: '16px Arial',
      fill: '#dddddd',
      align: 'center'
    })
    text.anchor.setTo(0.5, 0.5)

    this.load.image('loaderBg', './assets/images/loader-bg.png')
    this.load.image('loaderBar', './assets/images/loader-bar.png')

    this.game.camera.scale.x = 1
    this.game.camera.scale.y = 1
    // this.game.camera.focusOnXY(0, 0)
  }

  render () {
    if (config.webfonts.length && this.fontsReady) {
      this.state.start('Splash')
    }
    if (!config.webfonts.length) {
      this.state.start('Splash')
    }
  }

  fontsLoaded () {
    this.fontsReady = true
  }
}
