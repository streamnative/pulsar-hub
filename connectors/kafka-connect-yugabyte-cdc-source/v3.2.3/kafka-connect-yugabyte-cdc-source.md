---
description: "The official YugabyteDB CDC Kafka Source Connector for capturing change data from YugabyteDB."
author: ["YugaByte"]
contributors: ["YugaByte"]
language: Java
document: "https://github.com/yugabyte/debezium-connector-yugabytedb/blob/v3.2.3/README.md"
source: "https://github.com/yugabyte/debezium-connector-yugabytedb/tree/v3.2.3"
license: Apache License 2.0
tags: ["Kafka Connect", "Source", "CDC"]
alias: Kafka Connect YugabyteDB CDC Source
features: ["Captures row-level changes in YugabyteDB tables"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/yugabyte.jpeg"
download: "https://github.com/yugabyte/debezium-connector-yugabytedb/releases/tag/v3.2.3"
support: Community
support_link: "https://github.com/yugabyte/debezium-connector-yugabytedb"
support_img: ""
owner_name: "YugaByte"
owner_img: ""
sn_available: true
dockerfile: 
id: "kafka-connect-yugabyte-cdc-source"
powered_by: "Kafka Connect"
---

The YugabyteDB CDC Kafka Source connector is a Kafka Connect connector that reads change data from YugabyteDB and writes it to Kafka topics.

### Prerequisites

- Collect the following information about your YugabyteDB cluster:
  - Master addresses
  - DB Stream ID
  - DB User and password

### Configuration

The YugabyteDB CDC Kafka Source connector is configured using the following *Required* properties:

| Property | Description |
| -------- | ----------- |
| `database.master.addresses` | The addresses of the YugabyteDB master nodes. |
| `database.server.name` | The name of the YugabyteDB server. |
| `database.dbname` | The name of the YugabyteDB database. |
| `database.user` | The user name for the YugabyteDB database. |
| `database.password` | The password for the YugabyteDB database. |
| `database.streamid` | The stream ID for the YugabyteDB database. |
| `database.hostname` | The hostname for the YugabyteDB database. |
| `database.port` | The port for the YugabyteDB database. |

For more information about the properties, see the [offical YugabyteDB CDC Kafka Source Connector documentation](https://github.com/yugabyte/debezium-connector-yugabytedb/blob/v3.2.3/README.md).