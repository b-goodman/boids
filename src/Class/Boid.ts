import Vector from "../Interface/Vector";
import Scene from "./Scene";
import Counter from "../Util/Counter";
import VectorMath from "../Util/VectorMath";
import Distance from "../Util/Distance";

class Boid {

    public static defaultVelocity: number = 1;

    public velocity: Vector = {x:Boid.defaultVelocity, y:Boid.defaultVelocity};
    public position: Vector = {x:0, y:0};
    public id: number = Counter.inc();

    constructor (int?:{position?: Vector, velocity?: Vector}) {
        if (int) {
            if (int.position) {
                this.position = int.position;
            };
            if (int.velocity) {
                this.velocity = int.velocity;
            };
        }
    }

    public step () {
        const v1: Vector = this.rule1();
        const v2: Vector = this.rule2();
        const v3: Vector = this.rule3();

        const offset = VectorMath.add(VectorMath.add(v1, v2), v3);

        this.velocity = VectorMath.add(this.velocity,offset);
        this.position = VectorMath.add(this.position, this.velocity);

        return {id: this.id, position: this.position}
    };

    //  Boids try to fly towards the centre of mass of neighbouring boids.
    private rule1 (): Vector {
        const r = VectorMath.subtract(this.findFlockCentroid(), this.position);
        return VectorMath.divide(r, 100);
    };

    // Boids try to keep a small distance away from other objects (including other boids).
    private rule2 (): Vector {
        let c: Vector = {x: 0, y:0};
        Scene.population.forEach( (boid: Boid) => {
            if (boid.id !== this.id) {
                const neighbourDistance = Distance.euclidean(boid.position, this.position);
                if (neighbourDistance < 100) {
                    c = VectorMath.subtract(c, VectorMath.subtract(this.position, boid.position) )
                };
            };
        });
        return c;
    };

    // Boids try to match velocity with near boids.
    private rule3 (): Vector {
        let perceivedVelocity: Vector = {x: 0, y:0};
        
        if (Scene.population.length > 1) {
            Scene.population.forEach( (boid: Boid) => {
                if (this.id !== boid.id) {
                    perceivedVelocity = VectorMath.add(perceivedVelocity, boid.velocity);
                }
            });
    
            perceivedVelocity = VectorMath.divide(perceivedVelocity, Scene.population.length -1);
    
            return VectorMath.divide(VectorMath.subtract(perceivedVelocity, this.velocity) ,8)
        } else {
            return perceivedVelocity;
        }
    };

    private findFlockCentroid (): Vector {
        let centroid: Vector = {x:0, y:0};
        if (Scene.population.length > 1) {
            Scene.population.forEach( (boid: Boid) => {
                if (boid.id !== this.id) {
                    centroid = VectorMath.add(centroid, boid.position);
                };
            });
            return VectorMath.divide(centroid, Scene.population.length - 1)
        } else {
            return this.position;
        }
    };

};

export default Boid;