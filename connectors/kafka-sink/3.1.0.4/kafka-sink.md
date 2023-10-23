---
description: The Kafka sink connector pulls messages from Pulsar topics and persists the messages to Kafka topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/streamnative/pulsar/tree/v3.1.0.4/pulsar-io/kafka"
license: Apache License 2.0
tags: ["Pulsar IO", "Kafka", "Sink"]
alias: Kafka Sink
features: ["Use Kafka sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/kafka-logo.png"
download: "https://github.com/streamnative/pulsar/releases/download/v3.1.0.4/pulsar-io-kafka-3.1.0.4.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-kafka
id: "kafka-sink"
---

The [Kafka](https://kafka.apache.org/) sink connector pulls messages from Pulsar topics and persists the messages to Kafka topics. For more information about connectors, see [Connector Overview](https://docs.streamnative.io/docs/connector-overview).

This document introduces how to get started with creating an Kafka sink connector and get it up and running.

## Quick start

### Prerequisites

The prerequisites for connecting an Kafka sink connector to external systems include:

Apache Kafka: Ensure you have a running Kafka instance. You can follow the official Kafka [Quickstart guide](https://kafka.apache.org/quickstart) to set up a Kafka instance if you don't have one already.

### 1. Create a connector
Depending on the environment, there are several ways to create an Kafka sink connector:

- [Create a Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create a Connector with Function worker](https://pulsar.apache.org/docs/io-quickstart/).
Using this way requires you to download a **NAR** package to create a connector. You can download the version you need from the `download button` at the beginning of the article.
- [Create a Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
Using this way requires you to set the docker image. You can choose the version you want to launch from [here](https://hub.docker.com/r/streamnative/pulsar-io-elastic-search).

No matter how you create an Kafka sink connector, the minimum connector configuration contains the following parameters:
```yaml
configs:
    bootstrapServers: "localhost:9092"
    topic: "kafka-topic-name"
    ack: 1
```

### 2. Send messages to the topic

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

``` java
   PulsarClient client = PulsarClient.builder()
            .serviceUrl("{{Your Pulsar URL}}")
            .build();

   Producer<String> producer = client.newProducer(Schema.STRING)
     .topic("{{Your topic name}}")
     .create();

   String message = "hello kafka";
   MessageId msgID = producer.send(message);
   System.out.println("Publish " + message + " and message ID " + msgID);

   producer.flush();
   producer.close();
   client.close();
```

You can also send the message using the command line:
```sh
$ bin/pulsar-client produce pulsar-topic-name --messages "hello kafka"
```

### 4. Check the data on kafka topic

You can consume the data from the kafka topic using the command:
```sh
$ bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic kafka-topic-name --from-beginning
```

If everything is set up correctly, you should see the message "hello kafka" in the Kafka consumer.

## Configuration Properties

This table outlines the properties of a Kafka sink connector.

| Name | Type| Required | Default | Description 
|------|----------|---------|-------------|-------------|
|  `bootstrapServers` |String| true | " " (empty string) | A comma-separated list of host and port pairs for establishing the initial connection to the Kafka cluster. |
|`acks`|String|true|" " (empty string) |The number of acknowledgments that the producer requires the leader to receive before a request completes. <br/>This controls the durability of the sent records.
|`batchsize`|long|false|16384L|The batch size that a Kafka producer attempts to batch records together before sending them to brokers.
|`maxRequestSize`|long|false|1048576L|The maximum size of a Kafka request in bytes.
|`topic`|String|true|" " (empty string) |The Kafka topic which receives messages from Pulsar.
| `keyDeserializationClass` | String|false | org.apache.kafka.common.serialization.StringSerializer | The serializer class for Kafka producers to serialize keys.
| `valueDeserializationClass` | String|false | org.apache.kafka.common.serialization.ByteArraySerializer | The serializer class for Kafka producers to serialize values.<br/><br/>The serializer is set by a specific implementation of [`KafkaAbstractSink`](https://github.com/apache/pulsar/blob/master/pulsar-io/kafka/src/main/java/org/apache/pulsar/io/kafka/KafkaAbstractSink.java).
|`producerConfigProperties`|Map|false|" " (empty string)|The producer configuration properties to be passed to producers. <br/><br/>**Note:  other properties specified in the connector configuration file take precedence over this configuration**.

