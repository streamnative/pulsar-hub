---
description: "The official Apache Iceberg Kafka Connect Sink connector."
author: ["Tabular"]
contributors: ["Tabular"]
language: Java
document: "https://github.com/tabular-io/iceberg-kafka-connect/blob/v0.6.19/README.md"
source: "https://github.com/tabular-io/iceberg-kafka-connect/tree/v0.6.19"
license: Apache License 2.0
tags: ["Kafka Connect", "Sink"]
alias: Kafka Connect Iceberg Sink
features: ["Writes data from Kafka topics to Apache Iceberg tables"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/iceberg.png"
download: "https://github.com/tabular-io/iceberg-kafka-connect/releases/tag/v0.6.19"
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

### Quick Start

1. Setup the kcctl client: [doc](https://docs.streamnative.io/docs/kafka-connect-setup)
2. Set up the Iceberg Catalog, we can use the below yaml file to create a local iceberg catalog in k8s:
    ```yaml
    apiVersion: v1
    data:
      spark-defaults.conf: |
        #
        # Licensed to the Apache Software Foundation (ASF) under one or more
        # contributor license agreements.  See the NOTICE file distributed with
        # this work for additional information regarding copyright ownership.
        # The ASF licenses this file to You under the Apache License, Version 2.0
        # (the "License"); you may not use this file except in compliance with
        # the License.  You may obtain a copy of the License at
        #
        #    http://www.apache.org/licenses/LICENSE-2.0
        #
        # Unless required by applicable law or agreed to in writing, software
        # distributed under the License is distributed on an "AS IS" BASIS,
        # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        # See the License for the specific language governing permissions and
        # limitations under the License.
        #

        # Default system properties included when running spark-submit.
        # This is useful for setting default environmental settings.

        # Example:
        spark.sql.extensions                   org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions
        spark.sql.catalog.demo                 org.apache.iceberg.spark.SparkCatalog
        spark.sql.catalog.demo.type            rest
        spark.sql.catalog.demo.uri             http://iceberg-rest.default.svc.cluster.local:8181
        spark.sql.catalog.demo.io-impl         org.apache.iceberg.aws.s3.S3FileIO
        spark.sql.catalog.demo.warehouse       s3://warehouse/
        spark.sql.catalog.demo.s3.endpoint     http://minio.default.svc.cluster.local:9000
        spark.sql.defaultCatalog               demo
        spark.eventLog.enabled                 true
        spark.eventLog.dir                     /home/iceberg/spark-events
        spark.history.fs.logDirectory          /home/iceberg/spark-events
        spark.sql.catalogImplementation        in-memory
    kind: ConfigMap
    metadata:
      name: spark-config
      namespace: default
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: spark-iceberg
      namespace: default
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: spark-iceberg
      template:
        metadata:
          labels:
            app: spark-iceberg
        spec:
          containers:
          - name: spark-iceberg
            image: tabulario/spark-iceberg
            ports:
              - name: one
                containerPort: 8888
              - name: two
                containerPort: 8080
              - name: three
                containerPort: 10000
              - name: four
                containerPort: 10001
            env:
              - name: AWS_ACCESS_KEY_ID
                value: admin
              - name: AWS_SECRET_ACCESS_KEY
                value: password
              - name: AWS_REGION
                value: us-east-1
            volumeMounts:
              - name: spark-config
                mountPath: /opt/spark/conf/spark-defaults.conf
                subPath: spark-defaults.conf
          volumes:
            - name: spark-config
              configMap:
                name: spark-config
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: spark-iceberg
      namespace: default
    spec:
      selector:
        app: spark-iceberg
      ports:
        - protocol: TCP
          name: one
          port: 8888
          targetPort: 8888
        - protocol: TCP
          name: two
          port: 8080
          targetPort: 8080
        - protocol: TCP
          name: three
          port: 10000
          targetPort: 10000
        - protocol: TCP
          port: 10001
          name: four
          targetPort: 10001
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: iceberg-rest
      namespace: default
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: iceberg-rest
      template:
        metadata:
          labels:
            app: iceberg-rest
        spec:
          containers:
          - name: iceberg-rest
            image: tabulario/iceberg-rest
            ports:
              - name: one
                containerPort: 8181
            env:
              - name: AWS_ACCESS_KEY_ID
                value: admin
              - name: AWS_SECRET_ACCESS_KEY
                value: password
              - name: AWS_REGION
                value: us-east-1
              - name: CATALOG_WAREHOUSE
                value: s3://warehouse/
              - name: CATALOG_IO__IMPL
                value: org.apache.iceberg.aws.s3.S3FileIO
              - name: CATALOG_S3_ENDPOINT
                value: http://minio.default.svc.cluster.local:9000
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: iceberg-rest
      namespace: default
    spec:
      selector:
        app: iceberg-rest
      ports:
        - protocol: TCP
          name: one
          port: 8181
          targetPort: 8181
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: minio
      namespace: default
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: minio
      template:
        metadata:
          labels:
            app: minio
        spec:
          hostname: warehouse
          subdomain: minio
          containers:
          - name: minio
            image: minio/minio
            args:
              - server
              - /data
              - --console-address
              - ":9001"
            ports:
              - name: one
                containerPort: 9000
              - name: two
                containerPort: 9001
            env:
              - name: MINIO_ROOT_USER
                value: admin
              - name: MINIO_ROOT_PASSWORD
                value: password
              - name: MINIO_DOMAIN
                value: minio.default.svc.cluster.local
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: minio
      namespace: default
    spec:
      selector:
        app: minio
      ports:
        - protocol: TCP
          name: one
          port: 9000
          targetPort: 9000
        - protocol: TCP
          name: two
          port: 9001
          targetPort: 9001
    ```
3. Initialize the Iceberg table:

    ```bash
    kubectl apply -f iceberg-spark.yaml
    kubectl wait -l app=spark-iceberg --for=condition=Ready pod --timeout=5m
    kubectl wait -l app=iceberg-rest --for=condition=Ready pod --timeout=5m
    kubectl wait -l app=minio --for=condition=Ready pod --timeout=5m

    sleep 30

    # initialize the bucket
    minio_pod_name=$(kubectl get pods -l app=minio -o=jsonpath='{.items[0].metadata.name}')
    kubectl exec $minio_pod_name -- /usr/bin/mc config host add minio http://minio.default.svc.cluster.local:9000 admin password
    kubectl exec $minio_pod_name -- /usr/bin/mc rm -r --force minio/warehouse || true
    kubectl exec $minio_pod_name -- /usr/bin/mc mb minio/warehouse
    kubectl exec $minio_pod_name -- /usr/bin/mc policy set public minio/warehouse
    ```

4. Create a JSON file like the following:

    ```json
    {
        "name": "iceberg-sink",
        "config": {
            "connector.class": "io.tabular.iceberg.connect.IcebergSinkConnector",
            "topics": "kafka-iceberg-input",
            "iceberg.tables": "sink.kafka",
            "iceberg.catalog": "demo",
            "iceberg.catalog.type": "rest",
            "iceberg.catalog.uri": "http://iceberg-rest.default.svc.cluster.local:8181",
            "iceberg.catalog.client.region": "us-east-1",
            "iceberg.catalog.io-impl": "org.apache.iceberg.aws.s3.S3FileIO",
            "iceberg.catalog.warehouse": "s3://warehouse",
            "iceberg.catalog.s3.endpoint": "http://minio.default.svc.cluster.local:9000",
            "iceberg.catalog.s3.path-style-access": "true",
            "iceberg.catalog.s3.access-key-id": "admin",
            "iceberg.catalog.s3.secret-access-key": "password",
            "iceberg.tables.auto-create-enabled": "true",
            "iceberg.tables.evolve-schema-enabled": "true",
            "iceberg.control.commit.interval-ms": "1000",
            "key.converter": "org.apache.kafka.connect.storage.StringConverter",
            "value.converter": "org.apache.kafka.connect.json.JsonConverter",
            "value.converter.schemas.enable": "false",
            "tasks.max": "1"
        }
    }
    ```
5. Run the following command to create the connector:

    ```bash
    kcctl create -f <filename>.json
    ```

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

For more information about the properties, see the [official documentation](https://github.com/tabular-io/iceberg-kafka-connect/blob/v0.6.19/README.md).