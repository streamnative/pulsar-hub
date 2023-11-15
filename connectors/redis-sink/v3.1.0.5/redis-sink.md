---
description: The Redis sink connector pulls messages from Pulsar topics and persists the messages to a Redis database.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/streamnative/pulsar/tree/v3.1.0.5/pulsar-io/redis"
license: Apache License 2.0
tags: ["Pulsar IO", "Redis", "Sink"]
alias: Redis Sink
features: ["Use Redis sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/redis.png"
download: "https://github.com/streamnative/pulsar/releases/download/v3.1.0.5/pulsar-io-redis-3.1.0.5.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-redis
id: "redis-sink"
---

The Redis sink connector pulls messages from Pulsar topics and persists the messages to a Redis database.

# Configuration

The configuration of the Redis sink connector has the following properties.

## Property

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `redisHosts` |String|true|" " (empty string) | A comma-separated list of Redis hosts to connect to. |
| `redisPassword` |String|false|" " (empty string) | The password used to connect to Redis. |
| `redisDatabase` | int|true|0  | The Redis database to connect to. |
| `clientMode` |String| false|Standalone | The client mode when interacting with Redis cluster. <br><br>Below are the available options: <br><li>Standalone<br><li>Cluster |
| `autoReconnect` | boolean|false|true | Whether the Redis client automatically reconnect or not. |
| `requestQueue` | int|false|2147483647 | The maximum number of queued requests to Redis. |
| `tcpNoDelay` |boolean| false| false | Whether to enable TCP with no delay or not. |
| `keepAlive` | boolean|false | false |Whether to enable a keepalive to Redis or not. |
| `connectTimeout` |long| false|10000 | The time to wait before timing out when connecting in milliseconds. |
| `operationTimeout` | long|false|10000 | The time before an operation is marked as timed out in milliseconds . |
| `batchTimeMs` | int|false|1000 | The Redis operation time in milliseconds. |
| `batchSize` | int|false|200 | The batch size of writing to Redis database. |


## Example

Before using the Redis sink connector, you need to create a configuration file through one of the following methods.

* JSON

    ```json
    {
        "redisHosts": "localhost:6379",
        "redisPassword": "fake@123",
        "redisDatabase": "1",
        "clientMode": "Standalone",
        "operationTimeout": "2000",
        "batchSize": "100",
        "batchTimeMs": "1000",
        "connectTimeout": "3000"
    }
    ```

* YAML

    ```yaml
    {
        redisHosts: "localhost:6379"
        redisPassword: "fake@123"
        redisDatabase: 1
        clientMode: "Standalone"
        operationTimeout: 2000
        batchSize: 100
        batchTimeMs: 1000
        connectTimeout: 3000
    }
    ```
