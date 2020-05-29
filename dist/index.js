(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.boids = {}));
}(this, (function (exports) { 'use strict';

    class Counter {
        static inc() {
            return ++Counter.count;
        }
    }
    Counter.count = 0;

    class VectorMath {
        static add(p, q) {
            const res = { x: 0, y: 0 };
            res.x = p.x + q.x;
            res.y = p.y + p.x;
            return res;
        }
        ;
        static divide(p, n) {
            const res = { x: 0, y: 0 };
            res.x = p.x / n;
            res.y = p.y / n;
            return res;
        }
        ;
        static multiply(p, n) {
            const res = { x: 0, y: 0 };
            res.x = p.x * n;
            res.y = p.y * n;
            return res;
        }
        ;
        static subtract(p, q) {
            const res = { x: 0, y: 0 };
            res.x = p.x - q.x;
            res.y = p.y - p.x;
            return res;
        }
        ;
        static abs(p) {
            return Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
        }
        static angle(q, origin) {
            const offset = VectorMath.subtract(q, origin);
            return Math.atan2(offset.y, offset.x);
        }
        ;
    }

    class Distance {
        static euclidean(p, q) {
            return Math.sqrt(Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2));
        }
    }

    class Boid {
        constructor(int) {
            this.velocity = { x: 5, y: 5 };
            this.position = { x: 0, y: 0 };
            this.id = Counter.inc();
            if (int) {
                if (int.position) {
                    this.position = int.position;
                }
                if (int.velocity) {
                    this.velocity = int.velocity;
                }
            }
        }
        step() {
            this.rule1();
            this.rule2();
            this.rule3();
            this.position.x += this.velocity.x * 0.1;
            this.position.y += this.velocity.y * 0.1;
            this.boundPosition();
            // this.avoidBoundary();
            return { id: this.id, position: this.position };
        }
        ;
        // implememnt toroidal space
        boundPosition() {
            const xMax = Flock.bounds.x;
            const yMax = Flock.bounds.y;
            const xMin = 0;
            const yMin = 0;
            if (this.position.x <= xMin) {
                this.position.x = xMax;
            }
            else if (this.position.x >= xMax) {
                this.position.x = xMin;
            }
            if (this.position.y <= yMin) {
                this.position.y = yMax;
            }
            else if (this.position.y >= yMax) {
                this.position.y = yMin;
            }
        }
        ;
        // private avoidBoundary () {
        //     const distanceFromCenter = Distance.euclidean(this.position, Flock.boundsRadius);
        //     if (distanceFromCenter > Flock.boundsRadius.x) {
        //         const bearing = VectorMath.angle(Flock.boundsRadius, this.position);
        //         this.velocity.x = Math.cos(bearing) * this.velocity.x;
        //         this.velocity.y = Math.sin(bearing) * this.velocity.y;
        //     };
        // };
        //  Boids try to fly towards the centre of mass of neighbouring boids.
        rule1() {
            if (Flock.population.length > 0) {
                let avg = { x: 0, y: 0 };
                Flock.population.forEach((boid) => {
                    if (this.id !== boid.id) {
                        const range = Distance.euclidean(this.position, boid.position);
                        if (range > Boid.flockRange) {
                            avg.x += this.position.x - boid.position.x;
                            avg.y += this.position.y - boid.position.y;
                        }
                    }
                });
                avg = VectorMath.divide(avg, Flock.population.length);
                const range = VectorMath.abs(avg) * -1;
                if (range !== 0) {
                    const newVelocity = { x: this.velocity.x + (avg.x / range) * 0.15, y: this.velocity.y + (avg.y / range) * 0.15 };
                    this.velocity.x = newVelocity.x < 0 ? Math.max(newVelocity.x, Boid.maxVelocity * -1) : Math.min(newVelocity.x, Boid.maxVelocity * -1);
                    this.velocity.y = newVelocity.y < 0 ? Math.max(newVelocity.y, Boid.maxVelocity * -1) : Math.min(newVelocity.y, Boid.maxVelocity * -1);
                }
            }
        }
        ;
        // Boids try to keep a small distance away from other objects (including other boids).
        rule2() {
            let neighbouringBoids = 0;
            const offestDistance = { x: 0, y: 0 };
            Flock.population.forEach((boid) => {
                if (boid.id !== this.id) {
                    const range = Distance.euclidean(this.position, boid.position);
                    if (range < Boid.flockRange) {
                        neighbouringBoids++;
                        let dR = { x: this.position.x - boid.position.x, y: this.position.y - boid.position.y };
                        if (dR.x > 0) {
                            dR.x = Math.sqrt(Boid.neighbouringRange) - dR.x;
                        }
                        else if (dR.x < 0) {
                            dR.x = -Math.sqrt(Boid.neighbouringRange) - dR.x;
                        }
                        if (dR.y > 0) {
                            dR.y = Math.sqrt(Boid.neighbouringRange) - dR.y;
                        }
                        else if (dR.y < 0) {
                            dR.y = -Math.sqrt(Boid.neighbouringRange) - dR.y;
                        }
                        offestDistance.x += dR.x;
                        offestDistance.y += dR.y;
                    }
                }
            });
            if (neighbouringBoids > 0) {
                this.velocity.x -= offestDistance.x / 5;
                this.velocity.y -= offestDistance.y / 5;
            }
        }
        ;
        // Boids try to match velocity with near boids.
        rule3() {
            if (Flock.population.length > 1) {
                let avgVel = { x: 0, y: 0 };
                Flock.population.forEach((boid) => {
                    if (this.id !== boid.id) {
                        if (Distance.euclidean(this.position, boid.position) > Boid.flockRange) {
                            avgVel = VectorMath.add(avgVel, boid.velocity);
                        }
                    }
                });
                avgVel = VectorMath.divide(avgVel, Flock.population.length - 1);
                if (VectorMath.abs(avgVel) > 0) {
                    const newVelocity = VectorMath.multiply(VectorMath.divide(avgVel, VectorMath.abs(avgVel)), 0.05);
                    this.velocity.x += newVelocity.x < 0 ? Math.max(newVelocity.x, Boid.maxVelocity * -1) : Math.min(newVelocity.x, Boid.maxVelocity);
                    this.velocity.y += newVelocity.y < 0 ? Math.max(newVelocity.y, Boid.maxVelocity * -1) : Math.min(newVelocity.y, Boid.maxVelocity);
                }
            }
        }
        ;
    }
    Boid.flockRange = 100;
    Boid.neighbouringRange = 100;
    Boid.maxVelocity = 10;

    class Flock {
        static addBoid(int) {
            const newBoid = new Boid(int);
            this.population.push(newBoid);
            return newBoid;
        }
        ;
        static updateState() {
            return Flock.population.map((boid) => {
                return boid.step();
            });
        }
        ;
    }
    Flock.bounds = { x: 1500, y: 1500 };
    Flock.boundsRadius = VectorMath.divide(Flock.bounds, 2);
    Flock.population = [];

    const population = Flock.population;
    const bounds = Flock.bounds;
    // let updateID = 1;
    const addBoid = (int) => {
        return Flock.addBoid(int);
    };
    const updateState = () => {
        return Flock.updateState();
    };
    // export const start = (updateInterval:number = 10) => {
    //     if (Flock.population.length > 0) {
    //         updateID = window.setInterval( () => updateState(), updateInterval)
    //     } else {
    //         throw new Error("No boids in 'population'.  Use 'addBoid' to create a new boid.")
    //     };
    //     console.log("start ",{updateInterval})
    // };
    // export const stop = () => {
    //     window.clearInterval(updateID)
    // }

    exports.addBoid = addBoid;
    exports.bounds = bounds;
    exports.population = population;
    exports.updateState = updateState;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
