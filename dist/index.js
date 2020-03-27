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
    }

    class Distance {
        static euclidean(p, q) {
            return Math.sqrt(Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2));
        }
    }

    class Boid {
        constructor(int) {
            this.velocity = { x: Boid.defaultVelocity, y: Boid.defaultVelocity };
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
            const v1 = this.rule1();
            const v2 = this.rule2();
            const v3 = this.rule3();
            const offset = VectorMath.add(VectorMath.add(v1, v2), v3);
            this.velocity = VectorMath.add(this.velocity, offset);
            this.position = VectorMath.add(this.position, this.velocity);
            this.boundPosition();
            this.limitVelocity();
            return { id: this.id, position: this.position };
        }
        ;
        limitVelocity() {
            const absVelocity = VectorMath.abs(this.velocity);
            if (absVelocity > Boid.maxVelocity) {
                this.velocity = VectorMath.multiply(VectorMath.divide(this.velocity, absVelocity), Boid.maxVelocity);
            }
        }
        ;
        // implememnt toroidal space
        boundPosition() {
            const xMax = Scene.bounds.x;
            const yMax = Scene.bounds.y;
            const xMin = 0;
            const yMin = 0;
            if (this.position.x < xMin - 10) {
                this.position.x = xMax - 10;
            }
            else if (this.position.x > xMax) {
                this.position.x = xMin + 10;
            }
            if (this.position.y < yMin - 10) {
                this.position.y = yMax - 10;
            }
            else if (this.position.y > yMax) {
                this.position.y = yMin + 10;
            }
        }
        ;
        //  Boids try to fly towards the centre of mass of neighbouring boids.
        rule1() {
            const r = VectorMath.subtract(this.findFlockCentroid(), this.position);
            return VectorMath.divide(r, Boid.movementPower / 100);
        }
        ;
        // Boids try to keep a small distance away from other objects (including other boids).
        rule2() {
            let c = { x: 0, y: 0 };
            Scene.population.forEach((boid) => {
                if (boid.id !== this.id) {
                    const neighbourDistance = Distance.euclidean(boid.position, this.position);
                    if (neighbourDistance < Boid.neighbourRange) {
                        c = VectorMath.subtract(c, VectorMath.subtract(this.position, boid.position));
                    }
                }
            });
            return c;
        }
        ;
        // Boids try to match velocity with near boids.
        rule3() {
            let perceivedVelocity = { x: 0, y: 0 };
            if (Scene.population.length > 1) {
                Scene.population.forEach((boid) => {
                    if (this.id !== boid.id) {
                        perceivedVelocity = VectorMath.add(perceivedVelocity, boid.velocity);
                    }
                });
                perceivedVelocity = VectorMath.divide(perceivedVelocity, Scene.population.length - 1);
                return VectorMath.divide(VectorMath.subtract(perceivedVelocity, this.velocity), Boid.perceivedVelocityCoef);
            }
            else {
                return perceivedVelocity;
            }
        }
        ;
        findFlockCentroid() {
            let centroid = { x: 0, y: 0 };
            if (Scene.population.length > 1) {
                Scene.population.forEach((boid) => {
                    if (boid.id !== this.id) {
                        centroid = VectorMath.add(centroid, boid.position);
                    }
                });
                return VectorMath.divide(centroid, Scene.population.length - 1);
            }
            else {
                return this.position;
            }
        }
        ;
    }
    Boid.defaultVelocity = Math.random() / 100;
    Boid.maxVelocity = 0.001;
    Boid.neighbourRange = 20;
    Boid.movementPower = 3;
    Boid.perceivedVelocityCoef = 20;

    class Scene {
        static addBoid(int) {
            const newBoid = new Boid(int);
            this.population.push(newBoid);
            return newBoid;
        }
        ;
        static updateState() {
            return Scene.population.map((boid) => {
                return boid.step();
            });
        }
        ;
    }
    Scene.bounds = { x: 1000, y: 1000 };
    Scene.population = [];

    const population = Scene.population;
    let updateID = 1;
    const addBoid = (int) => {
        const newBoid = Scene.addBoid(int);
        const event = new CustomEvent('newBoid', { detail: newBoid });
        window.dispatchEvent(event);
    };
    const updateState = () => {
        const simulationState = Scene.updateState();
        const event = new CustomEvent('update', { detail: simulationState });
        window.dispatchEvent(event);
    };
    const start = (updateInterval = 10) => {
        if (Scene.population.length > 0) {
            updateID = window.setInterval(() => updateState(), updateInterval);
        }
        else {
            throw new Error("No boids in 'population'.  Use 'addBoid' to create a new boid.");
        }
        console.log("start ", { updateInterval });
    };
    const stop = () => {
        window.clearInterval(updateID);
    };

    exports.addBoid = addBoid;
    exports.population = population;
    exports.start = start;
    exports.stop = stop;
    exports.updateState = updateState;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
