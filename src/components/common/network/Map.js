import React, { useRef } from 'react';
import { createStyles, makeStyles } from '@material-ui/styles';
import ForceGraph from 'react-force-graph-2d';
import { AutoSizer } from 'react-virtualized';
import { Typography } from '@material-ui/core';

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

const nodes = [
  {
    color: 'green',
    fx: 0,
    fy: 0,
    id: '0001',
  },
  {
    color: 'yellow',
    fx: 100,
    fy: 0,
    id: '0002',
  },
  {
    fx: 0,
    fy: 100,
    id: '0003',
  },
  {
    fx: 100,
    fy: 200,
    id: '0004',
  },
  {
    color: 'red',
    fx: 200,
    fy: 100,
    id: '0005',
  },
  {
    fx: 300,
    fy: 100,
    id: '0006',
  },
];

const links = [
  {
    color: 'orange',
    source: '0001',
    target: '0002',
  },
  {
    color: 'grey',
    source: '0001',
    target: '0003',
  },
  {
    color: 'grey',
    source: '0001',
    target: '0004',
  },
  {
    color: 'orange',
    source: '0002',
    target: '0005',
  },
  {
    color: 'grey',
    source: '0004',
    target: '0006',
  },
  {
    color: 'grey',
    source: '0001',
    target: '0002',
  },
];

function getGraphData() {
  // get universe from file or query
  const universe = [];

  return universe.reduce((acc, system, index) => {
    const nodeProps = {
      fx: system.x,
      fy: system.y,
      ...system,
    };

    // if system in details/path, add relevant props
    acc.nodes.push(nodeProps);

    // generate links from system data
    const linkProps = system.links.map((link) => {
      const linkProps = {
        color: 'white',
        source: link.source,
        target: link.target,
      };
      // if link in path, add relevant props
      return linkProps;
    });
    acc.links.push(...linkProps);

    return acc;
  }, { nodes: [], links: [] });
}

function renderNode(node, context, globalScale) {
  // https://github.com/vasturiano/force-graph/blob/master/example/text-nodes/index.html
  const label = node.id;
  const fontSize = 12/globalScale;
  context.font = `${fontSize}px Sans-Serif`;
  const textWidth = context.measureText(label).width;
  const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

  context.fillStyle = 'rgba(63, 63, 63, 1';
  context.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = node.color ? node.color : 'white';
  context.fillText(node.id, node.fx, node.fy);
}

function Map({ title }) {
  const graphRef = useRef(null);
  const classes = useStyles();

  // todo:
  // - generate nodes/links based on universe and/or region mapping
  // - modify nodes/links based on details/path

  // const graphData = getGraphData();
  const graphData = { nodes, links };

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
                nodeCanvasObject={renderNode}
                nodeLabel={node => `LABEL FOR ${node.id}`}
                ref={graphRef}
                width={screenWidth}
              />
            </>
          );
        }}
      </AutoSizer>
    </div>
  );
}

export default Map;
