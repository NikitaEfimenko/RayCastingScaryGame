import { Howl } from 'howler'
import _ from 'lodash'
export const background = () => {
  const sounds = [
    'music/background.mp3',
  ]
  const sound = new Howl({
    src:sounds,
    autoplay: true,
    loop:true,
    volume: 0.1
  });
}

export const howl = () => {
  const sounds = [
    'music/howl.mp3'
  ]
  const sound = new Howl({
    src:sounds,
    autoplay: true,
    loop: true,
    volume: 0.9,
  });
}

export const step = (() => {
	let isEnd = true
	const sounds = [
  	'music/step.mp3'
  ]
  const sound = new Howl({
    	src:sounds,
    	volume: 0.9,
    	onend: () => {
    		isEnd = true
    	}
  })
	return () => {
  	if (isEnd) {
  		sound.play()
  		isEnd = false
  	}
	}
})()

export const scream = (() => {
	let isEnd = true
	const sounds = [
  	'music/scream.mp3'
  ]
  const sound = new Howl({
    	src:sounds,
    	volume: 1,
    	onend: () => {
    		isEnd = true
    	}
  	})
	return () => {
  	if (isEnd) {
  		sound.play()
  		isEnd = false
  	}
	}
})()