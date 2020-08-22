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
        //console.log(node, system);
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

export function systemsWithinRange(from, range, security) {
    let [minRange, maxRange] = range;
    let [minSecurity, maxSecurity] = security;
    if (!minRange) minRange = 0;
    let [jumps] = calculatePaths(from, maxRange);
    let sys = [];
    for (let system in jumps) {
        if (jumps[system] >= minRange &&
            systems[system][c.Security] >= minSecurity &&
            systems[system][c.Security] <= maxSecurity
            )
            sys.push({system: parseInt(system), jumps: jumps[system]});
    }
    return sys;
}

export function matchingProduction(from, range, security, richness, resourceList) {
    let inRange = systemsWithinRange(from, range, security);
    let [minRich, maxRich] = richness;
    let matches = [];
    for (let {system: id, jumps} of inRange) {
        let system = systems[id];
        let planets = system[c.Planets];
        for (let planet of planets) {
            let resources = planet[c.Resources];
            for (let resource of resources) {
                if (!resourceList.includes(resource[c.Resource]))
                    continue;
                let absRich = resource[c.AbsRich];
                if (absRich >= minRich && absRich <= maxRich) {
                    matches.push({
                        resource: resource[c.Resource],
                        planet: planet[c.Planet],
                        security: system[c.Security],
                        jumps,
                        richness: absRich
                    });
                }
            }
        }
    }
    return matches;
}

export function getSystems() {
    return systems.map(s => (
        {
            label: `${s[c.Region]} > ${s[c.Constellation]} > ${s[c.System]}`,
            region: s[c.Region],
            constellation: s[c.Constellation],
            system: s[c.System],
            security: s[c.Security]
        }
    ));
}

export function getResources() {
    return Object.keys(data.maxOutput);
}

export function getResourceMaxOutput() {
    let maxOutput = {}
    for (let i = 0; i < data.resources.length; i++)
        maxOutput[data.resources[i]] = data.maxOutput[i];
    return maxOutput;
}