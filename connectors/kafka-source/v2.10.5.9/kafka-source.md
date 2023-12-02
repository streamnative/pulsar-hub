---
description: The Kafka source connector pulls messages from Kafka topics and persists the messages to Pulsar topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/streamnative/pulsar/tree/v2.10.5.9/pulsar-io/kafka"
license: Apache License 2.0
tags: ["Pulsar IO", "Kafka", "Source"]
alias: Kafka Source
features: ["Use Kafka source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/kafka-logo.png"
download: "https://github.com/streamnative/pulsar/releases/download/v2.10.5.9/pulsar-io-kafka-2.10.5.9.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-kafka"
sn_available: true
id: "kafka-source"
---

The [Kafka](https://kafka.apache.org/) source connector pulls messages from Kafka topics and persists the messages to Pulsar topics. For more information about connectors, see [Connector Overview](https://docs.streamnative.io/docs/connector-overview).

This document introduces how to get started with creating a Kafka source connector and get it up and running.

![](/images/connectors/kafka-source.png)

## Quick start

### Prerequisites

The prerequisites for connecting an Kafka source connector to external systems include:

Apache Kafka: Ensure you have a running Kafka instance. You can follow the official Kafka [Quickstart guide](https://kafka.apache.org/quickstart) to set up a Kafka instance if you don't have one already.

### 1. Create a connector
Depending on the environment, there are several ways to create a Kafka source connector:

- [Create a Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create a Connector with Function worker](https://pulsar.apache.org/docs/io-quickstart/).
Using this way requires you to download a **NAR** package to create a connector. You can download the version you need from the `download button` at the beginning of the article.
- [Create a Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
Using this way requires you to set the docker image. You can choose the version you want to launch from [here](https://hub.docker.com/r/streamnative/pulsar-io-kafka).

No matter how you create a Kafka source connector, the minimum connector configuration contains the following parameters:
```yaml
configs:
    bootstrapServers: "localhost:9092"
    topic: "kafka-topic-name"
    groupId: "group-id"
```

### 2. Send messages to the Kafka topic

You can send the message using the command line:
```sh
$ bin/kafka-console-producer.sh --broker-list localhost:9092 --topic kafka-topic-name
> hello pulsar
```

### 3. Check the data on Pulsar topic

You can consume the data from the Pulsar topic using the command:
```sh
$ bin/pulsar-client consume --subscription-name my-subscription pulsar-topic-name -n 0
```

If everything is set up correctly, you should see the message "hello pulsar" in the Pulsar consumer.

## Configuration Properties

This table outlines the properties of a Kafka source connector.

| Name | Type| Required | Default | Description 
|------|----------|---------|-------------|-------------|
|  `bootstrapServers` |String| true | " " (empty string) | A comma-separated list of host and port pairs for establishing the initial connection to the Kafka cluster. |
| `groupId` |String| true | " " (empty string) | A unique string that identifies the group of consumer processes to which this consumer belongs. |
| `fetchMinBytes` | long|false | 1 | The minimum byte expected for each fetch response. |
| `autoCommitEnabled` | boolean |false | true | If set to true, the consumer's offset is periodically committed in the background.<br/><br/> This committed offset is used when the process fails as the position from which a new consumer begins. |
| `autoCommitIntervalMs` | long|false | 5000 | The frequency in milliseconds that the consumer offsets are auto-committed to Kafka if `autoCommitEnabled` is set to true. |
| `heartbeatIntervalMs` | long| false | 3000 | The interval between heartbeats to the consumer when using Kafka's group management facilities. <br/><br/>**Note: `heartbeatIntervalMs` must be smaller than `sessionTimeoutMs`**.|
| `sessionTimeoutMs` | long|false | 30000 | The timeout used to detect consumer failures when using Kafka's group management facility. |
| `topic` | String|true | " " (empty string)| The Kafka topic that sends messages to Pulsar. |
|  `consumerConfigProperties` | Map| false | " " (empty string) | The consumer configuration properties to be passed to consumers. <br/><br/>**Note: other properties specified in the connector configuration file take precedence over this configuration**. |
| `keyDeserializationClass` | String|false | org.apache.kafka.common.serialization.StringDeserializer | The deserializer class for Kafka consumers to deserialize keys.<br/> The deserializer is set by a specific implementation of [`KafkaAbstractSource`](https://github.com/apache/pulsar/blob/master/pulsar-io/kafka/src/main/java/org/apache/pulsar/io/kafka/KafkaAbstractSource.java).
| `valueDeserializationClass` | String|false | org.apache.kafka.common.serialization.ByteArrayDeserializer | The deserializer class for Kafka consumers to deserialize values.
| `autoOffsetReset` | String | false | earliest | The default offset reset policy. |