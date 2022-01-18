import * as THREE from "three";
import {Vector3} from "three";

class Chair{
    constructor(plane) {
        this.play = true
        this.floorLegs = []
        this.airLegs = []
        this.material = new THREE.MeshStandardMaterial({color: "olive", bumpScale: 0.1, roughness: 0.8, castShadow: true})
        const chairSize = 1.3
        this.coord = [new Vector3(0,5, 0),
            new Vector3(0,5,chairSize),
            new Vector3(chairSize,5,chairSize),
            new Vector3(chairSize,5,0)]
        // leg size
        this.width = 0.2;
        this.height = 1.5;
        this.depth = 0.2;
        this.geometry = new THREE.BoxGeometry(
            this.width, this.height, this.depth
        )
        this.plane = plane
    }

    init = (scene) => {
        this.scene = scene
        this.legs = []
        for (let i = 0; i < 4; i++) {
            let pos = this.coord[i]
            let leg = new THREE.Mesh(this.geometry, this.material)
            leg.position.copy(pos)
            leg.castShadow = true;
            leg.receiveShadow = true;
            this.legs.push(leg)
            this.airLegs.push(leg)
            scene.add(leg)

            leg.translateX(4)
        }

    }

    // obj - your object (THREE.Object3D or derived)
    // point - the point of rotation (THREE.Vector3)
    // axis - the axis of rotation (normalized THREE.Vector3)
    // theta - radian value of rotation
    // pointIsWorld - boolean indicating the point is in world coordinates (default = false)
    rotateAboutPoint = (obj, point, axis, theta, pointIsWorld) => {


        pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;

        if(pointIsWorld){
            obj.parent.localToWorld(obj.position); // compensate for world coordinate
        }

        obj.position.sub(point); // remove the offset
        obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
        obj.position.add(point); // re-add the offset

        if(pointIsWorld){
            obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
        }

        obj.rotateOnAxis(axis, theta); // rotate the OBJECT
    }

    rotate = () => {
        for(let i=0; i < this.legs.length; i++){
            this.rotateAboutPoint(this.legs[i], this._rotationParams.point, this._rotationParams.axis, this._rotationParams.angle, this._rotationParams.isWorld)
        }
    }

    checkCollision = (leg) => {
        let curLeg = new Vector3(leg.position.x , leg.position.y - this.height / 2, leg.position.z )
        let ray = new THREE.Raycaster(curLeg, new THREE.Vector3(0, -1, 0))
        let intersections = ray.intersectObject(this.plane.planeMesh, false)
        if(intersections[0].distance <= 0.07){ // collision happened
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


    startRotation = () => {
        this.toRotate = true
        let curLegIndex
        for(let i in this.legs){
            if (Object.is(this.legs[i], this.floorLegs[this.floorLegs.length-1])){
                curLegIndex = +i
                break
            }
        }
        console.log('----------------------')
        console.log(curLegIndex)
        let odd, axis, point
        odd = (curLegIndex % 2 === 0) ? 1 : -1
        console.log((curLegIndex + (odd === 1) ? 3 : 1)%4)
        // console.log(this.legs[(curLegIndex + (odd === 1) ? 2 : 1)%4].position)
        // console.log(this.legs[curLegIndex].position)

        if (this.floorLegs.length === 1) {
            axis = new THREE.Vector3().copy(this.legs[curLegIndex].position).sub(this.legs[(curLegIndex + ((odd === 1) ? 3 : 1)) % 4].position)
            console.log(this.legs[curLegIndex].position)
            console.log(this.legs[(curLegIndex + ((odd === 1) ? 3 : 1)) % 4].position)
            axis.multiplyScalar(-1) // костыль номер 1

            console.log(axis)
            axis.x = axis.x * Math.cos(odd*(Math.PI/4)) + axis.z * Math.sin(odd*(Math.PI/4))
            axis.z = -axis.x * Math.sin(odd*(Math.PI/4)) + axis.z * Math.cos((Math.PI/4)*odd)

            // axis.x = axis.x * Math.cos(-Math.PI/2) + axis.z * Math.sin(-Math.PI/2)
            // axis.z = -axis.x * Math.sin(-Math.PI/2) + axis.z * Math.cos(-Math.PI/2)

            // axis.x = axis.x * Math.cos((Math.PI/4)) + axis.z * Math.sin((Math.PI/4))
            // axis.z = -axis.x * Math.sin((Math.PI/4)) + axis.z * Math.cos((Math.PI/4))


            console.log(axis)

            axis.normalize()

            point = new THREE.Vector3(this.legs[curLegIndex].position.x, this.legs[curLegIndex].position.y - this.height/2, this.legs[curLegIndex].position.z)
            this._rotationParams = {
                point: point,
                axis: axis,
                angle: odd * 0.04,
                isWorld: false
            }
        }
        else if (this.floorLegs.length === 2){
            axis = new THREE.Vector3().copy(this.floorLegs[0].position).sub(this.floorLegs[1].position)
            axis.multiplyScalar(-1) // костыль номер 1
            axis.normalize()
            point = new THREE.Vector3(this.floorLegs[0].position.x, this.floorLegs[0].position.y - this.height/2, this.floorLegs[0].position.z)
            this._rotationParams = {
                point: point,
                axis: axis,
                angle: odd * (0.04),
                isWorld: false
            }
            console.log('2 case')
        }
        else{
            this.toRotate = false
            console.log('stop')
        }
        const arrowHelper = new THREE.ArrowHelper( axis, point, 10, 0xff0000 );
        this.scene.add(arrowHelper)
    }


    animate = () => {
        if(this.toDrop){
            for (let i = 0; i < 4; i++){
                let pos = this.legs[i].position
                this.legs[i].position.setY(pos.y - 0.05)
                this.checkCollision(this.legs[i])
            }
        }
        if(this.toRotate){
            this.rotate()
            for(let i=0; i<this.airLegs.length; i++){
                if(this.checkCollision(this.airLegs[i])){
                    this.startRotation()
                }
            }
        }
    }


    drop = () => {
        this.toDrop = true
    }
}

export default Chair
