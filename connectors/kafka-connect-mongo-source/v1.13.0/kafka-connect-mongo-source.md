---
description: "The official MongoDB Kafka Connect Source connector." 
author: ["MongoDB"]
contributors: ["MongoDB"]
language: Java
document: "https://www.mongodb.com/docs/kafka-connector/v1.13/"
source: "https://github.com/mongodb/mongo-kafka/tree/r1.13.0"
license: Apache License 2.0
tags: ["Kafka Connect", "Source"]
alias: Kafka Connect MongoDB Source
features: ["Reads data from MongoDB as a source into Apache Kafka topics"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/mongodb.png"
download: "https://github.com/mongodb/mongo-kafka/releases/tag/r1.13.0"
support: Community
support_link: "https://github.com/mongodb/mongo-kafka"
support_img: ""
owner_name: "MongoDB"
owner_img: ""
sn_available: true
dockerfile: 
id: "kafka-connect-mongodb-source"
powered_by: "Kafka Connect"
---

The MongoDB Kafka source connector is a Kafka Connect connector that reads data from MongoDB and writes data to Kafka topics.

### Prerequisites

- The `connection.uri` is in form of `mongodb+srv://username:password@cluster0.xxx.mongodb.net`
- Valid credentials with the `read` role on the database. For more granular access control, you can specify a custom role that allows `find`, and `changeStream` actions on the databases or collections.

### Quick Start

1. Setup the kcctl client: [doc](https://docs.streamnative.io/docs/kafka-connect-setup)
2. Create a MongoDB Cluster, you can create one in k8s cluster with below yaml file:
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: mongo
      labels:
        name: mongo
    spec:
      ports:
        - port: 27017
      clusterIP: None
      selector:
        role: mongo
    ---
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: mongo-dbz
    spec:
      selector:
        matchLabels:
          role: mongo
      serviceName: "mongo"
      replicas: 1
      template:
        metadata:
          labels:
            role: mongo
        spec:
          terminationGracePeriodSeconds: 10
          containers:
            - name: mongo
              image: debezium/example-mongodb:2.6
              env:
                - name: MONGODB_USER
                  value: "debezium"
                - name: MONGODB_PASSWORD
                  value: "dbz"
              command:
                - mongod
                - "--replSet"
                - rs0
                - "--bind_ip" # bind mongo to all ip address to allow others to access
                - "0.0.0.0"
              ports:
                - containerPort: 27017
            - name: mongo-sidecar
              image: cvallance/mongo-k8s-sidecar
              env:
                - name: MONGO_SIDECAR_POD_LABELS
                  value: "role=mongo"
                - name: KUBE_NAMESPACE
                  value: default
                - name: KUBERNETES_MONGO_SERVICE_NAME
                  value: "mongo"
    ```
3. Initialize the local MongoDB cluster:
    ```shell
    kubectl apply -f .ci/clusters/mongodb.yaml
    kubectl wait -l role=mongo --for=condition=Ready pod --timeout=5m
    # initialize the data
    kubectl exec mongo-dbz-0 -c mongo -- bash ./usr/local/bin/init-inventory.sh
    ```

4. Create a JSON file like the following:
    ```json
    {
        "name": "mongo-source",
        "config": {
            "connector.class": "com.mongodb.kafka.connect.MongoSourceConnector",
            "connection.uri": "mongodb://mongo.default.svc.cluster.local:27017/?authSource=admin",
            "database": "kafka-mongo",
            "collection": "source",
            "value.converter": "org.apache.kafka.connect.json.JsonConverter",
            "value.converter.schemas.enable": false,
            "tasks.max": "1"
        }
    }
    ```

5. Run the following command to create the connector:
    ```shell
    kcctl create -f <filename>.json
   ```

### Configuration

The MongoDB Kafka source connector is configured using the following *Required* properties:

Parameter | Description 
-|-
`connection.uri` | The connection URI for the MongoDB server. 
`database` | The MongoDb database from which the connector imports data into Redpanda topics. The connector monitors changes in this database. Leave the field empty to watch all databases.
`collection` | The collection in the MongoDB database to watch. If not set, then all collections are watched.
`topic.prefix` | The prefix for the Kafka topics that the connector creates. The connector appends a database name and collection name to this prefix to create the topic name.

The full properties are also available from the [offical MongoDB Kafka Source Connector documentation](https://www.mongodb.com/docs/kafka-connector/v1.13/source-connector/configuration-properties/).
