import * as Comlink from 'comlink';
import data from './data.json';
import c from './columns.js';

const sleep = () => new Promise(r => setTimeout(r, 1));
const SLEEPLOOPS = 100000;
const SENDMATCHDELAY = 100;

let systems = data.data;

function calculatePaths(from) {
    let jumps = systems[from].shortestPaths;
    let queue = [];
    queue.push(from);
    while (queue.length > 0) {
        let node = queue.shift();
        let system = systems[node];
        for (let next of system[c.Neighbors]) {
            if (jumps[next] === -1) {
                jumps[next] = jumps[node] + 1;
                queue.push(next);
            }
        }
    }
    return jumps;
}

function initSystems() {
    let start = performance.now();
    for (let i = 0; i < systems.length; i++) {
        let system = systems[i];
        system.shortestPaths = systems.map(s => -1);
        system.shortestPaths[i] = 0;
        calculatePaths(i);
    }
    let end = performance.now();
    console.log(`initSystems time: ${end - start} ms`);
}
initSystems();

export function shortestPath(from, to) {
    return systems[from].shortestPaths[to];
}

export function longestPath(from) {
    return systems[from].shortestPaths.reduce((a,c) => Math.max(a, c), -Infinity);
}

export function systemsWithinRange(from, range, security) {
    let jumps = systems[from].shortestPaths;
    let [minRange, maxRange] = range;
    let [minSecurity, maxSecurity] = security;
    if (!minRange) minRange = 0;
    let sys = [];
    for (let system = 0; system < jumps.length; system++) {
        if (minRange <= jumps[system] &&
            jumps[system] <= maxRange &&
            minSecurity <= systems[system][c.Security] &&
            systems[system][c.Security] <= maxSecurity
           )
            sys.push({system: system, jumps: jumps[system]});
    }
    return sys;
}

export function neighborhood(from, range) {
    let jumps = systems[from].shortestPaths;
    let nodes = [];
    let links = [];
    for (let i = 0; i < jumps.length; i++)
        if (jumps[i] <= range)
            nodes.push({
                id: i,
                name: systems[i][c.System],
                security: systems[i][c.Security]
            });
    for (let node of nodes)
        for (let neighbor of systems[node.id][c.Neighbors])
            if (jumps[neighbor] <= range)
                 links.push({source: node.id, target: neighbor});
    nodes.sort((a, b) => jumps[a.id] - jumps[b.id]);
    return { nodes, links };
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
                if (!resourceList.includes(resource[c.Resource])) continue;
                let richness = resource[c.AbsRich];
                if (richness < minRich || richness > maxRich) continue;
                matches.push({systemId, planetId, resourceId, jumps, richness,
                    resource: resource[c.Resource], planet: planet[c.Planet],
                    security: system[c.Security], output: resource[c.Output],
                    planetType: planet[c.PlanetType], system: system[c.System],
                    constellation: system[c.Constellation], region: system[c.Region]
                });
            }
        }
    }
    return matches;
}

//greedy travelling salesman - aka human approach
function shortestTripGreedy(systemList) {
    let route = [systemList[0]];
    let todo = systemList.slice(1);
    let todolen = todo.length;
    let roundTrip = 0;
    while (true) {
        let last = route[route.length - 1];
        let shortest = 99999999;
        let shortestIndex = -1;
        for (let i = 0; i < todolen; i++) {
            let next = todo[i];
            let distance = systems[last].shortestPaths[next];
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
    roundTrip += shortestPath(route[route.length - 1], systemList[0]);
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
export async function findBestMatches(matches, from, resourceList, numPlanets, maxRoundTripJumps, setBestMatches, setProgress) {
    let thisCallNumber = ++callNumber;
    let id = 0;
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
        id: id++,
        totalRichness: 'ALL',
        roundTrip: '',
        planets: new Set(matches.map(m => m.planet)).size,
        systems: new Set(matches.map(m => m.systemId)).size,
        matches
    }];
    setBestMatches(bestMatches);
    setProgress(0);
    await sleep();
    let setup = performance.now();
    let choices = [];
    let progress = [];
    let progressDenominator = resourceOrder.map(r => matchesByResource[r].length);
    let nPlanets = 0;
    let boundPlanets = 0;
    let boundRichness = 0;
    let boundRoundTrips = 0;
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
        let roundTrip = shortestTrip([from, ...choices.map(c => c.systemId)]);
        if (roundTrip > maxRoundTripJumps) {
            boundRoundTrips++;
            return;
        }
        if (choices.length === 1) {
            setProgress(progress[0] * 100 / progressDenominator[0])
            console.log(
                callNumber,
                progress.map((p, i) => p / progressDenominator[i]).join(' '),
                "bound by planets", boundPlanets,
                "bound by richness", boundRichness,
                "bound by round Trip", boundRoundTrips
                );
        }

        //leaf
        if (choices.length === resourceList.length) {
            //console.log(choices.map(c => c.planet));
            let nSystems = new Set(choices.map(c => c.systemId)).size;
            let matches = choices.slice(0);
            //console.log("found bestMatch", totalRichness, roundTrip, matches);
            bestMatches.push({
                id: id++,
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
    setProgress(100);
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
    return Object.keys(data.maxOutput).sort();
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
    neighborhood,
    matchingProduction,
    findBestMatches,
    getSystems,
    getResources,
    getResourceMaxOutput
})