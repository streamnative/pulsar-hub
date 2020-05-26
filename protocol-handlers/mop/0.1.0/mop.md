---
description: MoP brings the native MQTT protocol support to Pulsar by introducing a MQTT protocol handler on Pulsar brokers.
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/mop/tree/v0.1.0/mqtt-impl"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["Pulsar", "MQTT"]
alias: MoP
features: ["MoP brings the native MQTT protocol support to Pulsar by introducing a MQTT protocol handler on Pulsar brokers"]
icon: "/images/protocol-handler/mqtt-logo.png"
download: “https://github.com/streamnative/mop/releases/download/v0.1.0/pulsar-protocol-handler-mqtt-0.1.0.nar”
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

1. Download the NAR package of the MoP protocol handler from [here](https://github.com/streamnative/mop/releases/download/v0.1.0/pulsar-protocol-handler-mqtt-0.1.0.nar).

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

3. Load the MoP protocol handler. After installing the MoP protocol handler to the Pulsar broker, you can restart the the Pulsar broker to load the MoP protocol handler.

# Configuration

The following table lists configurations available for the MoP protocol handler.

| Property | Recommended value | Default value |
|---|---|---|
| `messagingProtocols` | mqtt | N/A |
| `protocolHandlerDirectory`| Location of MoP NAR file | ./protocols| 
| `mqttListeners` | mqtt://127.0.0.1:1883 | N/A |
| `advertisedAddress` | 127.0.0.1 | N/A |

# Usage

There are multiple MQTT clients that can be used to verify MoP, such as http://workswithweb.com/mqttbox.html or https://www.hivemq.com/mqtt-toolbox. You can choose a CLI tool or GUI tool to verify the MoP protocol handler.

This example shows how to use the MoP protocol handler to publish and consume messages.

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
