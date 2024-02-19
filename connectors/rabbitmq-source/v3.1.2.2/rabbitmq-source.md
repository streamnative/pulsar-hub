---
description: The RabbitMQ source connector receives messages from RabbitMQ clusters and writes messages to Pulsar topics
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar/tree/v3.1.2.2/pulsar-io/rabbitmq"
license: Apache License 2.0
tags: ["Pulsar IO", "RabbitMQ", "Source"]
alias: RabbitMQ source
features: ["Use RabbitMQ source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/rabbitmq.jpg"
download: "https://github.com/streamnative/pulsar/releases/download/v3.1.2.2/pulsar-io-rabbitmq-3.1.2.2.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-rabbitmq
id: "rabbitmq-source"
---

The RabbitMQ source connector receives messages from RabbitMQ clusters and writes messages to Pulsar topics.

# Configuration 

The configuration of the RabbitMQ source connector has the following properties.

## Property

| Name                  | Type    | Required | Sensitive | Default            | Description                                                                            |
|-----------------------|---------|----------|-----------|--------------------|----------------------------------------------------------------------------------------|
| `connectionName`      | String  | true     | false     | " " (empty string) | The connection name.                                                                   |
| `host`                | String  | true     | false     | " " (empty string) | The RabbitMQ host.                                                                     |
| `port`                | int     | true     | false     | 5672               | The RabbitMQ port.                                                                     |
| `virtualHost`         | String  | true     | false     | /                  | The virtual host used to connect to RabbitMQ.                                          |
| `username`            | String  | false    | true      | guest              | The username used to authenticate to RabbitMQ.                                         |
| `password`            | String  | false    | true      | guest              | The password used to authenticate to RabbitMQ.                                         |
| `queueName`           | String  | true     | false     | " " (empty string) | The RabbitMQ queue name that messages should be read from or written to.               |
| `requestedChannelMax` | int     | false    | false     | 0                  | The initially requested maximum channel number. <br><br>0 means unlimited.             |
| `requestedFrameMax`   | int     | false    | false     | 0                  | The initially requested maximum frame size in octets. <br><br>0 means unlimited.       |
| `connectionTimeout`   | int     | false    | false     | 60000              | The timeout of TCP connection establishment in milliseconds. <br><br>0 means infinite. |
| `handshakeTimeout`    | int     | false    | false     | 10000              | The timeout of AMQP0-9-1 protocol handshake in milliseconds.                           |
| `requestedHeartbeat`  | int     | false    | false     | 60                 | The requested heartbeat timeout in seconds.                                            |
| `prefetchCount`       | int     | false    | false     | 0                  | The maximum number of messages that the server delivers.<br><br> 0 means unlimited.    |
| `prefetchGlobal`      | boolean | false    | false     | false              | Whether the setting should be applied to the entire channel rather than each consumer. |

## Example

Before using the RabbitMQ source connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "host": "localhost",
        "port": "5672",
        "virtualHost": "/",
        "username": "guest",
        "password": "guest",
        "queueName": "test-queue",
        "connectionName": "test-connection",
        "requestedChannelMax": "0",
        "requestedFrameMax": "0",
        "connectionTimeout": "60000",
        "handshakeTimeout": "10000",
        "requestedHeartbeat": "60",
        "prefetchCount": "0",
        "prefetchGlobal": "false"
    }
    ```

* YAML

    ```yaml
    configs:
        host: "localhost"
        port: 5672
        virtualHost: "/"
        username: "guest"
        password: "guest"
        queueName: "test-queue"
        connectionName: "test-connection"
        requestedChannelMax: 0
        requestedFrameMax: 0
        connectionTimeout: 60000
        handshakeTimeout: 10000
        requestedHeartbeat: 60
        prefetchCount: 0
        prefetchGlobal: "false"
    ```

