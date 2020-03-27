import Flock from "./Class/Flock";
import Vector from "./Interface/Vector";

export const population = Flock.population;

let updateID = 1;

export const addBoid = (int?:{position?: Vector, velocity?: Vector}) => {
    const newBoid = Flock.addBoid(int);
    const event = new CustomEvent('newBoid', { detail: newBoid });
    window.dispatchEvent(event);
};

export const updateState = () => {
    const simulationState = Flock.updateState();
    const event = new CustomEvent('update', { detail: simulationState });
    window.dispatchEvent(event);
};

export const start = (updateInterval:number = 10) => {

    if (Flock.population.length > 0) {
        updateID = window.setInterval( () => updateState(), updateInterval)
    } else {
        throw new Error("No boids in 'population'.  Use 'addBoid' to create a new boid.")
    };
    console.log("start ",{updateInterval})
};

export const stop = () => {
    window.clearInterval(updateID)
}