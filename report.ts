import { beforeDurations, itDurations } from './benchmark';

after(() => {
    console.log(
        'TOTAL SETUP TIME',
        beforeDurations.reduce(
            (agg, val) => agg + val,
            0
        )
    );

    const compiles = itDurations.reduce<number>(
        (agg, val) => agg + val.first,
        0
    );
    const validates = itDurations.reduce<number>(
        (agg, val) => agg + val.second,
        0
    );

    console.log({
        compiles,
        validates,
        diff: compiles - validates
    })
});
