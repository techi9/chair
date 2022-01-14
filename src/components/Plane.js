import React, { Component } from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {Sky} from "three/examples/jsm/objects/Sky";

class Plane extends Component {

    initSky = ()=> {
        // Add Sky
        let sky = new Sky();
        sky.scale.setScalar( 450000 );
        // Add Sun
        let sun = new THREE.Vector3();

        const effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 2,
            azimuth: 180,
            exposure: this.renderer.toneMappingExposure
        };

        const uniforms = sky.material.uniforms;
        uniforms[ 'turbidity' ].value = effectController.turbidity;
        uniforms[ 'rayleigh' ].value = effectController.rayleigh;
        uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
        const theta = THREE.MathUtils.degToRad( effectController.azimuth );
        sun.setFromSphericalCoords( 1, phi, theta );
        uniforms[ 'sunPosition' ].value.copy( sun );
        this.renderer.toneMappingExposure = effectController.exposure;
        this.scene.add( sky );
    }

    initPlane = () => {
        // Plane
        let geometry = new THREE.PlaneBufferGeometry(15, 15, 50, 50)
        geometry.rotateX( - Math.PI / 2 );

        let vertices = geometry.attributes.position.array;

        for(let j = 1; j < vertices.length; j += 3){
            vertices[j] = Math.pow(Math.sin(0.31*vertices[j-1] - 0.32*vertices[j+1]), 2)+
                Math.pow(Math.cos(0.385*vertices[j-1] + 0.158*vertices[j+1]), 2);
        }
        // было бы круто сделать всё-таки облости с шумом, то есть чтоб были участи без шума и тп
        // for(let i = 1; i < vertices.length; i += 3){
        //     vertices[i] += Math.random()*0.2
        // }

        // Materials
        const material = new THREE.MeshStandardMaterial({
            color: 'gray',
            side: THREE.DoubleSide,
            roughness: 0.8,
            bumpScale: 0.02,
            metalness: 0.2
        })

        let plane = new THREE.Mesh(geometry, material)
        plane.castShadow = true;
        plane.receiveShadow = true;
        this.scene.add(plane)
    }

    initLights = () => {
        const color = 0x000000;
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
        pointLight.position.x = 0
        pointLight.position.y = 7
        pointLight.position.z = 0
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
        this.mount.appendChild(this.renderer.domElement); // mount a scene inside of React using a ref

        this.initSky();
        this.initPlane()
        this.initLights()

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

        this.init();
        this.initSky()

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
    render() {
        return <div ref={ref => (this.mount = ref)} />;
    }
}

export default Plane
