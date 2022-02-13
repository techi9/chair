import * as THREE from "three";
import {BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, Vector3} from "three";


class Chair{
    constructor(scene) {
        this.scene = scene
        this.tips = []

        this.group = new THREE.Group()

        // footboards materials
        this.materials = []
        this.materials.push(new THREE.MeshStandardMaterial({color: "#627445", bumpScale: 0.1, roughness: 0.8, transparent: true, opacity: 1}))
        this.materials.push(new THREE.MeshStandardMaterial({color: "black", bumpScale: 0.1, roughness: 0.8, transparent: true, opacity: 1}))
        this.materials.push(new THREE.MeshStandardMaterial({color: "white", bumpScale: 0.1, roughness: 0.8, transparent: true, opacity: 1}))
        this.materials.push(new THREE.MeshStandardMaterial({color: "gray", bumpScale: 0.1, roughness: 0.8, transparent: true, opacity: 1}))

        // base materials
        this.base_materials = new THREE.MeshStandardMaterial({color: "white", bumpScale: 0.1, roughness: 0.8, transparent: true, opacity: 1 })

        // legs coordinates
        this.chairSize = 1.3
        let chairSize = this.chairSize
        this.coord = [new Vector3(-chairSize/2, 5, -chairSize/2),
            new Vector3(-chairSize/2, 5, chairSize/2),
            new Vector3(chairSize/2, 5, chairSize/2),
            new Vector3(chairSize/2, 5, -chairSize/2)]

        // footboard size
        this.footboard_radius = 0.08
        this.footboard_height = 0.3
        this.footboard_segments = 10

        // leg size
        this.leg_width = 0.2;
        this.leg_height = 1.5;
        this.leg_depth = 0.2;

        // base size
        this.base_width = chairSize + this.leg_width;
        this.base_height = chairSize + this.leg_width;
        this.base_depth = 0.1;

        this.leg_geometry = new THREE.BoxGeometry(
            this.leg_width, this.leg_height, this.leg_depth
        )
        this.base_geometry = new THREE.BoxGeometry(
            this.base_width, this.base_height, this.base_depth
        )

        // tube param
        this.tube = 0.03
    }

    init = (position) => {

        // create base
        let base_position = new THREE.Vector3(this.coord[0].x + this.base_height/2 - this.leg_width/2,
            this.coord[0].y + this.leg_height/2  + this.base_depth/2,
            this.coord[0].z + this.base_height/2 - this.leg_width/2)

        this.base = new THREE.Mesh(this.base_geometry, this.base_materials)
        this.base.rotateX(Math.PI / 2)
        this.base.position.copy(base_position)
        this.group.add(this.base)

        // for footboards
        const geometry = new THREE.ConeGeometry(this.footboard_radius, this.footboard_height, this.footboard_segments);
        const material = new THREE.MeshStandardMaterial({color: "#FB8D02"});
        let dotMaterial = new PointsMaterial( { size: 0.05, alpha: 0 } );

        // create footboards and legs
        for (let i = 0; i < 4; i++) {
            let leg_position = new THREE.Vector3(this.coord[i].x , this.coord[i].y, this.coord[i].z)
            let leg = new THREE.Mesh(this.leg_geometry, this.materials[i])

            let prev_position = new THREE.Vector3(this.coord[i].x, this.coord[i].y - this.leg_height / 2 - this.footboard_height/2, this.coord[i].z)
            let footboard = new THREE.Mesh(geometry, material)
            footboard.position.copy(prev_position)
            footboard.rotateZ(Math.PI)
            footboard.rotateY(Math.PI)
            leg.position.copy(leg_position)

            leg.castShadow = true;
            leg.receiveShadow = true;

            //add tips to tips array
            let dotGeometry = new BufferGeometry();
            let pos = footboard.position.clone()
            pos.setY(pos.y - this.footboard_height/2)
            dotGeometry.setAttribute( 'position', new Float32BufferAttribute( new Vector3().toArray() , 3 ) );
            let dot = new Points( dotGeometry, dotMaterial );
            dot.position.copy(pos)

            // leg contacted the ground or not
            dot.grounded = false
            // which number contacted the ground
            dot.contact = -1

            //---> add objects to group
            this.group.add(dot); //debug
            this.group.add(leg)
            this.group.add(footboard)

        }

        this.group.position.set(position.x,position.y,position.z)

        for(let i of this.group.children){
            if(i instanceof Points){
                this.tips.push(i)
            }
        }
        this.scene.add(this.group)
    }

    rotateAboutPoint = (point, axis, theta) => {
        this.group.position.sub(point); // remove the offset
        this.group.position.applyAxisAngle(axis, theta); // rotate the POSITION
        this.group.position.add(point); // re-add the offset
        this.group.rotateOnWorldAxis(axis, theta); // rotate the OBJECT
    }

    torus = (pos) => {
        let geometry = new THREE.TorusGeometry( this.footboard_height/2+0.1, this.tube, 8, 12 );
        let material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        let torus = new THREE.Mesh( geometry, material );

        torus.rotateX(Math.PI / 2)
        torus.position.copy(pos)
        this.scene.add( torus );
        this.group.add(torus)
    }

    showDistanceToPlane = (coordinates, height) => {
        let line_geometry = new THREE.CylinderGeometry(
            this.leg_width/4, this.leg_width/4 , height, 10, 1
        )
        let material = new THREE.MeshStandardMaterial({color: "red", bumpScale: 0.1, roughness: 0.8, transparent: true, opacity: 1})
        let line = new THREE.Mesh(line_geometry, material)
        this.distHelper = line
        let line_position = new THREE.Vector3(coordinates.x, coordinates.y - height/2, coordinates.z)
        line.position.copy(line_position)

        this.scene.add(line)
    }

    moveDown = (distance) => {
        this.group.position.setY(this.group.position.y - distance)
    }

    moveLeft = (distance) => {
        this.group.position.setZ(this.group.position.z + distance)
    }

    moveRight = (distance) => {
        this.group.position.setZ(this.group.position.z - distance)
    }

    moveBack = (distance) => {
        this.group.position.setX(this.group.position.x - distance)
    }

    moveForward = (distance) => {
        this.group.position.setX(this.group.position.x + distance)
    }

    transparentStateOn = () =>{
        this.base_materials.opacity = 0.5
        for(let i in this.materials){
            this.materials[i].opacity = 0.5
        }
    }

    transparentStateOff = () => {
        this.base_materials.opacity = 1
        for(let i in this.materials){
            this.materials[i].opacity = 1
        }
    }

    rightRotation = (angle) => {
        angle = -angle *  Math.PI/180
        this.group.rotateY(angle); // rotate the OBJECT
    }

    leftRotation = (angle) => {
        angle = angle *  Math.PI/180
        this.group.rotateY(angle); // rotate the OBJECT
    }


    clearScene = () => {
        this.group.removeFromParent();
        if(this.distHelper){
            this.distHelper.removeFromParent();
        }

    }

}

export default Chair
