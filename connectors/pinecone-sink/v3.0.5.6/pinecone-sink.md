---
description: A connector to pinecone.io
author: illegalnumbers,dependabot[bot],shibd,streamnativebot
contributors: illegalnumbers,dependabot[bot],shibd,streamnativebot
language: Java,Shell,Dockerfile
document:
source: Private source
license: StreamNative, Inc.. All Rights Reserved
license_link: 
tags: 
alias: Pinecone Connector
features: ["A connector to pinecone.io"]
icon: "/images/connectors/pinecone-logo.png"
download: 
support: streamnative
support_link: https://streamnative.io
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: 
sn_available: "true"
id: "pinecone-sink"
---


# Pinecone Sink Connector

This connector allows access to pinecone.io with a pulsar topic. The sink connector
takes in messages and writes them if they are in a proper format to a Pinecone
index.

![](https://raw.githubusercontent.com/streamnative/pulsar-io-pinecone/v3.0.5.6/docs/pinecone.png)

## Quick start

1. Pay for a license.
2. Create an index on pinecone.io

Do one of the following.

Either
-  Download the image (from streamnative/pulsar-io-pinecone).

or
- Run the connector directly on StreamNative Cloud.

And finally
-  Provide the configuration below and start the connector.

### Prerequisites

The prerequisites for connecting a Pinecone sink connector to external systems include:

1. A pinecone.io api key
2. A index name
3. A namespace name

See conf/pulsar-io-template.yaml for more information.

### 1. Create a connector

The following command shows how to use [pulsarctl](https://github.com/streamnative/pulsarctl) to create a `builtin` connector. If you want to create a `non-builtin` connector,
you need to replace `--sink-type pinecone` with `--archive /path/to/pulsar-io-pinecone.nar`. You can find the button to download the `nar` package at the beginning of the document.

{% callout title="For StreamNative Cloud User" type="note" %}
If you are a StreamNative Cloud user, you need [set up your environment](https://docs.streamnative.io/docs/connector-setup) first.
{% /callout %}

```bash
pulsarctl sink create \
  --sink-type pinecone \
  --name pinecone \
  --tenant public \
  --namespace default \
  --inputs "Your topic name" \
  --parallelism 1 \
  --sink-config \
  '{ "apiKey": "abcd-123","indexName": "test", "namespace": "test" }'
```

The `--sink-config` is the minimum necessary configuration for starting this connector, and it is a JSON string. You need to substitute the relevant parameters with your own.
If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

{% callout title="Note" type="note" %}
You can also choose to use a variety of other tools to create a connector:
- [pulsar-admin](https://pulsar.apache.org/docs/3.1.x/io-use/): The command arguments for `pulsar-admin` are similar to those of `pulsarctl`. You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector ).
- [RestAPI](https://pulsar.apache.org/sink-rest-api/?version=3.1.1): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Terraform](https://github.com/hashicorp/terraform): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Function Mesh](https://functionmesh.io/docs/connectors/run-connector): The docker image can be found at the beginning of the document.
{% /callout %}

### 2. Send messages to the topic

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

``` java
@Data
@ToString
public class TestMessage {
    public static void main(String[] args) {
        PulsarClient client = PulsarClient.builder()
        .serviceUrl("{{Your Pulsar URL}}")
        .build();

        Producer<String> producer = client.newProducer(Schema.STRING)
              .topic("my-topic")
              .create();

        String testMessage = '{ "id": "v1", "values": [1.0]}';

        MessageId msgID = producer.send(testMessage);
        System.out.println("Publish " + testMessage + " and message ID " + msgID);

        producer.flush();
        producer.close();
        client.close();
    }
}

```

### 3. Querying Data From Index

You can look in the query UI from Pinecone or you can run a raw Pinecone
query yourself using a client. There are several on the Pinecone website
which are listed including Python, Node, and cURL.

```python
# Taken from https://www.pinecone.io/
# Mock vectorized search query (vectorize with LLM of choice)
query = [0.1]  # len(query) = 1, same as the indexed vectors

# Send query with (optional) filter to index and get back 1 result (top_k=1)
index.query(
  vector=query,
  top_k=1
)
```

## Configuration Properties

Before using the Pinecone sink connector, you need to configure it. This table outlines the properties and the descriptions.

| Name                          | Type    | Required | Sensitive | Default           | Description                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------|---------|----------|-----------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| apiKey                          | string    | True | True | None           | The API key for the Pinecone service. Find this in the Pinecone dashboard.
| indexName                          | string    | True | False | None           | The name of the Pinecone index to which you want to write data. Find this in the Pinecone dashboard.
| namespace                          | string    | True | False | None           | The name of the Pinecone namespace to which you want to write data. Find this in the Pinecone dashboard.
| dimensions                          | integer    | False | False | None           | The number of dimensions required by the index. If a request is made to upsert data into an index with a different number of dimensions, the request will fail. If not provided the connector will make it's best attempt to upsert the data and if the connection fails due to a mismatch the message will eventually be DLQ'd.
| queryMetadata                          | JSON    | False | False | None           |  The metadata to be associated with the request to the index.This should be a JSON object in the form {"key": "value", "key2": "value2" }.

## Advanced features

### Monitoring

Currently we provide several metrics for monitoring.

- `pinecone-upsert-successful`
- `pinecone-upsert-failed`
- `pinecone-connector-active`
- `pinecone-upsert-failed-no-config`
- `pinecone-upsert-failed-no-client`
- `pinecone-upsert-failed-no-index-connection`
- `pinecone-upsert-failed-parsing-error`
- `pinecone-upsert-failed-dimension-error`

These can all be used to manage the connectors status.

### Troubleshooting

If you get a failed upsert problem the most likely candidate is the formatting
of your messages. These are required to be in a format like the following.

```
{ "id": "string", "values": [float, float, ...]}
```

or the form
```
{ "metadata": { "key": "value", "key2": "value2", ... }, id: "string", "values": [float, float, ...]}
```

Other likely candidates are problems with your connection to Pinecone. Check your
configuration values and any exceptions that are ocurring from the connector.

Some example commands for debugging locally are as follows.

Produce a sample message.

```
pulsar-client produce persistent://public/default/pinecone-source -m '{"id":"v1", "values": [3.0]}' -s '\n'
```

Clear a backlog of messages.
```
pulsar-admin --admin-url http://localhost:8080 topics clear-backlog --subscription public/default/pinecone persistent://public/default/pinecone-source
```

Delete a topic subscription.
```
pulsar-admin --admin-url http://localhost:8080 topics unsubscribe \
    --subscription public/default/pinecone \
    persistent://public/default/pinecone-source
```

Consume a group of messages.
```
pulsar-client consume -n 1 persistent://public/default/pinecone-source -s public/default/pinecone
```

If you need to add a maven shell using jenv you can do this with a
helpful script.
```
mvn dependency:build-classpath -DincludeTypes=jar -Dmdep.outputFile=.cp.txt
jshell --class-path `cat .cp.txt`:target/classes
```

And remember if you have maven problems on install that you need to
use JDK 8 with this project.

```
mvn --version # should be java 8
jenv exec mvn # if using jenv you can exec the local version using
              # this
```

### Delivery guarantees

The Pulsar IO connector framework provides three [delivery guarantees](https://pulsar.apache.org/docs/next/functions-concepts#processing-guarantees-and-subscription-types): `at-most-once`, `at-least-once`, and `effectively-once`.

Currently, the Pinecone sink connector provides the at-least-once delivery guarantee.

### Examples

With the source connector you can connect to Pinecone with a valid configuration
and then write messages to it. An example using localrun is shown below.

```
pulsar-admin --admin-url http://localhost:8080/ sinks localrun --broker-service-url pulsar://localhost:6650/ --archive "file:///Users/your-user/src/pulsar-io-pinecone/pinecone-connector/target/pulsar-io-pinecone-0.2.0.nar" --classname "org.streamnative.pulsar.io.pinecone.PineconeConnectorSink" --name "pinecone" --sink-config '{ "apiKey": "abcd-123","indexName": "test", "namespace": "test", "dimensions": 1 }' --inputs persistent://public/default/pinecone-source
```

This can be used when building the JAR of the project from scratch using
`mvn clean install`.

Similar configuration can be setup when using an image mounted with a config file
defining environment variables or when using in Kubernetes.

This table lists the schema types that currently are supported to be converted.

| Schema          | Supported |
|-----------------|-----------|
| AVRO            | No        |
| PRIMITIVE       | Yes       | (only bytes and string)
| PROTOBUF_NATIVE | Yes       |
| PROTOBUF        | No        |
| JSON            | Yes       |
| KEY_VALUE       | No        |


