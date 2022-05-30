import * as Mocha from 'mocha';

const originalBeforeAll = Mocha.Suite.prototype.beforeAll;
const originalAddTest = Mocha.Suite.prototype.addTest;

export const beforeDurations: number[] = [];

Mocha.Suite.prototype.beforeAll = function(beforeFn) {
    // Server setup may be expensive, and probably unrelated to
    // framework performance. Track time spent to rule out issues.
    return originalBeforeAll.call(this, async () => {
        const start = Date.now();
        await beforeFn();
        const end = Date.now();
        beforeDurations.push(end - start);
    });
};

export const itDurations: {
    first: number;
    second: number;
}[] = [];

Mocha.Suite.prototype.addTest = function (test) {

    let first: null | number = null;
    let second: null | number = null;
    const setDuration = () => {
        if (first !== null && second !== null) {
            itDurations.push({ first, second });
        }
    };

    const originalTestFn = test.fn;
    const clone = test.clone();
    test.fn = (async function (...args) {
        const start = Date.now();
        await originalTestFn.apply(this, args);
        const end = Date.now();
        first = end - start;
        setDuration();
    });

    clone.fn = (async function (...args) {
        const start = Date.now();
        await originalTestFn.apply(this, args);
        const end = Date.now();
        second = end - start;
        setDuration();
    });
    clone.title = `${clone.title} - REPEAT`;

    originalAddTest.call(this, test);
    originalAddTest.call(this, clone);

    return this;
}
