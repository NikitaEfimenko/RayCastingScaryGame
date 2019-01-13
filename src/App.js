import React, { Component } from 'react';
import './App.css';
import Engine from './engine.js'
import Config from './config.json'

class App extends Component {
  constructor(props){
    super(props)
    this.canvas = React.createRef()
    this.looper = null
    this.cb = this.callback()
  }
  componentDidMount(){
    this.engine = Engine(this.canvas.current, Config)
    this.cb()
  }

  callback = () => {
    let it = 0
    return () => {
      this.looper && this.looper.stop()
      this.looper = this.engine.Looper(it ? this.engine.Drawer2D : this.engine.Drawer3D)
      this.looper.start()
      it = (it + 1) % 2
    }
  }

  render() {
    return (
      <>
        <button className='map' onClick={this.cb}> map </button>
        <canvas  ref={this.canvas} className='game center' width='900px' height='900px'/>
      </>
    );
  }
}

export default App;
