---
description: The ActiveMQ source connector receives messages from ActiveMQ clusters and writes messages to Pulsar topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-io-activemq/tree/v2.5.1"
license: Apache License 2.0
tags: ["Pulsar IO", "ActiveMQ", "Source"]
alias: ActiveMQ Source
features: ["Use ActiveMQ sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "http://activemq.apache.org/assets/img/activemq_logo_black_small.png"
download: "https://github.com/streamnative/pulsar-io-activemq/releases/download/v2.5.1/pulsar-io-activemq-2.5.1.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: 
owner_name: “Apache Software Foundation”
owner_img: “/images/apache-powered-by.svg” 
id: "activemq-source"
---

The ActiveMQ source connector receives messages from ActiveMQ clusters and writes messages to Pulsar topics.

# Installation

To install the ActiveMQ source connector, execute the following commands:

```Java
git clone https://github.com/streamnative/pulsar-io-activemq.git
cd pulsar-io-activemq/
mvn clean install -DskipTests
cp target/pulsar-io-activemq-0.0.1.nar $PULSAR_HOME/pulsar-io-activemq-0.0.1.nar
```

# Configuration

The configuration of the ActiveMQ source connector has the following properties.

## ActiveMQ source connector configuration

| Name | Type|Required | Default | Description
|------|----------|----------|---------|-------------|
| `protocol` |String| true | "tcp" | ActiveMQ protocol |
| `host` | String| true | " " (empty string) | ActiveMQ host |
| `port` | int |true | 5672 | ActiveMQ port. |
| `username` | String|false | " " (empty string) | Username used to authenticate to ActiveMQ |
| `password` | String|false | " " (empty string) | Password used to authenticate to ActiveMQ. |
| `queueName` | String|false | " " (empty string) | ActiveMQ queue name that messages should be read from or written to |
| `topicName` | String|false | " " (empty string) | ActiveMQ topic name that messages should be read from or written to |

## Configure ActiveMQ source connector

Before using the ActiveMQ source connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "activemq-source",
        "topicName": "user-op-queue-topic",
        "archive": "connectors/pulsar-io-activemq-0.0.1.nar",
        "parallelism": 1,
        "configs": {
            "protocol": "tcp",
            "host": "localhost",
            "port": "61616",
            "username": "admin",
            "password": "admin",
            "queueName": "user-op-queue"
        }
    }
    ```

* YAML

    ```yaml
    tenant: "public"
    namespace: "default"
    name: "activemq-source"
    topicName: "user-op-queue-topic"
    archive: "connectors/pulsar-io-activemq-0.0.1.nar"
    parallelism: 1
    
    configs:
        protocol: "tcp"
        host: "localhost"
        port: "61616"
        username: "admin"
        password: "admin"
        queueName: "user-op-queue"
    ```

# Usage

This example shows how to use the ActiveMQ source connector to receive messages from ActiveMQ clusters and writes messages to Pulsar topics.

1. Prepare ActiveMQ service.

    ```
    docker pull rmohr/activemq
    docker run -p 61616:61616 -p 8161:8161 rmohr/activemq
    ```

2. Put the `pulsar-io-activemq-0.0.1.nar` in the pulsar connectors catalog.

    ```
    cp pulsar-io-activemq-0.0.1.nar $PULSAR_HOME/connectors/pulsar-io-activemq-0.0.1.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    $PULSAR_HOME/bin/pulsar standalone
    ```

4. Run ActiveMQ source locally.

    ```
    $PULSAR_HOME/bin/pulsar-admin source localrun --source-config-file activemq-source-config.yaml
    ```

5. Consume Pulsar messages.

    ```
    bin/pulsar-client consume -s "sub-products" public/default/user-op-queue-topic -n 0
    ```

6. Send ActiveMQ messages.

    Use the test method `sendMessage` of the `class org.apache.pulsar.ecosystem.io.activemq.ActiveMQDemo` 
to send ActiveMQ messages.

    ```
    @Test
    private void sendMessage() throws JMSException {
    
        ActiveMQConnectionFactory connectionFactory = new ActiveMQConnectionFactory("tcp://localhost:61616");
    
        @Cleanup
        Connection connection = connectionFactory.createConnection();
        connection.start();
    
        @Cleanup
        Session session = connection.createSession(false, Session.CLIENT_ACKNOWLEDGE);
    
        Destination destination = session.createQueue("user-op-queue");
    
        @Cleanup
        MessageProducer producer = session.createProducer(destination);
        producer.setDeliveryMode(DeliveryMode.NON_PERSISTENT);
    
        for (int i = 0; i < 10; i++) {
            String msgContent = "Hello ActiveMQ - " + i;
            ActiveMQTextMessage message = new ActiveMQTextMessage();
            message.setText(msgContent);
            producer.send(message);
        }
    }
    ```