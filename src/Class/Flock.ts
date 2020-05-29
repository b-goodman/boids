import Boid from "./Boid";
import Vector from "../Interface/Vector";
import VectorMath from "../Util/VectorMath";

abstract class Flock {

    public static bounds: Vector = {x: 1500, y: 1500};

    public static boundsRadius = VectorMath.divide(Flock.bounds, 2)

    public static population: Boid[] = [];

    public static addBoid (int?:{position?: Vector, velocity?: Vector}) {
        const newBoid = new Boid(int);
        this.population.push(newBoid);
        return newBoid;
    };

    public static updateState () {
        return Flock.population.map( (boid: Boid) => {
            return boid.step();
        });
    };
};

export default Flock;