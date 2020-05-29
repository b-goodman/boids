import Vector from "../Interface/Vector";

abstract class VectorMath {

    public static add (p: Vector, q: Vector): Vector {
        const res: Vector = {x:0, y:0};
        res.x = p.x + q.x;
        res.y = p.y + p.x;
        return res;
    };

    public static divide (p: Vector, n: number): Vector {
        const res: Vector = {x:0, y:0};
        res.x = p.x / n;
        res.y = p.y / n;
        return res;
    };

    public static multiply (p: Vector, n: number): Vector {
        const res: Vector = {x:0, y:0};
        res.x = p.x * n;
        res.y = p.y * n;
        return res;
    };

    public static subtract (p:Vector, q:Vector): Vector {
        const res: Vector = {x:0, y:0};
        res.x = p.x - q.x;
        res.y = p.y - p.x;
        return res;
    };

    public static abs (p: Vector) : number {
        return Math.sqrt( Math.pow(p.x, 2) + Math.pow(p.y, 2) )
    }

    public static angle (q: Vector, origin: Vector) {
        const offset = VectorMath.subtract(q ,origin);

        return Math.atan2(offset.y, offset.x )
    };
};

export default VectorMath;