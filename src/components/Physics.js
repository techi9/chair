import * as THREE from "three";
import {Vector3} from "three";
import Chair from "./Chair"


class Physics {
    constructor(plane, scene) {
        this.plane = plane
        this.scene = scene
        this.chair = new Chair(this.scene)
        this.global_tips_position = []

        this.contactNum = 0
    }

    init = (position) => {
        this.chair.init(position)
    }

    getFirstLegPosition = () => {
        let coord = this.chair.getInitCoordinates()
        return new THREE.Vector3(this.global_tips_position[0].x - coord[0].x, 0,
            this.global_tips_position[0].z - coord[0].z)
    }

    rotate = () => {
        this.chair.rotateAboutPoint(this._rotationParams.point, this._rotationParams.axis, this._rotationParams.angle)
    }

    checkCollision = (tip, index) => {
        if(this.distanceToPlane(index) <= 0.02){ // collision happened
            tip.grounded = true
            this.contactNum += 1
            tip.contact = this.contactNum
            return true
        }
        return false
    }

    distanceToPlane = (index) =>{
        let current_tip = new Vector3(this.global_tips_position[index].x, this.global_tips_position[index].y, this.global_tips_position[index].z)
        let ray = new THREE.Raycaster(current_tip, new THREE.Vector3(0, -1, 0))
        let intersections = ray.intersectObject(this.plane.planeMesh, false)
        if (intersections.length > 0){
            return intersections[0].distance
        }
        return 0
    }

    startRotation = (curTipIndex) => {
        this.toRotate = true
        let opposite = false

        let axis, point

        if (this.chair.tips[curTipIndex].contact === 1) {
            this.firstTipIndex = curTipIndex
            axis = this.global_tips_position[curTipIndex].clone().sub(this.global_tips_position[(+curTipIndex + 1) % 4])
            axis.multiplyScalar(-1)
            axis.applyAxisAngle(new Vector3(0,1,0), -Math.PI / 4)
            axis.normalize()
            point = this.global_tips_position[curTipIndex].clone()

            this._rotationParams = {
                point: point,
                axis: axis,
                angle: -0.003
            }
        }
        else if (this.chair.tips[curTipIndex].contact === 2){

            console.log(this.firstTipIndex, curTipIndex)

            this.firstTipIndex = +this.firstTipIndex
            curTipIndex = +curTipIndex

            if(this.firstTipIndex === 3 && curTipIndex === 0){
                axis = new THREE.Vector3().copy(this.global_tips_position[curTipIndex]).sub(this.global_tips_position[this.firstTipIndex])
                axis.multiplyScalar(-1)
            }
            else if((this.firstTipIndex > curTipIndex) || (this.firstTipIndex === 0 && curTipIndex === 3)){ // swap  2 -- 1 -> 1 -- 2, 0--3 (change)
                axis = new THREE.Vector3().copy(this.global_tips_position[curTipIndex]).sub(this.global_tips_position[this.firstTipIndex])
            }
            else{ // 1 -- 2 (ok)
                axis = new THREE.Vector3().copy(this.global_tips_position[this.firstTipIndex]).sub(this.global_tips_position[curTipIndex])
            }
            axis.normalize()

            point = this.global_tips_position[curTipIndex].clone()

            let ang

            if((this.firstTipIndex + 2) % 4 === curTipIndex){
                opposite = true

                let countAirTips = 0, airTip1, airTip2
                for(let i in this.chair.tips){
                    if(this.chair.tips[i].contact === -1 && countAirTips === 0){
                        airTip1 = i
                        countAirTips = 1
                    }
                    if(this.chair.tips[i].contact === -1 && countAirTips === 1){
                        airTip2 = i
                        countAirTips = 2
                    }
                }
                if(this.distanceToPlane(airTip1) < this.distanceToPlane(airTip2)){
                    ang = 1
                }
                else{
                    ang = -1
                }
            }
            ang = opposite ? ang : 1

            this._rotationParams = {
                point: point,
                axis: axis,
                angle: ang * 0.001
            }
        }
        else{
            this.toRotate = false
        }
        const arrowHelper = new THREE.ArrowHelper( axis, point, 10, 0xff0000 );
        this.scene.add(arrowHelper)
    }

    animate = () => {
        for(let i in this.chair.tips){
            this.global_tips_position[i] = this.chair.group.localToWorld(this.chair.tips[i].position.clone())
        }
        if(this.toDrop){
            this.chair.moveDown(0.01)
            for(let i in this.chair.tips){
                this.global_tips_position[i] = this.chair.group.localToWorld(this.chair.tips[i].position.clone())
            }
            for(let i in this.chair.tips){
                if(this.checkCollision(this.chair.tips[i], i)){
                    this.toDrop = false
                    for(let i in this.chair.tips){
                        this.global_tips_position[i] = this.chair.group.localToWorld(this.chair.tips[i].position.clone())
                    }
                    this.startRotation(i)
                }
            }
        }
        if(this.toRotate){
            this.rotate()
            for(let i in this.chair.tips){
                this.global_tips_position[i] = this.chair.group.localToWorld(this.chair.tips[i].position.clone())
            }
            for (let i in this.chair.tips){
                if(this.chair.tips[i].grounded === false && this.checkCollision(this.chair.tips[i], i)){
                    for(let i in this.chair.tips){
                        this.global_tips_position[i] = this.chair.group.localToWorld(this.chair.tips[i].position.clone())
                    }
                    this.startRotation(i)
                }
            }
        }
        if(this.toTest){

        }
    }

    dropButton = () => {
        this.toDrop = true
    }

    dropAndShow = () => {
        //this.toDrop = true
        // let radius   = 0.3,
        //     segments = 20,
        //     material = new THREE.LineBasicMaterial( { color: 0x0000ff } ),
        //     geometry = new THREE.CircleGeometry( radius, segments );
        // geometry.rotateX( - Math.PI / 2 );
        // let plane = new THREE.Line( geometry, material )
        //
        //
        // plane.position.copy(this.legs[0].position).sub(new Vector3(0, this.height/2, 0))
        // this.scene.add( plane );
    }

    leftButton = () => {
        if(this.toDrop === true || this.toRotate === true) return
        let groundedTips = 0
        for(let i in this.chair.tips){
            if(this.chair.tips[i].grounded === true){
                groundedTips += 1
            }
        }
        if(groundedTips !== 0) return
        this.chair.moveLeft(0.2)
    }

    rightButton = () => {
        if(this.toDrop === true || this.toRotate === true) return
        let groundedTips = 0
        for(let i in this.chair.tips){
            if(this.chair.tips[i].grounded === true){
                groundedTips += 1
            }
        }
        if(groundedTips !== 0) return
        this.chair.moveRight(0.2)
    }

    backButton = () => {
        if(this.toDrop === true || this.toRotate === true) return
        let groundedTips = 0
        for(let i in this.chair.tips){
            if(this.chair.tips[i].grounded === true){
                groundedTips += 1
            }
        }
        if(groundedTips !== 0) return
        this.chair.moveBack(0.2)
    }

    forwardButton = () => {
        if(this.toDrop === true || this.toRotate === true) return
        let groundedTips = 0
        for(let i in this.chair.tips){
            if(this.chair.tips[i].grounded === true){
                groundedTips += 1
            }
        }
        if(groundedTips !== 0) return
        this.chair.moveForward(0.2)
    }

   deleteFromScene = () => {
        this.chair.clearScene()
        this.scene.children = this.scene.children.filter(obj => !(obj instanceof THREE.ArrowHelper));

        this.toDrop = false
        this.toRotate = false
        this.toTest = false
        this.contactNum = 0
   }

}

export default Physics
