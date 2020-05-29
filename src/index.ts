import Flock from "./Class/Flock";
import Vector from "./Interface/Vector";

export const population = Flock.population;

export const bounds = Flock.bounds;

// let updateID = 1;

export const addBoid = (int?:{position?: Vector, velocity?: Vector}) => {
    return Flock.addBoid(int);
};

export const updateState = () => {
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