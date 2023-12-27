---
description: The HBase sink connector pulls the messages from Pulsar topics and persists the messages to HBase tables
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar/tree/v3.0.2.2/pulsar-io/hbase"
license: Apache License 2.0
tags: ["Pulsar IO", "HBase", "Sink"]
alias: HBase Sink
features: ["Use HBase sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/hbase.png"
download: "https://github.com/streamnative/pulsar/releases/download/v3.0.2.2/pulsar-io-hbase-3.0.2.2.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-hbase
id: "hbase-sink"
---

The HBase sink connector pulls the messages from Pulsar topics and persists the messages to HBase tables.

# Configuration

The configuration of the HBase sink connector has the following properties.

## Property

| Name | Type|Default | Required | Description |
|------|---------|----------|-------------|---
| `hbaseConfigResources` | String|None | false | HBase system configuration `hbase-site.xml` file. |
| `zookeeperQuorum` | String|None | true | HBase system configuration about `hbase.zookeeper.quorum` value. |
| `zookeeperClientPort` | String|2181 | false | HBase system configuration about `hbase.zookeeper.property.clientPort` value. |
| `zookeeperZnodeParent` | String|/hbase | false | HBase system configuration about `zookeeper.znode.parent` value. |
| `tableName` | None |String | true | HBase table, the value is `namespace:tableName`. |
| `rowKeyName` | String|None | true | HBase table rowkey name. |
| `familyName` | String|None | true | HBase table column family name. |
| `qualifierNames` |String| None | true | HBase table column qualifier names. |
| `batchTimeMs` | Long|1000l| false | HBase table operation timeout in milliseconds. |
| `batchSize` | int|200| false | Batch size of updates made to the HBase table. |

## Example

Before using the HBase sink connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "hbaseConfigResources": "hbase-site.xml",
        "zookeeperQuorum": "localhost",
        "zookeeperClientPort": "2181",
        "zookeeperZnodeParent": "/hbase",
        "tableName": "pulsar_hbase",
        "rowKeyName": "rowKey",
        "familyName": "info",
        "qualifierNames": [ 'name', 'address', 'age']
    }
    ```


* YAML

    ```yaml
    configs:
        hbaseConfigResources: "hbase-site.xml"
        zookeeperQuorum: "localhost"
        zookeeperClientPort: "2181"
        zookeeperZnodeParent: "/hbase"
        tableName: "pulsar_hbase"
        rowKeyName: "rowKey"
        familyName: "info"
        qualifierNames: [ 'name', 'address', 'age']
    ```

    