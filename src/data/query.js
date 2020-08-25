import * as Comlink from 'comlink';
import data from './data.json';
import c from './columns.js';

const sleep = () => new Promise(r => setTimeout(r, 10));
const SLEEPLOOPS = 100000;
const SENDMATCHDELAY = 100;

let systems = data.data;

function calculatePaths(from, maxJumps, to) {
    let start = performance.now();
    let queue = [];
    let max = 0;
    let jumps = {[from]: 0};
    queue.push(from);
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

function initShortestPaths() {
    for (let i = 0; i < systems.length; i++) {
        let system = systems[i];
        system.shortestPaths = systems.map(s => -1);
        system.shortestPaths[i] = 0;
    }
}
initShortestPaths();

export function shortestPath(from, to) {
    let distance = systems[from].shortestPaths[to];
    if (distance !== -1) return distance;
    distance = calculatePaths(from, null, to);
    systems[from].shortestPaths[to] = distance;
    systems[to].shortestPaths[from] = distance;
    return distance;
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
    let todo = systems.slice(1);
    let todolen = todo.length;
    let roundTrip = 0;
    while (true) {
        let last = route[route.length - 1];
        let shortest = 99999999;
        let shortestIndex = -1;
        for (let i = 0; i < todolen; i++) {
            let next = todo[i];
            let distance = shortestPath(last, next);
            if (distance < shortest) {
                shortest = distance;
                shortestIndex = i;
            }
        }
        if (shortestIndex === -1) break;
        route.push(todo[shortestIndex]);
        todo[shortestIndex] = todo[--todolen];
        roundTrip += shortest;
    }
    roundTrip += shortestPath(route[route.length - 1], systems[0]);
    return roundTrip;
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

let callNumber = 0;
export async function findBestMatches(matches, from, resourceList, numPlanets, setBestMatches, setWorking) {
    let thisCallNumber = ++callNumber;
    let start = performance.now();
    let loopsBetweenSleep = 0;
    let lastMatchSend = 0;
    let resourceIndex = {};
    let matchesByResource = {};
    for (let i = 0; i < resourceList.length; i++) {
        resourceIndex[resourceList[i]] = i;
        matchesByResource[resourceList[i]] = [];
    }
    for (let match of matches)
        matchesByResource[match.resource].push(match);
    for (let resource in matchesByResource) {
        if (matchesByResource[resource].length === 0) return [];
        matchesByResource[resource].sort(
            (a, b) => b.richness - a.richness
        );
    }
    let resourceOrder = resourceList.slice(0).sort(
        (a, b) => matchesByResource[a].length - matchesByResource[b].length
    );
    let resourceMaxRich = resourceOrder.map(r => matchesByResource[r][0].richness);
    let maxRemainingRich = resourceMaxRich.map((r, i) => resourceMaxRich.slice(i).reduce((a, v) => a + v));
    maxRemainingRich.push(0);

    let seen = {};
    let planets = [];
    for (let match of matches) {
        if (match.planet in seen) {
            match.planetUid = seen[match.planet];
        } else {
            match.planetUid = planets.length;
            planets.push(false);
            seen[match.planet] = match.planetUid;
        }
    }
    let bestMatches = [{
        totalRichness: 'ALL',
        roundTrip: '',
        planets: new Set(matches.map(m => m.planet)).size,
        systems: new Set(matches.map(m => m.systemId)).size,
        matches
    }];
    setBestMatches(bestMatches);
    setWorking(true);
    await sleep();
    let setup = performance.now();
    let choices = [];
    let progress = [];
    let progressDenominator = resourceOrder.map(r => matchesByResource[r].length);
    let nPlanets = 0;
    let boundPlanets = 0;
    let boundRichness = 0;
    async function recurse() {
        if (thisCallNumber !== callNumber) return;
        loopsBetweenSleep++;
        if (loopsBetweenSleep > SLEEPLOOPS) {
            loopsBetweenSleep = 0;
            await sleep();
        }
        //bound
        if (nPlanets > numPlanets) {
            boundPlanets++;
            return;
        }
        let totalRichness = choices.reduce((a, c) => a + c.richness, 0) + maxRemainingRich[choices.length];
        if (bestMatches.length >= 100 && totalRichness < bestMatches[99].totalRichness) {
            boundRichness++;
            return;
        }

        if (choices.length < 2) {
            console.log(
                callNumber,
                progress.map((p, i) => p / progressDenominator[i]).join(' '),
                "bound by planets", boundPlanets,
                "bound by richness", boundRichness
                );
        }

        //leaf
        if (choices.length === resourceList.length) {
            //console.log(choices.map(c => c.planet));
            let roundTrip = shortestTrip([from, ...choices.map(c => c.systemId)]);
            let nSystems = new Set(choices.map(c => c.systemId)).size;
            let matches = choices.slice(0);
            //console.log("found bestMatch", totalRichness, roundTrip, matches);
            bestMatches.push({
                totalRichness,
                roundTrip,
                planets: nPlanets,
                systems: nSystems,
                matches
            });
            //bubble sort it up, leave ALL in [0]
            for (let i = bestMatches.length - 1; i > 1; i--) {
                if (bestMatches[i].totalRichness <= bestMatches[i-1].totalRichness) break;
                [bestMatches[i], bestMatches[i-1]] = [bestMatches[i-1], bestMatches[i]];
            }
            while (bestMatches.length >= 100 && bestMatches[bestMatches.length - 1].totalRichness < bestMatches[99].totalRichness)
                bestMatches.pop();
            if (performance.now() > lastMatchSend + SENDMATCHDELAY) {
                setBestMatches(bestMatches.slice(0));
                lastMatchSend = performance.now();
            }
            await sleep();
            return;
        }

        //branch
        let last = choices.length;
        let resource = resourceOrder[last];
        let mbr = matchesByResource[resource];
        choices.push(null);
        progress.push(0);
        for (let i = 0, len = mbr.length; i < len; i++) {
            let match = mbr[i];
            choices[last] = match;
            progress[last] = i;
            let added = false;
            if (!planets[match.planetUid]) {
                planets[match.planetUid] = true;
                added = true;
                nPlanets += 1;
            }
            await recurse();
            if (added) {
                planets[match.planetUid] = false;
                nPlanets -= 1;
            }
        }
        choices.pop();
        progress.pop();
    }
    await recurse();
    if (thisCallNumber !== callNumber) return;
    setBestMatches(bestMatches);
    setWorking(false);
    let end = performance.now();
    console.log(`Setup time: ${setup - start}ms, Recurse time: ${end - setup}ms`);
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

Comlink.expose({
    shortestPath,
    longestPath,
    systemsWithinRange,
    matchingProduction,
    findBestMatches,
    getSystems,
    getResources,
    getResourceMaxOutput
})