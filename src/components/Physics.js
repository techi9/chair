import * as THREE from "three";
import {Vector3} from "three";
import Chair from "./Chair"


class Physics {
    constructor(plane, scene) {
        this.plane = plane
        this.scene = scene
        this.chair = new Chair(this.scene)

        this.floorLegs = []
        this.airLegs = this.chair.airLegs
    }

    init = (position) => {
        this.chair.init(position)
    }

    getFirstLegPosition = () => {
        return this.chair.getFirstLegPosition()
    }

    rotate = () => {
        for(let element of this.chair.objects){
            this.chair.rotateAboutPoint(this._rotationParams.point, this._rotationParams.axis, this._rotationParams.angle)
        }
    }

    checkCollision = (leg) => {
        if(this.distanceToPlane(leg) <= 0.05){ // collision happened
            this.floorLegs.push(leg)
            for(let i=0; i<this.airLegs.length; i++){
                if(this.airLegs[i] === leg){
                    this.airLegs.splice(i, 1)
                    break
                }
            }
            return true
        }
        return false
    }

    distanceToPlane = (leg) =>{
        let curLeg = new Vector3(leg.position.x , leg.position.y - this.chair.leg_height / 2, leg.position.z )
        let ray = new THREE.Raycaster(curLeg, new THREE.Vector3(0, -1, 0))
        let intersections = ray.intersectObject(this.plane.planeMesh, false)
        if (intersections.length > 0){
            return intersections[0].distance
        }
        return 0
    }

    startRotation = () => {
        this.toRotate = true
        let opposite = false
        let curLegIndex
        for(let i in this.chair.legs){
            if(JSON.stringify(this.chair.legs[i]) === JSON.stringify(this.floorLegs[this.floorLegs.length-1])){
                curLegIndex = +i
                break
            }
        }

        let odd, axis, point
        odd = (curLegIndex % 2 === 0) ? 1 : -1

        if (this.floorLegs.length === 1) {
            this.firstLegIndex = curLegIndex
            axis = new THREE.Vector3().copy(this.chair.legs[curLegIndex].position).sub(this.chair.legs[(curLegIndex + ((odd === 1) ? 3 : 1)) % 4].position)
            axis.multiplyScalar(-1)
            axis.applyAxisAngle(new Vector3(0,1,0), -Math.PI / 4)
            axis.normalize()
            point = new THREE.Vector3(this.chair.legs[curLegIndex].position.x, this.chair.legs[curLegIndex].position.y - this.chair.leg_height/2, this.chair.legs[curLegIndex].position.z)

            this._rotationParams = {
                point: point,
                axis: axis,
                angle: -0.003
            }
        }
        else if (this.floorLegs.length === 2){

            // console.log(this.firstLegIndex)
            // console.log(curLegIndex)

            if(this.firstLegIndex === 3 && curLegIndex === 0){
                //console.log('3 --- 0')
                axis = new THREE.Vector3().copy(this.chair.legs[curLegIndex].position).sub(this.chair.legs[this.firstLegIndex].position)
                axis.multiplyScalar(-1)
            }
            else if((this.firstLegIndex > curLegIndex) || (this.firstLegIndex === 0 && curLegIndex === 3)){ // swap  2 -- 1 -> 1 -- 2, 0--3 (change)
                //console.log('v')
                axis = new THREE.Vector3().copy(this.chair.legs[curLegIndex].position).sub(this.chair.legs[this.firstLegIndex].position)
            }
            else{ // 1 -- 2 (ok)
                //console.log("wwwwwwwwww")
                axis = new THREE.Vector3().copy(this.chair.legs[this.firstLegIndex].position).sub(this.chair.legs[curLegIndex].position)
            }
            axis.normalize()
            point = new THREE.Vector3(this.floorLegs[0].position.x, this.floorLegs[0].position.y - this.chair.leg_height/2, this.floorLegs[0].position.z)

            let ang
            if(((this.firstLegIndex === 0 || this.firstLegIndex === 2) && (curLegIndex === 0 || curLegIndex === 2)) ||  // define rotation direction TODO: maybe fix
                ((this.firstLegIndex === 1 || this.firstLegIndex === 3) && (curLegIndex === 1 || curLegIndex === 3))){
                opposite = true
                console.log('opposite')
                if(this.distanceToPlane(this.airLegs[0]) < this.distanceToPlane(this.airLegs[1])){
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
                angle: ang*0.02
            }

        }
        else{
            this.toRotate = false
        }
        const arrowHelper = new THREE.ArrowHelper( axis, point, 10, 0xff0000 );
        this.scene.add(arrowHelper)
    }


    animate = () => {
        if(this.toDrop){
            // TODO: here we need to move down not only legs, but all objects from class Chair
            for (let i = 0; i < 4; i++){
                let pos = this.chair.legs[i].position
                this.chair.legs[i].position.setY(pos.y - 0.05)
                if(this.checkCollision(this.chair.legs[i])){
                    this.toDrop = false
                    this.startRotation()
                }
            }
            // this.chair.moveDown(0.05)
            // for(let i in this.chair.tips){
            //     if(this.checkCollision(this.chair.tips[i])){
            //         // --------------------
            //         this.floorLegs.push(this.chair.legs[i])
            //         for(let i=0; i<this.airLegs.length; i++){
            //             if(this.airLegs[i] === this.chair.legs[i]){
            //                 this.airLegs.splice(i, 1)
            //                 break
            //             }
            //         }
            //         // --------------------
            //         this.toDrop = false
            //         this.startRotation()
            //     }
            // }
        }
        if(this.toRotate){
            this.rotate()
            for(let i=0; i<this.airLegs.length; i++){
                if(this.checkCollision(this.airLegs[i])){
                    this.startRotation()
                }
            }
        }
        if(this.toTest){
            // for( let i in this.chair.objects){
            //     this.chair.rotateAboutPoint(new THREE.Vector3(0,0,0), new THREE.Vector3(0,-1,0), 0.2, false)
            // }
            this.chair.rotateAboutPoint2(new THREE.Vector3(0,0,0), new THREE.Vector3(0,-1,0), 0.2)
        }
    }

    drop = () => {

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
        if(this.floorLegs.length !== 0) return
        for (let i of this.chair.objects) {
            i.translateZ(0.2)
        }
    }

    rightButton = () => {
        if(this.floorLegs.length !== 0) return
        for (let i of this.chair.objects) {
            i.translateZ(0.2)
        }
    }

    backButton = () => {
        if(this.floorLegs.length !== 0) return
        for (let i of this.chair.objects) {
            i.translateX(-0.2)
        }
    }

    forwardButton = () => {
        if(this.floorLegs.length !== 0) return
        for (let i of this.chair.objects) {
            i.translateX(0.2)
        }
    }



   deleteFromScene = () => {
        this.chair.clearScene()
        this.scene.children = this.scene.children.filter(obj => !(obj instanceof THREE.ArrowHelper));
   }

}

export default Physics
