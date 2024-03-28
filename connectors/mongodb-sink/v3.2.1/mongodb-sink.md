---
description: The MongoDB sink connector pulls messages from Pulsar topics and persists the messages to collections.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/v3.2.1/pulsar-io/mongo"
license: Apache License 2.0
tags: ["Pulsar IO", "MongoDB", "Sink"]
alias: MongoDB Sink
features: ["Use MongoDB sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/mongodb.png"
download: "https://archive.apache.org/dist/pulsar/pulsar-3.2.1/connectors/pulsar-io-mongo-3.2.1.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
id: "mongodb-sink"
---

The MongoDB sink connector pulls messages from Pulsar topics and persists the messages to collections.

# Configuration

The configuration of the MongoDB sink connector has the following properties.

## Property

| Name          | Type   | Required | Sensitive | Default            | Description                                                                                                                                                                      |
|---------------|--------|----------|-----------|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mongoUri`    | String | true     | true      | " " (empty string) | The MongoDB URI to which the connector connects. <br><br>For more information, see [connection string URI format](https://docs.mongodb.com/manual/reference/connection-string/). |
| `database`    | String | true     | false     | " " (empty string) | The database name to which the collection belongs.                                                                                                                               |
| `collection`  | String | true     | false     | " " (empty string) | The collection name to which the connector writes messages.                                                                                                                      |
| `batchSize`   | int    | false    | false     | 100                | The batch size of writing messages to collections.                                                                                                                               |
| `batchTimeMs` | long   | false    | false     | 1000               | The batch operation interval in milliseconds.                                                                                                                                    |


## Example

Before using the Mongo sink connector, you need to create a configuration file through one of the following methods.

* JSON
  
    ```json
    {
        "mongoUri": "mongodb://localhost:27017",
        "database": "pulsar",
        "collection": "messages",
        "batchSize": "2",
        "batchTimeMs": "500"
    }
    ```

* YAML
  
    ```yaml
    {
        mongoUri: "mongodb://localhost:27017"
        database: "pulsar"
        collection: "messages"
        batchSize: 2
        batchTimeMs: 500
    }
    ```
