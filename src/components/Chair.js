import * as THREE from "three";
import {Vector3} from "three";

class Chair{
    constructor(plane) {
        this.material = new THREE.MeshStandardMaterial({color: "olive", bumpScale: 0.1, roughness: 0.8, castShadow: true})
        const chairSize = 1
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
            scene.add(leg)
            //debug ----------------
            // let helper_pos = new Vector3(pos.x, pos.y - this.height/2, pos.z)
            // const arrowHelper = new THREE.ArrowHelper( helper_pos, helper_pos.setY(helper_pos.y-1), 1, 0xffff00 );
            // scene.add( arrowHelper );

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

    checkCollision = (leg) => {
        let curLeg = new Vector3(leg.position.x, leg.position.y - this.height/2, leg.position.z)
        let ray = new THREE.Raycaster(curLeg, new THREE.Vector3(0, -1, 0))
        let intersections = ray.intersectObject(this.plane.planeMesh, false)

        if(intersections[0].distance <= 0.07){
            console.log("PLANE!!")
            this.toDrop = false
        }
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
            let axis = new THREE.Vector3(0, 1, 0)
            axis.normalize()
            let point = new THREE.Vector3(this.legs[1].position.x, this.legs[1].position.y - this.height/2, this.legs[1].position.z)


            this.rotateAboutPoint(this.legs[0], point, axis , 0.1, false)
            this.rotateAboutPoint(this.legs[1], point, axis , 0.1, false)
            this.rotateAboutPoint(this.legs[2], point, axis , 0.1, false)
            this.rotateAboutPoint(this.legs[3], point, axis , 0.1, false)
            //this.toRotate = false
        }
            
    }


    drop = () => {
        // this.toDrop = true
        this.toRotate = true
    }
}

export default Chair
