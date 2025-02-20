---
description: kafka-connect-bigquery is a Kafka Connect connector for Google BigQuery.
author: ["WePay", "Confluent"]
contributors: ["WePay", "Confluent"]
language: Java
document: "https://github.com/confluentinc/kafka-connect-bigquery/blob/v2.5.7/README.md"
source: "https://github.com/confluentinc/kafka-connect-bigquery/tree/v2.5.7"
license: Apache License 2.0
tags: ["Kafka Connect", "Sink"]
alias: Kafka Connect BigQuery Sink
features: ["Sink data from Kafka to Google BigQuery"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/google-bigquery-logo.png"
download: "https://github.com/confluentinc/kafka-connect-bigquery/releases/tag/v2.5.7"
support: Community
support_link: "https://github.com/confluentinc/kafka-connect-bigquery"
support_img: ""
owner_name: "Confluent"
owner_img: ""
sn_available: true
dockerfile:
id: "kafka-connect-bigquery"
powered_by: "Kafka Connect"
---

`kafka-connect-bigquery` is a Kafka Connect connector for Google BigQuery. It is available in the StreamNative Cloud.

### Prerequisites

The following prerequisites are required before setting up the BigQuery connector.

1. A valid Google Cloud account authorized for resource creation.
2. A BigQuery project, which can be set up via the Google Cloud Console.
3. A dataset within the BigQuery project.
4. A service account with access to the BigQuery project that hosts the dataset; this account can be created in the Google Cloud Console.
5. Ensure the service account is granted access to the BigQuery project containing the dataset; create and download a key in JSON format when setting up the service account.
6. According to `GCP specifications <https://cloud.google.com/bigquery/docs/access-control>`, the service account will either need the **BigQueryEditor** primitive IAM role or the **bigquery.dataEditor** predefined IAM role. The minimum permissions are as follows:
```
   bigquery.datasets.get
   bigquery.tables.create
   bigquery.tables.get
   bigquery.tables.getData
   bigquery.tables.list
   bigquery.tables.update
   bigquery.tables.updateData
```

### Quick Start

1. Setup the kcctl client: [doc](https://docs.streamnative.io/docs/kafka-connect-setup)
2. Create a GSA(google service account) in Google Cloud, and get the private key of it
3. Create a secret in StreamNative Console, and save the GSA private key's content , please refer to: [doc](https://docs.streamnative.io/docs/kafka-connect-create#create-kafka-connect-with-secret), let's say the secret name is `gcp`, and key is `auth`
4. Create a dataset in Google Cloud
5. Create a json file like below:

    ```json
    {
        "name": "test-bq",
        "config": {
            "connector.class": "com.wepay.kafka.connect.bigquery.BigQuerySinkConnector",
            "topics": "${INPUT_TOPIC}",
            "project": "${GCP_PROJECT_NAME}",
            "defaultDataset": "${DATA_SET_NAME}",
            "key.converter": " org.apache.kafka.connect.storage.StringConverter",
            "value.converter": "org.apache.kafka.connect.json.JsonConverter",
            "autoCreateTables": "false",
            "keySource": "JSON",
            "keyfile": "${snsecret:gcp:auth}",
            "value.converter.schemas.enable": false
        }
    }
    ```

6. Run the following command to create the connector:

    ```shell
    kcctl apply -f <your-json-file>
    ```

### Configuration

The `kafka-connect-bigquery` connector is configured using the following properties:

| Parameter                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                  | Default                                                           |
|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| project                              | The Google Cloud project ID                                                                                                                                                                                                                                                                                                                                                                                                  |                                                                   |
| defaultDataset                       | The BigQuery dataset name                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                   |
| topics                               | The Kafka topics to sink to BigQuery                                                                                                                                                                                                                                                                                                                                                                                         |                                                                   |
| autoCreateTables                     | Create BigQuery tables if they don’t already exist. This property should only be enabled for Schema Registry-based inputs: Avro, Protobuf, or JSON Schema (JSON_SR). Table creation is not supported for JSON input.                                                                                                                                                                                                         | true                                                              |
| keyfile                              | keyfile can be either a string representation of the Google credentials file or the path to the Google credentials file itself. The string representation of the Google credentials file is supported in BigQuery sink connector version 1.3 (and later). For StreamNative Cloud, the keyfile will be saved as StreamNative Cloud secret in JSON format                                                                      |                                                                   |
| keySource                            | The source of the keyfile. The keyfile can be provided as a string or a file path. For StreamNative Cloud, only `JSON` supported.                                                                                                                                                                                                                                                                                            | JSON                                                              |
| gcsBucketName                        | The name of the bucket where Google Cloud Storage (GCS) blobs are located. These blobs are used to batch-load to BigQuery. This is applicable only if `enableBatchLoad` is configured.                                                                                                                                                                                                                                       |                                                                   |
| queueSize                            | The maximum size (or -1 for no maximum size) of the worker queue for BigQuery write requests before all topics are paused. This is a soft limit; the size of the queue can go over this before topics are paused. All topics resume once a flush is triggered or the size of the queue drops under half of the maximum size.                                                                                                 | -1                                                                |
| bigQueryRetry                        | The number of retry attempts made for a BigQuery request that fails with a backend error or a quota exceeded error.                                                                                                                                                                                                                                                                                                          | 0                                                                 |
| bigQueryRetryWait                    | The time in milliseconds to wait between retry attempts.                                                                                                                                                                                                                                                                                                                                                                     | 1000                                                              |
| bigQueryMessageTimePartitioning      | The time partitioning configuration for BigQuery tables.                                                                                                                                                                                                                                                                                                                                                                     | false                                                             |
| bigQueryPartitionDecorator           | Whether or not to append partition decorator to BigQuery table name when inserting records. Default is true. Setting this to true appends partition decorator to table name (e.g. table$yyyyMMdd depending on the configuration set for bigQueryPartitionDecorator). Setting this to false bypasses the logic to append the partition decorator and uses raw table name for inserts.                                         | true                                                              |
| timestampPartitionFieldName          | The field name in the record that contains the timestamp to use for partitioning.                                                                                                                                                                                                                                                                                                                                            | null                                                              |
| clusteringPartitionFieldNames        | The field names in the record that contain the fields to use for clustering.                                                                                                                                                                                                                                                                                                                                                 | null                                                              |
| timePartitioningType                 | The type of time partitioning to use. Support `MONTH, YEAR, HOUR, DAY`                                                                                                                                                                                                                                                                                                                                                       | DAY                                                               |
| sanitizeTopics                       | Whether to sanitize topic names to be compatible with BigQuery table names.                                                                                                                                                                                                                                                                                                                                                  | false                                                             |
| schemaRetriever                      | A class that can be used for automatically creating tables and/or updating schemas. Note that in version 2.0.0, SchemaRetriever API changed to retrieve the schema from each SinkRecord, which will help support multiple schemas per topic. SchemaRegistrySchemaRetriever has been removed as it retrieves schema based on the topic.                                                                                       | com.wepay.kafka.connect.bigquery.retrieve.IdentitySchemaRetriever |
| threadPoolSize                       | The size of the BigQuery write thread pool. This establishes the maximum number of concurrent writes to BigQuery.                                                                                                                                                                                                                                                                                                            | 10                                                                |
| allBQFieldsNullable                  | If true, no fields in any produced BigQuery schema are REQUIRED. All non-nullable Avro fields are translated as NULLABLE (or REPEATED, if arrays).                                                                                                                                                                                                                                                                           | false                                                             |
| avroDataCacheSize                    | The size of the Avro data cache.                                                                                                                                                                                                                                                                                                                                                                                             | 100                                                               |
| batchLoadIntervalSec                 | The interval, in seconds, in which to attempt to run GCS to BigQuery load jobs. Only relevant if `enableBatchLoad` is configured.                                                                                                                                                                                                                                                                                            | 120                                                               |
| convertDoubleSpecialValues           | Designates whether +Infinity is converted to Double.MAX_VALUE and whether -Infinity and NaN are converted to Double.MIN_VALUE to ensure successfull delivery to BigQuery.                                                                                                                                                                                                                                                    | false                                                             |
| enableBatchLoad                      | [Beta Feature] Use with caution. The sublist of topics to be batch loaded through GCS.                                                                                                                                                                                                                                                                                                                                       | ""                                                                |
| includeKafkaData                     | Whether to include an extra block containing the Kafka source topic, offset, and partition information in the resulting BigQuery rows.                                                                                                                                                                                                                                                                                       | false                                                             |
| upsertEnabled                        | Enable upsert functionality on the connector through the use of record keys, intermediate tables, and periodic merge flushes. Row-matching will be performed based on the contents of record keys. This feature won’t work with SMTs that change the name of the topic and doesn’t support JSON input.                                                                                                                       | false                                                             |
| deleteEnabled                        | Enable delete functionality on the connector through the use of record keys and intermediate tables. Row-matching will be performed based on the contents of record keys. This feature won’t work with SMTs that change the name of the topic and doesn’t support JSON input.                                                                                                                                                | false                                                             |
| intermediateTableSuffix              | A suffix that will be appended to the names of destination tables to create the names for the corresponding intermediate tables. Multiple intermediate tables may be created for a single destination table, but their names will always start with the name of the destination table, followed by this suffix, and possibly followed by an additional suffix.                                                               | "tmp"                                                             |
| mergeIntervalMs                      | The interval, in milliseconds, at which to attempt to merge intermediate tables into destination tables.                                                                                                                                                                                                                                                                                                                     | 60000                                                             |
| mergeRecordsThreshold                | The number of records that must be in an intermediate table before it is eligible for a merge operation.                                                                                                                                                                                                                                                                                                                     | -1                                                                |
| autoCreateBucket                     | Whether to create the GCS bucket if it doesn't exist.                                                                                                                                                                                                                                                                                                                                                                        | true                                                              |
| allowNewBigQueryFields               | Whether to allow new fields in BigQuery tables.                                                                                                                                                                                                                                                                                                                                                                              | false                                                             |
| allowBigQueryRequiredFieldRelaxation | If true, fields in BigQuery Schema can be changed from REQUIRED to NULLABLE. Note that allowNewBigQueryFields and allowBigQueryRequiredFieldRelaxation replaced the autoUpdateSchemas parameter of older versions of this connector.                                                                                                                                                                                         | false                                                             |
| allowSchemaUnionization              | If true, the existing table schema (if one is present) will be unionized with new record schemas during schema updates. If false, the record of the last schema in a batch will be used for any necessary table creation and schema update attempts.                                                                                                                                                                         | false                                                             |
| kafkaDataFieldName                   | The Kafka data field name. The default value is null, which means the Kafka Data field will not be included.                                                                                                                                                                                                                                                                                                                 | null                                                              |
| kafkaKeyFieldName                    | The Kafka key field name. The default value is null, which means the Kafka Key field will not be included.                                                                                                                                                                                                                                                                                                                   | null                                                              |
| topic2TableMap                       | Map of topics to tables (optional). Format: comma-separated tuples, e.g. <topic-1>:<table-1>,<topic-2>:<table-2>,.. Note that topic name should not be modified using regex SMT while using this option. Also note that SANITIZE_TOPICS_CONFIG would be ignored if this config is set. Lastly, if the topic2table map doesn’t contain the topic for a record, a table with the same name as the topic name would be created. | ""                                                                |

