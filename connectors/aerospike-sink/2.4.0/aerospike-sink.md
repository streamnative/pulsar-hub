---
description: The Aerospike sink connector pulls messages from Pulsar topics to Aerospike clusters
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v2.4.0/pulsar-io/aerospike/src/main/java/org/apache/pulsar/io/aerospike"
license: Apache License 2.0
tags: ["Pulsar IO", "Aerospike", "Sink"]
alias: Aerospike Sink
features: ["Use Aerospike sink connector to sync data from Pulsar"]
icon: https://www.aerospike.com/wp-content/uploads/2018/02/aerospike_logo_horizontal_newsite.png
download: "https://archive.apache.org/dist/pulsar/pulsar-2.4.0/connectors/pulsar-io-aerospike-2.4.0.nar"
support: Apache community
dockerfile: 
id: "aerospike-sink"
---

The Aerospike sink connector pulls messages from Pulsar topics to Aerospike clusters.

# Configuration

The configuration of the Aerospike sink connector has the following properties.

## Property

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `seedHosts` |String| true | No default value| The comma-separated list of one or more Aerospike cluster hosts.<br><br>Each host can be specified as a valid IP address or hostname followed by an optional port number. | 
| `keyspace` | String| true |No default value |The Aerospike namespace. |
| `columnName` | String | true| No default value|The Aerospike column name. |
|`userName`|String|false|NULL|The Aerospike username.|
|`password`|String|false|NULL|The Aerospike password.|
| `keySet` | String|false |NULL | The Aerospike set name. |
| `maxConcurrentRequests` |int| false | 100 | The maximum number of concurrent Aerospike transactions that a sink can open. |
| `timeoutMs` | int|false | 100 | This property controls `socketTimeout` and `totalTimeout` for Aerospike transactions.  |
| `retries` | int|false | 1 |The maximum number of retries before aborting a write transaction to Aerospike. |
