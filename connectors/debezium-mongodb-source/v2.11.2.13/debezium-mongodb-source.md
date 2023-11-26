---
description: The Debezium MongoDB source connector pulls messages from MongoDB and persists the messages to Pulsar topics
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar/tree/v2.11.2.13/pulsar-io/debezium/mongodb"
license: Apache License 2.0
tags: ["Pulsar IO", "Debezium", "Source"]
alias: Debezium MongoDB Source
features: ["Use Debezium MongoDB source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/debezium.jpg"
download: "https://github.com/streamnative/pulsar/releases/download/v2.11.2.13/pulsar-io-debezium-mongodb-2.11.2.13.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-debezium-mongodb
sn_available: true
id: "debezium-mongodb-source"
---

The Debezium source connector pulls messages from MongoDB and persists the messages to Pulsar topics.

# Configuration 

## Debezium source connector

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
| `database.history.pulsar.service.url` | true | null | Pulsar cluster service URL for history topic. |
| `pulsar.service.url` | true | null | Pulsar cluster service URL. |
| `offset.storage.topic` | true | null | Record the last committed offsets that the connector successfully completes. |

## MongoDB 

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `mongodb.hosts` | true | null | The comma-separated list of hostname and port pairs (in the form 'host' or 'host:port') of the MongoDB servers in the replica set. The list contains a single hostname and a port pair. If mongodb.members.auto.discover is set to false, the host and port pair are prefixed with the replica set name (e.g., rs0/localhost:27017). |
| `mongodb.name` | true | null | A unique name that identifies the connector and/or MongoDB replica set or shared cluster that this connector monitors. Each server should be monitored by at most one Debezium connector, since this server name prefixes all persisted Kafka topics emanating from the MongoDB replica set or cluster. |
| `mongodb.user` | true | null | Name of the database user to be used when connecting to MongoDB. This is required only when MongoDB is configured to use authentication. |
| `mongodb.password` | true | null | Password to be used when connecting to MongoDB. This is required only when MongoDB is configured to use authentication. |
| `mongodb.task.id` | true | null | The taskId of the MongoDB connector that attempts to use a separate task for each replica set. |

## Example 

You need to create a configuration file before using the Pulsar Debezium connector.

* JSON 

    ```json
    {
        "mongodb.hosts": "rs0/mongodb:27017",
        "mongodb.name": "dbserver1",
        "mongodb.user": "debezium",
        "mongodb.password": "dbz",
        "mongodb.task.id": "1",
        "database.whitelist": "inventory",
        "pulsar.service.url": "pulsar://127.0.0.1:6650"
    }
    ```

* YAML 

    You can create a `debezium-mongodb-source-config.yaml` file and copy the [contents](https://github.com/apache/pulsar/blob/master/pulsar-io/debezium/mongodb/src/main/resources/debezium-mongodb-source-config.yaml) below to the `debezium-mongodb-source-config.yaml` file.

    ```yaml
    tenant: "public"
    namespace: "default"
    name: "debezium-mongodb-source"
    topicName: "debezium-mongodb-topic"
    archive: "connectors/pulsar-io-debezium-mongodb-{{pulsar:version}}.nar"
    parallelism: 1

    configs:

        # config for pg, docker image: debezium/example-mongodb:0.10
        mongodb.hosts: "rs0/mongodb:27017",
        mongodb.name: "dbserver1",
        mongodb.user: "debezium",
        mongodb.password: "dbz",
        mongodb.task.id: "1",
        database.whitelist: "inventory",

        # PULSAR_SERVICE_URL_CONFIG
        pulsar.service.url: "pulsar://127.0.0.1:6650"
    ```

# Usage

This example shows how to change the data of a MongoDB table using the Pulsar Debezium connector.


1. Start a MongoDB server with a database from which Debezium can capture changes.

    ```bash
    $ docker pull debezium/example-mongodb:0.10
    $ docker run -d -it --rm --name pulsar-mongodb -e MONGODB_USER=mongodb -e MONGODB_PASSWORD=mongodb -p 27017:27017  debezium/example-mongodb:0.10
    ```
    Use the following commands to initialize the data.
    
    ``` bash
    ./usr/local/bin/init-inventory.sh
    ```

    If the local host cannot access the container network, you can update the file ```/etc/hosts``` and add a rule ```127.0.0.1 6 f114527a95f```. f114527a95f is container id, you can try to get by ```docker ps -a```


2. Start a Pulsar service locally in standalone mode.

    ```bash
    $ bin/pulsar standalone
    ```

3. Start the Pulsar Debezium connector in local run mode using one of the following methods.

   * Use the **JSON** configuration file as shown previously. 
     
     Make sure the nar file is available at `connectors/pulsar-io-mongodb-{{pulsar:version}}.nar`.

        ```bash
        $ bin/pulsar-admin source localrun \
        --archive connectors/pulsar-io-debezium-mongodb-{{pulsar:version}}.nar \
        --name debezium-mongodb-source \
        --destination-topic-name debezium-mongodb-topic \
        --tenant public \
        --namespace default \
        --source-config '{"mongodb.hosts": "rs0/mongodb:27017","mongodb.name": "dbserver1","mongodb.user": "debezium","mongodb.password": "dbz","mongodb.task.id": "1","database.whitelist": "inventory","pulsar.service.url": "pulsar://127.0.0.1:6650"}'
        ```

        {% callout title="Note" type="note" %}
        
        Currently, the destination topic (specified by the `destination-topic-name` option ) is a required configuration but it is not used for the Debezium connector to save data. The Debezium connector saves data on the following 4 types of topics:
        
        - One topic for storing the database metadata messages. It is named with the database server name ( `database.server.name`), like `public/default/database.server.name`.
        - One topic (`database.history.pulsar.topic`) for storing the database history information. The connector writes and recovers DDL statements on this topic.
        - One topic (`offset.storage.topic`) for storing the offset metadata messages. The connector saves the last successfully-committed offsets on this topic.
        - One per-table topic. The connector writes change events for all operations that occur in a table to a single Pulsar topic that is specific to that table.
                If automatic topic creation is disabled on the Pulsar broker, you need to manually create these 4 types of topics and the destination topic.
        {% /callout %}
   
   * Use the **YAML** configuration file as shown previously.
      
        ```bash
        $ bin/pulsar-admin source localrun  \
        --source-config-file debezium-mongodb-source-config.yaml
        ```

4. Subscribe the topic _sub-products_ for the _inventory.products_ table.

    ```
    $ bin/pulsar-client consume -s "sub-products" public/default/dbserver1.inventory.products -n 0
    ```

5. Start a MongoDB client in docker.
   
    ```bash
    $ docker exec -it pulsar-mongodb /bin/bash
    ```

6. A MongoDB client pops out. 
   
    ```bash
    mongo -u debezium -p dbz --authenticationDatabase admin localhost:27017/inventory
    db.products.update({"_id":NumberLong(104)},{$set:{weight:1.25}})
    ```

    In the terminal window of subscribing topic, you can receive the following messages.
        
    ```bash
    ----- got message -----
    {"schema":{"type":"struct","fields":[{"type":"string","optional":false,"field":"id"}],"optional":false,"name":"dbserver1.inventory.products.Key"},"payload":{"id":"104"}}, value = {"schema":{"type":"struct","fields":[{"type":"string","optional":true,"name":"io.debezium.data.Json","version":1,"field":"after"},{"type":"string","optional":true,"name":"io.debezium.data.Json","version":1,"field":"patch"},{"type":"struct","fields":[{"type":"string","optional":false,"field":"version"},{"type":"string","optional":false,"field":"connector"},{"type":"string","optional":false,"field":"name"},{"type":"int64","optional":false,"field":"ts_ms"},{"type":"string","optional":true,"name":"io.debezium.data.Enum","version":1,"parameters":{"allowed":"true,last,false"},"default":"false","field":"snapshot"},{"type":"string","optional":false,"field":"db"},{"type":"string","optional":false,"field":"rs"},{"type":"string","optional":false,"field":"collection"},{"type":"int32","optional":false,"field":"ord"},{"type":"int64","optional":true,"field":"h"}],"optional":false,"name":"io.debezium.connector.mongo.Source","field":"source"},{"type":"string","optional":true,"field":"op"},{"type":"int64","optional":true,"field":"ts_ms"}],"optional":false,"name":"dbserver1.inventory.products.Envelope"},"payload":{"after":"{\"_id\": {\"$numberLong\": \"104\"},\"name\": \"hammer\",\"description\": \"12oz carpenter's hammer\",\"weight\": 1.25,\"quantity\": 4}","patch":null,"source":{"version":"0.10.0.Final","connector":"mongodb","name":"dbserver1","ts_ms":1573541905000,"snapshot":"true","db":"inventory","rs":"rs0","collection":"products","ord":1,"h":4983083486544392763},"op":"r","ts_ms":1573541909761}}.
    ```
   
