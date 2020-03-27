import Boid from "./Boid";
import Vector from "../Interface/Vector";

abstract class Scene {

    public bounds: Vector = {x: 1000, y: 1000};

    public static population: Boid[] = [];

    public static addBoid (int?:{position?: Vector, velocity?: Vector}) {
        const newBoid = new Boid(int);
        this.population.push(newBoid);
    };

    public static updateState () {
        return Scene.population.map( (boid: Boid) => {
            return boid.step();
        });
    };
};

export default Scene;