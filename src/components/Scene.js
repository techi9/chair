import React, { Component } from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Physics from "./Physics"
import Plane from "./Plane"
import Controller from  "./Controller"
import "../styles/stool.css"

class Scene extends Component {
    constructor(props) {
        super(props);
        this.prevPosition = new THREE.Vector3()

        this.init();

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.maxPolarAngle = 1.2
        this.controls.minPolarAngle = 0
        this.controls.update()

        this.startAnimation()

    }

    startAnimation = () =>{

        if(this.animationID){
            window.cancelAnimationFrame(this.animationID)
        }

        let scene = this.scene
        let camera = this.camera
        let renderer = this.renderer
        let chair = this.chair
        let controls = this.controls

        function tick() {
            chair.animate()
            renderer.render( scene, camera );
            controls.update()
            window.requestAnimationFrame(tick)

        }

        this.animationID = window.requestAnimationFrame(tick)
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
        this.scene.add(pointLight)
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
        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 0.5;


        let plane = new Plane(this.scene, this.renderer)
        this.plane = plane
        plane.initSky();
        plane.initPlane()
        this.initLights()

        this.chair = new Physics(plane, this.scene, this.props.KioApi)
        this.chair.init(new THREE.Vector3(0, 0, 0), 0)

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

    getParams = () =>{
        return {
                    pos: this.prevPosition,
                    angle: this.chair.angle
               }
    }

    loadSolution = (params) =>{
        let angle = params.angle
        let lastPosition = params.pos

        this.chair.deleteFromScene()
        this.chair = new Physics(this.plane, this.scene, this.props.KioApi)
        this.chair.init(lastPosition, angle)

        this.forceUpdate()
        this.startAnimation()
    }

    restartGame= () => {
        let angle = this.chair.angle
        let lastPosition = this.prevPosition

        this.chair.deleteFromScene()
        this.chair = new Physics(this.plane, this.scene, this.props.KioApi)
        this.chair.init(lastPosition, angle)

        this.forceUpdate()
        this.startAnimation()
    }

    savePositionAndDrop = () =>{

        if(!this.chair.canMove()) return

        let angle = this.chair.angle
        this.chair.chair.rightRotation(angle)
        this.prevPosition = this.chair.chair.group.position.clone()
        this.chair.chair.leftRotation(angle)
        this.chair.dropButton()
    }

    componentDidMount() {
        this.mount.appendChild(this.renderer.domElement); // mount a scene inside of React using a ref
    }

    render() {


        return(
         <div className="stoolWrapper" ref={ref => (this.mount = ref)}>


         <Controller onDrop = {this.savePositionAndDrop}
                     onDropAndShow = {this.chair.dropAndShow}
                     onLeftMoveButton = {this.chair.leftButton}
                     onRightMoveButton = {this.chair.rightButton}
                     onBackMoveButton = {this.chair.backButton}
                     onForwardMoveButton = {this.chair.forwardButton}
                     onRestartButton = {this.restartGame}
                     onTransparentButtonOn = {this.chair.transparentButtonOn}
                     onTransparentButtonOff = {this.chair.transparentButtonOff}
                     onRightRotationButton = {this.chair.rightRotationButton}
                     onLeftRotationButton = {this.chair.leftRotationButton}
                     />
        </div>

        );
    }
}

export default Scene

