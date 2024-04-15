---
description: The Pinecone Sink connector pulls data from a Pulsar topic and then stores it into a Pinecone Index.
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document:
source: "https://github.com/streamnative/pulsar-io-pinecone/"
license: Proprietary
tags: ["Pulsar IO", "Pinecone", "Sink"]
alias: Pinecone Sink
features: ["Use Pinecone sink connector to sync data from Pulsar"]
license_link: ""
icon: "/images/connectors/pinecone.png"
download: "https://api.github.com/repos/streamnative/pulsar-io-pinecone/tarball/refs/tags/v0.0.1"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile:
id: "pinecone-sink"
---

The Pinecone sink connector pulls messages from Pulsar topics and persist the messages to Pinecone indices.


# Configuration

The configuration of the Pinecone sink connector has the following properties.


## Property

| Name | Type|Required | Default | Description
|------|----------|----------|---------|-------------|
| `apiKey` |String| true | " " (empty string) | The key to connect to Pinecone. |
| `indexName` |String| true | " " (empty string) | The index to push data to. |
| `environment` |String| true | " " (empty string) | The environment to push data to. |
| `project` |String| true | " " (empty string) | The project to push the data to. |
| `namespace` |String| true | " " (empty string) | The namespace to push the data to. |
| `connectionUrl` |String| true | " " (empty string) | The URL provided by Pinecone to connect to the index. |
| `dimensions` |Integer| true | null | The number of dimensions in the index, this is setup when creating the index. |
| `queryMetadata` | JSON string of the format { "key": "value" } | false | null | Additional query metadata to add to each record persisted in Pinecone. This can also be added to the message on the topic directly. |



## Example

Before using the Pinecone sink connector, you need to create a configuration file through one of the following methods.

* JSON

    ```json
    {
        "apiKey": "1234-abcde"
        "indexName": "my-index"
        "environment": "my-environment"
        "project": "my-project"
        "namespace": "my-namespace"
        "connectionUrl": "https://test-asdf.my-environment.pinecone.io"
        "dimensions": "1"
        "queryMetadata": "{ \"key\": \"value\" }'"
    }
    ```

* YAML

    ```yaml
    configs:
        apiKey: 1234-abcde
        indexName: my-index
        environment: my-environment
        project: my-project
        namespace: my-namespace
        connectionUrl: https://test-asdf.my-environment.pinecone.io
        dimensions: 1
        queryMetadata: '{ "key": "value" }'
    ```

Messages must then be sent on the topic in the following JSON formats.

```
{ "id": "string", "values": [float, float, ...]}
```

or the form
```
{ "metadata": { "key": "value", "key2": "value2", ... }, id: "string", "values": [float, float, ...]}
```

If you add the `metadata` key to your message the metadata provided will be used in the vector uploaded to the Pinecone index.

# Examples

With the sink connector you can connect to Pinecone with a valid configuration
and then write messages to it. An example using localrun is shown below.

```
pulsar-admin --admin-url http://localhost:8080/ sinks localrun --broker-service-url pulsar://localhost:6650/ --archive "file:///Users/your-user/src/pulsar-io-pinecone/target/pulsar-io-pinecone-0.0.1.jar" --classname "org.apache.pulsar.ecosystem.io.pinecone.PineconeConnectorSink" --name "pinecone" --sink-config '{ "apiKey": "abcd-123","indexName": "test","environment": "gcp-starter","project": "default", "namespace": "test", "connectionUrl": "test-project.svc.gcp-starter.pinecone.io", "dimensions": 1 }' --inputs persistent://public/default/pinecone-source
```

# Monitoring

Currently we provide several metrics for monitoring.

- `pinecone-upsert-successful`
- `pinecone-upsert-failed`
- `pinecone-connector-active`
- `pinecone-upsert-failed-no-config`
- `pinecone-upsert-failed-no-client`
- `pinecone-upsert-failed-parsing-error`
- `pinecone-upsert-failed-dimension-error`

These can all be used to manage the connectors status.

# Troubleshooting

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
