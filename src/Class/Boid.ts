import Vector from "../Interface/Vector";
import Flock from "./Flock";
import Counter from "../Util/Counter";
import VectorMath from "../Util/VectorMath";
import Distance from "../Util/Distance";

class Boid {

    public static flockRange: number = 100;
    public static neighbouringRange: number = 100;
    public static maxVelocity: number = 10;

    public velocity: Vector = {x:5, y:5};
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

        this.rule1();
        this.rule2();
        this.rule3();
        this.position.x += this.velocity.x * 0.1;
        this.position.y += this.velocity.y * 0.1;
        this.boundPosition();
        // this.avoidBoundary();

        return {id:this.id, position:this.position}
    };



    // implememnt toroidal space
    private boundPosition () {
        const xMax = Flock.bounds.x;
        const yMax = Flock.bounds.y;
        const xMin = 0;
        const yMin = 0;

        if (this.position.x <= xMin) {
            this.position.x = xMax;
        } else if (this.position.x >= xMax) {
            this.position.x = xMin;
        };

        if (this.position.y <= yMin) {
            this.position.y = yMax;
        } else if (this.position.y >= yMax) {
            this.position.y = yMin;
        };
    };

    // private avoidBoundary () {
    //     const distanceFromCenter = Distance.euclidean(this.position, Flock.boundsRadius);

    //     if (distanceFromCenter > Flock.boundsRadius.x) {
    //         const bearing = VectorMath.angle(Flock.boundsRadius, this.position);
    //         this.velocity.x = Math.cos(bearing) * this.velocity.x;
    //         this.velocity.y = Math.sin(bearing) * this.velocity.y;
    //     };
    // };

    //  Boids try to fly towards the centre of mass of neighbouring boids.
    private rule1 (): void {
        if (Flock.population.length > 0) {
            let avg: Vector = {x: 0, y:0};
            Flock.population.forEach( (boid: Boid) => {
                if (this.id !== boid.id) {
                    const range = Distance.euclidean(this.position, boid.position);
                    if (range > Boid.flockRange) {
                        avg.x += this.position.x - boid.position.x;
                        avg.y += this.position.y - boid.position.y;
                    };
                }
            });

            avg = VectorMath.divide(avg, Flock.population.length);

            const range = VectorMath.abs(avg) * -1;
            if (range !== 0) {
                const newVelocity: Vector = {x: this.velocity.x + (avg.x / range) * 0.15, y:this.velocity.y + (avg.y / range) * 0.15 };
                this.velocity.x = newVelocity.x < 0 ? Math.max(newVelocity.x, Boid.maxVelocity * -1) : Math.min(newVelocity.x, Boid.maxVelocity * -1);
                this.velocity.y = newVelocity.y < 0 ? Math.max(newVelocity.y, Boid.maxVelocity * -1) : Math.min(newVelocity.y, Boid.maxVelocity * -1);
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
                if (range < Boid.flockRange) {
                    neighbouringBoids++;
                    let dR: Vector = {x: this.position.x - boid.position.x, y: this.position.y - boid.position.y};
                    if (dR.x > 0) {
                        dR.x = Math.sqrt(Boid.neighbouringRange) - dR.x
                    } else if (dR.x < 0) {
                        dR.x = -Math.sqrt(Boid.neighbouringRange) - dR.x
                    };
                    if (dR.y > 0) {
                        dR.y = Math.sqrt(Boid.neighbouringRange) - dR.y
                    } else if (dR.y < 0) {
                        dR.y = -Math.sqrt(Boid.neighbouringRange) - dR.y
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
        if (Flock.population.length > 1) {
            let avgVel: Vector = {x:0, y:0};
            Flock.population.forEach( (boid: Boid) => {
                if (this.id !== boid.id) {
                    if (Distance.euclidean(this.position, boid.position) > Boid.flockRange ) {
                        avgVel = VectorMath.add(avgVel, boid.velocity);
                    }
                }
            });
            avgVel = VectorMath.divide(avgVel, Flock.population.length - 1);

            if (VectorMath.abs(avgVel) > 0) {
                const newVelocity = VectorMath.multiply(VectorMath.divide(avgVel, VectorMath.abs(avgVel)), 0.05);
                this.velocity.x +=  newVelocity.x < 0 ? Math.max(newVelocity.x, Boid.maxVelocity * -1) :  Math.min(newVelocity.x, Boid.maxVelocity);
                this.velocity.y += newVelocity.y < 0 ? Math.max(newVelocity.y, Boid.maxVelocity * -1) :  Math.min(newVelocity.y, Boid.maxVelocity);
            }
        }
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