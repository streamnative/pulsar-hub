---
description: The Elasticsearch sink connector pulls messages from Pulsar topics and persists the messages to indexes
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v2.9.2/pulsar-io/elastic-search"
license: Apache License 2.0
tags: ["Pulsar IO", "Elasticsearch", "Sink"]
alias: Elasticsearch Sink
features: ["Use Elasticsearch sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/elasticsearch.jpg"
download: "https://archive.apache.org/dist/pulsar/pulsar-2.9.2/connectors/pulsar-io-elastic-search-2.9.2.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
id: "elasticsearch-sink"
---

The [Elasticsearch](https://www.elastic.co/elasticsearch/) sink connector pulls messages from Pulsar topics and persists the messages to indexes.

![](/images/connectors/elasticsearch-sink.png)

# How to get

This section describes how to build the Elasticsearch sink connector.

## Work with Function Worker

You can get the NAR package of the Elasticsearch sink connector from the [download page](https://github.com/streamnative/pulsar/releases/download/v2.9.2.7/pulsar-io-elastic-search-2.9.2.7.nar) if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

## Work with Function Mesh

You can pull the Elasticsearch sink connector Docker image from [the Docker Hub](https://hub.docker.com/r/streamnative/pulsar-io-elastic-search) if you use [Function Mesh](https://functionmesh.io/docs/connectors/run-connector) to run the connector.

# How to configure

Before using the Elasticsearch sink, you need to configure it. This table lists the properties and the descriptions.

| Name | Type| Required | Default | Description 
|------|----------|----------|---------|-------------|
| `elasticSearchUrl` | String| true |" " (empty string)| The URL of the Elasticsearch cluster to which the connector connects. |
| `indexName` | String| false |" " (empty string)| The index name the connector writes messages to. By default, it is the topic name. The index name can be in a date format of `%{+<date-format>}` support event time based index. For example, suppose the event time of a record is 1645182000000L and the `indexName` is in a format of `logs-%{+yyyy-MM-dd}`, then the formatted index name would be `logs-2022-02-18`. |
| `schemaEnable` | Boolean | false | false | Enable or disable the Schema Aware mode. |
| `createIndexIfNeeded` | Boolean | false | false | Manage the index if any index misses. |
| `maxRetries` | Integer | false | 1 | The maximum number of retries for Elasticsearch requests. If it is set to `-1`, it means not to retry an Elasticsearch request. |
| `retryBackoffInMs` | Integer | false | 100 | The base time to wait when retrying an Elasticsearch request (in milliseconds). |
| `maxRetryTimeInSec` | Integer| false | 86400 | The maximum retry time interval (in seconds) for retrying an Elasticsearch request. |
| `bulkEnabled` | Boolean | false | false | Enable the Elasticsearch bulk processor to flush write requests based on the number or size of requests, or after a given period. |
| `bulkActions` | Integer | false | 1000 | The maximum number of actions per Elasticsearch bulk request. If it is set to `-1`, it means to disable it. |
| `bulkSizeInMb` | Integer | false |5 | The maximum size (in megabytes) of Elasticsearch bulk requests. If it is set to `-1`, it means to disable it. |
| `bulkConcurrentRequests` | Integer | false | 0 | The maximum number of in-flight Elasticsearch bulk requests. By default, it is set to `0`, which means allowing the execution of a single request. If it is set to `1`, it means allowing to execute one concurrent request while accumulating new bulk requests. |
| `bulkFlushIntervalInMs` | Integer | false | -1 | The maximum time period to wait for flushing pending writes when bulk writes are enabled. By default, it is set to `-1`, which means not to set the time period. |
| `compressionEnabled` | Boolean | false |false | Enable or disable Elasticsearch request compression. |
| `connectTimeoutInMs` | Integer | false |5000 | The Elasticsearch client connection timeout (in milliseconds). |
| `connectionRequestTimeoutInMs` | Integer | false |1000 | The time (in milliseconds) for getting a connection from the Elasticsearch connection pool. |
| `connectionIdleTimeoutInMs` | Integer | false |5 | The idle connection timeout to prevent a read timeout. |
| `keyIgnore` | Boolean | false |true | Whether to ignore the record key to build the Elasticsearch document `_id`. If the `primaryFields` option is defined, the Elasticsearch connector extracts the primary fields from the payload to build the document `_id`.Otherwise, the Elasticsearch connector automatically generates a random document `_id`. |
| `primaryFields` | String | false | "id" | The comma separated ordered list of field names used to build the Elasticsearch document `_id` from the record value. If this list is a singleton, the field is converted as a string. If this list has two or more fields, the generated `_id` is a JSON string of the field values. |
| `nullValueAction` | enum (IGNORE,DELETE,FAIL) | false | IGNORE | How to handle records with null values. Supported options are `IGNORE`, `DELETE` and `FAIL`. By default, it is set to `IGNORE`. |
| `malformedDocAction` | enum (IGNORE,WARN,FAIL) | false | FAIL | How to handle Elasticsearch rejected documents due to some malformation. Supported options are `IGNORE`, `DELETE` and `FAIL`. By default, it is set to `FAIL`. |
| `stripNulls` | Boolean | false |true | If it is set to false, the Elasticsearch source includes 'null' for empty fields (for example {"foo": null}). Otherwise, null fields are stripped. |
| `socketTimeoutInMs` | Integer | false | 60000 | The socket timeout (in milliseconds) waiting to read the Elasticsearch response. |
| `typeName` | String | false | "_doc" | The type name that the connector writes messages to. <br><br> The value should be set to a valid type name other than "_doc" for Elasticsearch 6.2 and previous releases, and be left to a default value for other releases. |
| `indexNumberOfShards` | int| false |1| The number of shards of the index. |
| `indexNumberOfReplicas` | int| false |1 | The number of replicas of the index. |
| `username` | String| false |" " (empty string) | The username used by the connector to connect to the Elasticsearch cluster. <br><br> If the `username` option is set, the `password` option should also be provided. |
| `password` | String| false | " " (empty string)| The password used by the connector to connect to the Elasticsearch cluster. <br><br>If the `username` option is set, the `password` option should also be provided.  |
| `ssl` | ElasticSearchSslConfig | false |  | Configuration for TLS encrypted communication. <br />- `enabled`: enable SSL/TLS. <br />- `hostnameVerification`: whether or not to validate the hostname of the node when using SSL. <br />- `truststorePath`: the path to the truststore file.   <br />- `truststorePassword`: the truststore password. <br />- `keystorePath`: the path to the keystore file. <br />- `keystorePassword`: the keystore password. <br />- `cipherSuites`: the SSL/TLS cipher suites. <br />- `protocols`: a comma separated list of enabled SSL/TLS protocols.|

## Work with Function Worker

You can create a configuration file (JSON or YAML) to set the properties if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

### Examples for Elasticsearch 6.2+

**Example**

- JSON

    ```json
    {
      "configs": {
        "elasticSearchUrl": "http://localhost:9200",
        "indexName": "my_index",
        "username": "scooby",
        "password": "doobie"
      }
    }
    ```

- YAML

    ```yaml
    configs:
        elasticSearchUrl: "http://localhost:9200"
        indexName: "my_index"
        username: "scooby"
        password: "doobie"
    ```

### Examples for Elasticsearch 6.2 and previous versions

* JSON

    ```json
    {
      "elasticSearchUrl": "http://localhost:9200",
      "indexName": "my_index",
      "typeName": "doc",
      "username": "scooby",
      "password": "doobie"
    }
    ```

* YAML

    ```yaml
    configs:
      elasticSearchUrl: "http://localhost:9200"
      indexName: "my_index"
      typeName: "doc"
      username: "scooby"
      password: "doobie"
    ```

## Work with Function Mesh

You can create a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to create a Elasticsearch sink connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes ecosystem. For more information about Pulsar sink CRD configurations, see [sink CRD configurations](https://functionmesh.io/docs/connectors/io-crd-config/sink-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Sink
metadata:
  name: es-sink-sample
spec:
  image: streamnative/pulsar-io-elastic-search:2.9.2.9
  className: org.apache.pulsar.io.elasticsearch.ElasticSearchSink
  replicas: 1
  maxReplicas: 1
  input:
    topics: 
    - persistent://public/default/destination
    typeClassName: “org.apache.pulsar.client.api.schema.GenericObject”
  sinkConfig:
    elasticSearchUrl: "http://localhost:9200"
    indexName: "my_index"
    typeName: "doc"
    username: "scooby"
    password: "doobie"
  pulsar:
    pulsarConfig: "test-pulsar-sink-config"
  resources:
    limits:
    cpu: "0.2"
    memory: 1.1G
    requests:
    cpu: "0.1"
    memory: 1G
  java:
    jar: connectors/pulsar-io-elastic-search-2.9.2.9.nar
  clusterName: test-pulsar
  autoAck: true
```

# How to use

You can use the Elasticsearch sink connector with Function Worker or Function Mesh.

## Work with Function Worker

You can make the Elasticsearch sink connector as a Pulsar built-in connector and use it on a standalone cluster or an on-premises cluster.

### Standalone cluster

This example describes how to use the Elasticsearch sink connector to pull messages from Pulsar topics and persist the messages to indexes.

#### Prerequisites

- Install [Docker](https://docs.docker.com/get-docker/) (Community Edition). 

#### Steps

1. Start a single-node Elasticsearch cluster.

    ```bash
   docker run -p 9200:9200 -p 9300:9300 \
     -e "discovery.type=single-node" \
     docker.elastic.co/elasticsearch/elasticsearch:7.13.3
    ```

2. Start Pulsar locally in standalone mode.

    ```bash
    bin/pulsar standalone
    ```

    Make sure that the NAR file is available at `connectors/pulsar-io-elastic-search-{{pulsar:version}}.nar`.

3. Start the Pulsar Elasticsearch connector in local run mode using one of the following methods.

    * Use the **JSON** configuration as shown previously. 
        ```bash
        bin/pulsar-admin sinks localrun \
          --archive connectors/pulsar-io-elastic-search-{{pulsar:version}}.nar \
          --tenant public \
          --namespace default \
          --name elasticsearch-test-sink \
          --sink-config '{"elasticSearchUrl":"http://localhost:9200","indexName": "my_index","username": "scooby","password": "doobie"}' \
          --inputs elasticsearch_test
        ```

    * Use the **YAML** configuration file as shown previously.
    
        ```bash
        bin/pulsar-admin sinks localrun \
          --archive connectors/pulsar-io-elastic-search-{{pulsar:version}}.nar \
          --tenant public \
          --namespace default \
          --name elasticsearch-test-sink \
          --sink-config-file elasticsearch-sink.yml \
          --inputs elasticsearch_test
        ```

4. Publish records to the topic.

    ```bash
    bin/pulsar-client produce elasticsearch_test --messages "{\"a\":1}"
    ```

5. Check documents in Elasticsearch.

    * Refresh the index
        ```bash
        curl -s http://localhost:9200/my_index/_refresh
        ``` 

    * Search documents.

        ```bash
        curl -s http://localhost:9200/my_index/_search
        ```

        You can see the record that was published earlier has been successfully written into Elasticsearch.

        ```json
        {"took":2,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":1.0,"hits":[{"_index":"my_index","_type":"_doc","_id":"FSxemm8BLjG_iC0EeTYJ","_score":1.0,"_source":{"a":1}}]}}
        ```

### On-premises cluster

This example explains how to create a Elasticsearch sink connector in an on-premises cluster.

1. Copy the NAR package of the Elasticsearch connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-Elasticsearch-{{connector:version}}.nar $PULSAR_HOME/connectors/pulsar-io-Elasticsearch-{{connector:version}}.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sinks reload
    ```

3. Check whether the Elasticsearch sink connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks available-sinks
    ```

4. Create a Elasticsearch sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-config-file <Elasticsearch-sink-config.yaml>
    ```

## Work with Function Mesh

This example describes how to create a Elasticsearch sink connector for a Kuberbetes cluster using Function Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).
- Create a [Pulsar cluster](https://pulsar.apache.org/docs/en/kubernetes-helm/) in the Kubernetes cluster.
- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes cluster.

### Step

1. Define the Elasticsearch sink connector with a YAML file and save it as `sink-sample.yaml`.

    This example shows how to publish the Elasticsearch sink connector to Function Mesh with a Docker image.

    ```yaml
    apiVersion: compute.functionmesh.io/v1alpha1
    kind: Sink
    metadata:
      name: es-sink-sample
    spec:
      image: streamnative/pulsar-io-elastic-search:2.9.2.9
      className: org.apache.pulsar.io.elasticsearch.ElasticSearchSink
      replicas: 1
      maxReplicas: 1
      input:
        topics: 
        - persistent://public/default/destination
        typeClassName: “org.apache.pulsar.client.api.schema.GenericObject”
      sinkConfig:
        elasticSearchUrl: "http://localhost:9200"
        indexName: "my_index"
        typeName: "doc"
        username: "scrappy"
        password: "fighter"
      pulsar:
        pulsarConfig: "test-pulsar-sink-config"
      resources:
        limits:
        cpu: "0.2"
        memory: 1.1G
        requests:
        cpu: "0.1"
        memory: 1G
      java:
        jar: connectors/pulsar-io-elastic-search-2.9.2.9.nar
      clusterName: test-pulsar
      autoAck: true
    ```

2. Apply the YAML file to create the Elasticsearch sink connector.

    **Input**

    ```
    kubectl apply -f <path-to-sink-sample.yaml>
    ```

    **Output**

    ```
    sink.compute.functionmesh.io/es-sink-sample created
    ```

3. Check whether the Elasticsearch sink connector is created successfully.

    **Input**

    ```
    kubectl get all
    ```

    **Output**

    ```
    NAME                                         READY   STATUS      RESTARTS   AGE
    pod/es-sink-sample-0               1/1    Running     0          77s
    ```

    After confirming the successful creation of the Elasticsearch sink connector, you can use it to export Pulsar messages to Elasticsearch.