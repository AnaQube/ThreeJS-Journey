import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import EventEmitter from "./EventEmitter";
import * as THREE from 'three'

/**
 * Class for loading all textures and files. Useful for loading bar and centralizing
 * Going to create a file that exports an object array to load stuff
 * Basically, just a file that has all the file paths, file types, and name
 * This class parses the sources array to load each file
 */
export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        this.sources = sources
        
        // loaded items, num of items left to load, num of items loaded
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.setLoaders()
        this.startLoading()
    }
    setLoaders() {
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
    }
    startLoading() {
        for (const source of this.sources) {
            if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'cubeTexture') {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
        }
    }
    // Call back function to increment num of loaded and add to items array
    // Also fires event when all are loaded
    sourceLoaded(source, file) {
        this.items[source.name] = file

        this.loaded++
        if (this.loaded === this.toLoad)
            this.trigger('ready')
    }
}