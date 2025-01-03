---
description: "The official YugabyteDB CDC Kafka Source Connector for capturing change data from YugabyteDB."
author: ["YugaByte"]
contributors: ["YugaByte"]
language: Java
document: "https://github.com/yugabyte/debezium-connector-yugabytedb/blob/v1.9.5.y.220.3/README.md"
source: "https://github.com/yugabyte/debezium-connector-yugabytedb/tree/v1.9.5.y.220.3"
license: Apache License 2.0
tags: ["Kafka Connect", "Source", "CDC"]
alias: Kafka Connect YugabyteDB CDC Source
features: ["Captures row-level changes in YugabyteDB tables"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/yugabyte.jpeg"
download: "https://github.com/yugabyte/debezium-connector-yugabytedb/releases/tag/v1.9.5.y.220.3"
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

### Quick Start

1. Setup the kcctl client: [doc](https://docs.streamnative.io/docs/kafka-connect-setup)
2. Setup a YugabyteDB cluster, you can create one in k8s cluster with below yaml file:
    ```shell
    helm repo add yugabytedb https://charts.yugabyte.com
    helm repo update

    helm upgrade --install yb-demo yugabytedb/yugabyte --version 2024.1.0
    kubectl wait -l app=yb-master --for=condition=Ready pod --timeout=10m
    kubectl wait -l app=yb-tserver --for=condition=Ready pod --timeout=10m
   
    # wait for the pod to be ready
    sleep 30
   
    kubectl exec yb-tserver-0 -- /home/yugabyte/bin/ysqlsh -c "CREATE TABLE IF NOT EXISTS test_kafka_connect(id int primary key, message text);"

    # create change stream
    stream_id=$(kubectl exec yb-master-0 -- yb-admin --master_addresses yb-masters.default.svc.cluster.local:7100 create_change_data_stream ysql.yugabyte)
    stream_id=$(echo $stream_id | awk '{print $4}')
    ```
3. Create a JSON file like the following:
    ```json
    {
        "name": "yugabyte-cdc-source",
        "config": {
            "connector.class": "io.debezium.connector.yugabytedb.YugabyteDBConnector",
            "kafka.topic": "kafka-yugabyte-output",
            "tasks.max": "1",
            "database.hostname": "yb-tservers.default.svc.cluster.local",
            "database.port": "5433",
            "database.master.addresses": "yb-masters.default.svc.cluster.local:7100",
            "database.dbname": "yugabyte",
            "table.include.list": "public.test_kafka_connect",
            "database.streamid": "${STREAM_ID}",
            "snapshot.mode": "never",
            "database.user": "yugabyte",
            "database.password": "yugabyte",
            "database.server.name": "dbserver1",
            "key.converter": "org.apache.kafka.connect.storage.StringConverter",
            "key.converter.schemas.enable": "false",
            "value.converter": "org.apache.kafka.connect.json.JsonConverter",
            "value.converter.schemas.enable": "false"
        }
    }
    ```
4. Run the following command to create the connector:
    ```shell
    kcctl create -f <filename>.json
    ```

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

For more information about the properties, see the [offical YugabyteDB CDC Kafka Source Connector documentation](https://github.com/yugabyte/debezium-connector-yugabytedb/blob/v1.9.5.y.220.3/README.md).