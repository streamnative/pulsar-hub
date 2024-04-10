---
description: The Cassandra sink connector pulls messages from Pulsar topics to Cassandra clusters
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v3.2.2/pulsar-io/cassandra"
license: Apache License 2.0
tags: ["Pulsar IO", "Cassandra", "Sink"]
alias: Cassandra Sink
features: ["Use Cassandra sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/cassandra-sink.jpg"
download: "https://archive.apache.org/dist/pulsar/pulsar-3.2.2/connectors/pulsar-io-cassandra-3.2.2.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
id: "cassandra-sink"
---

The Cassandra sink connector pulls messages from Pulsar topics to Cassandra clusters.

# Configuration

The configuration of the Cassandra sink connector has the following properties.

## Property

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `roots` | String|true | " " (empty string) | A comma-separated list of Cassandra hosts to connect to.|
| `keyspace` | String|true| " " (empty string)| The key space used for writing pulsar messages. <br><br>**Note: `keyspace` should be created prior to a Cassandra sink.**|
| `keyname` | String|true| " " (empty string)| The key name of the Cassandra column family. <br><br>The column is used for storing Pulsar message keys. <br><br>If a Pulsar message doesn't have any key associated, the message value is used as the key. |
| `columnFamily` | String|true| " " (empty string)| The Cassandra column family name.<br><br>**Note: `columnFamily` should be created prior to a Cassandra sink.**|
| `columnName` | String|true| " " (empty string) | The column name of the Cassandra column family.<br><br> The column is used for storing Pulsar message values. |

## Example

Before using the Cassandra sink connector, you need to create a configuration file through one of the following methods.

* JSON

    ```json
    {
        "roots": "localhost:9042",
        "keyspace": "pulsar_test_keyspace",
        "columnFamily": "pulsar_test_table",
        "keyname": "key",
        "columnName": "col"
    }
    ```

* YAML
  
    ```
    configs:
        roots: "localhost:9042"
        keyspace: "pulsar_test_keyspace"
        columnFamily: "pulsar_test_table"
        keyname: "key"
        columnName: "col"
    ```


# Usage

For more information about **how to connect Pulsar with Cassandra**, see [here](https://pulsar.apache.org/docs/en/next/io-quickstart/#connect-pulsar-to-cassandra).
