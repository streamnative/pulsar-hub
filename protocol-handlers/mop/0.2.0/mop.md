---
description: MoP brings the native MQTT protocol support to Pulsar by introducing a MQTT protocol handler on Pulsar brokers.
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/mop/tree/v0.2.0/mqtt-impl"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["Pulsar", "MQTT", "Protocol handler"]
alias: MoP
features: ["MoP brings the native MQTT protocol support to Pulsar by introducing a MQTT protocol handler on Pulsar brokers"]
icon: "/images/protocol-handler/mqtt-logo.png"
download: "https://github.com/streamnative/mop/releases/download/v0.2.0/pulsar-protocol-handler-mqtt-0.2.0.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "mop"
---

# Overview

MQTT-on-Pulsar (aka MoP) is developed to support MQTT protocol natively on Apache Pulsar.

# Installation

To install the MoP protocol handler, follow these steps:

1. Download the NAR package of the MoP protocol handler from [here](https://github.com/streamnative/mop/releases/download/v0.2.0/pulsar-protocol-handler-mqtt-0.2.0.nar).

2. Install the MoP protocol handler.

   1. Set the configuration of the MoP protocol handler.
       
       Add the following properties and set their values in the Pulsar configuration file, such as `conf/broker.conf` or `conf/standalone.conf`.

       Property | Recommended value | Default value
       |---|---|---
       `messagingProtocols` | mqtt | null
       `protocolHandlerDirectory`| Location of MoP NAR file | ./protocols
       
       **Example**

       ```
       messagingProtocols=mqtt
       protocolHandlerDirectory=./protocols
       ```

   2. Set the MQTT server listeners.

       > #### Note
       >
       > The hostname in the MQTT server listeners should be the same one as the Pulsar broker's `advertisedAddress`.

       **Example**

       ```
       mqttListeners=mqtt://127.0.0.1:1883
       advertisedAddress=127.0.0.1
       ```

3. Load the MoP protocol handler. After installing the MoP protocol handler on the Pulsar broker, you can restart the Pulsar broker to load the MoP protocol handler.

# Configuration

The following table lists configurations available for the MoP protocol handler.

| Property | Recommended value | Default value |
|---|---|---|
| `messagingProtocols` | mqtt | N/A |
| `protocolHandlerDirectory`| Location of MoP NAR file | ./protocols|
| `mqttListeners` | mqtt://127.0.0.1:1883 | N/A |
| `advertisedAddress` | 127.0.0.1 | N/A |

# How to use Pulsar Proxy

To use the Pulsar Proxy, follow these steps. For detailed steps, refer to [Deploy a cluster on bare metal](http://pulsar.apache.org/docs/en/deploy-bare-metal/).

1. Prepare a ZooKeeper cluster.

2. Initialize the cluster metadata.

3. Prepare a BookKeeper cluster.

4. Copy the `pulsar-protocol-handler-mqtt-${version}.nar` to the `$PULSAR_HOME/protocols` directory.

5. Start the Pulsar broker.

   Here is an example of the Pulsar broker configuration.

    ```yaml
    messagingProtocols=mqtt
    protocolHandlerDirectory=./protocols
    brokerServicePort=6651
    mqttListeners=mqtt://127.0.0.1:1883
    advertisedAddress=127.0.0.1
    
    mqttProxyEnable=true
    mqttProxyPort=5682
    ```

# Usage

There are multiple MQTT clients that can be used to verify MoP, such as http://workswithweb.com/mqttbox.html or https://www.hivemq.com/mqtt-toolbox. You can choose a CLI tool or GUI tool to verify the MoP protocol handler.

## Verify MoP with FuseSource MQTT client

This example shows how to verify the MoP protocol handler with the FuseSource MQTT client.

1. Add Maven dependency.

    ```java
    <dependency>
        <groupId>org.fusesource.mqtt-client</groupId>
        <artifactId>mqtt-client</artifactId>
        <version>1.16</version>
    </dependency>
    ```

2. Publish and consume messages.

    ```java
    MQTT mqtt = new MQTT();
    mqtt.setHost("127.0.0.1", 1883);
    BlockingConnection connection = mqtt.blockingConnection();
    connection.connect();
    Topic[] topics = { new Topic("persistent://public/default/my-topic", QoS.AT_LEAST_ONCE) };
    connection.subscribe(topics);

    // publish message
    connection.publish("persistent://public/default/my-topic", "Hello MOP!".getBytes(), QoS.AT_LEAST_ONCE, false);

    // receive message
    Message received = connection.receive();
    ```
