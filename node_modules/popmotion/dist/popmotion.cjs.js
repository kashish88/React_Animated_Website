'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var styleValueTypes = require('style-value-types');
var heyListen = require('hey-listen');
var sync = require('framesync');
var sync__default = _interopDefault(sync);

var SpringAnimator = (function () {
    function SpringAnimator(options) {
        this.isComplete = false;
        this.updateOptions(options);
        var _a = this.options, velocity = _a.velocity, from = _a.from, to = _a.to, damping = _a.damping, stiffness = _a.stiffness, mass = _a.mass;
        var initialVelocity = velocity ? -(velocity / 1000) : 0.0;
        var initialDelta = to - from;
        var dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
        var angularFreq = Math.sqrt(stiffness / mass) / 1000;
        if (dampingRatio < 1) {
            this.resolveSpring = function (t) {
                var envelope = Math.exp(-dampingRatio * angularFreq * t);
                var expoDecay = angularFreq * Math.sqrt(1.0 - dampingRatio * dampingRatio);
                return (to -
                    envelope *
                        (((initialVelocity + dampingRatio * angularFreq * initialDelta) /
                            expoDecay) *
                            Math.sin(expoDecay * t) +
                            initialDelta * Math.cos(expoDecay * t)));
            };
        }
        else if (dampingRatio === 1) {
            this.resolveSpring = function (t) {
                var envelope = Math.exp(-angularFreq * t);
                return to - envelope * (1 + angularFreq * t);
            };
        }
        else {
            var dampedAngularFreq_1 = angularFreq * Math.sqrt(dampingRatio * dampingRatio - 1);
            this.resolveSpring = function (t) {
                var envelope = Math.exp(-dampingRatio * angularFreq * t);
                return (to -
                    (envelope *
                        ((initialVelocity + dampingRatio * angularFreq * initialDelta) *
                            Math.sinh(dampedAngularFreq_1 * t) +
                            dampedAngularFreq_1 *
                                initialDelta *
                                Math.cosh(dampedAngularFreq_1 * t))) /
                        dampedAngularFreq_1);
            };
        }
    }
    SpringAnimator.prototype.update = function (t) {
        var latest = this.resolveSpring(t);
        var _a = this.options, velocity = _a.velocity, restSpeed = _a.restSpeed, restDelta = _a.restDelta, to = _a.to;
        var isBelowVelocityThreshold = Math.abs(velocity) <= restSpeed;
        var isBelowDisplacementThreshold = Math.abs(to - latest) <= restDelta;
        this.isComplete = isBelowVelocityThreshold && isBelowDisplacementThreshold;
        return this.isComplete ? to : latest;
    };
    SpringAnimator.prototype.updateOptions = function (_a) {
        var _b = _a.from, from = _b === void 0 ? 0.0 : _b, _c = _a.to, to = _c === void 0 ? 0.0 : _c, _d = _a.velocity, velocity = _d === void 0 ? 0.0 : _d, _e = _a.stiffness, stiffness = _e === void 0 ? 100 : _e, _f = _a.damping, damping = _f === void 0 ? 10 : _f, _g = _a.mass, mass = _g === void 0 ? 1.0 : _g, _h = _a.restSpeed, restSpeed = _h === void 0 ? 0.005 : _h, _j = _a.restDelta, restDelta = _j === void 0 ? 0.5 : _j;
        this.options = {
            from: from,
            to: to,
            velocity: velocity,
            stiffness: stiffness,
            damping: damping,
            mass: mass,
            restSpeed: restSpeed,
            restDelta: restDelta
        };
    };
    SpringAnimator.needsInterpolation = true;
    SpringAnimator.uniqueOptionKeys = new Set([
        'stiffness',
        'damping',
        'mass',
        'restSpeed',
        'restDelta'
    ]);
    return SpringAnimator;
}());

var progress = function (from, to, value) {
    var toFromDifference = to - from;
    return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
};

var mix = function (from, to, progress) {
    return -progress * from + progress * to + from;
};

var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var mixLinearColor = function (from, to, v) {
    var fromExpo = from * from;
    var toExpo = to * to;
    return Math.sqrt(Math.max(0, v * (toExpo - fromExpo) + fromExpo));
};
var colorTypes = [styleValueTypes.hex, styleValueTypes.rgba, styleValueTypes.hsla];
var getColorType = function (v) {
    return colorTypes.find(function (type) { return type.test(v); });
};
var notAnimatable = function (color) {
    return "'" + color + "' is not an animatable color. Use the equivalent color code instead.";
};
var mixColor = function (from, to) {
    var fromColorType = getColorType(from);
    var toColorType = getColorType(to);
    heyListen.invariant(!!fromColorType, notAnimatable(from));
    heyListen.invariant(!!toColorType, notAnimatable(to));
    heyListen.invariant(fromColorType.transform === toColorType.transform, 'Both colors must be hex/RGBA, OR both must be HSLA.');
    var fromColor = fromColorType.parse(from);
    var toColor = toColorType.parse(to);
    var blended = __assign({}, fromColor);
    var mixFunc = fromColorType === styleValueTypes.hsla ? mix : mixLinearColor;
    return function (v) {
        for (var key in blended) {
            if (key !== 'alpha') {
                blended[key] = mixFunc(fromColor[key], toColor[key], v);
            }
        }
        blended.alpha = mix(fromColor.alpha, toColor.alpha, v);
        return fromColorType.transform(blended);
    };
};

var zeroPoint = {
    x: 0,
    y: 0,
    z: 0
};
var isNum = function (v) { return typeof v === 'number'; };

var combineFunctions = function (a, b) { return function (v) { return b(a(v)); }; };
var pipe = function () {
    var transformers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        transformers[_i] = arguments[_i];
    }
    return transformers.reduce(combineFunctions);
};

var __assign$1 = (undefined && undefined.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
function getMixer(origin, target) {
    if (isNum(origin)) {
        return function (v) { return mix(origin, target, v); };
    }
    else if (styleValueTypes.color.test(origin)) {
        return mixColor(origin, target);
    }
    else {
        return mixComplex(origin, target);
    }
}
var mixArray = function (from, to) {
    var output = __spreadArrays(from);
    var numValues = output.length;
    var blendValue = from.map(function (fromThis, i) { return getMixer(fromThis, to[i]); });
    return function (v) {
        for (var i = 0; i < numValues; i++) {
            output[i] = blendValue[i](v);
        }
        return output;
    };
};
var mixObject = function (origin, target) {
    var output = __assign$1(__assign$1({}, origin), target);
    var blendValue = {};
    for (var key in output) {
        if (origin[key] !== undefined && target[key] !== undefined) {
            blendValue[key] = getMixer(origin[key], target[key]);
        }
    }
    return function (v) {
        for (var key in blendValue) {
            output[key] = blendValue[key](v);
        }
        return output;
    };
};
function analyse(value) {
    var parsed = styleValueTypes.complex.parse(value);
    var numValues = parsed.length;
    var numNumbers = 0;
    var numRGB = 0;
    var numHSL = 0;
    for (var i = 0; i < numValues; i++) {
        if (numNumbers || typeof parsed[i] === 'number') {
            numNumbers++;
        }
        else {
            if (parsed[i].hue !== undefined) {
                numHSL++;
            }
            else {
                numRGB++;
            }
        }
    }
    return { parsed: parsed, numNumbers: numNumbers, numRGB: numRGB, numHSL: numHSL };
}
var mixComplex = function (origin, target) {
    var template = styleValueTypes.complex.createTransformer(target);
    var originStats = analyse(origin);
    var targetStats = analyse(target);
    heyListen.invariant(originStats.numHSL === targetStats.numHSL &&
        originStats.numRGB === targetStats.numRGB &&
        originStats.numNumbers >= targetStats.numNumbers, "Complex values '" + origin + "' and '" + target + "' too different to mix. Ensure all colors are of the same type.");
    return pipe(mixArray(originStats.parsed, targetStats.parsed), template);
};

var clamp = function (min, max, v) {
    return Math.min(Math.max(v, min), max);
};

var mixNumber = function (from, to) { return function (p) { return mix(from, to, p); }; };
function detectMixerFactory(v) {
    if (typeof v === 'number') {
        return mixNumber;
    }
    else if (typeof v === 'string') {
        if (styleValueTypes.color.test(v)) {
            return mixColor;
        }
        else {
            return mixComplex;
        }
    }
    else if (Array.isArray(v)) {
        return mixArray;
    }
    else if (typeof v === 'object') {
        return mixObject;
    }
}
function createMixers(output, ease, customMixer) {
    var mixers = [];
    var mixerFactory = customMixer || detectMixerFactory(output[0]);
    var numMixers = output.length - 1;
    for (var i = 0; i < numMixers; i++) {
        var mixer = mixerFactory(output[i], output[i + 1]);
        if (ease) {
            var easingFunction = Array.isArray(ease) ? ease[i] : ease;
            mixer = pipe(easingFunction, mixer);
        }
        mixers.push(mixer);
    }
    return mixers;
}
function fastInterpolate(_a, _b) {
    var from = _a[0], to = _a[1];
    var mixer = _b[0];
    return function (v) { return mixer(progress(from, to, v)); };
}
function slowInterpolate(input, mixers) {
    var inputLength = input.length;
    var lastInputIndex = inputLength - 1;
    return function (v) {
        var mixerIndex = 0;
        var foundMixerIndex = false;
        if (v <= input[0]) {
            foundMixerIndex = true;
        }
        else if (v >= input[lastInputIndex]) {
            mixerIndex = lastInputIndex - 1;
            foundMixerIndex = true;
        }
        if (!foundMixerIndex) {
            var i = 1;
            for (; i < inputLength; i++) {
                if (input[i] > v || i === lastInputIndex) {
                    break;
                }
            }
            mixerIndex = i - 1;
        }
        var progressInRange = progress(input[mixerIndex], input[mixerIndex + 1], v);
        return mixers[mixerIndex](progressInRange);
    };
}
function interpolate(input, output, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.clamp, isClamp = _c === void 0 ? true : _c, ease = _b.ease, mixer = _b.mixer;
    var inputLength = input.length;
    heyListen.invariant(inputLength === output.length, 'Both input and output ranges must be the same length');
    heyListen.invariant(!ease || !Array.isArray(ease) || ease.length === inputLength - 1, 'Array of easing functions must be of length `input.length - 1`, as it applies to the transitions **between** the defined values.');
    if (input[0] > input[inputLength - 1]) {
        input = [].concat(input);
        output = [].concat(output);
        input.reverse();
        output.reverse();
    }
    var mixers = createMixers(output, ease, mixer);
    var interpolator = inputLength === 2
        ? fastInterpolate(input, mixers)
        : slowInterpolate(input, mixers);
    return isClamp
        ? function (v) { return interpolator(clamp(input[0], input[inputLength - 1], v)); }
        : interpolator;
}

var reverseEasing = function (easing) { return function (p) { return 1 - easing(1 - p); }; };
var mirrorEasing = function (easing) { return function (p) {
    return p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2;
}; };
var createExpoIn = function (power) { return function (p) { return Math.pow(p, power); }; };
var createBackIn = function (power) { return function (p) {
    return p * p * ((power + 1) * p - power);
}; };
var createAnticipate = function (power) {
    var backEasing = createBackIn(power);
    return function (p) {
        return (p *= 2) < 1 ? 0.5 * backEasing(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
    };
};

var DEFAULT_OVERSHOOT_STRENGTH = 1.525;
var BOUNCE_FIRST_THRESHOLD = 4.0 / 11.0;
var BOUNCE_SECOND_THRESHOLD = 8.0 / 11.0;
var BOUNCE_THIRD_THRESHOLD = 9.0 / 10.0;
var linear = function (p) { return p; };
var easeIn = createExpoIn(2);
var easeOut = reverseEasing(easeIn);
var easeInOut = mirrorEasing(easeIn);
var circIn = function (p) { return 1 - Math.sin(Math.acos(p)); };
var circOut = reverseEasing(circIn);
var circInOut = mirrorEasing(circOut);
var backIn = createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
var backOut = reverseEasing(backIn);
var backInOut = mirrorEasing(backIn);
var anticipate = createAnticipate(DEFAULT_OVERSHOOT_STRENGTH);
var ca = 4356.0 / 361.0;
var cb = 35442.0 / 1805.0;
var cc = 16061.0 / 1805.0;
var bounceOut = function (p) {
    var p2 = p * p;
    return p < BOUNCE_FIRST_THRESHOLD
        ? 7.5625 * p2
        : p < BOUNCE_SECOND_THRESHOLD
            ? 9.075 * p2 - 9.9 * p + 3.4
            : p < BOUNCE_THIRD_THRESHOLD
                ? ca * p2 - cb * p + cc
                : 10.8 * p * p - 20.52 * p + 10.72;
};
var bounceIn = function (p) { return 1.0 - bounceOut(1.0 - p); };
var bounceInOut = function (p) {
    return p < 0.5
        ? 0.5 * (1.0 - bounceOut(1.0 - p * 2.0))
        : 0.5 * bounceOut(p * 2.0 - 1.0) + 0.5;
};

function defaultEasing(values, easing) {
    return values.map(function () { return easing || easeInOut; }).splice(0, values.length - 1);
}
function defaultOffset(values) {
    var numValues = values.length;
    return values.map(function (_value, i) {
        return i !== 0 ? i / (numValues - 1) : 0;
    });
}
function convertOffsetToTimes(offset, duration) {
    return offset.map(function (o) { return o * duration; });
}
var KeyframesAnimator = (function () {
    function KeyframesAnimator(options) {
        this.isComplete = false;
        this.updateOptions(options);
        var _a = this.options, from = _a.from, to = _a.to, duration = _a.duration;
        var _b = this.options, ease = _b.ease, offset = _b.offset;
        var values = Array.isArray(to) ? to : [from, to];
        ease = Array.isArray(ease) ? ease : defaultEasing(values);
        offset = offset || defaultOffset(values);
        var times = convertOffsetToTimes(offset, duration);
        this.interpolator = interpolate(times, values, { ease: ease });
    }
    KeyframesAnimator.prototype.update = function (t) {
        var duration = this.options.duration;
        this.isComplete = t >= duration;
        return this.interpolator(t);
    };
    KeyframesAnimator.prototype.updateOptions = function (_a) {
        var _b = _a.from, from = _b === void 0 ? 0 : _b, _c = _a.to, to = _c === void 0 ? 1 : _c, ease = _a.ease, offset = _a.offset, _d = _a.duration, duration = _d === void 0 ? 300 : _d;
        this.options = { from: from, to: to, ease: ease, offset: offset, duration: duration };
    };
    KeyframesAnimator.needsInterpolation = false;
    KeyframesAnimator.uniqueOptionKeys = new Set([
        'duration',
        'ease'
    ]);
    return KeyframesAnimator;
}());

var DecayAnimator = (function () {
    function DecayAnimator(options) {
        this.isComplete = false;
        this.updateOptions(options);
        var _a = this.options, power = _a.power, velocity = _a.velocity, modifyTarget = _a.modifyTarget, from = _a.from;
        var amplitude = power * velocity;
        var idealTarget = from + amplitude;
        var target = typeof modifyTarget === 'undefined'
            ? idealTarget
            : modifyTarget(idealTarget);
        if (target !== idealTarget)
            amplitude = target - from;
        this.target = target;
        this.amplitude = amplitude;
    }
    DecayAnimator.prototype.update = function (t) {
        var _a = this.options, timeConstant = _a.timeConstant, restDelta = _a.restDelta;
        var delta = -this.amplitude * Math.exp(-t / timeConstant);
        this.isComplete = !(delta > restDelta || delta < -restDelta);
        return this.isComplete ? this.target : this.target + delta;
    };
    DecayAnimator.prototype.updateOptions = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.velocity, velocity = _c === void 0 ? 0 : _c, _d = _b.from, from = _d === void 0 ? 0 : _d, _e = _b.power, power = _e === void 0 ? 0.8 : _e, _f = _b.timeConstant, timeConstant = _f === void 0 ? 350 : _f, _g = _b.restDelta, restDelta = _g === void 0 ? 0.5 : _g, modifyTarget = _b.modifyTarget;
        this.options = {
            velocity: velocity,
            from: from,
            power: power,
            timeConstant: timeConstant,
            restDelta: restDelta,
            modifyTarget: modifyTarget
        };
    };
    DecayAnimator.needsInterpolation = true;
    DecayAnimator.uniqueOptionKeys = new Set([
        'power',
        'timeConstant',
        'modifyTarget'
    ]);
    return DecayAnimator;
}());

var animators = [KeyframesAnimator, SpringAnimator, DecayAnimator];
var numAnimators = animators.length;
function detectAnimationFromOptions(config) {
    for (var key in config) {
        for (var i = 0; i < numAnimators; i++) {
            var animator = animators[i];
            if (animator.uniqueOptionKeys.has(key))
                return animator;
        }
    }
}

var __assign$2 = (undefined && undefined.__assign) || function () {
    __assign$2 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$2.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var framesync = function (update) {
    var passTimestamp = function (_a) {
        var delta = _a.delta;
        return update(delta);
    };
    sync__default.update(passTimestamp, true, true);
    return function () { return sync.cancelSync.update(passTimestamp); };
};
function animate(_a) {
    var from = _a.from, to = _a.to, _b = _a.autoplay, autoplay = _b === void 0 ? true : _b, _c = _a.driver, driver = _c === void 0 ? framesync : _c, _d = _a.elapsed, elapsed = _d === void 0 ? 0 : _d, _e = _a.repeat, repeatMax = _e === void 0 ? 0 : _e, _f = _a.repeatType, repeatType = _f === void 0 ? 'loop' : _f, _g = _a.repeatDelay, onPlay = _a.onPlay, onComplete = _a.onComplete, onRepeat = _a.onRepeat, onUpdate = _a.onUpdate, options = __rest(_a, ["from", "to", "autoplay", "driver", "elapsed", "repeat", "repeatType", "repeatDelay", "onPlay", "onComplete", "onRepeat", "onUpdate"]);
    var repeatCount = 0;
    var computedDuration = options.duration;
    var isForwardPlayback = true;
    var cancelDriver;
    var interpolateFromNumber;
    var Animator = detectAnimationFromOptions(options);
    if (Animator.needsInterpolation) {
        interpolateFromNumber = interpolate([0, 100], [from, to], {
            clamp: false
        });
        from = 0;
        to = 100;
    }
    var animation = new Animator(__assign$2(__assign$2({}, options), { from: from, to: to }));
    function repeat() {
        if (repeatCount === 0 && computedDuration === undefined) {
            computedDuration = elapsed;
        }
        repeatCount++;
        var remainder = elapsed - computedDuration;
        if (repeatType === 'loop') {
            elapsed = remainder;
        }
        else {
            elapsed = computedDuration - remainder;
            isForwardPlayback = repeatCount % 2 === 0;
        }
        onRepeat && onRepeat();
    }
    function complete() {
        cancelDriver();
        onComplete && onComplete();
    }
    function update(delta) {
        if (!isForwardPlayback)
            delta = -delta;
        elapsed += delta;
        var latest = animation.update(elapsed);
        if (interpolateFromNumber) {
            latest = interpolateFromNumber(latest);
        }
        onUpdate(latest);
        var isComplete = isForwardPlayback ? animation.isComplete : elapsed <= 0;
        if (isComplete) {
            repeatCount < repeatMax ? repeat() : complete();
        }
    }
    function play() {
        onPlay && onPlay();
        cancelDriver = driver(update);
    }
    autoplay && play();
    return {
        play: play,
        pause: function () { },
        resume: function () { },
        reverse: function () { },
        seek: function () { },
        stop: cancelDriver
    };
}

var radiansToDegrees = function (radians) { return (radians * 180) / Math.PI; };

var angle = function (a, b) {
    if (b === void 0) { b = zeroPoint; }
    return radiansToDegrees(Math.atan2(b.y - a.y, b.x - a.x));
};

var applyOffset = function (from, to) {
    var hasReceivedFrom = true;
    if (to === undefined) {
        to = from;
        hasReceivedFrom = false;
    }
    return function (v) {
        if (hasReceivedFrom) {
            return v - from + to;
        }
        else {
            from = v;
            hasReceivedFrom = true;
            return to;
        }
    };
};

var identity = function (v) { return v; };
var attract = function (alterDisplacement) {
    if (alterDisplacement === void 0) { alterDisplacement = identity; }
    return function (constant, origin, v) {
        var displacement = origin - v;
        var springModifiedDisplacement = -(0 - constant + 1) * (0 - alterDisplacement(Math.abs(displacement)));
        return displacement <= 0
            ? origin + springModifiedDisplacement
            : origin - springModifiedDisplacement;
    };
};
var attractLinear = attract();
var attractExpo = attract(Math.sqrt);

var degreesToRadians = function (degrees) { return (degrees * Math.PI) / 180; };

var isPoint = function (point) {
    return point.hasOwnProperty('x') && point.hasOwnProperty('y');
};

var isPoint3D = function (point) {
    return isPoint(point) && point.hasOwnProperty('z');
};

var distance1D = function (a, b) { return Math.abs(a - b); };
var distance = function (a, b) {
    if (b === void 0) { b = zeroPoint; }
    if (isNum(a) && isNum(b)) {
        return distance1D(a, b);
    }
    else if (isPoint(a) && isPoint(b)) {
        var xDelta = distance1D(a.x, b.x);
        var yDelta = distance1D(a.y, b.y);
        var zDelta = isPoint3D(a) && isPoint3D(b) ? distance1D(a.z, b.z) : 0;
        return Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2) + Math.pow(zDelta, 2));
    }
    return 0;
};

var pointFromVector = function (origin, angle, distance) {
    angle = degreesToRadians(angle);
    return {
        x: distance * Math.cos(angle) + origin.x,
        y: distance * Math.sin(angle) + origin.y
    };
};

var toDecimal = function (num, precision) {
    if (precision === void 0) { precision = 2; }
    precision = Math.pow(10, precision);
    return Math.round(num * precision) / precision;
};

var smoothFrame = function (prevValue, nextValue, duration, smoothing) {
    if (smoothing === void 0) { smoothing = 0; }
    return toDecimal(prevValue +
        (duration * (nextValue - prevValue)) / Math.max(smoothing, duration));
};

var smooth = function (strength) {
    if (strength === void 0) { strength = 50; }
    var previousValue = 0;
    var lastUpdated = 0;
    return function (v) {
        var currentFramestamp = sync.getFrameData().timestamp;
        var timeDelta = currentFramestamp !== lastUpdated ? currentFramestamp - lastUpdated : 0;
        var newValue = timeDelta
            ? smoothFrame(previousValue, v, timeDelta, strength)
            : previousValue;
        lastUpdated = currentFramestamp;
        previousValue = newValue;
        return newValue;
    };
};

var snap = function (points) {
    if (typeof points === 'number') {
        return function (v) { return Math.round(v / points) * points; };
    }
    else {
        var i_1 = 0;
        var numPoints_1 = points.length;
        return function (v) {
            var lastDistance = Math.abs(points[0] - v);
            for (i_1 = 1; i_1 < numPoints_1; i_1++) {
                var point = points[i_1];
                var distance = Math.abs(point - v);
                if (distance === 0)
                    return point;
                if (distance > lastDistance)
                    return points[i_1 - 1];
                if (i_1 === numPoints_1 - 1)
                    return point;
                lastDistance = distance;
            }
        };
    }
};

var velocityPerFrame = function (xps, frameDuration) {
    return isNum(xps) ? xps / (1000 / frameDuration) : 0;
};

var velocityPerSecond = function (velocity, frameDuration) {
    return frameDuration ? velocity * (1000 / frameDuration) : 0;
};

var wrap = function (min, max, v) {
    var rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

var a = function (a1, a2) { return 1.0 - 3.0 * a2 + 3.0 * a1; };
var b = function (a1, a2) { return 3.0 * a2 - 6.0 * a1; };
var c = function (a1) { return 3.0 * a1; };
var calcBezier = function (t, a1, a2) {
    return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
};
var getSlope = function (t, a1, a2) {
    return 3.0 * a(a1, a2) * t * t + 2.0 * b(a1, a2) * t + c(a1);
};
var subdivisionPrecision = 0.0000001;
var subdivisionMaxIterations = 10;
function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX;
    var currentT;
    var i = 0;
    do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
            aB = currentT;
        }
        else {
            aA = currentT;
        }
    } while (Math.abs(currentX) > subdivisionPrecision &&
        ++i < subdivisionMaxIterations);
    return currentT;
}
var newtonIterations = 8;
var newtonMinSlope = 0.001;
function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < newtonIterations; ++i) {
        var currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) {
            return aGuessT;
        }
        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
}
var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
function cubicBezier(mX1, mY1, mX2, mY2) {
    if (mX1 === mY1 && mX2 === mY2)
        return linear;
    var sampleValues = new Float32Array(kSplineTableSize);
    for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
    function getTForX(aX) {
        var intervalStart = 0.0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;
        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += kSampleStepSize;
        }
        --currentSample;
        var dist = (aX - sampleValues[currentSample]) /
            (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;
        var initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= newtonMinSlope) {
            return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        }
        else if (initialSlope === 0.0) {
            return guessForT;
        }
        else {
            return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
    }
    return function (t) {
        return t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2);
    };
}

var steps = function (steps, direction) {
    if (direction === void 0) { direction = 'end'; }
    return function (progress) {
        progress =
            direction === 'end' ? Math.min(progress, 0.999) : Math.max(progress, 0.001);
        var expanded = progress * steps;
        var rounded = direction === 'end' ? Math.floor(expanded) : Math.ceil(expanded);
        return clamp(0, 1, rounded / steps);
    };
};

exports.DecayAnimator = DecayAnimator;
exports.KeyframesAnimator = KeyframesAnimator;
exports.SpringAnimator = SpringAnimator;
exports.angle = angle;
exports.animate = animate;
exports.anticipate = anticipate;
exports.applyOffset = applyOffset;
exports.attract = attract;
exports.attractExpo = attractExpo;
exports.attractLinear = attractLinear;
exports.backIn = backIn;
exports.backInOut = backInOut;
exports.backOut = backOut;
exports.bounceIn = bounceIn;
exports.bounceInOut = bounceInOut;
exports.bounceOut = bounceOut;
exports.circIn = circIn;
exports.circInOut = circInOut;
exports.circOut = circOut;
exports.clamp = clamp;
exports.createAnticipate = createAnticipate;
exports.createBackIn = createBackIn;
exports.createExpoIn = createExpoIn;
exports.cubicBezier = cubicBezier;
exports.degreesToRadians = degreesToRadians;
exports.distance = distance;
exports.easeIn = easeIn;
exports.easeInOut = easeInOut;
exports.easeOut = easeOut;
exports.interpolate = interpolate;
exports.isPoint = isPoint;
exports.isPoint3D = isPoint3D;
exports.linear = linear;
exports.mirrorEasing = mirrorEasing;
exports.mix = mix;
exports.mixColor = mixColor;
exports.mixComplex = mixComplex;
exports.pipe = pipe;
exports.pointFromVector = pointFromVector;
exports.progress = progress;
exports.radiansToDegrees = radiansToDegrees;
exports.reverseEasing = reverseEasing;
exports.smooth = smooth;
exports.smoothFrame = smoothFrame;
exports.snap = snap;
exports.steps = steps;
exports.toDecimal = toDecimal;
exports.velocityPerFrame = velocityPerFrame;
exports.velocityPerSecond = velocityPerSecond;
exports.wrap = wrap;
