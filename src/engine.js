import {
	background,
	howl,
	step as stepSound,
	scream
} from './music'


CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2*r) r = w/2;
        if (h < 2*r) r = h/2;
        this.beginPath();
        if (r < 1) {
            this.rect(x, y, w, h);
        } else {
            if (window["opera"]) {
                this.moveTo(x+r, y);
                this.arcTo(x+r, y, x, y+r, r);
                this.lineTo(x, y+h-r);
                this.arcTo(x, y+h-r, x+r, y+h, r);
                this.lineTo(x+w-r, y+h);
                this.arcTo(x+w-r, y+h, x+w, y+h-r, r);
                this.lineTo(x+w, y+r);
                this.arcTo(x+w, y+r, x+w-r, y, r);
            } else {
                this.moveTo(x+r, y);
                this.arcTo(x+w, y, x+w, y+h, r);
                this.arcTo(x+w, y+h, x, y+h, r);
                this.arcTo(x, y+h, x, y, r);
                this.arcTo(x, y, x+w, y, r);
            }
        }
        this.closePath();
    };
    CanvasRenderingContext2D.prototype.fillRoundRect = function(x, y, w, h, r) {
        this.roundRect(x, y, w, h, r);
        this.fill();
    };


const bg = new Image()
bg.src = 'bg.jpg'

const sky = new Image()
sky.src = 'sky.jpg'

const wall = new Image()
wall.src = 'wall.jpg'

const monster = new Image()
monster.src = 'monster.png'

const floor = new Image()
floor.src = 'floor.jpg'

const wall1 = new Image()
wall1.src = 'wall.png'


let initial = {
	hero:{
		direction: {
			x:0,
			y:-1,
			alpha: Math.PI / 4
		},
		origin: {
			x:430,
			y:290
		},
		health: 100
	},

	map:[
		{
			img:floor,
			width:500,
			height:500
		},
		{
			img:wall,
			width:750,
			height:500
		},
		{
			img:wall1,
			width:750,
			height:500
		}
	],
	enemies:[]

}

initial.enemies = [...Array(50).keys()].map(i => ({x:900 * Math.random(), y: 900 * Math.random(), health: Math.random() * 100}))

const d = (vec1, vec2) => Math.sqrt((vec1.x - vec2.x)**2 + (vec1.y - vec2.y)**2)
const length = vec1 => Math.sqrt(vec1.x**2 + vec1.y**2)
const dot = (vec1, vec2) => vec1.x * vec2.x + vec1.y * vec2.y
const det = (vec1, vec2) => vec1.x * vec2.y  - vec1.y * vec2.x
const angle = (vec1, vec2) => Math.acos(dot(vec1,vec2)/length(vec1)/length(vec2))


const View3D = (ctx, w, h) => {
	const depth = 200
	const numColumns = 300
	const direction = initial.hero.direction
	const columnWidth = w / numColumns
	//
	const horisont = h / 1.8
	const origin = initial.hero.origin
	//
	const delta = initial.hero.direction.alpha / numColumns
	let rayDistance = Array(numColumns).fill(0)
	const Ray = (num, map) => {
		const mapSize = Math.floor(Math.sqrt(map.length))
		const count = depth / mapSize
		const alpha = num * delta - direction.alpha / 2
		const dir = {
			x: direction.x * Math.cos(alpha) - direction.y * Math.sin(alpha),
			y: direction.x * Math.sin(alpha) + direction.y * Math.cos(alpha)
		}
		const intersection = (x, y) => {
			const i = Math.floor(mapSize * x / w)
			const j = Math.floor(mapSize * y / h)
 			return {
 				cords: {i, j},
				type:map[i + mapSize * j]
			}
		} 
		const cast = () => {
			const inspectIntersection = (cur, goal) => {
				const dx = cur.cords.i - goal.cords.i
				const dy = cur.cords.j - goal.cords.j
				const width = w /  Math.floor(Math.sqrt(map.length))
				const i = dx > 0 ? goal.cords.i + 1: goal.cords.i
				const j = dy > 0 ? goal.cords.j + 1: goal.cords.j
				return {
					type: goal.type,
					part: Math.max(Math.abs(i * width - x0), Math.abs(j * width - y0)) / width
				}
			}
			let x0 = origin.x
			let y0 = origin.y
			let distance = 0
			const current = intersection(x0, y0)
			let isGoal = current.type
			while(!isGoal && (++distance) < depth){
				x0 += dir.x
				y0 += dir.y
				isGoal = intersection(x0, y0).type
			}
			const goal = intersection(x0, y0)
			rayDistance[num] = distance
			const {type, part} = inspectIntersection(current, goal) 
			return {
				z: Math.cos(alpha) * distance / depth,
				type,
				part
			}
		} 
		return {
			cast
		}
	}

	const Column = (num, map) => {
		const ray = Ray(num, map)
		const mapSize = Math.floor(Math.sqrt(map.length))
		const {z, type, part} = ray.cast()
		const sz =  h  / mapSize / z 
		if ( type ){
			const {img, width, height} = initial.map[type - 1] 
			ctx.globalAlpha = Math.max(1 - z, 0);
			ctx.drawImage(img, part * width, 0, columnWidth, height, num * columnWidth, horisont - sz / 2, columnWidth, sz)
		}
	}

	const Map = (map) => {
		[...Array(numColumns).keys()].map(num => {
			 Column(num, map)
		})
	}
	const Lamp = (() => {
		const x = w / 2
		const y = h / 1.2
		const maxState = 100
		let state = maxState;
		let step = 5
		return (shake) => {
			const delta = state * Number(shake)
			const lamp = (scale, width, power) => {
			ctx.save();
			ctx.beginPath()
			ctx.translate(x + delta, y)
			ctx.scale(scale, 1)
			const gradient = ctx.createRadialGradient(0,0,width,0,0,50)
				ctx.globalAlpha = power;
				gradient.addColorStop(0.1, `rgba(100,100,100,0.0)`)
				gradient.addColorStop(1, `rgba(120,120,120,${power})`)
				ctx.fillStyle = gradient
				ctx.arc(0, 0, width, 0, 2 * Math.PI, true)
				ctx.fill()
				ctx.restore()
			}
			lamp(3, 200, 0.7)
			if (state >= maxState || state <= -maxState){
				step *= -1
			}
			state += step
		}
	})()

	const Enemies = (state) => {
		const {x,y} = initial.hero.origin
		const {enemies} = initial	
		enemies.forEach(enemy => {
			const dist = d(enemy, {x,y})
			const ang = Math.sign(det({x:enemy.x-x,y:enemy.y-y}, initial.hero.direction)) * angle({x:enemy.x-x,y:enemy.y-y}, initial.hero.direction)
			if (dist < depth && Math.abs(ang) < initial.hero.direction.alpha){
				const z = dist / depth
				const num = Math.floor((initial.hero.direction.alpha / 2 - ang) / initial.hero.direction.alpha  * numColumns)
				ctx.globalAlpha = Math.max(1 - z, 0);
				const sz = h / z / 10
				const enemyLine = horisont + 30
				if (dist < rayDistance[num]) ctx.drawImage(monster,num * columnWidth - sz , enemyLine - sz / 2, sz, sz)
			}
		})
	}

	const Health = (() => {
		const HealthBar = health => {
			ctx.globalAlpha = 1
			ctx.fillStyle = '#F00'
			ctx.fillRect(w  - 50, h - health  - 30, 15, health)
		}
		const heal = () => {
			ctx.fillStyle = 'rgba(0,255,0,0.1)'
			ctx.fillRect(0,0,1000,1000)
		}
		const hit = () => {
			ctx.fillStyle = 'rgba(255,0,0,0.1)'
			ctx.fillRect(0,0,1000,1000)
		}
		let pre = 100
		return (health) => {
			HealthBar(health)
			const res = health - pre
			if ( res < 0 ) {
				hit()
			}
			else if (res > 0){
				heal()
			}
			pre = health
		}	
	})()

	const Death = (health) => {
		if (health <= 0){
			ctx.fillStyle = 'rgba(255,255,255,255.1)'
			ctx.fillRect(0,0,1000,1000)
		}
	}

	const Hero = (going) => {
		Lamp(going)
		Health(initial.hero.health)
		Death(initial.hero.health)
	}

	const Heroes = (state, going) => {
		Enemies(state)
		Hero(going)
	}

	const Background = () => {
		ctx.globalAlpha = 1;
		ctx.drawImage(bg,0,0,1000,700,0, 0, 1000,1000)
		ctx.globalAlpha = 0.7;
		ctx.fillStyle =`rgba(0,0,0,1)`
		ctx.fillRect(0,0,1000,1000)
	}

	return {
		Map,
		Heroes,
		Background
	}
}




const View2D = (ctx, w, h, count) => {
	const depth = 200
	const draw = (i,j) => {
		ctx.beginPath()
		ctx.fillStyle = `rgba(0,0,0,0.7)`
		ctx.drawImage(wall, i * w, j * h, w, h)
		ctx.fillRect(i * w, j * h, w, h)
	}
	const Enemies = () => {
		const {x, y} = initial.hero.origin
		const {enemies} = initial	
		enemies.forEach(enemy => {
			if (d(enemy, {x,y}) < depth && angle({x:enemy.x-x,y:enemy.y-y}, initial.hero.direction) < initial.hero.direction.alpha ){
				ctx.drawImage(monster,enemy.x,enemy.y,20,20)
			}
		})
	}


	const Heroes = (state) => {
		const {x, y} = state.origin
		const l = depth
		const alpha =  state.direction.alpha
		const tox = x + state.direction.x
		const toy = y + state.direction.y
		const gradient = ctx.createRadialGradient(x,y,l,x,y,40)
		gradient.addColorStop(0, `rgba(100,100,100,0.0)`)
		gradient.addColorStop(1, `rgba(255,255,255,0.7)`)
		ctx.beginPath()
		ctx.strokeStyle = '#F32'
		ctx.fillStyle = gradient
		ctx.arc(x, y, 10, 0, 2* Math.PI)
		ctx.moveTo(tox, toy)
		ctx.lineTo(tox + l * (Math.cos(alpha) * state.direction.x - Math.sin(alpha) * state.direction.y),
			toy +  l*(Math.sin(alpha) * state.direction.x + Math.cos(alpha) * state.direction.y))
		ctx.moveTo(tox, toy)
		ctx.lineTo(tox + l * (Math.cos(-alpha) * state.direction.x - Math.sin(-alpha) * state.direction.y),
			toy +  l*(Math.sin(-alpha) * state.direction.x + Math.cos(-alpha) * state.direction.y))
		ctx.stroke()
		ctx.arc(x, y, l, -Math.atan2(state.direction.x, state.direction.y) + alpha, -Math.atan2(state.direction.x, state.direction.y) - alpha - Math.PI)
		ctx.fill()

		Enemies()
	}

	const Map = (map) => {
		map.forEach((el, id) => {
			const j = Math.floor(id / count)
			const i = id % count
			if (el) draw(i, j)
		})
	}
	const Background = () => {
		ctx.fillStyle = '#4b525e'
		ctx.fillRect(0,0,1000,1000)
	}
	return {
		Map,
		Heroes,
		Background
	}
}

const Engine = (canvas, config) => {
	const { map } = config
	const count = Math.floor(Math.sqrt(map.length))
	const ctx = canvas.getContext('2d')
	const w = Math.floor(canvas.width / count)
	const h = Math.floor(canvas.height / count)
	let going = false
	const Drawer2D = View2D(ctx, w, h, count)
	const Drawer3D = View3D(ctx, canvas.width, canvas.height)
	let preX = 0
	let preY = 0


	const LiveCycle = (...elem) => [...elem].forEach(f => f()) 

	const Update = () => {
		const prex = initial.hero.origin.x
		const prey = initial.hero.origin.y
		const preEnemies = [...initial.enemies]
		const _step = () => {
			initial.hero.origin.x += initial.hero.direction.x / count * 5 
			initial.hero.origin.y += initial.hero.direction.y / count * 5
		}
		const wandering = () => {
			const step = () => Math.random() > 0.5 ? Math.random():-Math.random()
			initial.enemies = initial.enemies.map(({x,y}) => ({x:x + step(), y:y + step()}))
		}
		const inspect = ({x,y}, pre) => intersection(x,y).type ? {x: pre.x, y: pre.y} : {x,y}
		const step = () => {if (going) _step()}
		
		const damageCalculation = () => {
			const { x, y } = initial.hero.origin
			initial.enemies.forEach(enemy => {
				if (d(enemy, {x, y}) < 10){
					initial.hero.health -= 0.3
				}
			})
		}

		const solveCollision = () => {
			const cords = inspect(initial.hero.origin, {x:prex, y:prey})
			initial.hero.origin.x = cords.x
			initial.hero.origin.y = cords.y
			
			initial.enemies.forEach((cords,i) => {
				const ins = inspect(cords, preEnemies[i])
				initial.enemies[i].x = ins.x
				initial.enemies[i].y = ins.y
			})
		}
		const intersection = (x, y) => {
			const i = Math.floor(count * x / canvas.width)
			const j = Math.floor(count * y / canvas.height)
 			return {
 				cords: {i, j},
				type:map[i + count * j]
			}
		} 
		LiveCycle(
			step,
			wandering,
			solveCollision,
			damageCalculation
		)

	}
	const Looper = (drawer) => {
		let id = null
		const start = () => {
			drawer.Background()
			drawer.Map(map)
			drawer.Heroes(initial.hero, going)
			Update()
			id = requestAnimationFrame(start)
		}
		const stop = () => {
			window.cancelAnimationFrame(id)
		}
		return {
			start,
			stop
		}
	}

	const Events = () => {
		let position;
		let angle = Math.PI / 40
		const onMove = (e) => {
			const betta = angle * Math.sign(e.clientX - position.x)
			position = {
				x: e.clientX,
				y: e.clientY
			}
				const {x, y} = { ...initial.hero.direction}
				initial.hero.direction.x = x * Math.cos(betta) - y * Math.sin(betta) 
				initial.hero.direction.y = x * Math.sin(betta) + y * Math.cos(betta)
		}
		canvas.addEventListener('mousedown', (e) => {
			position = {
				x: e.clientX,
				y: e.clientY
			}
			if( e.which === 3){
				going = true
			}
			canvas.addEventListener('mousemove',onMove)
		})
		canvas.addEventListener('mouseup', (e) => {
			if(e.which === 3){
				going = false
			}
			canvas.removeEventListener('mousemove',onMove)
		})
		canvas.addEventListener('contextmenu', (e) => {
			e.preventDefault()
		})
	}

	const Sounds = () => {
		 //background()
		 //howl()
	}


	Sounds()
	Events()

	return{
		Looper,
		Drawer2D,
		Drawer3D
	}
}

export default Engine