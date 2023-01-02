import { LineLoop } from "three"
import * as lil from 'lil-gui'

/**
 * Debug class.
 */
export default class Debug {
    // window.location.hash tells if there's a # in the URL
    constructor() {
        this.active = window.location.hash === '#debug'

        if (this.active) {
            this.ui = new lil.GUI()
        }
    }
}