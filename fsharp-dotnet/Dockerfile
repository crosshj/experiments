FROM microsoft/dotnet:1.1-sdk

RUN apt-get update
RUN apt-get install -y --force-yes vim nano

WORKDIR /app

# dependencies fetch and project setup
COPY example.fsproj ./
RUN dotnet restore
RUN echo dotnet restore > ./install && chmod 0755 ./install

# build
COPY main.fs ./
COPY library.fs ./
RUN dotnet publish -c Release -o out
RUN echo dotnet publish -c Release -o out > ./build && chmod 0755 ./build

RUN echo '[ ! -z "$TERM" -a -r /etc/motd ] && echo -e "Try ./run, ./build, and ./install\n"' >> /etc/bash.bashrc

# run
RUN echo dotnet out/example.dll > ./run && chmod 0755 ./run
ENTRYPOINT ["run"]
