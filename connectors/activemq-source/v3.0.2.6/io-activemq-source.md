---
description: ActiveMQ Connector integrates Apache Pulsar with Apache ActiveMQ. 
author: gaoran10,shibd,dependabot[bot],sijie
contributors: gaoran10,shibd,dependabot[bot],sijie
language: Java,Shell,Dockerfile
document:
source: https://github.com/streamnative/pulsar-io-activemq
license: Apache License 2.0
license_link: https://github.com/streamnative/pulsar-io-activemq/blob/master/LICENSE
tags: apache-pulsar,pulsar-io,source-connector,sink-connector,apache-activemq
alias: ActiveMQ source connector
features: ["ActiveMQ Connector integrates Apache Pulsar with Apache ActiveMQ. "]
icon: "/images/connectors/activemq_logo_white_vertical.jpg"
download: https://api.github.com/repos/streamnative/pulsar-io-activemq/tarball/refs/tags/v3.0.2.6
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-activemq
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-activemq
sn_available: ""
id: "io-activemq-source"
---


The ActiveMQ source connector receives messages from ActiveMQ clusters and writes messages to Pulsar topics.

# Installation

```
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
| `protocol` |String| true | "tcp" | The ActiveMQ protocol. |
| `host` | String| true | " " (empty string) | The ActiveMQ host. |
| `port` | int |true | 5672 | The ActiveMQ port. |
| `username` | String|false | " " (empty string) | The username used to authenticate to ActiveMQ. |
| `password` | String|false | " " (empty string) | The password used to authenticate to ActiveMQ. |
| `queueName` | String|false | " " (empty string) | The ActiveMQ queue name that messages should be read from or written to. |
| `topicName` | String|false | " " (empty string) | The ActiveMQ topic name that messages should be read from or written to. |

## Configure ActiveMQ source connector

Before using the ActiveMQ source connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "activemq-source",
        "topicName": "user-op-queue-topic",
        "archive": "connectors/pulsar-io-activemq-2.5.1.nar",
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
    archive: "connectors/pulsar-io-activemq-2.5.1.nar"
    parallelism: 1
    
    configs:
        protocol: "tcp"
        host: "localhost"
        port: "61616"
        username: "admin"
        password: "admin"
        queueName: "user-op-queue"
    ```

1. Prepare ActiveMQ service.

    ```
    docker pull rmohr/activemq
    docker run -p 61616:61616 -p 8161:8161 rmohr/activemq
    ```

2. Put the `pulsar-io-activemq-2.5.1.nar` in the pulsar connectors catalog.

    ```
    cp pulsar-io-activemq-2.5.1.nar $PULSAR_HOME/connectors/pulsar-io-activemq-2.5.1.nar
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


