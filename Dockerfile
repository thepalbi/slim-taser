FROM ghcr.io/graalvm/graalvm-ce:java8-21.1.0

RUN microdnf install git wget
RUN mkdir /workspace.nodeprof && cd /workspace.nodeprof && \
  wget https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-21.1.0/graalvm-ce-java8-linux-amd64-21.1.0.tar.gz && \
  tar -xzf graalvm-ce-java8-linux-amd64-21.1.0.tar.gz && cd graalvm-ce-java8-21.1.0 && \
  ./bin/gu install nodejs

# FIXME Parametrize this!
RUN git clone https://github.com/Haiyang-Sun/nodeprof.js.git /workspace.nodeprof/nodeprof && \
  cd /workspace.nodeprof/nodeprof && \
  git checkout c513652ba0845667badf109278ca60e17bd3f3ac

COPY ./jars/nodeprof.jar /workspace.nodeprof/jars/

ENV PATH_GRAALVM="/workspace.nodeprof/graalvm-ce-java8-21.1.0"
ENV PATH_NODEPROF_JAR="/workspace.nodeprof/jars/"
ENV PATH_NODEPROF="/workspace.nodeprof/nodeprof"

COPY run.sh /bin/slim-taser
RUN chmod +x /bin/slim-taser
