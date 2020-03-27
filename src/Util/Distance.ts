import Vector from "../Interface/Vector";

abstract class Distance {

    public static euclidean (p: Vector, q: Vector): number {
        return Math.sqrt( Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2) )
    }
};

export default Distance;