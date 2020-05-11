---
description: The Flume NG sink connector pulls messages from Pulsar topics to Flume clusters.
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-flume-ng-sink/tree/master/src/main/java/org/apache/flume/sink/pulsar"
license: Apache License 2.0
tags: ["Pulsar IO", "Flume NG", "Logging"]
alias: Flume NG Sink
features: ["Use Flume NG sink connector to sync data from Pulsar"]
license_link: "https://pulsar.apache.org/license/LICENSE-2.0"
icon: "/images/connectors/flume.jpg"
download: ""
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: 
id: "flume-ng-sink"
---


The Flume NG sink connector pulls messages from Pulsar topics to Flume clusters.

# Installation

This section describes how to install the Flume NG sink connector.

## Prerequisites

Install the following tools before installing the Flume NG sink connector.

- JDK 1.8+
- Apache Maven 3.x

## Build Flume NG sink from Source

1. Use the following command to clone the project from GitHub.

    ```bash
    git clone https://github.com/streamnative/flume-ng-pulsar-sink.git
    ```

2. Build the Flume NG sink using maven.

    ```bash
    cd flume-ng-pulsar-sink
    mvn clean package
    ```

    Once it is built successfully, you can find a jar `flume-ng-pulsar-sink-<version>.jar` generated under the `target` directory.
    You can drop the built jar at your flume installation under the `lib` directory.

# Usage

This section gives an example about how to use the Flume NG sink connector to publish data to a Pulsar topic.

## Requirements

Install the Docker. For details about how to install the Docker, see [here](https://docs.docker.com/docker-for-mac/install/).

## Procedures

To publish data to a Pulsar topic through the Flume NG sink connector, follow these steps:

1. Use the following command to clone the project.

    ```bash
    git clone https://github.com/streamnative/flume-ng-pulsar-sink.git
    ```

2. Start Pulsar in standalone mode.

    ```$xslt
    docker pull apachepulsar/pulsar:2.3.0
    docker run -d -it -p 6650:6650 -p 8080:8080 -v $PWD/data:/pulsar/data --name pulsar-flume-standalone apachepulsar/pulsar:2.3.0 bin/pulsar standalone
    ```

3. Start the Pulsar [consumer](https://github.com/streamnative/pulsar-flume-ng-sink/blob/master/src/test/python/pulsar-flume.py) to consume messages from topic `flume-test-topic`.

    ```$xslt
    docker cp src/test/python/pulsar-flume.py pulsar-flume-standalone:/pulsar
    docker exec -it pulsar-flume-standalone /bin/bash
    python pulsar-flume.py
    ```

4. Set up the Flume.

   1. Prepare the build environment.

        Open a new terminal to start a Docker instance `flume` of `maven:3.6-jdk-8` in the same network as `pulsar-flume-standalone` that we started at the previous step. Use this `flume` Docker instance to install the Flume and the Flume NG sink connector.

        ```$xslt
        docker pull maven:3.6-jdk-8
        docker run -d -it --link pulsar-flume-standalone -p 44445:44445 --name flume maven:3.6-jdk-8 /bin/bash
        ```

   2. Install the Flume.

        1. Go to the Docker instance `flume`.

            ```$xslt
            docker exec -it flume /bin/bash
            ```

        2. At the docker instance `flume`, use the following commands to decompress the Flume package.

            ```
            wget http://apache.01link.hk/flume/1.9.0/apache-flume-1.9.0-bin.tar.gz
            tar -zxvf apache-flume-1.9.0-bin.tar.gz
            ```

   3. Install the Flume NG sink.
   
       1. Go to the Docker instance `flume`.

            ```$xslt
            docker exec -it flume /bin/bash
            ```
       2. At the Docker instance `flume`, use the following commands to install the Flume NG sink.
   
            ```$xslt
            git clone https://github.com/streamnative/flume-ng-pulsar-sink
            cd flume-ng-pulsar-sink
            mvn clean package
            cd ..
            cp flume-ng-pulsar-sink/target/flume-ng-pulsar-sink-1.9.0.jar apache-flume-1.9.0-bin/lib/
            exit
            ```

   4. Configure the Flume.

      1. Copy the example configurations to `flume`.

           - [flume-example.conf](https://github.com/streamnative/pulsar-flume-ng-sink/blob/master/src/test/resources/flume-example.conf)
           - [flume-env.sh](https://github.com/streamnative/pulsar-flume-ng-sink/blob/master/src/test/resources/flume-env.sh)

      2. Use the following commands to configure the Flume.
   
            ```$xslt
            docker cp src/test/resources/flume-example.conf flume:/apache-flume-1.9.0-bin/conf/
            docker cp src/test/resources/flume-env.sh flume:/apache-flume-1.9.0-bin/conf/
            ```

   5. Start the Flume NG agent.
   
      1. Go to the Docker instance `flume`.

            ```$xslt
            docker exec -it flume /bin/bash
            ```

      2. At the Docker instance `flume`, use the following command to start the Flume NG agent.

            ```$xslt
            apache-flume-1.9.0-bin/bin/flume-ng agent --conf apache-flume-1.9.0-bin/conf/ -f apache-flume-1.9.0-bin/conf/flume-example.conf -n a1
            ```

5. Send data to the Pulsar topic.

    1. Open another terminal window, send data to Port 44445 of the Flume.

        ```$xslt
        ➜  ~ telnet localhost 44445
        Trying ::1...
        Connected to localhost.
        Escape character is '^]'.
        hello
        OK
        world
        OK
        ```

    2. At the terminal window, run the script `pulsar-consumer.py` and you can see the following output:

        ```$xslt
        'eceived message: 'hello
        'eceived message: 'world
        ``` 

6. Stop Pulsar and Flume.

    The `flume` and `pulsar-flume-standalone` are running in the background. Ensure to stop them at the end of this tutorial.

    ```bash
    docker ps | grep pulsar-flume-standalone | awk '{ print $1 }' | xargs docker kill
    docker ps | grep flume | awk '{ print $1 }' | xargs docker kill
    ```

