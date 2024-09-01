---
description: "The official Apache Iceberg Kafka Connect Sink connector."
author: ["Tabular"]
contributors: ["Tabular"]
language: Java
document: "https://github.com/tabular-io/iceberg-kafka-connect/blob/v3.1.2/README.md"
source: "https://github.com/tabular-io/iceberg-kafka-connect/tree/v3.1.2"
license: Apache License 2.0
tags: ["Kafka Connect", "Sink"]
alias: Kafka Connect Iceberg Sink
features: ["Writes data from Kafka topics to Apache Iceberg tables"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/iceberg.png"
download: "https://github.com/tabular-io/iceberg-kafka-connect/releases/tag/v3.1.2"
support: Community
support_link: "https://github.com/tabular-io/iceberg-kafka-connect"
support_img: ""
owner_name: "Tabular"
owner_img: ""
sn_available: true
dockerfile: 
id: "kafka-connect-iceberg-sink"
powered_by: "Kafka Connect"
---

The Apache Iceberg Kafka Connect Sink connector is a Kafka Connect connector that writes data from Kafka topics to Apache Iceberg tables.

### Prerequisites

- Setup the [Iceberg Catalog](https://iceberg.apache.org/concepts/catalog/)
- Create the Iceberg connector control topic, which cannot be used by other connectors. 

### Limitations

- Each Iceberg sink connector must have its own control topic.

### Configuration

The following *Required* properties are used to configure the connector.

Parameter | Description
-|-
`topics` | Comma-separated list of the Kafka topics you want to replicate. (You can define either the `topics` or the `topics.regex` setting, but not both.) 
`topics.regex` | Java regular expression of topics to replicate. (You can define either the `topics` or the `topics.regex` setting, but not both.) 
`iceberg.control.topic` | The name of the control topic. It cannot be used by other Iceberg connectors. 
`iceberg.catalog.type` | The type of Iceberg catalog. Allowed options are: `REST`, `HIVE`, `HADOOP`. 
`iceberg.tables` | Comma-separated list of Iceberg table names, which are specified using the format `{namespace}.{table}`. 

The following *Advanced* properties are used to configure the connector.

Parameter | Description
-|-
`iceberg.control.commit.timeout-ms` | Commit timeout interval in ms. The default is 30000 (30 sec). 
`iceberg.tables.route-field` | For multi-table fan-out, the name of the field used to route records to tables. Required when `iceberg.tables.dynamic-enabled` is set to `true`. 
`iceberg.tables.cdc-field` | Name of the field containing the CDC operation, `I`, `U`, or `D`, default is none

For more information about the properties, see the [official documentation](https://github.com/tabular-io/iceberg-kafka-connect/blob/v3.1.2/README.md).