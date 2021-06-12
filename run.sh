#!/bin/bash

NODEPROF_DIR=/graalvm-nodeprof-java8-20.2.0-dev
NODE_BINARY=$NODEPROF_DIR/bin/node
OPTS=--experimental-options
SLIM_TASER_MAIN=/analysis/dist/index.js

$NODE_BINARY $OPTS --nodeprof $NODEPROF_DIR/nodeprof/nodeprof.js --analysis $SLIM_TASER_MAIN $@