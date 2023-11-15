---
description: The Elasticsearch sink connector pulls messages from Pulsar topics and persists the messages to indexes
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar/tree/v2.10.5.8/pulsar-io/elastic-search"
license: Apache License 2.0
tags: ["Pulsar IO", "Elasticsearch", "Sink"]
alias: Elasticsearch Sink Connector
features: ["Use Elasticsearch sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/elasticsearch.png"
download: "https://github.com/streamnative/pulsar/releases/download/v2.10.5.8/pulsar-io-elastic-search-2.10.5.8.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-elastic-search
sn_available: true
id: "elasticsearch-sink"
---

The [Elasticsearch](https://www.elastic.co/elasticsearch/) sink connector pulls messages from Pulsar topics and persists the messages to indexes. For more information about connectors, see [Connector Overview](https://docs.streamnative.io/docs/connector-overview).

![](/images/connectors/elasticsearch-sink.png)

This document introduces how to get started with creating an Elasticsearch sink connector and get it up and running.
## Quick start

### Prerequisites

The prerequisites for connecting an Elasticsearch sink connector to external systems include:

Create a Elasticsearch cluster. You can create a single-node Elasticsearch cluster by executing this command:

```bash
docker run -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
       -e "ELASTIC_PASSWORD=ElasticPasseword" \
  docker.elastic.co/elasticsearch/elasticsearch:7.17.13
```

### 1. Create a connector
Depending on the environment, there are several ways to create an Elasticsearch sink connector:

- [Create a Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create a Connector with Function worker](https://pulsar.apache.org/docs/io-quickstart/).
Using this way requires you to download a **NAR** package to create a connector. You can download the version you need from the `download button` at the beginning of the article.
- [Create a Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
Using this way requires you to set the docker image. You can choose the version you want to launch from [here](https://hub.docker.com/r/streamnative/pulsar-io-elastic-search).

No matter how you create an Elasticsearch sink connector, the minimum connector configuration for Elasticsearch 6.2+ contains the following parameters:
```yaml
configs:
  elasticSearchUrl: "http://localhost:9200"
  indexName: "my_index"
  username: "elastic"
  password: "ElasticPasseword"
```

The minimum connector configuration for Elasticsearch 6.2 and previous versions contains the following parameters:
```yaml
configs:
  elasticSearchUrl: "http://localhost:9200"
  indexName: "my_index"
  typeName: "doc"
  username: "elastic"
  password: "ElasticPasseword"
```

Note that the `typeName` value should be set to a valid type name other than "_doc" for Elasticsearch 6.2 and previous releases, and be left to a default value for other releases.

> * The configuration structure varies depending on how you create the Elasticsearch sink connector.
>  For example, some are **JSON**, some are **YAML**, and some are **Kubernetes YAML**. You need to adapt the configs to the corresponding format.
>
> * If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

### 2. Send messages to the topic
{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

``` java
   PulsarClient client = PulsarClient.builder()
            .serviceUrl("{{Your Pulsar URL}}")
            .build();

   Producer<String> producer = client.newProducer(Schema.STRING)
     .topic("{{Your topic name}}")
     .create();

   String message = "{\"a\":1}";
   MessageId msgID = producer.send(message);
   System.out.println("Publish " + message + " and message ID " + msgID);

   producer.flush();
   producer.close();
   client.close();
```

### 3. Check documents in Elasticsearch
- Refresh the index
```bash
curl -s http://localhost:9200/my_index/_refresh
``` 

-  Search documents

```bash
curl -s http://localhost:9200/my_index/_search
```

- You can see the record that was published earlier has been successfully written into Elasticsearch.

```json
{"took":2,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":1.0,"hits":[{"_index":"my_index","_type":"_doc","_id":"FSxemm8BLjG_iC0EeTYJ","_score":1.0,"_source":{"a":1}}]}}
```

## Configuration Properties

This table outlines the properties of an Elasticsearch sink connector.

| Name                           | Type                                                 | Required | Default            | Description                                                                                                                                                                                                                                                                                                                                                                    |
|--------------------------------|------------------------------------------------------|----------|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `elasticSearchUrl`             | String                                               | true     | " " (empty string) | The URL of elastic search cluster to which the connector connects.                                                                                                                                                                                                                                                                                                             |
| `indexName`                    | String                                               | false    | " " (empty string) | The index name to which the connector writes messages. The default value is the topic name. It accepts date formats in the name to support event time based index with the pattern `%{+<date-format>}`. For example, suppose the event time of the record is 1645182000000L, the indexName is `logs-%{+yyyy-MM-dd}`, then the formatted index name would be `logs-2022-02-18`. |
| `schemaEnable`                 | Boolean                                              | false    | false              | Turn on the Schema Aware mode.                                                                                                                                                                                                                                                                                                                                                 |
| `createIndexIfNeeded`          | Boolean                                              | false    | false              | Manage index if missing.                                                                                                                                                                                                                                                                                                                                                       |
| `maxRetries`                   | Integer                                              | false    | 1                  | The maximum number of retries for elasticsearch requests. Use -1 to disable it.                                                                                                                                                                                                                                                                                                |
| `retryBackoffInMs`             | Integer                                              | false    | 100                | The base time to wait when retrying an Elasticsearch request (in milliseconds).                                                                                                                                                                                                                                                                                                |
| `maxRetryTimeInSec`            | Integer                                              | false    | 86400              | The maximum retry time interval in seconds for retrying an elasticsearch request.                                                                                                                                                                                                                                                                                              |
| `bulkEnabled`                  | Boolean                                              | false    | false              | Enable the elasticsearch bulk processor to flush write requests based on the number or size of requests, or after a given period.                                                                                                                                                                                                                                              |
| `bulkActions`                  | Integer                                              | false    | 1000               | The maximum number of actions per elasticsearch bulk request. Use -1 to disable it.                                                                                                                                                                                                                                                                                            |
| `bulkSizeInMb`                 | Integer                                              | false    | 5                  | The maximum size in megabytes of elasticsearch bulk requests. Use -1 to disable it.                                                                                                                                                                                                                                                                                            |
| `bulkConcurrentRequests`       | Integer                                              | false    | 0                  | The maximum number of in flight elasticsearch bulk requests. The default 0 allows the execution of a single request. A value of 1 means 1 concurrent request is allowed to be executed while accumulating new bulk requests.                                                                                                                                                   |
| `bulkFlushIntervalInMs`        | Long                                                 | false    | 1000               | The maximum period of time to wait for flushing pending writes when bulk writes are enabled. -1 or zero means the scheduled flushing is disabled.                                                                                                                                                                                                                              |
| `compressionEnabled`           | Boolean                                              | false    | false              | Enable elasticsearch request compression.                                                                                                                                                                                                                                                                                                                                      |
| `connectTimeoutInMs`           | Integer                                              | false    | 5000               | The elasticsearch client connection timeout in milliseconds.                                                                                                                                                                                                                                                                                                                   |
| `connectionRequestTimeoutInMs` | Integer                                              | false    | 1000               | The time in milliseconds for getting a connection from the elasticsearch connection pool.                                                                                                                                                                                                                                                                                      |
| `connectionIdleTimeoutInMs`    | Integer                                              | false    | 5                  | Idle connection timeout to prevent a read timeout.                                                                                                                                                                                                                                                                                                                             |
| `keyIgnore`                    | Boolean                                              | false    | true               | Whether to ignore the record key to build the Elasticsearch document `_id`. If primaryFields is defined, the connector extract the primary fields from the payload to build the document `_id` If no primaryFields are provided, elasticsearch auto generates a random document `_id`.                                                                                         |
| `primaryFields`                | String                                               | false    | "id"               | The comma separated ordered list of field names used to build the Elasticsearch document `_id` from the record value. If this list is a singleton, the field is converted as a string. If this list has 2 or more fields, the generated `_id` is a string representation of a JSON array of the field values.                                                                  |
| `nullValueAction`              | enum (IGNORE,DELETE,FAIL)                            | false    | IGNORE             | How to handle records with null values, possible options are IGNORE, DELETE or FAIL. Default is IGNORE the message.                                                                                                                                                                                                                                                            |
| `malformedDocAction`           | enum (IGNORE,WARN,FAIL)                              | false    | FAIL               | How to handle elasticsearch rejected documents due to some malformation. Possible options are IGNORE, DELETE or FAIL. Default is FAIL the Elasticsearch document.                                                                                                                                                                                                              |
| `stripNulls`                   | Boolean                                              | false    | true               | If stripNulls is false, elasticsearch _source includes 'null' for empty fields (for example {"foo": null}), otherwise null fields are stripped.                                                                                                                                                                                                                                |
| `socketTimeoutInMs`            | Integer                                              | false    | 60000              | The socket timeout in milliseconds waiting to read the elasticsearch response.                                                                                                                                                                                                                                                                                                 |
| `typeName`                     | String                                               | false    | "_doc"             | The type name to which the connector writes messages to. <br /><br /> The value should be set explicitly to a valid type name other than "_doc" for Elasticsearch version before 6.2, and left to default otherwise.                                                                                                                                                           |
| `indexNumberOfShards`          | int                                                  | false    | 1                  | The number of shards of the index.                                                                                                                                                                                                                                                                                                                                             |
| `indexNumberOfReplicas`        | int                                                  | false    | 1                  | The number of replicas of the index.                                                                                                                                                                                                                                                                                                                                           |
| `username`                     | String                                               | false    | " " (empty string) | The username used by the connector to connect to the elastic search cluster. <br /><br />If `username` is set, then `password` should also be provided.                                                                                                                                                                                                                        |
| `password`                     | String                                               | false    | " " (empty string) | The password used by the connector to connect to the elastic search cluster. <br /><br />If `username` is set, then `password` should also be provided.                                                                                                                                                                                                                        |
| `ssl`                          | ElasticSearchSslConfig                               | false    |                    | Configuration for TLS encrypted communication                                                                                                                                                                                                                                                                                                                                  |
| `compatibilityMode`            | enum (AUTO,ELASTICSEARCH,ELASTICSEARCH_7,OPENSEARCH) | false    | AUTO               | Specify compatibility mode with the ElasticSearch cluster. `AUTO` value will try to auto detect the correct compatibility mode to use. Use `ELASTICSEARCH_7` if the target cluster is running ElasticSearch 7 or prior. Use `ELASTICSEARCH` if the target cluster is running ElasticSearch 8 or higher. Use `OPENSEARCH` if the target cluster is running OpenSearch.          |
| `token`                        | String                                               | false    | " " (empty string) | The token used by the connector to connect to the ElasticSearch cluster. Only one between basic/token/apiKey authentication mode must be configured.                                                                                                                                                                                                                           |
| `apiKey`                       | String                                               | false    | " " (empty string) | The apiKey used by the connector to connect to the ElasticSearch cluster. Only one between basic/token/apiKey authentication mode must be configured.                                                                                                                                                                                                                          |
| `canonicalKeyFields`           | Boolean                                              | false    | false              | Whether to sort the key fields for JSON and Avro or not. If it is set to `true` and the record key schema is `JSON` or `AVRO`, the serialized object does not consider the order of properties.                                                                                                                                                                                |
| `stripNonPrintableCharacters`  | Boolean                                              | false    | true               | Whether to remove all non-printable characters from the document or not. If it is set to true, all non-printable characters are removed from the document.                                                                                                                                                                                                                     |
| `idHashingAlgorithm`           | enum(NONE,SHA256,SHA512)                             | false    | NONE               | Hashing algorithm to use for the document id. This is useful in order to be compliant with the ElasticSearch _id hard limit of 512 bytes.                                                                                                                                                                                                                                      |
| `conditionalIdHashing`         | Boolean                                              | false    | false              | This option only works if idHashingAlgorithm is set. If enabled, the hashing is performed only if the id is greater than 512 bytes otherwise the hashing is performed on each document in any case.                                                                                                                                                                            |
| `copyKeyFields`                | Boolean                                              | false    | false              | If the message key schema is AVRO or JSON, the message key fields are copied into the ElasticSearch document.                                                                                                                                                                                                                                                                  |
