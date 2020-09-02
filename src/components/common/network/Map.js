import React, { useRef, useMemo, useEffect } from 'react';
import { createStyles, makeStyles } from '@material-ui/styles';
import ForceGraph from 'react-force-graph-3d';
import { AutoSizer } from 'react-virtualized';
import { Typography } from '@material-ui/core';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';

THREE.Object3D.DefaultUp.set(0, 0, 1);

// h5 component height + bottom margin (32 + 8.4)
const tableTitleHeight = 32;
const tableTitleAdjustment = tableTitleHeight + 8.4;

const useStyles = makeStyles((theme) => createStyles({
  root: {
    // height = screen height - grid padding
    height: `calc(100vh - (${theme.spacing(4)}px * 2))`,
  },
  title: {
    height: tableTitleHeight,
    marginLeft: theme.spacing(1),
    width: 'max-content',
  },
}));

const spriteCache = {};

function Map({ title, nodes, links, baseSystem, details, route }) {
  const graphRef = useRef(null);
  const classes = useStyles();

  function renderNode(node) {
    const color = node.id === baseSystem ? "#9999ff" : "#" + 
      (node.security < 0 ? "ff" : parseInt((1 - node.security)*255).toString(16).padStart(2, '0')) + 
      (node.security > 0 ? "ff" : parseInt((node.security + 1)*255).toString(16).padStart(2, '0')) +
      "00";
    let focus = details.find(d => d.systemId === node.id) || node.id === baseSystem;
    
    if (details.length > 100 || !focus)
      return new THREE.Mesh(new THREE.SphereGeometry(focus ? 20 : 10, 5), new THREE.MeshBasicMaterial({color}));
    
    let sprite = spriteCache[node.system];
    if (!sprite) {
      sprite = new SpriteText(node.system);
      sprite.color = node.security >= -0.5 ? 'black': 'white';
      sprite.backgroundColor = color;
      sprite.textHeight = 50;
      spriteCache[node.system] = sprite;
    }
    return sprite;
  }
  const baseNode = useMemo(() => nodes.find(n => n.id === baseSystem), [nodes, baseSystem]);
  // todo:
  // - generate nodes/links based on universe and/or region mapping
  // - modify nodes/links based on details/path

  // const graphData = getGraphData();
  const a = performance.now();
  const graphData = useMemo(() => {
    const lookup = {[route[0]]: {}};
    for (let i = 1; i < route.length; i++) {
      if (!lookup[route[i]]) lookup[route[i]] = {};
      lookup[route[i-1]][route[i]] = true;
      lookup[route[i]][route[i-1]] = true;
    }
    return {
      nodes,
      links: links.map(l => {
        let isOnRoute = lookup[l.source] && lookup[l.source][l.target];
        return {...l, color: isOnRoute ? '#3399ff' : '#666666', width: isOnRoute ? 20 : 10};
      })
    }
  }, [nodes, links, route]);
  console.log("route time", performance.now() - a);

  function updateCamera() {
    if (!baseNode || !nodes.length) return;
    const camera = graphRef.current.camera();
    camera.up.set(0, 0, 1);
    let bbox = null;
    for (let n of nodes) {
      if (!route.includes(n.id) && !details.find(d => d.systemId === n.id)) continue;
      if (!bbox) bbox = {x: [n.fx, n.fx], y: [n.fy, n.fy], z: [n.fz, n.fz]};
      if (n.fx < bbox.x[0]) bbox.x[0] = n.fx;
      if (n.fx > bbox.x[1]) bbox.x[1] = n.fx;
      if (n.fy < bbox.y[0]) bbox.y[0] = n.fy;
      if (n.fy > bbox.y[1]) bbox.y[1] = n.fy;
      if (n.fz < bbox.z[0]) bbox.z[0] = n.fz;
      if (n.fz > bbox.z[1]) bbox.z[1] = n.fz;
    }
    let center = {x: (bbox.x[0] + bbox.x[1]) / 2, y: (bbox.y[0] + bbox.y[1]) / 2, z: (bbox.z[0] + bbox.z[1]) / 2};
    let distance = Math.max(bbox.x[1] - bbox.x[0], bbox.z[1] - bbox.z[0]) * 1.2;
    let campos = {x: center.x, y: center.y - distance, z: center.z - distance / 4};
    console.log("bbox", bbox, center, distance, campos);
    graphRef.current.cameraPosition(campos, center, 3000);
  }

  return (
    <div className={classes.root}>
      <AutoSizer>
        {({ height: screenHeight, width: screenWidth }) => {
          const graphHeight = title ? screenHeight - tableTitleAdjustment : screenHeight;
          return (
            <>
              <Typography
                className={classes.title}
                gutterBottom
                variant="h5"
              >
                {title}
              </Typography>
              <ForceGraph
                enableNodeDrag={false}
                graphData={graphData}
                height={graphHeight}
                nodeThreeObject={renderNode}
                linkWidth="width"
                linkOpacity={0.5}
                nodeLabel={node => `${node.system} ${node.security.toFixed(1)}<br/>x: ${node.fx}<br/>y: ${node.fy}<br/>z: ${node.fz}`}
                ref={graphRef}
                width={screenWidth}
                cooldownTicks={1}
                controlType="orbit"
                onEngineTick={updateCamera}
              />
            </>
          );
        }}
      </AutoSizer>
    </div>
  );
}

export default Map;
