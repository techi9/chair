import React, { Component } from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Chair from "./Chair"
import Plane from "./Plane"
import Controller from  "./Controller"

class Scene extends Component {
    constructor(props) {
        super(props);

        this.init();

        let scene = this.scene
        let camera = this.camera
        let renderer = this.renderer

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.maxPolarAngle = 1.2
        controls.minPolarAngle = 0
        controls.update()

        function tick() {
            renderer.render( scene, camera );
            window.requestAnimationFrame(tick)
            controls.update()
        }
        tick()
    }

    initLights = () => {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 0.5;
        let light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        this.scene.add(light);
        let pointLight = new THREE.PointLight(0xB97A20, 2)
        pointLight.position.x = 0
        pointLight.position.y = 2
        pointLight.position.z = 0
        this. scene.add(pointLight)
        pointLight = new THREE.PointLight(0xB97A20, 0.8)
        pointLight.position.x = 2
        pointLight.position.y = 7
        pointLight.position.z = 4
        this.scene.add(pointLight)
    }

    init = () => {
        //Scene
        this.scene = new THREE.Scene();
        //Size
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        //Camera
        this.camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        this.camera.position.x = 13
        this.camera.position.y = 5
        this.camera.position.z = 0
        this.scene.add(this.camera)

        // Renderer
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 0.5;


        let plane = new Plane(this.scene, this.renderer)
        plane.initSky();
        let vertices = plane.initPlane()
        this.initLights()


        this.chair = new Chair(vertices)

        this.chair.init(this.scene)

//-------------
        window.addEventListener('resize', () => {
            // Update sizes
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight

            // Update camera
            this.camera.aspect = sizes.width / sizes.height
            this.camera.updateProjectionMatrix()

            // Update renderer
            this.renderer.setSize(sizes.width, sizes.height)
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })

    }

    componentDidMount() {
        this.mount.appendChild(this.renderer.domElement); // mount a scene inside of React using a ref
    }

    render() {


        return(
         <div ref={ref => (this.mount = ref)}>

         <Controller onDrop = {this.chair.drop}/>

        </div>
        );
    }
}

export default Scene

