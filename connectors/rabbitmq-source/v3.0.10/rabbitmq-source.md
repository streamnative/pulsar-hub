---
description: The RabbitMQ source connector receives messages from RabbitMQ clusters and writes messages to Pulsar topics
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v3.0.10/pulsar-io/rabbitmq"
license: Apache License 2.0
tags: ["Pulsar IO", "RabbitMQ", "Source"]
alias: RabbitMQ source
features: ["Use RabbitMQ source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/rabbitmq.png"
download: "https://archive.apache.org/dist/pulsar/pulsar-3.0.10/connectors/pulsar-io-rabbitmq-3.0.10.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
id: "rabbitmq-source"
---

The RabbitMQ source connector receives messages from RabbitMQ clusters and writes messages to Pulsar topics.

# Configuration 

The configuration of the RabbitMQ source connector has the following properties.

## Property

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `connectionName` |String| true | " " (empty string) | The connection name. |
| `host` | String| true | " " (empty string) | The RabbitMQ host. |
| `port` | int |true | 5672 | The RabbitMQ port. |
| `virtualHost` |String|true | / | The virtual host used to connect to RabbitMQ. |
| `username` | String|false | guest | The username used to authenticate to RabbitMQ. |
| `password` | String|false | guest | The password used to authenticate to RabbitMQ. |
| `queueName` | String|true | " " (empty string) | The RabbitMQ queue name that messages should be read from or written to. |
| `requestedChannelMax` | int|false | 0 | The initially requested maximum channel number. <br><br>0 means unlimited. |
| `requestedFrameMax` | int|false |0 | The initially requested maximum frame size in octets. <br><br>0 means unlimited. |
| `connectionTimeout` | int|false | 60000 | The timeout of TCP connection establishment in milliseconds. <br><br>0 means infinite. |
| `handshakeTimeout` | int|false | 10000 | The timeout of AMQP0-9-1 protocol handshake in milliseconds. |
| `requestedHeartbeat` | int|false | 60 | The requested heartbeat timeout in seconds. |
| `prefetchCount` | int|false | 0 | The maximum number of messages that the server delivers.<br><br> 0 means unlimited. |
| `prefetchGlobal` | boolean|false | false |Whether the setting should be applied to the entire channel rather than each consumer. |

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

