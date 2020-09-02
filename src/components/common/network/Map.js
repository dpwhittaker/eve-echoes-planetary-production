import React, { useRef, useMemo } from 'react';
import { createStyles, makeStyles } from '@material-ui/styles';
import ForceGraph from 'react-force-graph-3d';
import { AutoSizer } from 'react-virtualized';
import { Typography } from '@material-ui/core';
import SpriteText from 'three-spritetext';

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


function Map({ title, nodes, links, baseSystem, details, route }) {
  const graphRef = useRef(null);
  const classes = useStyles();

  function renderNode(node) {
    const sprite = new SpriteText(node.system);
    sprite.color = node.security >= -0.5 ? 'black': 'white';
    sprite.backgroundColor = node.id === baseSystem ? "#9999ff" : "#" + 
      (node.security < 0 ? "ff" : parseInt((1 - node.security)*255).toString(16).padStart(2, '0')) + 
      (node.security > 0 ? "ff" : parseInt((node.security + 1)*255).toString(16).padStart(2, '0')) +
      "00";
    sprite.textHeight = details.find(d => d.systemId === node.id) || node.id === baseSystem ? 50 : 10;
    return sprite;
  }
  const baseNode = useMemo(() => nodes.find(n => n.id === baseSystem), [nodes, baseSystem]);
  // todo:
  // - generate nodes/links based on universe and/or region mapping
  // - modify nodes/links based on details/path

  // const graphData = getGraphData();
  const graphData = useMemo(() => ({
    nodes,
    links: links.map(l => {
      let isOnRoute = false;
      for (let i = 1; i < (route ? route.length : 0); i++)
        if (l.source === route[i-1] && l.target === route[i] ||
          l.source === route[i] && l.target === route[i-1]) {
          isOnRoute = true;
          break;
        }
      return {...l, color: isOnRoute ? 'yellow' : 'white', width: isOnRoute ? 20 : 10};
    })
  }), [nodes, links, route]);

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
                nodeLabel={node => `LABEL FOR ${node.id}`}
                ref={graphRef}
                width={screenWidth}
                cooldownTicks={1}
                onEngineTick={() => {
                  if (!baseNode) return;
                  const camera = graphRef.current.camera();
                  camera.up.set(0, 0, 1);
                  graphRef.current.cameraPosition({y: baseNode.fy - 10000, z: baseNode.fz - 2500}, {x: baseNode.fx, y: baseNode.fy, z: baseNode.fz}, 0);
                }}
              />
            </>
          );
        }}
      </AutoSizer>
    </div>
  );
}

export default Map;
