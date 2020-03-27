import Vector from "../Interface/Vector";
import Flock from "./Flock";
import Counter from "../Util/Counter";
import VectorMath from "../Util/VectorMath";
import Distance from "../Util/Distance";

class Boid {

    public static minRange: number = 10;
    public static maxVelocity: number = 5;

    public velocity: Vector = {x:1, y:-1};
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
        // const v1: Vector = this.rule1();
        // const v2: Vector = this.rule2();
        // const v3: Vector = this.rule3();

        // const offset = VectorMath.add(VectorMath.add(v1, v2), v3);

        // this.velocity = VectorMath.add(this.velocity,offset);
        // this.position = VectorMath.add(this.position, this.velocity);

        // this.boundPosition();
        // this.limitVelocity();

        this.rule1();
        this.rule2();
        this.rule3();

        return {id:this.id, position:this.position}
    };



    // implememnt toroidal space
    private boundPosition () {
        const xMax = Flock.bounds.x;
        const yMax = Flock.bounds.y;
        const xMin = 0;
        const yMin = 0;

        if (this.position.x < xMin - 10) {
            this.position.x = xMax - 10;
        } else if (this.position.x > xMax) {
            this.position.x = xMin + 10;
        };

        if (this.position.y < yMin - 10) {
            this.position.y = yMax - 10;
        } else if (this.position.y > yMax) {
            this.position.y = yMin + 10;
        };
    };

    //  Boids try to fly towards the centre of mass of neighbouring boids.
    private rule1 (): void {
        if (Flock.population.length > 0) {
            let avg: Vector = {x: 0, y:0};
            Flock.population.forEach( (boid: Boid) => {
                if (this.id !== boid.id) {
                    const range = Distance.euclidean(this.position, boid.position);
                    if (range > Boid.minRange) {
                        avg.x += this.position.x - boid.position.x;
                        avg.y += this.position.y - boid.position.y;
                    };
                }
            });

            avg = VectorMath.divide(avg, Flock.population.length);

            const range = VectorMath.abs(avg) * -1;
            if (range !== 0) {
                this.velocity.x = Math.min(this.velocity.x + (avg.x / range) * 0.15, Boid.maxVelocity);
                this.velocity.y = Math.min(this.velocity.y + (avg.y / range) * 0.15, Boid.maxVelocity)
            }
        };
    };

    // Boids try to keep a small distance away from other objects (including other boids).
    private rule2 (): void {
        let neighbouringBoids = 0;
        const offestDistance: Vector = {x:0, y:0};
        Flock.population.forEach( (boid: Boid) => {
            if (boid.id !== this.id) {
                const range = Distance.euclidean(this.position, boid.position);
                if (range < Boid.minRange) {
                    neighbouringBoids++;
                    let dR: Vector = {x: this.position.x - boid.position.x, y: this.position.y - boid.position.y};
                    if (dR.x > 0) {
                        dR.x = Math.sqrt(Boid.minRange) - dR.x
                    } else if (dR.x < 0) {
                        dR.x = -Math.sqrt(Boid.minRange) - dR.x
                    };
                    if (dR.y > 0) {
                        dR.y = Math.sqrt(Boid.minRange) - dR.y
                    } else if (dR.y < 0) {
                        dR.y = -Math.sqrt(Boid.minRange) - dR.y
                    };

                    offestDistance.x += dR.x;
                    offestDistance.y += dR.y;
                }
            }
        });

        if (neighbouringBoids > 0) {
            this.velocity.x -= offestDistance.x / 5;
            this.velocity.y -= offestDistance.y / 5;
        }
    };

    // Boids try to match velocity with near boids.
    private rule3 (): void {



    };

    // private findFlockCentroid (): Vector {
    //     let centroid: Vector = {x:0, y:0};
    //     if (Flock.population.length > 1) {
    //         Flock.population.forEach( (boid: Boid) => {
    //             if (boid.id !== this.id) {
    //                 centroid = VectorMath.add(centroid, boid.position);
    //             };
    //         });
    //         return VectorMath.divide(centroid, Flock.population.length - 1)
    //     } else {
    //         return this.position;
    //     }
    // };

};

export default Boid;