#!/bin/bash

$PATH_GRAALVM/bin/node --jvm --experimental-options \
  --vm.Dtruffle.class.path.append=$PATH_NODEPROF_JAR/nodeprof.jar \
  --nodeprof $PATH_NODEPROF/src/ch.usi.inf.nodeprof/js/jalangi.js \
  --analysis /persistent2/tsm-setup/taser/dist/src/AintNodeTaint.js $@
