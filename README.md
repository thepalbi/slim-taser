## Automation
Local docker container tag being used: `b5d5ab012d81`

## Running analysis
1. Build container: ```docker build .```
2. Start the Typescript compiler in watch mode: ```npm install && npx tsc --watch```
3. Given the built container hash, start it mounting the built analysis directory:
```bash
docker run -v `pwd`/:/analysis -v `pwd`/test_libs/:/test_libs -ti CONTAINER_TAG  bash
```
4. Inside the container, run the analysis with:
```bash
cd /test_libs/spawn/
LIBRARY_ROOT_DIR=`pwd` LIBRARY_UNDER_TEST=spawn slim-taser ./node_modules/.bin/mocha test
```
5. Or use the following to run slim-taser in an spurious container:
```bash
docker run \
    -v `pwd`/:/analysis -v `pwd`/test_libs/:/test_libs \
    -w /test_libs/spawn \
    -e LIBRARY_ROOT_DIR=/test_libs/spawn \
    -e LIBRARY_UNDER_TEST=spawn \
        7497c0c769e1 slim-taser ./node_modules/.bin/mocha test
```