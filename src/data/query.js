import data from './data.json';
import c from './columns.js';

let systems = data.data;

function calculatePaths(from, maxJumps) {
    let start = performance.now();
    let queue = [];
    let max = 0;
    let jumps = {[from]: 0};
    queue.push(from);
    console.log("Neighbors", c);
    while (queue.length > 0) {
        let node = queue.shift();
        if (maxJumps && jumps[node] === maxJumps) continue;
        let system = systems[node];
        for (let next of system[c.Neighbors]) {
            if (!(next in jumps)) {
                max = jumps[next] = jumps[node] + 1;
                queue.push(next);
            }
        }
    }
    let end = performance.now();
    console.log(jumps);
    console.log(max);
    console.log(`calculatePaths time: ${end - start} ms`);
    return [jumps, max];
}

export function longestPath(from) {
    return calculatePaths(from)[1];
}