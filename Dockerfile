FROM jysunhy/nodeprof:v20.2.0

RUN unzip graalvm-nodeprof-java8-20.2.0-dev.zip
COPY run.sh /bin/
RUN chmod +x /bin/run.sh
