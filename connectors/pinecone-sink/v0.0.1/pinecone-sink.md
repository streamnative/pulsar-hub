---
description: A connector to pinecone.io
author: StreamNative
contributors: illegalnumbers,dependabot[bot],shibd,streamnativebot
language: Java,Shell,Dockerfile
document:
source: Private source
license: StreamNative, Inc.. All Rights Reserved
license_link: 
tags: 
alias: pulsar-io-pinecone
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

## Pulsar IO :: Pinecone

This connector allows access to pinecone.io with a pulsar topic. The sink connector
takes in messages and writes them if they are in a proper format to a Pinecone
index.

### Installation

Pay for a license.
Download the image (from streamnative.io/pulsar-io-pinecone).

### Configuration

See conf/pulsar-io-template.yaml for more information. A basic configuration
requires at the very least.

1. A pinecone.io api key
2. A index name
3. A environment name
4. A project name
5. A namespace name
6. A connection url

### Examples

With the source connector you can connect to Pinecone with a valid configuration
and then write messages to it. An example using localrun is shown below.

```
pulsar-admin --admin-url http://localhost:8080/ sinks localrun --broker-service-url pulsar://localhost:6650/ --archive "file:///Users/your-user/src/pulsar-io-pinecone/target/pulsar-io-pinecone-0.0.1.jar" --classname "org.apache.pulsar.ecosystem.io.pinecone.PineconeConnectorSink" --name "pinecone" --sink-config '{ "apiKey": "abcd-123","indexName": "test","environment": "gcp-starter","project": "default", "namespace": "test", "connectionUrl": "test-project.svc.gcp-starter.pinecone.io", "dimensions": 1 }' --inputs persistent://public/default/pinecone-source
```

This can be used when building the JAR of the project from scratch using
`mvn clean install`.

Similar configuration can be setup when using an image mounted with a config file
defining environment variables or when using in Kubernetes.

### Monitoring

Currently we provide several metrics for monitoring.

- `pinecone-upsert-successful`
- `pinecone-upsert-failed`
- `pinecone-connector-active`
- `pinecone-upsert-failed-no-config`
- `pinecone-upsert-failed-no-client`
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
pulsar-client consume persistent://public/default/pinecone-source -s public/default/pinecone
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

### License

All rights reserved StreamNative 2024.


