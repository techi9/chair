import * as THREE from "three";
import {Vector3} from "three";


class Chair{
    constructor(plane, scene) {
        this.scene = scene
        this.floorLegs = []
        this.airLegs = []
        this.legBoards = []
        this.objects = []

        this.material = []

        this.material.push(new THREE.MeshStandardMaterial({color: "olive", bumpScale: 0.1, roughness: 0.8}))
        this.material.push(new THREE.MeshStandardMaterial({color: "black", bumpScale: 0.1, roughness: 0.8}))
        this.material.push(new THREE.MeshStandardMaterial({color: "white", bumpScale: 0.1, roughness: 0.8}))
        this.material.push(new THREE.MeshStandardMaterial({color: "blue", bumpScale: 0.1, roughness: 0.8}))

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

    init = (position) => {

        const geometry = new THREE.ConeGeometry( 0.1, 0.4, 10 ); //TODO: decide -> decided!!!!!! no
        const material = new THREE.MeshStandardMaterial( {color: 0xffff00} );
        const cone = new THREE.Mesh( geometry, material );
        this.scene.add( cone );

        this.legs = []
        for (let i = 0; i < 4; i++) {
            let pos = new THREE.Vector3(this.coord[i].x + position.x, this.coord[i].y, this.coord[i].z + position.z)
            let leg = new THREE.Mesh(this.geometry, this.material[i])

            let posEnd = new THREE.Vector3(this.coord[i].x + position.x, this.coord[i].y - this.height/2, this.coord[i].z + position.z)
            let legBoard = new THREE.Mesh(geometry, material)
            legBoard.position.copy(posEnd)
            legBoard.rotateZ(Math.PI)

            legBoard.rotateY(Math.PI) // ?

            leg.position.copy(pos)

            leg.castShadow = true;
            leg.receiveShadow = true;
            this.legs.push(leg)
            this.objects.push(leg)
            this.objects.push(legBoard)
            this.legBoards.push(legBoard)
            this.airLegs.push(leg)
            this.scene.add(leg, legBoard)

        }
    }

    getFirstLegPosition = () => {
        return new THREE.Vector3(this.legs[0].position.x - this.coord[0].x, 0,
            this.legs[0].position.z - this.coord[0].z)
    }

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
        for(let element of this.objects){
            this.rotateAboutPoint(element, this._rotationParams.point, this._rotationParams.axis, this._rotationParams.angle, this._rotationParams.isWorld)
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
        let curLeg = new Vector3(leg.position.x , leg.position.y - this.height / 2, leg.position.z )
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
        for(let i in this.legs){
            if (Object.is(this.legs[i], this.floorLegs[this.floorLegs.length-1])){
                curLegIndex = +i
                break
            }
        }

        let odd, axis, point
        odd = (curLegIndex % 2 === 0) ? 1 : -1

        if (this.floorLegs.length === 1) {

            this.firstLegIndex = curLegIndex
            axis = new THREE.Vector3().copy(this.legs[curLegIndex].position).sub(this.legs[(curLegIndex + ((odd === 1) ? 3 : 1)) % 4].position)
            axis.multiplyScalar(-1) // костыль номер 1
            axis.x = axis.x * Math.cos(odd*(Math.PI/4)) + axis.z * Math.sin(odd*(Math.PI/4))
            axis.z = -axis.x * Math.sin(odd*(Math.PI/4)) + axis.z * Math.cos((Math.PI/4)*odd)
            axis.normalize()
            point = new THREE.Vector3(this.legs[curLegIndex].position.x, this.legs[curLegIndex].position.y - this.height/2, this.legs[curLegIndex].position.z)

            this._rotationParams = {
                point: point,
                axis: axis,
                angle: odd * 0.02,
                isWorld: false
            }
        }
        else if (this.floorLegs.length === 2){

            // console.log(this.firstLegIndex)
            // console.log(curLegIndex)

            if(this.firstLegIndex === 3 && curLegIndex === 0){
                //console.log('3 --- 0')
                axis = new THREE.Vector3().copy(this.legs[curLegIndex].position).sub(this.legs[this.firstLegIndex].position)
                axis.multiplyScalar(-1)
            }
            else if((this.firstLegIndex > curLegIndex) || (this.firstLegIndex === 0 && curLegIndex === 3)){ // swap  2 -- 1 -> 1 -- 2, 0--3 (change)
                //console.log('v')
                axis = new THREE.Vector3().copy(this.legs[curLegIndex].position).sub(this.legs[this.firstLegIndex].position)
            }
            else{ // 1 -- 2 (ok)
                //console.log("wwwwwwwwww")
                axis = new THREE.Vector3().copy(this.legs[this.firstLegIndex].position).sub(this.legs[curLegIndex].position)
            }

            axis.normalize()
            point = new THREE.Vector3(this.floorLegs[0].position.x, this.floorLegs[0].position.y - this.height/2, this.floorLegs[0].position.z)

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
                angle: ang*0.02,
                isWorld: false
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
            for (let i = 0; i < 4; i++){
                let pos = this.legs[i].position
                this.legs[i].position.setY(pos.y - 0.05)
                if(this.checkCollision(this.legs[i])){
                    this.toDrop = false
                    this.startRotation()
                }
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

    dropAndShow = () => {
        //this.toDrop = true
        let radius   = 0.3,
            segments = 20,
            material = new THREE.LineBasicMaterial( { color: 0x0000ff } ),
            geometry = new THREE.CircleGeometry( radius, segments );
        geometry.rotateX( - Math.PI / 2 );
        let plane = new THREE.Line( geometry, material )


        plane.position.copy(this.legs[0].position).sub(new Vector3(0, this.height/2, 0))
        this.scene.add( plane );
    }

    leftButton = () => {
        if(this.floorLegs.length !== 0) return
        for (let i of this.legs) {
            i.translateZ(0.2)
        }
        for (let i of this.legBoards) {
            i.translateZ(0.2)
        }
    }

    rightButton = () => {
        if(this.floorLegs.length !== 0) return
        for (let i of this.legs) {
            i.translateZ(0.2)
        }
        for (let i of this.legBoards) {
            i.translateZ(0.2)
        }
    }

    backButton = () => {
        if(this.floorLegs.length !== 0) return
        for (let i of this.objects) {
            i.translateX(-0.2)
        }
    }

    forwardButton = () => {
        if(this.floorLegs.length !== 0) return
        for (let i of this.objects) {
            i.translateX(0.2)
        }
    }



   deleteFromScene = () => {

       this.objects.map(object3D => {
           if (!(object3D instanceof THREE.Object3D)) return false;
           // for better memory management and performance
           object3D.geometry.dispose();
           if (object3D.material instanceof Array) {
               // for better memory management and performance
               object3D.material.forEach(material => material.dispose());
           } else {
               // for better memory management and performance
               object3D.material.dispose();
           }
           object3D.removeFromParent(); // the parent might be the scene or another Object3D, but it is certain to be removed this way
       })

       this.scene.children = this.scene.children.filter(obj => !(obj instanceof THREE.ArrowHelper));


   }


}

export default Chair
