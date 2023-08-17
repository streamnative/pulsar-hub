---
description: The Cloud Storage sink connector pulls messages from Pulsar topics and persists messages to Cloud Storage.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-io-cloud-storage/tree/v2.5.1/src/main/java/org/apache/pulsar/io/jcloud"
license: Apache License 2.0
tags: ["Pulsar IO", "Cloud Storage", "Sink"]
alias: Cloud Storage Sink
features: ["Use the Cloud Storage sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: /images/pulsar-hub.svg
download: "https://github.com/streamnative/pulsar-io-cloud-storage/releases/download/v2.5.1/pulsar-io-cloud-storage-2.5.1.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "io-cloud-storage-sink"
sn_available: true
---

# Overview

The Cloud Storage sink connector periodically polls data from Pulsar and in turn moves it to objects in cloud storage (AWS S3, Google GCS, etc.) in either Avro, JSON, or Parquet formats without duplicates. Depending on your environment, the Cloud Storage sink connector can export data by guaranteeing exactly-once delivery semantics to its consumers.

The Cloud Storage sink connector provides partitioners that support default partitioning based on Pulsar partitions and time-based partitioning in days or hours. A partitioner is used to split the data of every Pulsar partition into chunks. Each chunk of data acts as an object whose virtual path encodes the Pulsar partition and the start offset of this data chunk. The size of each data chunk is determined by the number of records written to objects in cloud storage and by schema compatibility.
If no partitioner is specified in the configuration, the default partitioner, which preserves Pulsar partitioning, is used. 

The Cloud Storage sink connector provides the following features:

- **Ensure exactly-once delivery.** Records, which are exported using a deterministic partitioner, are delivered with exactly-once semantics regardless of the eventual consistency of cloud storage.
- **Support data formats with or without a Schema.** The Cloud Storage sink connector supports writing data to objects in cloud storage in either Avro, JSON, or Parquet format. Generally, the Cloud Storage sink connector may accept any data format that provides an implementation of the `Format` interface.
- **Support time-based partitioner.** The Cloud Storage sink connector supports the `TimeBasedPartitioner` class based on the `publishTime` timestamp of Pulsar messages. Time-based partitioning options are daily or hourly.
- **Support more kinds of object storage.** The Cloud Storage sink connector uses jclouds as an implementation of cloud storage. You can use the JAR package of the jclouds object storage to connect to more types of object storage. If you need to customize credentials, you can register ʻorg.apache.pulsar.io.jcloud.credential.JcloudsCredential` via the Service Provider Interface (SPI).

# Installation

[Download](https://github.com/streamnative/pulsar-io-cloud-storage/releases) the NAR file of the Cloud Storage sink connector and then you can use the connector with Pulsar IO. For details, see [Usage](#usage).

In addition, you can also build the Cloud Storage sink connector from the source code. For details, see [here](https://github.com/streamnative/pulsar-io-cloud-storage#installation).

# Configuration

The Cloud Storage sink connector supports the following properties.

## Cloud Storage sink connector configuration

| Name | Type|Required | Default | Description |
|------|----------|----------|---------|-------------|
| `provider` |String| True | null | The Cloud Storage type, such as `aws-s3`,`gcs`.|
| `accessKeyId` |String| True | null | The Cloud Storage access key ID. |
| `secretAccessKey` | String| True | null | The Cloud Storage secret access key. |
| `role` | String |False | null | The Cloud Storage role. |
| `roleSessionName` | String| False | null | The Cloud Storage role session name. |
| `bucket` | String| True | null | The Cloud Storage bucket. |
| `endpoint` | String| False | null | The Cloud Storage endpoint. |
| `formatType` | String| False | "json" | The data format type. Available options are JSON, Avro, or Parquet. By default, it is set to JSON. |
| `partitionerType` | String| False |"partition" | The partitioning type. It can be configured by topic partitions or by time. By default, the partition type is configured by topic partitions. |
| `timePartitionPattern` | String| False |"yyyy-MM-dd" | The format pattern of the time-based partitioning. For details, refer to the Java date and time format. |
| `timePartitionDuration` | String| False |"1d" | The time interval for time-based partitioning, such as 1d, or 1h. |
| `batchSize` | int | False |10 | The number of records submitted in batch. |
| `batchTimeMs` | long | False |1000 | The interval for batch submission. |

## Configure Cloud Storage sink connector

Before using the Cloud Storage sink connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
       "tenant": "public",
       "namespace": "default",
       "name": "cloud-storage-sink",
       "inputs": [
          "user-avro-topic"
       ],
       "archive": "connectors/pulsar-io-cloud-storage-0.0.1.nar",
       "parallelism": 1,
       "configs": {
          "provider": "aws-s3",
          "accessKeyId": "accessKeyId",
          "secretAccessKey": "secretAccessKey",
          "role": "none",
          "roleSessionName": "none",
          "bucket": "testBucket",
          "region": "local",
          "endpoint": "us-standard",
          "formatType": "parquet",
          "partitionerType": "time",
          "timePartitionPattern": "yyyy-MM-dd",
          "timePartitionDuration": "1d",
          "batchSize": 10,
          "batchTimeMs": 1000
       }
    }
    ```
    
* YAML

    ```yaml
    tenant: "public"
    namespace: "default"
    name: "cloud-storage-sink"
    inputs: 
      - "user-avro-topic"
    archive: "connectors/pulsar-io-cloud-storage-0.0.1.nar"
    parallelism: 1
    
    configs:
      provider: "aws-s3",
      accessKeyId: "accessKeyId"
      secretAccessKey: "secretAccessKey"
      role: "none"
      roleSessionName: "none"
      bucket: "testBucket"
      region: "local"
      endpoint: "us-standard"
      formatType: "parquet"
      partitionerType: "time"
      timePartitionPattern: "yyyy-MM-dd"
      timePartitionDuration: "1d"
      batchSize: 10
      batchTimeMs: 1000
    ```

# Usage

1. Prepare the Cloud Storage service. In this example, we use `s3mock` as an example.

    ```
    docker pull apachepulsar/s3mock:latest
    docker run -p 9090:9090 -e initialBuckets=pulsar-integtest apachepulsar/s3mock:latest
    ```

2. Put the `pulsar-io-cloud-storage-2.5.1.nar` in the Pulsar connector catalog.

    ```
    cp pulsar-io-cloud-storage-2.5.1.nar $PULSAR_HOME/connectors/pulsar-io-cloud-storage-2.5.1.nar
    ```

3. Start Pulsar in the standalone mode.

    ```
    $PULSAR_HOME/bin/pulsar standalone
    ```

4. Run the Cloud Storage sink connector locally.

    ```
    $PULSAR_HOME/bin/pulsar-admin sink localrun --sink-config-file cloud-storage-sink-config.yaml
    ```

5. Send Pulsar messages. Currently, only Avro or JSON schema is supported.

   ```java
     try (
                PulsarClient pulsarClient = PulsarClient.builder()
                        .serviceUrl("pulsar://localhost:6650")
                        .build();
                Producer<TestRecord> producer = pulsarClient.newProducer(Schema.AVRO(TestRecord.class))
                        .topic("public/default/test-parquet-avro")
                        .create();
                ) {
                List<TestRecord> testRecords = Arrays.asList(
                        new TestRecord("key1", 1, null),
                        new TestRecord("key2", 1, new TestRecord.TestSubRecord("aaa"))
                );
                for (TestRecord record : testRecords) {
                    producer.send(record);
                }
            }
   ```

6. Validate Cloud Storage data.

    To get the path, you can use the [jclould](https://jclouds.apache.org/start/install/) to verify the file, as shown below.
    ```java
    Properties overrides = new Properties();
    overrides.put(“jclouds.s3.virtual-host-buckets”, “false”);
    BlobStoreContext blobStoreContext = ContextBuilder.newBuilder(“aws-s3”)
            .credentials(
                    “accessKeyId”,
                    “secretAccessKey”
            )
            .endpoint(“http://localhost:9090”) // replace to s3mock url
            .overrides(overrides)
            .buildView(BlobStoreContext.class);
    BlobStore blobStore = blobStoreContext.getBlobStore();
    final long sequenceId = FunctionCommon.getSequenceId(message.getMessageId());
    final String path = “public/default/test-parquet-avro” + File.separator + “2020-09-14" + File.separator + sequenceId + “.parquet”;
    final boolean blobExists = blobStore.blobExists(“testBucket”, path);
    Assert.assertTrue(“the sink record does not exist”, blobExists);
    ```
    You can find the data in your `testBucket` Bucket. The path is something like `public/default/test-parquet-avro/2020-09-14/1234.parquet`.
    The path consists of three parts, the basic part of the topic, partition information, and format suffix.
    - Basic part of topic: `public/default/test-parquet-avro/`
        This part consists of the tenant, namespace, and topic name of the input topic.
    - Partition information: `2020-09-14/${messageSequenceId}`
        The date is generated based on the `partitionerType` parameter in the configuration. And the `${messageSequenceId}` is generated by `FunctionCommon.getSequenceId(message.getMessageId())`.
    - Format suffix: `.parquet`
        This part is generated based on the `formatType` parameter in the configuration.
