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
alias: ActiveMQ sink connector
features: ["ActiveMQ Connector integrates Apache Pulsar with Apache ActiveMQ. "]
icon: "/images/connectors/activemq_logo_white_vertical.jpg"
download: https://api.github.com/repos/streamnative/pulsar-io-activemq/tarball/refs/tags/v3.2.3.2
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-activemq
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-activemq
sn_available: ""
id: "io-activemq-sink"
---


The ActiveMQ sink connector pulls messages from Pulsar topics and persist messages to ActiveMQ.

# Installation

```
git clone https://github.com/streamnative/pulsar-io-activemq.git
cd pulsar-io-activemq/
mvn clean install -DskipTests
cp target/pulsar-io-activemq-0.0.1.nar $PULSAR_HOME/pulsar-io-activemq-0.0.1.nar
```

# Configuration 

The configuration of the ActiveMQ sink connector has the following properties.

## ActiveMQ sink connector configuration

| Name                | Type   | Required | Sensitive | Default            | Description                                                              |
|---------------------|--------|----------|-----------|--------------------|--------------------------------------------------------------------------|
| `protocol`          | String | true     | false     | "tcp"              | The ActiveMQ protocol.                                                   |
| `host`              | String | true     | false     | " " (empty string) | The ActiveMQ host.                                                       |
| `port`              | int    | true     | false     | 5672               | The ActiveMQ port.                                                       |
| `username`          | String | false    | true      | " " (empty string) | The username used to authenticate to ActiveMQ.                           |
| `password`          | String | false    | true      | " " (empty string) | The password used to authenticate to ActiveMQ.                           |
| `queueName`         | String | false    | false     | " " (empty string) | The ActiveMQ queue name that messages should be read from or written to. |
| `topicName`         | String | false    | false     | " " (empty string) | The ActiveMQ topic name that messages should be read from or written to. |
| `activeMessageType` | String | false    | false     | 0                  | The ActiveMQ message simple class name.                                  |

## Configure ActiveMQ sink connector

Before using the ActiveMQ sink connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "activemq-sink",
        "inputs": ["user-op-queue-topic"],
        "archive": "connectors/pulsar-io-activemq-2.5.1.nar",
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
    archive: "connectors/pulsar-io-activemq-2.5.1.nar"
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


