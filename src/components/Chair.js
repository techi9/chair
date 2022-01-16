import * as THREE from "three";
import {Vector3} from "three";

class Chair{
    constructor(vertices) {
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
        // this.plane_vertices = vertices
    }

    init = (scene) => {
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

    drop = () => {
        console.log("hello")
    }
}

export default Chair
