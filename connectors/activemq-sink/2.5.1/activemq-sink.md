---
description: The ActiveMQ sink connector pulls messages from Pulsar topics and persist messages to ActiveMQ clusters.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-io-activemq/tree/v2.5.1"
license: Apache License 2.0
tags: ["Pulsar IO", "ActiveMQ", "Sink"]
alias: ActiveMQ Sink
features: ["Use ActiveMQ sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/activemq_logo_white_vertical.jpg"
download: "https://github.com/streamnative/pulsar-io-activemq/releases/download/v2.5.1/pulsar-io-activemq-2.5.1.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile:
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
id: "activemq-sink"
---

The ActiveMQ sink connector pulls messages from Pulsar topics and persist messages to ActiveMQ clusters.

# Installation

To install the ActiveMQ sink connector, follow these steps.

1. Download the NAR package of the ActiveMQ sink connector from [here](https://github.com/streamnative/pulsar-io-activemq/releases/download/v2.5.1/pulsar-io-activemq-2.5.1.nar).

2. Put the NAR package `pulsar-io-activemq-0.0.1.nar` in the pulsar connectors catalog.

    ```
    cp pulsar-io-activemq-0.0.1.nar $PULSAR_HOME/connectors/pulsar-io-activemq-0.0.1.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    $PULSAR_HOME/bin/pulsar standalone
    ```

4. Run the ActiveMQ sink connector locally.

    ```
    $PULSAR_HOME/bin/pulsar-admin sink localrun --sink-config-file activemq-sink-config.yaml
    ```

# Configuration

The configuration of the ActiveMQ sink connector has the following properties.

## ActiveMQ sink connector configuration

| Name | Type|Required | Default | Description
|------|----------|----------|---------|-------------|
| `protocol` |String| true | "tcp" | ActiveMQ protocol |
| `host` | String| true | " " (empty string) | ActiveMQ host |
| `port` | int |true | 5672 | ActiveMQ port |
| `username` | String|false | " " (empty string) | Username used to authenticate to ActiveMQ |
| `password` | String|false | " " (empty string) | Password used to authenticate to ActiveMQ |
| `queueName` | String|false | " " (empty string) | ActiveMQ queue name that messages should be read from or written to |
| `topicName` | String|false | " " (empty string) | ActiveMQ topic name that messages should be read from or written to |
| `activeMessageType` | String|false |0 | ActiveMQ message simple class name |

## Configure ActiveMQ sink connector

Before using the ActiveMQ sink connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "activemq-sink",
        "inputs": ["user-op-queue-topic"],
        "archive": "connectors/pulsar-io-activemq-0.0.1.nar",
        "parallelism": 1,
        "configs":
        {
            "protocol": "tcp",
            "host": "localhost",
            "port": "61616",
            "username": "admin",
            "password": "admin",
            "queueName": "user-op-queue-pulsar"
        }
    }
    ```

* YAML

    ```yaml
    tenant: "public"
    namespace: "default"
    name: "activemq-sink"
    inputs: 
      - "user-op-queue-topic"
    archive: "connectors/pulsar-io-activemq-0.0.1.nar"
    parallelism: 1
    
    configs:
        protocol: "tcp"
        host: "localhost"
        port: "61616"
        username: "admin"
        password: "admin"
        queueName: "user-op-queue-pulsar"
    ```

# Usage

This section describes how to use the ActiveMQ sink connector to pull messages from Pulsar topics to ActiveMQ clusters.

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

4. Run ActiveMQ sink locally.

    ```
    $PULSAR_HOME/bin/pulsar-admin sink localrun --sink-config-file activemq-sink-config.yaml
    ```

5. Send Pulsar messages.

    ```
    $PULSAR_HOME/bin/pulsar-client produce public/default/user-op-queue-topic --messages hello -n 10
    ```

6. Consume ActiveMQ messages.

    Use the test method `receiveMessage` of the class `org.apache.pulsar.ecosystem.io.activemq.ActiveMQDemo` 
to consume ActiveMQ messages.

    ```
    @Test
    private void receiveMessage() throws JMSException, InterruptedException {
    
        ActiveMQConnectionFactory connectionFactory = new ActiveMQConnectionFactory("tcp://localhost:61616");
    
        @Cleanup
        Connection connection = connectionFactory.createConnection();
        connection.start();
    
        @Cleanup
        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
    
        Destination destination = session.createQueue("user-op-queue-pulsar");
    
        @Cleanup
        MessageConsumer consumer = session.createConsumer(destination);
    
        consumer.setMessageListener(new MessageListener() {
            @Override
            public void onMessage(Message message) {
                if (message instanceof ActiveMQTextMessage) {
                    try {
                        System.out.println("get message ----------------- ");
                        System.out.println("receive: " + ((ActiveMQTextMessage) message).getText());
                    } catch (JMSException e) {
                        e.printStackTrace();
                    }
                }
            }
        });
    }
    ```