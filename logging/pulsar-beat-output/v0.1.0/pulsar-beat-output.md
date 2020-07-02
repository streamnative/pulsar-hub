---
description: Use Pulsar Beat output plugin to capture all sorts of operational data.
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Go
document: 
source: "https://github.com/streamnative/pulsar-beat-output"
license: Apache License 2.0
tags: ["Pulsar IO", "Beat output", "Logging"]
alias: Pulsar Beat output
features: ["Use Pulsar Beat output to capture all sorts of operational data"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/elasticsearch.jpg"
download: "https://github.com/streamnative/pulsar-beat-output/releases/tag/v0.1.0"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "pulsar-beat-output"
---


The Pulsar Beat output plugin is a lightweight data shipper, written in Go, that you install on your servers to capture all sorts of operational data.

# Installation

This section describes how to install the Pulsar Beat output plugin.

Download the Pulsar Beat output plugin from [here](https://github.com/streamnative/pulsar-beat-output/releases/tag/v0.1.0).


# Usage

This section gives an example about how to use the Pulsar Beat output to capture information about the Filebeat.

## Requirements

Install the Docker. For details about how to install the Docker, see [here](https://docs.docker.com/docker-for-mac/install/).

## Procedures

1. Build the Pulsar Beat images.

    ```
    docker build -t pulsar-beat.
    ```

2. Create a network.

    ```
    docker network create pulsar-beat
    ```

3. Start the Pulsar service.

    ```
    docker run -d -it --network pulsar-beat -p 6650:6650 -p 8080:8080 -v $PWD/data:/pulsar/data --name pulsar-beat-standalone apachepulsar/pulsar:2.4.0 bin/pulsar standalone
    ```

4. Add the following configuration to `filebeat.yml`.

    ```
    output.pulsar:
    url: "pulsar://pulsar-beat-standalone:6650"
    topic: my_topic
    name: test123
    ```

5. Start the Filebeat.

    ```
    docker pull golang:1.12.4
    docker run -it --network pulsar-beat --name filebeat golang:1.12.4 /bin/bash
    mkdir -p $GOPATH/src/github.com/streamnative/
    cd $GOPATH/src/github.com/streamnative/
    git clone https://github.com/streamnative/pulsar-beat-output
    cd pulsar-beat-output
    go build -o filebeat main.go
    chown -R root:root filebeat.yml test_module/modules.d/system.yml test_module/module/system
    cp test_module/module/system/auth/test/test.log /var/log/messages.log
    cp filebeat filebeat.yml test_module
    cd test_module
    ./filebeat modules enable system
    ./filebeat -c filebeat.yml -e
    ```

6. Open another terminal window, execute the following commands to collect information from the Filebeat.

    ```
    docker cp pulsar-client.py pulsar-beat-standalone:/pulsar
    docker exec -it pulsar-beat-standalone /bin/bash
    python pulsar-client.py
    ```

# Troubleshooting

This section lists how to troubleshoot some problems that you may encounter, when you use the Pulsar Beat output plugin.

## Fail to install Pulsar Go Client

- To troubleshoot problems related to installing the Pulsar Go client, see [here](https://streamnative.io/docs/v1.0.0/connect/client/go/).
- To troubleshoot problems related to dynamic libraries, see [here](https://streamnative.io/docs/v1.0.0/connect/client/cpp/).

## Fail to build Packetbeat

To troubleshoot problems related to building Packetbeat, see [here](https://github.com/elastic/beats/issues/11054).

## Fail to build journalbeat.go

If you get an error `systemd/sd-journal.h: No such file or directory`, use the following commands to troubleshoot the problem.

```
apt-get update
apt-get install libsystemd-dev
```

## Fail to build auditbeat.go

If you get an error `vendor/github.com/elastic/beats/x-pack/auditbeat/module/system/package/rpm_linux.go:23:24: fatal error: rpm/rpmlib.h: No such file or directory`, use the following command to troubleshoot the problem.

```
aapt-get install librpm-dev
```

## Fail to start Beat

If you get an error `Exiting: error loading config file: config file ("filebeat.yml") must be owned by the user identifier (uid=0) or root`, use the following command to troubleshoot the problem.

```
chown -R root:root filebeat.yml
```
