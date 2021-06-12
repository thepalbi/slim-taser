## Automation
Local docker container tag being used: `b5d5ab012d81`

## Running analysis
1. Build container: ```docker build .```
2. Start the Typescript compiler in watch mode: ```npm install && npx tsc --watch```
3. Given the built container hash, start it mounting the built analysis directory:
```bash
docker run -v `pwd`/dist/:/analysis -ti $CONTAINER_TAG  bash
```
4. Inside the container, run the analysis with:
```bash
cd graalvm-nodeprof-java8-20.2.0-dev

./bin/node \
    --experimental-options \
    --nodeprof ./nodeprof/nodeprof.js \
    --analysis  /analysis/index.js \
        ./nodeprof/tests/helloworld.js
```