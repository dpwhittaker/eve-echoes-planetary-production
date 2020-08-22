import json
import pprint
import sys

compress = False
minify = True

for i in range(1, len(sys.argv)):
    if sys.argv[i] == '-c': compress = True
    if sys.argv[i] == '-p': minify = False

def parseCSV(filename):
    data = []
    with open(filename) as f:
        header = f.readline().strip().split(',')
        while True:
            line = f.readline()
            if not line: break
            data.append(line.strip().split(','))
    return {'header': header, 'data': data}

systems = parseCSV('SystemsDB.csv')
planets = parseCSV('PlanetsDB.csv')
resources = parseCSV('ResourcesDB.csv')

def buildIdToIndex(data, idCol):
    idToIndex = {}
    for i in range(len(data)):
        idToIndex[data[i][idCol]] = i
    return idToIndex

systemIdToIndex = buildIdToIndex(systems['data'], 0)
planetIdToIndex = buildIdToIndex(planets['data'], 0)

regions = []
regionToIndex = {}
for d in systems['data']:
    if d[1] not in regions:
        regionToIndex[d[1]] = len(regions)
        regions.append(d[1])

constellations = []
constellationToIndex = {}
for d in systems['data']:
    if d[2] not in constellations:
        constellationToIndex[d[2]] = len(constellations)
        constellations.append(d[2])

planetTypes = []
planetTypeToIndex = {}
for d in planets['data']:
    if d[3] not in planetTypes:
        planetTypeToIndex[d[3]] = len(planetTypes)
        planetTypes.append(d[3])

resourceNames = []
resourceToIndex = {}
maxOutput = {}
for d in resources['data']:
    if d[1] not in resourceNames:
        resourceToIndex[d[1]] = len(resourceNames)
        resourceNames.append(d[1])
        maxOutput[d[1]] = 0

richness = ['Poor','Medium','Rich','Perfect']
richnessToIndex = {'Poor':0,'Medium':1,'Rich':2,'Perfect':3}

del systems['header'][0]
for d in systems['data']:
    del d[0]
    if compress:
        d[0] = regionToIndex[d[0]]
        d[1] = constellationToIndex[d[1]]
    d[3] = float(d[3])
    d[4] = list(map(lambda x: systemIdToIndex[x], d[4].split(':')))
    d.append([])

del planets['header'][0]
for d in planets['data']:
    del d[0]
    d[0] = systemIdToIndex[d[0]]
    if compress:
        d[2] = planetTypeToIndex[d[2]]
    d.append([])

del resources['header'][0]
resources['header'].append('AbsRich')
planets['header'].append(resources['header'])
for d in resources['data']:
    planet = planetIdToIndex[d[0]]
    system = planets['data'][planet][0]
    security = systems['data'][system][3]
    d[3] = float(d[3])
    if security > 0.5 and d[3] > maxOutput[d[1]]:
        print(d[1], ':', d[3])
        maxOutput[d[1]] = d[3]
    elif d[3] / 2 > maxOutput[d[1]]:
        print('nullsec', d[1], ':', d[3] / 2)
        maxOutput[d[1]] = d[3] / 2
    if compress:
        d[1] = resourceToIndex[d[1]]
        d[2] = richnessToIndex[d[2]]

for d in resources['data']:
    planet = planetIdToIndex[d[0]]
    del d[0]
    d.append(int(d[2]/maxOutput[d[0]]*100))
    planets['data'][planet][-1].append(d)

del planets['header'][0]
systems['header'].append(planets['header'])
for d in planets['data']:
    system = d[0]
    del d[0]
    systems['data'][system][-1].append(d)

data = systems
data['maxOutput'] = maxOutput

if compress:
    data.update({
        'regions': regions,
        'constellations': constellations,
        'planetTypes': planetTypes,
        'richness': richness
        })

with open('data.json', 'w') as j:
    if minify:
        json.dump(data, j, separators=(',',':'))
    else:
        pprint.pprint(data, j)