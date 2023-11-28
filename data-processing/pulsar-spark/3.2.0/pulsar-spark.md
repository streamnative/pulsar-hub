---
description: Pulsar Spark Connector allows Spark to read data from Pulsar and write data  to Pulsar
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-spark/tree/release-3.2.0.2"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["Pulsar", "Spark", "Connector"]
alias: Pulsar Spark Connector
features: ["Pulsar Spark Connector allows Spark to read data from Pulsar and write data to Pulsar"]
icon: "/images/data-processing/spark-logo.png"
download: "https://github.com/streamnative/pulsar-spark/releases/tag/release-3.2.0.2"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "pulsar-spark"
---

Pulsar Spark Connector is an integration of [Apache Pulsar](https://pulsar.apache.org/en/) and [Apache Spark](https://spark.apache.org/) (data processing engine), which allows Spark to read data from Pulsar and write data to Pulsar using Spark structured streaming and Spark SQL and provides exactly-once source semantics and at-least-once sink semantics.

![](/images/data-processing/pulsar-spark-connector.png)

# How it Works

This illustration shows how the Pulsar Spark source connector transfers data from a Pulsar topic to a Spark job.

![](/images/data-processing/pulsar-spark-how-it-works-1.png)

As you can see from the above illustration, each Pulsar topic partition is mapped into a `PulsarSourceRDD` partition. When a Spark job executes a new microbatch, the Pulsar Spark connector requests new data from Pulsar for each `PulsarSourceRDD` partition. In the Spark cluster, the data request tasks are assigned to available executors. All of the available data for each partition since the last consumption are read from the Pulsar topic partition. And, the Spark job continuously creates new microbatches in a user-defined triggering interval and processes the fetched data accordingly. This process repeats until the Spark job is canceled. Once the data is fetched, you can do any operations, including shuffling.

After a microbatch, the offset is committed. Therefore, the next microbatch starts with newly incoming data since the last offset.

For failure recovery, the offsets of each partition are stored into the Spark’s checkpoint. And each time a Spark job is launched, it first tries to restore reading offsets from the state store. If there are offsets saved for this job, the Spark job reads data from the saved offsets. Otherwise, the Spark job reads data from a user-defined position of the topic.

The whole life cycle of a structured streaming job is illustrated in the figure below. As time goes by, each interval yields a new microbatch of data that is then processed by the Spark job.

![](/images/data-processing/pulsar-spark-how-it-works-2.png)

> **Limitation**

> Currently, the Spark connector provides `at-least-once` semantics. Therefore, when the Spark connector writes streaming or batch queries to Pulsar, some records may be duplicated. A possible solution to remove duplicates could be to introduce a primary (unique) key that can be used to perform deduplication when reading data.

# How to configure

You can set the following configurations for the Pulsar Spark connector.

{% raw-html %}
<table class="table">
<tr><th>Option</th><th>Value</th><th>Required</th><th>Default</th><th>QueryType</th><th>Description</th></tr>
<tr>
  <td><code>service.url</code></code></td>
  <td>The Pulsar <code>serviceUrl</code> configuration.</td>
  <td>Yes</td>
  <td>None</td>
  <td>Streaming and batch queries</td>
  <td>The broker service URL of your Pulsar cluster, such as "pulsar://localhost:6650".</td>
</tr>
<tr>
  <td><code>admin.url</code> (Deprecated)</td>
  <td>The Pulsar <code>serviceHttpUrl</code> configuration.</td>
  <td>No</td>
  <td>None</td>
  <td>Streaming and batch queries</td>
  <td>The HTTP service URL of your Pulsar cluster.</td>
</tr>
<tr>
  <td><code>predefinedSubscription</code></td>
  <td>A subscription name string</td>
  <td>No</td>
  <td>None</td>
  <td>Streaming and batch queries</td>
  <td>The pre-defined subscription name that is used by the Spark connector to track the Spark application progress.</td>
</tr>
<tr>
    <td><code>subscriptionPrefix</code></td>
    <td>A subscription prefix string</td>
    <td>No</td>
    <td>None</td>
    <td>Streaming and batch queries</td>
    <td>The prefix that is used by the Spark connector to generate a random subscription to track the Spark application progress.</td>
</tr>
<tr>
  <td><code>topic</code></td>
  <td>A topic name string</td>
  <td>Yes</td>
  <td>None</td>
  <td>Streaming and batch queries</td>
  <td>The topic to be consumed. This option is exclusive to the <code>topics</code> and <code>topicsPattern</code> options. This option is available for the Pulsar Spark source.</td>
</tr>
<tr>
  <td><code>topics</code></td>
  <td>A comma-separated list of topics</td>
  <td>Yes</td>
  <td>None</td>
  <td>Streaming and batch queries</td>
  <td>The list of topics to be consumed. This option is exclusive to the <code>topic</code> and <code>topicsPattern</code> options. This option is available for the Pulsar Spark source.</td>
</tr>
<tr>
  <td><code>topicsPattern</code></td>
  <td>A Java regex string</td>
  <td>Yes</td>
  <td>None</td>
  <td>Streaming and batch queries</td>
  <td>The pattern used to subscribe to topic(s). This option is exclusive to the <code>topic</code> and <code>topics</code> options. This option is available for the Pulsar Spark source.</td>
</tr>
<tr>
  <td><code>poolTimeoutMs</code></td>
  <td>A number string in unit of milliseconds </td>
  <td>No</td>
  <td>"120000"</td>
  <td>Streaming and batch queries</td>
  <td>The timeout for reading messages from Pulsar, such as <code>6000</code>.</td>
</tr>
<tr>
  <td><code>waitingForNonExistedTopic`</td>
  <td>
  * <code>true</code><br>
  * <code>false</code>
  </td>
  <td>No</td>
  <td>"false"</td>
  <td>Streaming and batch queries</td>
  <td>Whether the Spark connector should wait until the desired topics are created. By default, the Spark connector will not wait for the topic.</td>
</tr>
<tr>
  <td><code>startingOffsets</code></td>
  <td>
  * "earliest" (streaming and batch queries)<br>
  * "latest" (streaming query)<br>
  * A JSON string, such as """ {""topic-1"":[8,11,16,101,24,1,32,1],""topic-5"":[8,15,16,105,24,5,32,5]} """
  </td>
  <td>No</td>
  <td>
   * Batch query: "earliest"<br> 
   * Streaming query: "latest"</td>
  <td>Streaming and batch queries</td>
  <td> The <code>startingOffsets</code> option specifies the position where a Reader reads data from.<br>* "earliest": the Reader reads all the data in the partition, starting from the very beginning.<br>* "latest": the Reader reads data from the newest records that are written after the Reader starts running.<br>* A JSON string: specifies a starting offset for each topic. You can use <code>org.apache.spark.sql.pulsar.JsonUtils.topicOffsets(Map[String, MessageId])</code> to convert a message offset to a JSON string.<br><b>Note</b>:<br>For the batch query, the "latest" option is not allowed, either implicitly specified or use <code>MessageId.latest ([8,-1,-1,-1,-1,-1,-1,-1,-1,127,16,-1,-1,-1,-1,-1,-1,-1,-1,127])</code> in JSON. For the streaming query, the "latest" option applies only when a new query is started, and the resuming always picks up from where the query left off. Newly discovered partitions during a query will start at "earliest". </td>
</tr>
<tr>
  <td><code>endingOffsets</code></td>
  <td>
  * "latest" (batch query)<br>
  * A JSON string, such as "topic-1":[8,12,16,102,24,2,32,2],"topic-5":[8,16,16,106,24,6,32,6]}
  </td>
  <td>No</td>
  <td>"latest"</td>
  <td>Batch query</td>
  <td> The <code>endingOffsets</code> option specifies where a Reader stops reading data.<br />* "latest": the Reader stops reading data at the latest record.<br />* A JSON string: specifies an ending offset for each topic.<br><br><b>Note</b>:<br><br><code>MessageId.earliest ([8,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,16,-1,-1,-1,-1,-1,-1,-1,-1,-1,1])</code> is not allowed.</td>
</tr>
<tr>
  <td><code>failOnDataLoss`</td>
  <td>
  * <code>true</code><br>
  * <code>false</code>
  </td>
  <td>No</td>
  <td>true</td>
  <td>Streaming query</td>
  <td>Specify whether to fail a query when data is lost (For example, topics or messages are deleted because of the retention policy). This may cause a false alarm. You can set it to <code>false</code> when it does not work as you expected. A batch query always fails if it fails to read any data from the provided offsets due to data loss.</td>
</tr>
<tr>
  <td><code>allowDifferentTopicSchemas`</td>
  <td> Boolean value </td>
  <td>No</td>
  <td><code>false</code></td>
  <td> Streaming query  </td>
  <td>If it is set to <code>false</code>, schema-based topics are not automatically deserialized, when multiple topics with different schemas are read. In that way, topics with different schemas can be read in the same pipeline, which is then responsible for deserializing the raw values based on some schema. Since only the raw values are returned when it is set to <code>true</code>, Pulsar topic schema(s) are not taken into account during operation.</td>
</tr>
<tr>
  <td><code>pulsar.client.*</code></td>
  <td>Pulsar Client related settings</td>
  <td>No</td>
  <td>None</td>
  <td>Streaming and batch queries</td>
  <td>A Pulsar client instance is shared among all threads within one executor. You can set Pulsar client related settings with <code>pulsar.client.*</code> option. For details, see <a href="https://pulsar.apache.org/docs/client-libraries-java/#client">Pulsar Client Configuration</a>.</td>
</tr>
<tr>
  <td><code>pulsar.reader.*</code></td>
  <td>Pulsar Reader related settings</td>
  <td>No</td>
  <td>None</td>
  <td>Streaming and batch queries</td>
  <td>Data in Pulsar topics are read out using the Pulsar Reader API. Therefore, you can configure Reader-related settings by specifying the <code>pulsar.reader.*</code> option. For details, see <a href="https://pulsar.apache.org/docs/client-libraries-java/#configure-reader">Pulsar Reader Configuration</a>.</td>
</tr>
<tr>
  <td><code>pulsar.producer.*</code></td>
  <td>Pulsar Producer related settings</td>
  <td>No</td>
  <td>None</td>
  <td>Streaming and batch queries</td>
  <td> Data in Pulsar topics is actually written out using the Pulsar Producer API. Therefore, you can configure Producer-related settings by specifying the <code>pulsar.producer.*</code> option. For details, see <a href="https://pulsar.apache.org/docs/client-libraries-java/#configure-producer">Pulsar Producer Configuration</a>.</td>
</tr>
</table>
{% /raw-html %}

### Schema of Pulsar Spark source

- For Pulsar topics without schema or with primitive schema, messages' payloads are loaded to a `value` column with the corresponding Pulsar schema type.
- For topics with Avro or JSON schema, their field names and field types are kept in the result rows.
- If the `topicsPattern` matches topics that have different schemas, then setting `allowDifferentTopicSchemas` to `true` allows the Pulsar Spark source to read this content in a raw form. In this case, it is the responsibility of the pipeline to apply the schema on this content, which is loaded to the `value` column. 

In addition, each row in the Pulsar Spark source has the following metadata fields.

| Column | Type |
| --- | --- |
| `__key` | Binary |
| `__topic` | String |
| `__messageId` | Binary |
| `__publishTime` | Timestamp |
| `__eventTime` | Timestamp|
| `__messageProperties` | Map &lt String, String &gt |

**Example**

In Pulsar, a topic with AVRO schemas looks like the following: 

```scala
  case class Foo(i: Int, f: Float, bar: Bar)
  case class Bar(b: Boolean, s: String)
  val s = Schema.AVRO(Foo.getClass)
```

When the data is exported to a Spark DataFrame/DataSet, it looks like the following:

```
root
 |-- i: integer (nullable = false)
 |-- f: float (nullable = false)
 |-- bar: struct (nullable = true)
 |    |-- b: boolean (nullable = false)
 |    |-- s: string (nullable = true)
 |-- __key: binary (nullable = true)
 |-- __topic: string (nullable = true)
 |-- __messageId: binary (nullable = true)
 |-- __publishTime: timestamp (nullable = true)
 |-- __messageProperties: map (nullable = true)
 |    |-- key: string
 |    |-- value: string (valueContainsNull = true)
 ```

This example shows how Pulsar data with `Schema.DOUBLE` schema looks like in the Spark DataFrame:

```
root
 |-- value: double (nullable = false)
 |-- __key: binary (nullable = true)
 |-- __topic: string (nullable = true)
 |-- __messageId: binary (nullable = true)
 |-- __publishTime: timestamp (nullable = true)
 |-- __eventTime: timestamp (nullable = true)
 |-- __messageProperties: map (nullable = true)
 |    |-- key: string
 |    |-- value: string (valueContainsNull = true)
```

## Security configurations

If the Pulsar cluster requires authentication, you can set credentials in any of the following ways.

### Scenario 1

When a Pulsar cluster is enabled with authentication and the Pulsar client and Pulsar Admin use the same credential, you can configure the Spark connector as below:

```scala
val df = spark
  .readStream
  .format("pulsar")
  .option("service.url", "pulsar://localhost:6650")
  .option("pulsar.client.authPluginClassName","org.apache.pulsar.client.impl.auth.AuthenticationToken")
  .option("pulsar.client.authParams","token:<valid client JWT token>")
  .option("topicsPattern", "sensitiveTopic")
  .load()
df.selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
  .as[(String, String)]
```

- `service.url`: the service URL of your Pulsar cluster
- `pulsar.client.authParams`: the JWT token used for authentication, in a format of `token:<your_JWT_token>`

### Scenario 2

When a Pulsar cluster is enabled with TLS authentication and the Pulsar client and Pulsar Admin use different credentials, you can configure the Spark connector as below:

```scala
val df = spark
  .readStream
  .format("pulsar")
  .option("service.url", "pulsar+ssl://localhost:6651")
  .option("pulsar.admin.authPluginClassName","org.apache.pulsar.client.impl.auth.AuthenticationToken")
  .option("pulsar.admin.authParams","token:<valid admin JWT token>")
  .option("pulsar.client.authPluginClassName","org.apache.pulsar.client.impl.auth.AuthenticationToken")
  .option("pulsar.client.authParams","token:<valid client JWT token>")
  .option("pulsar.client.tlsTrustCertsFilePath","/path/to/tls/cert/cert.pem")
  .option("pulsar.client.tlsAllowInsecureConnection","false")
  .option("pulsar.client.tlsHostnameVerificationenable","true")
  .option("topicsPattern", "sensitiveTopic")
  .load()
df.selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
  .as[(String, String)]
```

- `service.url`: the service URL of your Pulsar cluster
- `pulsar.admin.authParams`: the JWT token used for Pulsar Admin authentication, in a format of `token:<your_admin_JWT_token>`
- `pulsar.client.authParams`: the JWT token used for Pulsar client authentication, in a format of `token:<your_client_JWT_token>`
- `pulsar.client.tlsTrustCertsFilePath`: the path to the certification file. The certificate file must be at the specified path on every machine of the Pulsar cluster.

# How to deploy

You can use one of the following methods to use the Pulsar Spark connector and you need to configure it before using the connector.

- [Client library](#client-library): you can use all the features of Pulsar Spark connector (Java and Scala). 
- [CLI](#cli): you can use all the features of Pulsar Spark connector in interactive mode (Scala).

## Client library

As with any Spark applications, `spark-submit` is used to launch your application. You can use the `--packages` option to add `pulsar-spark-connector_{{SCALA_BINARY_VERSION}}` and its dependencies directly to `spark-submit`.  

**Example**

```shell
./bin/spark-submit 
--packages io.streamnative.connectors:pulsar-spark-connector_{{SCALA_BINARY_VERSION}}:{{PULSAR_SPARK_VERSION}}
--repositories https://dl.bintray.com/streamnative/maven
...
```

## CLI

For experimenting on `spark-shell` (or `pyspark` for Python), you can also use the `--packages` option to add `pulsar-spark-connector_{{SCALA_BINARY_VERSION}}` and its dependencies directly.

**Example**

```shell
./bin/spark-shell 
--packages io.streamnative.connectors:pulsar-spark-connector_{{SCALA_BINARY_VERSION}}:{{PULSAR_SPARK_VERSION}}
--repositories https://dl.bintray.com/streamnative/maven
...
```

When locating an artifact or library, the `--packages` option checks the following repositories in order:

1. Local maven repository

2. Maven central repository

3. Other repositories specified by the `--repositories` option

The format for the coordinates should be `groupId:artifactId:version`.

{% callout title="Tip" type="tip" %}
For more information about **submitting applications with external dependencies**, see [application submission guide](https://spark.apache.org/docs/latest/submitting-applications.html).
{% /callout %}

# How to use

This section describes how to create Pulsar Spark source and sink connectors to transmit data between the Pulsar cluster and the Spark cluster.

## Read data from Pulsar

The section describes how to create a Pulsar Spark source for streaming and batching queries.

### Prerequisites

- [Deploy the Pulsar Spark connector](#how-to-deploy). 
- [Install Scala 2.12.10](https://docs.scala-lang.org/scala3/getting-started.html).
- [Install Spark 3.2.2 or above](https://spark.apache.org/downloads.html).
- [Install Pulsar 2.10.2 or above](https://pulsar.apache.org/docs/en/standalone/).

### Create a Pulsar Spark source for streaming queries

- This example shows that the Pulsar Spark source reads data from one Pulsar topic (`topic1`) to the Spark cluster.

  ```scala
  val df = spark
    .readStream
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .option("topic", "topic1")
    .load()
  df.selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
    .as[(String, String)]
  ```

- This example shows that the Pulsar Spark source reads data from multiple Pulsar topics (`topic1` and `topic2`) to the Spark cluster.

  ```scala
  val df = spark
    .readStream
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .option("topics", "topic1,topic2")
    .load()
  df.selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
    .as[(String, String)]
  ```

- This example shows that the Pulsar Spark source subscribes to a topic pattern.

  ```scala
  val df = spark
    .readStream
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .option("topicsPattern", "topic.*")
    .load()
  df.selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
    .as[(String, String)]
  ```

{% callout title="Tip" type="tip" %}
For more information on how to use other language bindings for Spark structured streaming, see [Structured Streaming Programming Guide](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html).
{% /callout %}

### Create a Pulsar Spark source for batch queries

For batch processing, you can create a Dataset/DataFrame for a defined range of offsets.

- This example shows how a Pulsar Spark source reads data from one topic (`topic1`) from the very beginning (`earliest`) to the newest records (`latest`) that are written after the Reader starts running. 

  ```scala
  val df = spark
    .read
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .option("topic", "topic1")
    .load()
  df.selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
    .as[(String, String)]
  ```

- This example shows how a Pulsar Spark source reads data from multiple topics (`topic1` and `topic2`) from the specific offset.

  ```scala
  import org.apache.spark.sql.pulsar.JsonUtils._
  val startingOffsets = topicOffsets(Map("topic1" -> messageId1, "topic2" -> messageId2))
  val endingOffsets = topicOffsets(...)
  val df = spark
    .read
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .option("topics", "topic1,topic2")
    .option("startingOffsets", startingOffsets)
    .option("endingOffsets", endingOffsets)
    .load()
  df.selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
    .as[(String, String)]
  ```

- This example shows how a Pulsar Spark source subscribes to a topic pattern with `earliest` starting offset and `latest` ending offset.

  ```scala
  val df = spark
    .read
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .option("topicsPattern", "topic.*")
    .option("startingOffsets", "earliest")
    .option("endingOffsets", "latest")
    .load()
  df.selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
    .as[(String, String)]
  ```

## Write data to Pulsar

The DataFrame written to Pulsar can have arbitrary schema. Since each record in DataFrame is transformed as one message sent to Pulsar, fields of DataFrame are divided into two groups. `__key` and `__eventTime` fields are encoded as metadata of Pulsar messages. Other fields are grouped and encoded using AVRO and put in `value()`.

```scala
producer.newMessage().key(__key).value(avro_encoded_fields).eventTime(__eventTime)
```

### Prerequisites

- [Deploy the Pulsar Spark connector](#how-to-deploy). 
- [Install Scala 2.12.10](https://docs.scala-lang.org/scala3/getting-started.html).
- [Install Spark 3.2.2 or above](https://spark.apache.org/downloads.html).
- [Install Pulsar 2.10.2 or above](https://pulsar.apache.org/docs/en/standalone/).

### Create a Pulsar Spark sink for streaming queries

- This example shows how to write key-value data from a DataFrame to a specific Pulsar topic (`topic1`).

  ```scala
  val ds = df
    .selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
    .writeStream
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .option("topic", "topic1")
    .start()
  ```

- This example shows how to write key-value data from a DataFrame to Pulsar using a topic specified in the data.

  ```scala
  val ds = df
    .selectExpr("__topic", "CAST(__key AS STRING)", "CAST(value AS STRING)")
    .writeStream
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .start()
  ```

### Create a Pulsar Spark sink for batch queries

- This example shows how to write key-value data from a DataFrame to a specific Pulsar topic (`topic1`).

  ```scala
  df.selectExpr("CAST(__key AS STRING)", "CAST(value AS STRING)")
    .write
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .option("topic", "topic1")
    .save()
  ```

- This example shows how to write key-value data from a DataFrame to Pulsar using a topic specified in the data.

  ```scala
  df.selectExpr("__topic", "CAST(__key AS STRING)", "CAST(value AS STRING)")
    .write
    .format("pulsar")
    .option("service.url", "pulsar://localhost:6650")
    .save()
  ```