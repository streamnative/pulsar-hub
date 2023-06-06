---
description: The Debezium source connector pulls messages from MySQL and persists the messages to Pulsar topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v2.5.1/pulsar-io/debezium/mysql"
license: Apache License 2.0
tags: ["Pulsar IO", "Debezium", "MySQL", "Source"]
alias: Debezium MySQL Source
features: ["Use Debezium MySQL source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/debezium.jpg"
download: "https://archive.apache.org/dist/pulsar/pulsar-2.5.1/connectors/pulsar-io-debezium-mysql-2.5.1.nar"
support: Apache community
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
id: "debezium-mysql"
---

The Debezium source connector pulls messages from MySQL and persists the messages to Pulsar topics.

# Configuration

The configuration of Debezium source connector has the following properties.

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `task.class` | true | null | A source task class that implemented in Debezium. |
| `database.hostname` | true | null | The address of a database server. |
| `database.port` | true | null | The port number of a database server.|
| `database.user` | true | null | The name of a database user that has the required privileges. |
| `database.password` | true | null | The password for a database user that has the required privileges. |
| `database.server.id` | true | null | The connector’s identifier that must be unique within a database cluster and similar to the database’s server-id configuration property. |
| `database.server.name` | true | null | The logical name of a database server/cluster, which forms a namespace and it is used in all the names of Kafka topics to which the connector writes, the Kafka Connect schema names, and the namespaces of the corresponding Avro schema when the Avro Connector is used. |
| `database.whitelist` | false | null | A list of all databases hosted by this server which is monitored by the  connector.<br/><br/> This is optional, and there are other properties for listing databases and tables to include or exclude from monitoring. |
| `key.converter` | true | null | The converter provided by Kafka Connect to convert record key. |
| `value.converter` | true | null | The converter provided by Kafka Connect to convert record value.  |
| `database.history` | true | null | The name of the database history class. |
| `database.history.pulsar.topic` | true | null | The name of the database history topic where the connector writes and recovers DDL statements. <br/><br/>**Note: this topic is for internal use only and should not be used by consumers.** |
| `database.history.pulsar.service.url` | false | null | The service URL of your Pulsar cluster for the history topic. If it is not set, the `client_auth_plugin` and `client_auth_params` from the connector will be used to connect. |
| `pulsar.service.url` | true | null | The service URL of your Pulsar cluster. |
| `offset.storage.topic` | true | null | Record the last committed offsets that the connector successfully completes. |

## Converter options

- org.apache.kafka.connect.json.JsonConverter

    The`json-with-envelope` config is valid only for the JsonConverter. By default, the value is set to false. When the `json-with-envelope` value is set to false, the consumer uses the schema `Schema.KeyValue(Schema.AUTO_CONSUME(), Schema.AUTO_CONSUME(), KeyValueEncodingType.SEPARATED)`, and the message only consists of the payload.
    When the `json-with-envelope` value is set to true, the consumer uses the schema `Schema.KeyValue(Schema.BYTES, Schema.BYTES`, and the message consists of the schema and the payload.

- org.apache.pulsar.kafka.shade.io.confluent.connect.avro.AvroConverter

    If you select the AvroConverter, the consumer uses the schema `Schema.KeyValue(Schema.AUTO_CONSUME(), Schema.AUTO_CONSUME(), KeyValueEncodingType.SEPARATED)`, and the message consists of the payload.

# Example of MySQL

You need to create a configuration file before using the Pulsar Debezium connector.

## Configuration 

You can use one of the following methods to create a configuration file.

* JSON 

    ```json
    {
        "database.hostname": "localhost",
        "database.port": "3306",
        "database.user": "debezium",
        "database.password": "dbz",
        "database.server.id": "184054",
        "database.server.name": "dbserver1",
        "database.whitelist": "inventory",
        "database.history": "org.apache.pulsar.io.debezium.PulsarDatabaseHistory",
        "database.history.pulsar.topic": "history-topic",
        "database.history.pulsar.service.url": "pulsar://127.0.0.1:6650",
        "key.converter": "org.apache.kafka.connect.json.JsonConverter",
        "value.converter": "org.apache.kafka.connect.json.JsonConverter",
        "pulsar.service.url": "pulsar://127.0.0.1:6650",
        "offset.storage.topic": "offset-topic"
    }
    ```

* YAML 

    You can create a `debezium-mysql-source-config.yaml` file and copy the [contents](https://github.com/apache/pulsar/blob/master/pulsar-io/debezium/mysql/src/main/resources/debezium-mysql-source-config.yaml) below to the `debezium-mysql-source-config.yaml` file.

    ```yaml
    tenant: "public"
    namespace: "default"
    name: "debezium-mysql-source"
    topicName: "debezium-mysql-topic"
    archive: "connectors/pulsar-io-debezium-mysql-{{pulsar:version}}.nar"
    parallelism: 1

    configs:

        ## config for mysql, docker image: debezium/example-mysql:0.8
        database.hostname: "localhost"
        database.port: "3306"
        database.user: "debezium"
        database.password: "dbz"
        database.server.id: "184054"
        database.server.name: "dbserver1"
        database.whitelist: "inventory"
        database.history: "org.apache.pulsar.io.debezium.PulsarDatabaseHistory"
        database.history.pulsar.topic: "history-topic"
        database.history.pulsar.service.url: "pulsar://127.0.0.1:6650"

        ## KEY_CONVERTER_CLASS_CONFIG, VALUE_CONVERTER_CLASS_CONFIG
        key.converter: "org.apache.kafka.connect.json.JsonConverter"
        value.converter: "org.apache.kafka.connect.json.JsonConverter"

        ## PULSAR_SERVICE_URL_CONFIG
        pulsar.service.url: "pulsar://127.0.0.1:6650"

        ## OFFSET_STORAGE_TOPIC_CONFIG
        offset.storage.topic: "offset-topic"
    ```

## Usage

This example shows how to change the data of a MySQL table using the Pulsar Debezium connector.

1. Start a MySQL server with a database from which Debezium can capture changes.

    ```bash
    $ docker run -it --rm \
    --name mysql \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=debezium \
    -e MYSQL_USER=mysqluser \
    -e MYSQL_PASSWORD=mysqlpw debezium/example-mysql:0.8
    ```

2. Start a Pulsar service locally in standalone mode.

    ```bash
    $ bin/pulsar standalone
    ```

3. Start the Pulsar Debezium connector in local run mode using one of the following methods.

     * Use the **JSON** configuration file as shown previously. 
   
        Make sure the nar file is available at `connectors/pulsar-io-debezium-mysql-{{pulsar:version}}.nar`.

        ```bash
        $ bin/pulsar-admin source localrun \
        --archive connectors/pulsar-io-debezium-mysql-{{pulsar:version}}.nar \
        --name debezium-mysql-source --destination-topic-name debezium-mysql-topic \
        --tenant public \
        --namespace default \
        --source-config '{"database.hostname": "localhost","database.port": "3306","database.user": "debezium","database.password": "dbz","database.server.id": "184054","database.server.name": "dbserver1","database.whitelist": "inventory","database.history": "org.apache.pulsar.io.debezium.PulsarDatabaseHistory","database.history.pulsar.topic": "history-topic","database.history.pulsar.service.url": "pulsar://127.0.0.1:6650","key.converter": "org.apache.kafka.connect.json.JsonConverter","value.converter": "org.apache.kafka.connect.json.JsonConverter","pulsar.service.url": "pulsar://127.0.0.1:6650","offset.storage.topic": "offset-topic"}'
        ```

        > **Note**
        > 
        > Currently, the destination topic (specified by the `destination-topic-name` option ) is a required configuration but it is not used for the Debezium connector to save data. The Debezium connector saves data on the following 4 types of topics:
        > 
        > - One topic for storing the database metadata messages. It is named with the database server name ( `database.server.name`), like `public/default/database.server.name`.
        > - One topic (`database.history.pulsar.topic`) for storing the database history information. The connector writes and recovers DDL statements on this topic.
        > - One topic (`offset.storage.topic`) for storing the offset metadata messages. The connector saves the last successfully-committed offsets on this topic.
        > - One per-table topic. The connector writes change events for all operations that occur in a table to a single Pulsar topic that is specific to that table.
        >
        > If automatic topic creation is disabled on the Pulsar broker, you need to manually create these 4 types of topics and the destination topic.

    * Use the **YAML** configuration file as shown previously.
  
        ```bash
        $ bin/pulsar-admin source localrun \
        --source-config-file debezium-mysql-source-config.yaml
        ```

4. Subscribe the topic _sub-products_ for the table _inventory.products_.

    ```bash
    $ bin/pulsar-client consume -s "sub-products" public/default/dbserver1.inventory.products -n 0
    ```

5. Start a MySQL client in docker.

    ```bash
    $ docker run -it --rm \
    --name mysqlterm \
    --link mysql \
    --rm mysql:5.7 sh \
    -c 'exec mysql -h"$MYSQL_PORT_3306_TCP_ADDR" -P"$MYSQL_PORT_3306_TCP_PORT" -uroot -p"$MYSQL_ENV_MYSQL_ROOT_PASSWORD"'
    ```

6. A MySQL client pops out. 
   
   Use the following commands to change the data of the table _products_.

    ```
    mysql> use inventory;
    mysql> show tables;
    mysql> SELECT * FROM  products;
    mysql> UPDATE products SET name='1111111111' WHERE id=101;
    mysql> UPDATE products SET name='1111111111' WHERE id=107;
    ```

    In the terminal window of subscribing topic, you can find the data changes have been kept in the _sub-products_ topic.
