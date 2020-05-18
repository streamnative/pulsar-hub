---
description: The Kafka source connector pulls messages from Kafka topics and persists the messages to Pulsar topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/v2.4.2/pulsar-io/kafka"
license: Apache License 2.0
tags: ["Pulsar IO", "Kafka", "Source"]
alias: Kafka Source
features: ["Use Kafka source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/kafka.jpg"
download: "https://archive.apache.org/dist/pulsar/pulsar-2.4.2/connectors/pulsar-io-kafka-2.4.2.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: 
id: "kafka-source"
---

The Kafka source connector pulls messages from Kafka topics and persists the messages to Pulsar topics.

This guide explains how to configure and use the Kafka source connector.

# Configuration

The configuration of the Kafka source connector has the following properties.

## Property

| Name | Type| Required | Default | Description 
|------|----------|---------|-------------|-------------|
|  `bootstrapServers` |String| true | " " (empty string) | A comma-separated list of host and port pairs for establishing the initial connection to the Kafka cluster. |
| `groupId` |String| true | " " (empty string) | A unique string that identifies the group of consumer processes to which this consumer belongs. |
| `fetchMinBytes` | long|false | 1 | The minimum byte expected for each fetch response. |
| `autoCommitEnabled` | boolean |false | true | If set to true, the consumer's offset is periodically committed in the background.<br/><br/> This committed offset is used when the process fails as the position from which a new consumer begins. |
| `autoCommitIntervalMs` | long|false | 5000 | The frequency in milliseconds that the consumer offsets are auto-committed to Kafka if `autoCommitEnabled` is set to true. |
| `heartbeatIntervalMs` | long| false | 3000 | The interval between heartbeats to the consumer when using Kafka's group management facilities. <br/><br/>**Note: `heartbeatIntervalMs` must be smaller than `sessionTimeoutMs`**.|
| `sessionTimeoutMs` | long|false | 30000 | The timeout used to detect consumer failures when using Kafka's group management facility. |
| `topic` | String|true | " " (empty string)| The Kafka topic which sends messages to Pulsar. |
|  `consumerConfigProperties` | Map| false | " " (empty string) | The consumer configuration properties to be passed to consumers. <br/><br/>**Note: other properties specified in the connector configuration file take precedence over this configuration**. |
| `keyDeserializationClass` | String|false | org.apache.kafka.common.serialization.StringDeserializer | The deserializer class for Kafka consumers to deserialize keys.<br/> The deserializer is set by a specific implementation of [`KafkaAbstractSource`](https://github.com/apache/pulsar/blob/master/pulsar-io/kafka/src/main/java/org/apache/pulsar/io/kafka/KafkaAbstractSource.java).
| `valueDeserializationClass` | String|false | org.apache.kafka.common.serialization.ByteArrayDeserializer | The deserializer class for Kafka consumers to deserialize values.


## Example

Before using the Kafka source connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "bootstrapServers": "pulsar-kafka:9092",
        "groupId": "test-pulsar-io",
        "topic": "my-topic",
        "sessionTimeoutMs": "10000",
        "autoCommitEnabled": false
    }
    ```

* YAML

    ```yaml
    configs:
        bootstrapServers: "pulsar-kafka:9092"
        groupId: "test-pulsar-io"
        topic: "my-topic"
        sessionTimeoutMs: "10000"
        autoCommitEnabled: false
    ```

# Usage

Here is an example of using the Kafka source connecter with the configuration file as shown previously.

1. Download a Kafka client and a Kafka connector.

    ```bash
    $ wget https://repo1.maven.org/maven2/org/apache/kafka/kafka-clients/0.10.2.1/kafka-clients-0.10.2.1.jar
    ```

2. Create a network.
   
   ```bash
   $ docker network create kafka-pulsar
   ```

3. Pull a ZooKeeper image and start ZooKeeper.
   
   ```bash
   $ docker pull wurstmeister/zookeeper

   $ docker run -d -it -p 2181:2181 --name pulsar-kafka-zookeeper --network kafka-pulsar wurstmeister/zookeeper
   ```

4. Pull a Kafka image and start Kafka.
   
   ```bash
   $ docker pull wurstmeister/kafka:2.11-1.0.2
   
   $ docker run -d -it --network kafka-pulsar -p 6667:6667 -p 9092:9092 -e KAFKA_ADVERTISED_HOST_NAME=pulsar-kafka -e KAFKA_ZOOKEEPER_CONNECT=pulsar-kafka-zookeeper:2181 --name pulsar-kafka wurstmeister/kafka:2.11-1.0.2
   ```

5. Pull a Pulsar image and start Pulsar standalone.
   
   ```bash
   $ docker pull apachepulsar/pulsar:latest
   
   $ docker run -d -it --network kafka-pulsar -p 6650:6650 -p 8080:8080 -v $PWD/data:/pulsar/data --name pulsar-kafka-standalone apachepulsar/pulsar:latest bin/pulsar standalone
   ```

6. Create a producer file _kafka-producer.py_.
   
   ```python
   from kafka import KafkaProducer
   producer = KafkaProducer(bootstrap_servers='pulsar-kafka:9092')
   future = producer.send('my-topic', b'hello world')
   future.get()
   ```

7. Create a consumer file _pulsar-client.py_.

    ```python
    import pulsar

    client = pulsar.Client('pulsar://localhost:6650')
    consumer = client.subscribe('my-topic', subscription_name='my-aa')

    while True:
        msg = consumer.receive()
        print msg
        print dir(msg)
        print("Received message: '%s'" % msg.data())
        consumer.acknowledge(msg)

    client.close()
    ```

8. Copy the following files to Pulsar.
   
    ```bash
    $ docker cp pulsar-io-kafka.nar pulsar-kafka-standalone:/pulsar
    $ docker cp kafkaSourceConfig.yaml pulsar-kafka-standalone:/pulsar/conf
    $ docker cp kafka-clients-0.10.2.1.jar pulsar-kafka-standalone:/pulsar/lib
    $ docker cp pulsar-client.py pulsar-kafka-standalone:/pulsar/
    $ docker cp kafka-producer.py pulsar-kafka-standalone:/pulsar/
    ```

9. Open a new terminal window and start the Kafka source connector in local run mode. 

    ```bash
    $ docker exec -it pulsar-kafka-standalone /bin/bash

    $ ./bin/pulsar-admin source localrun \
    --archive ./pulsar-io-kafka.nar \
    --classname org.apache.pulsar.io.kafka.KafkaBytesSource \
    --tenant public \
    --namespace default \
    --name kafka \
    --destination-topic-name my-topic \
    --source-config-file ./conf/kafkaSourceConfig.yaml \
    --parallelism 1
    ```

10. Open a new terminal window and run the consumer.

    ```bash
    $ docker exec -it pulsar-kafka-standalone /bin/bash

    $ pip install kafka-python

    $ python3 kafka-producer.py
    ```

    The following information appears on the consumer terminal window.

    ```bash
    Received message: 'hello world'
    ```
