import EventEmitter from "./EventEmitter"

/**
 * Time class for start of app, delta since lasta frame, elapsed time since start
 * and tick() function to run each frame.
 */
export default class Time extends EventEmitter {
    constructor() {
        super()
        
        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        this.delta = 16

        window.requestAnimationFrame(() => {
            this.tick()
        })
    }
    tick() {
        const currentTime = Date.now()
        this.delta = currentTime - this.current
        this.current = currentTime
        this.elapsed = this.current - this.start

        this.trigger('tick')
        
        window.requestAnimationFrame(() => {
            this.tick()
        })
    }
}