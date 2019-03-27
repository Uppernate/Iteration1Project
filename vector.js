// Library for vector2 maths

var sqrt = Math.sqrt;
var pow = Math.pow;
var atan2 = Math.atan2;
var cos = Math.cos;
var sin = Math.sin;
var pi = Math.PI;
var fullPI = pi * 2;
var min = Math.min;
var max = Math.max;

const is = function(a, b) {
    return (a instanceof b);
}

const isObject = function (obj) {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

const exists = function(a) {
    return (typeof a !== "undefined");
}

/*class Vector2 {
    constructor(x, y) {
        this.rawx = 0;
        this.rawy = 0;
        this.rawangle = 0;
        this.rawmagnitude = 0;
        this.rawmagnitudeSqr = 0;
        this.updatedX = true;
        this.updatedY = true;
        this.updatedAngle = false;
        this.updatedMagnitude = false;
        this.updatedMagnitudeSqr = false;
        if (exists(x) && x instanceof Vector2) { // Parameter given is a vector, copy it
            this.rawx = x.rawx;
            this.rawy = x.rawy;
            this.rawangle = x.rawangle;
            this.rawmagnitude = x.rawmagnitude;
            this.rawmagnitudeSqr = x.rawmagnitudeSqr;
            this.updatedX = x.updatedX;
            this.updatedY = x.updatedY;
            this.updatedAngle = x.updatedAngle;
            this.updatedMagnitude = x.updatedMagnitude;
            this.updatedMagnitudeSqr = x.updatedMagnitudeSqr;
        }
        else if (exists(x) && exists(y)) { // Parameters are coordinates, make new vector
            this.rawx = x;
            this.rawy = y;
        }
        else if (exists(x)) {
            if (exists(x.x) && exists(x.y)) {
                this.rawx = x.x;
                this.rawy = x.y;
            }
            else if (exists(x.angle) && exists(x.magnitude)) {
                this.rawangle = x.angle;
                this.rawmagnitude = x.magnitude;
                this.rawmagnitudeSqr = x.magnitude * x.magnitude;
            }
        }
        /*if (this.auto) {
            this.angle;
            this.magnitude;
        }
    }
    get x() {
        if (this.updatedX) {
            //console.log("X: Returned");
            return this.rawx;
        }
        else if (this.updatedAngle && this.updatedMagnitude) {
            //console.log("X: Generated");
            this.rawx = cos(this.rawangle) * this.rawmagnitude;
            this.updatedX = true;
            return this.rawx;
        }
        else {
            throw "X: Cannot Generate";
        }
    }
    get y() {
        if (this.updatedY) {
            //console.log("Y: Returned");
            return this.rawy;
        }
        else if (this.updatedAngle && this.updatedMagnitude) {
            //console.log("Y: Generated");
            this.rawy = sin(this.rawangle) * this.rawmagnitude;
            this.updatedY = true;
            return this.rawy;
        }
        else {
            throw "Y: Cannot Generate";
        }
    }
    get angle() {
        if (this.updatedAngle) {
            //console.log("Angle: Returned");
            return this.rawangle;
        }
        else if (this.updatedX && this.updatedY) {
            //console.log("Angle: Generated");
            this.rawangle = atan2(this.rawy, this.rawx);
            this.updatedAngle = true;
            return this.rawangle;
        }
        else {
            throw "Angle: Cannot Generate";
        }
    }
    get magnitude() {
        if (this.updatedMagnitude) {
            //console.log("Magnitude: Returned");
            return this.rawmagnitude;
        }
        else if (this.updatedMagnitudeSqr) {
            //console.log("Magnitude: Generated from Sqr");
            this.rawmagnitude = sqrt(this.rawmagnitudeSqr);
            this.updatedMagnitude = true;
            return this.rawmagnitude;
        }
        else if (this.updatedX && this.updatedY) {
            //console.log("Magnitude: Generated from XY");
            this.rawmagnitudeSqr = this.rawx * this.rawx + this.rawy * this.rawy;
            this.rawmagnitude = sqrt(this.rawmagnitudeSqr);
            this.updatedMagnitude = true;
            this.updatedMagnitudeSqr = true;
            return this.rawmagnitude;
        }
        else {
            throw "Magnitude: Cannot Generate";
        }
    }
    get magnitudeSqr() {
        if (this.updatedMagnitudeSqr) {
            //console.log("MagnitudeSqr: Returned");
            return this.rawmagnitudeSqr;
        }
        else if (this.updatedX && this.updatedY) {
            //console.log("MagnitudeSqr: Generated");
            this.rawmagnitudeSqr = this.rawx * this.rawx + this.rawy * this.rawy;
            this.updatedMagnitudeSqr = true;
            return this.rawmagnitudeSqr;
        }
        else {
            throw "MagnitudeSqr: Cannot Generate";
        }
    }
    set(o1, o2) {
        if (exists(o1)) {
            if (exists(o2)) {
                this.x = o1;
                this.y = o2;
            }
            else {
                if (o1 instanceof Vector2) {
                    this.rawx = o1.rawx;
                    this.rawy = o1.rawy;
                    this.rawangle = o1.rawangle;
                    this.rawmagnitude = o1.rawmagnitude;
                    this.rawmagnitudeSqr = o1.rawmagnitudeSqr;
                    this.updatedX = o1.updatedX;
                    this.updatedY = o1.updatedY;
                    this.updatedAngle = o1.updatedAngle;
                    this.updatedMagnitude = o1.updatedMagnitude;
                    this.updatedMagnitudeSqr = o1.updatedMagnitudeSqr;
                    return this;
                }
                else if (exists(o1.x) && exists(o1.y)) {
                    this.x = o1.x;
                    this.y = o1.y;
                }
                else if (typeof o1 === "number") {
                    this.x = o1;
                    this.y = o1;
                }
                else {
                    throw "Vector set was not understood/given incorrect parameters.";
                }
            }
        }
        return this;
    }
    add(o1, o2) {
        if (exists(o1)) {
            if (exists(o2)) {
                this.x += o1;
                this.y += o2;
            }
            else {
                if (o1 instanceof Vector2) {
                    this.x += o1.x;
                    this.y += o1.y;
                }
                else if (exists(o1.x) && exists(o1.y)) {
                    this.x += o1.x;
                    this.y += o1.y;
                }
                else if (typeof o1 === "number") {
                    this.x += o1;
                    this.y += o1;
                }
                else {
                    throw "Vector add was not understood/given incorrect parameters.";
                }
            }
        }
        return this;
    }
    sub(o1, o2) {
        if (exists(o1)) {
            if (exists(o2)) {
                this.x -= o1;
                this.y -= o2;
            }
            else {
                if (o1 instanceof Vector2) {
                    this.x -= o1.x;
                    this.y -= o1.y;
                }
                else if (exists(o1.x) && exists(o1.y)) {
                    this.x -= o1.x;
                    this.y -= o1.y;
                }
                else if (typeof o1 === "number") {
                    this.x -= o1;
                    this.y -= o1;
                }
                else {
                    throw "Vector sub was not understood/given incorrect parameters.";
                }
            }
        }
        return this;
    }
    mul(o1, o2) {
        if (exists(o1)) {
            if (exists(o2)) {
                this.x *= o1;
                this.y *= o2;
            }
            else {
                if (o1 instanceof Vector2) {
                    this.x *= o1.x;
                    this.y *= o1.y;
                }
                else if (exists(o1.x) && exists(o1.y)) {
                    this.x *= o1.x;
                    this.y *= o1.y;
                }
                else if (typeof o1 === "number") {
                    this.x *= o1;
                    this.y *= o1;
                }
                else {
                    throw "Vector mul was not understood/given incorrect parameters.";
                }
            }
        }
        return this;
    }
    div(o1, o2) {
        if (exists(o1)) {
            if (exists(o2)) {
                this.x /= o1;
                this.y /= o2;
            }
            else {
                if (o1 instanceof Vector2) {
                    this.x /= o1.x;
                    this.y /= o1.y;
                }
                else if (exists(o1.x) && exists(o1.y)) {
                    this.x /= o1.x;
                    this.y /= o1.y;
                }
                else if (typeof o1 === "number") {
                    this.x /= o1;
                    this.y /= o1;
                }
                else {
                    throw "Vector div was not understood/given incorrect parameters.";
                }
            }
        }
        return this;
    }
    set x(x) {
        this.rawx = x;
        (this.y);
        this.updatedX = true;
        this.updatedAngle = false;
        this.updatedMagnitude = false;
        this.updatedMagnitudeSqr = false;
    }
    set y(y) {
        this.rawy = y;
        (this.x);
        this.updatedX = true;
        this.updatedAngle = false;
        this.updatedMagnitude = false;
        this.updatedMagnitudeSqr = false;
    }
    set angle(a) {
        this.rawangle = a;
        if (this.rawangle > pi)
            this.rawangle = ((this.rawangle + pi) % fullPI) - pi;
        else if (this.rawangle < -pi)
            this.rawangle = -(-(this.rawangle - pi) % fullPI) + pi;
        (this.magnitude);
        this.updatedX = false;
        this.updatedY = false;
        this.updatedAngle = true;
    }
    set magnitude(m) {
        if (this.updatedX && this.updatedY) {
            (this.magnitude);
            this.rawx /= this.rawmagnitude;
            this.rawy /= this.rawmagnitude;
            this.rawmagnitude = m;
            this.rawmagnitudeSqr = m * m;
            this.rawx *= m;
            this.rawy *= m;
        }
        else {
            this.rawmagnitude = m;
            this.rawmagnitudeSqr = m * m;
            (this.angle);
            this.updatedY = false;
            this.updatedX = false;
        }
        this.updatedMagnitude = true;
        this.updatedMagnitudeSqr = true;
    }
    set magnitudeSqr(m) {
        this.rawmagnitudeSqr = m * m;
        (this.angle);
        this.updatedY = false;
        this.updatedX = false;
        this.updatedMagnitude = false;
        this.updatedMagnitudeSqr = true;
    }

    normalise() {
        if (this.magnitude !== 0) {
            (this.x);
            (this.y);
            this.rawx = this.rawx / this.magnitude;
            this.rawy = this.rawy / this.magnitude;
            this.rawmagnitude = 1;
            this.rawmagnitudeSqr = 1;
            this.updatedMagnitude = true;
            this.updatedMagnitudeSqr = true;
            this.updatedX = true;
            this.updatedY = true;
        }
        return this;
    }

    copy(a) {
        if (exists(a) && a instanceof Vector2) {
            return this.set(a);
        }
        else {
            return new Vector2(this);
        }
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    get unit() {
        return this.copy().normalise();
    }

    lerp(v, alpha) {
        return this.set(this.x * (1 - alpha) + v.x * alpha, this.y * (1 - alpha) + v.y * alpha);
    }

    lerpAngle(v, alpha) {
        if (v instanceof Vector2) {
            this.angle = this.angle + ((((v.angle - this.angle % (pi * 2)) + pi * 3) % (pi * 2)) - pi) * alpha;
            return this;
        }
        else {
            this.angle = this.angle + ((((v - this.angle % (pi * 2)) + pi * 3) % (pi * 2)) - pi) * alpha
            return this;
        }
    }

    angleDifference(v) {
        if (v instanceof Vector2) {
            return ((((v.angle - this.angle % (pi * 2)) + pi * 3) % (pi * 2)) - pi);
        }
        else {
            return ((((v - this.angle % (pi * 2)) + pi * 3) % (pi * 2)) - pi);
        }
    }

    range(tl, br) {
        return this.set(min(max(this.x, tl.x), br.x), min(max(this.y, tl.y), br.y));
    }

    toLocal(origin, direction) {
        if (exists(origin) && exists(direction)) {
            this.sub(origin);
            this.angle -= direction.angle;
            return this;
        }
        else {
            this.rawangle = 0;
            this.rawx = this.magnitude;
            this.rawy = 0;
            this.updatedX = true;
            this.updatedY = true;
            this.updatedAngle = true;
            return this;
        }
    }

    fromLocal(origin, direction) {
        this.angle += direction.angle;
        return this.add(origin);
    }

    transform(v) {
        this.angle += v.angle;
        return this.mul(v.magnitude);
    }

    inverseTransform(v) {
        this.angle -= v.angle;
        return this.mul(1 / v.magnitude);
    }
    static get zero() {
        return new Vector2(0, 0);
    }
    static get right() {
        return new Vector2(1, 0);
    }
    static get left() {
        return new Vector2(-1, 0);
    }
    static get up() {
        return new Vector2(0, -1);
    }
    static get down() {
        return new Vector2(0, 1);
    }
}*/

class Vector2 {
    constructor(x, y) {
        this.values = [0, 0, 0, 0];
        this.flags = [true, true, false, false];

        if (exists(x) && x instanceof Vector2) {
            x.values.forEach(function (v, i, a) {
                this.values[i] = v;
            }, this);
            x.flags.forEach(function (v, i, a) {
                this.flags[i] = v;
            }, this);
        }
        else if (isObject(x)) {
            this.values[0] = x.x || this.values[0];
            this.values[1] = x.y || this.values[1];
        }
        else if (typeof x === 'number' && typeof y === 'number') {
            this.values[0] = x;
            this.values[1] = y;
        }

    }
    get x() {
        if (this.flags[0]) {
            return this.values[0];
        }
        else if (this.flags[2] && this.flags[3]) {
            this.values[0] = cos(this.values[2]) * this.values[3];
            this.flags[0] = true;
            return this.values[0];
        }
        else {
            throw 'Cannot Generate X';
        }
    }
    get y() {
        if (this.flags[1]) {
            return this.values[1];
        }
        else if (this.flags[2] && this.flags[3]) {
            this.values[1] = sin(this.values[2]) * this.values[3];
            this.flags[1] = true;
            return this.values[1];
        }
        else {
            throw 'Cannot Generate Y';
        }
    }
    get angle() {
        if (this.flags[2]) {
            return this.values[2];
        }
        else if (this.flags[0] && this.flags[1]) {
            this.values[2] = atan2(this.values[1], this.values[0]);
            this.flags[2] = true;
            return this.values[2];
        }
        else {
            throw 'Cannot Generate Angle';
        }
    }
    get magnitude() {
        if (this.flags[3]) {
            return this.values[3];
        }
        else if (this.flags[0] && this.flags[1]) {
            this.values[3] = sqrt(this.values[0] ^ 2 + this.values[1] ^ 2);
            this.flags[3] = true;
            return this.values[3];
        }
        else {
            throw 'Cannot Generate Magnitude';
        }
    }
    set x(x) {
        this.values[0] = x;
        (this.y);
        this.flags[0] = true;
        this.flags[2] = false;
        this.flags[3] = false;
    }
    set y(y) {
        this.values[1] = y;
        (this.x);
        this.flags[1] = true;
        this.flags[2] = false;
        this.flags[3] = false;
    }
    set angle(a) {
        this.values[2] = a;
        if (this.values[2] > pi)
            this.values[2] = ((this.values[2] + pi) % fullPI) - pi;
        else if (this.values[2] < -pi)
            this.values[2] = -(-(this.values[2] - pi) % fullPI) + pi;
        (this.magnitude);
        this.flags[2] = true;
        this.flags[0] = false;
        this.flags[1] = false;
    }
    set magnitude(m) {
        if (this.flags[0] && this.flags[1]) {
            (this.magnitude);
            this.values[0] /= this.values[3];
            this.values[1] /= this.values[3];
            this.values[3] = m;
            this.values[0] *= m;
            this.values[1] *= m;
        }
        else {
            this.values[3] = m;
            (this.angle);
            this.flags[0] = false;
            this.flags[1] = false;
        }
        this.flags[3] = true;
    }
}

var zeroVector = new Vector2(0, 0);
var rightVector = new Vector2(1, 0);
var leftVector = new Vector2(-1, 0);
var topVector = new Vector2(0, 1);
var downVector = new Vector2(0, -1);