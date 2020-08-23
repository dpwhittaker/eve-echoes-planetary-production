import data from './data.json';
import c from './columns.js';

let systems = data.data;

function calculatePaths(from, maxJumps, to) {
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
                if (to !== undefined && next === to) return max;
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
    for (let {system: systemId, jumps} of inRange) {
        let system = systems[systemId];
        let planets = system[c.Planets];
        for (let planetId = 0; planetId < planets.length; planetId++) {
            let planet = planets[planetId];
            let resources = planet[c.Resources];
            for (let resourceId = 0; resourceId < resources.length; resourceId++) {
                let resource = resources[resourceId];
                if (!resourceList.includes(resource[c.Resource]))
                    continue;
                let absRich = resource[c.AbsRich];
                if (absRich >= minRich && absRich <= maxRich) {
                    matches.push({
                        systemId,
                        planetId,
                        resourceId,
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

function shortestTripGreedy(systems) {
    //greedy travelling salesman - aka human approach
    let route = [systems[0]];
    let roundTrip = 0;
    while (true) {
        let last = route[route.length - 1];
        let shortest = 99999999;
        let shortestId = null;
        for (let next in systems) {
            if (route.includes(next)) continue;
            let distance = calculatePaths(last, null, next);
            if (distance < shortest) {
                shortest = distance;
                shortestId = next;
            }
        }
        if (shortestId === null) break;
        route.push(shortestId);
        roundTrip += shortest;
    }
    roundTrip += calculatePaths(route[route.length - 1], null, systems[0]);
}

function shortestTrip(systems) {
    let route = systems.slice(0);
    let shortest = shortestTripGreedy(route);
    for (let i = 0; i < systems.length - 1; i++) {
        route.push(route.shift());
        let trip = shortestTripGreedy(route);
        if (trip < shortest) shortest = trip;
    }
    return shortest;
}

export function findBestMatches(matches, from, resourceList, numPlanets) {
    let resourceIndex = {};
    let matchesByResource = {};
    for (let i = 0; i < resourceList.length; i++) {
        resourceIndex[resourceList[i]] = i;
        matchesByResource[resourceList[i]] = [];
    }
    for (let match of matches)
        matchesByResource[match.resource].push(match);
    let resourceOrder = resourceList.sort(
        (a, b) => matchesByResource[a].length - matchesByResource[b].length
    );

    let bestMatches = [];
    function recurse(choices) {
        //bound
        let nPlanets = new Set(choices.map(c => c.planet)).size;
        if (nPlanets > numPlanets) continue;

        //leaf
        if (choices.length === resourceList.length) {
            let totalRichness = choices.reduce((a, c) => a + c.richness, 0);
            let roundTrip = shortestTrip([from, ...choices.map(c => c.systemId)]);
            let nSystems = new Set(choices.map(c => c.systemId)).size;
            bestMatches.push({
                totalRichness,
                roundTrip,
                planets: nPlanets,
                systems: nSystems,
                matches: choices
            });
        }

        //branch
        let resource = resourceOrder[choices.length];
        for (let match of matchesByResource[resource]) {
            let newChoices = choices.sice(0); //shallow copy
            newChoices.push(match);
            recurse(newChoices);
        }
    }
    recurse([], new Set());
    return bestMatches;
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