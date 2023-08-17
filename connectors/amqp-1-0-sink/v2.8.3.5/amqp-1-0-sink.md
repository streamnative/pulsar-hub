---
description: support sink/source for AMQP version 1.0.0
author: gaoran10,Anonymitaet,dependabot[bot],timmyyuan
contributors: gaoran10,Anonymitaet,dependabot[bot],timmyyuan
language: Java,Shell,Python,Dockerfile
document:
source: "https://github.com/streamnative/pulsar-io-amqp-1-0"
license: Apache License 2.0
license_link: "https://github.com/streamnative/pulsar-io-amqp-1-0/blob/master/LICENSE"
tags: 
alias: AMQP1_0 Sink Connector
features: ["support sink/source for AMQP version 1.0.0"]
icon: /images/connectors/amqp-logo.png
download: "https://api.github.com/repos/streamnative/pulsar-io-amqp-1-0/tarball/refs/tags/v2.8.3.5"
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-amqp-1-0
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: ""
sn_available: true
id: "amqp-1-0-sink"
---

# AMQP1_0 sink connector

The AMQP1_0 sink connector pulls messages from Pulsar topics and persists messages to [AMQP 1.0](https://www.amqp.org/).

![](https://raw.githubusercontent.com/streamnative/pulsar-io-amqp-1-0/v2.8.3.5/docs/amqp-1-0-sink.png)

# How to get 

You can get the AMQP1_0 sink connector using one of the following methods:

* Download the NAR package from [here](https://github.com/streamnative/pulsar-io-amqp-1-0/releases/download/v2.7.1.1/pulsar-io-amqp1_0-2.7.1.1.nar).

* Build it from source code.

  1. Clone the source code to your machine.

        ```bash
        git clone https://github.com/streamnative/pulsar-io-amqp-1-0
        ```

  2. Assume that `PULSAR_IO_AMQP1_0_HOME` is the home directory for the `pulsar-io-amqp1_0` repo. Build the connector in the `${PULSAR_IO_AMQP1_0_HOME}` directory.

        ```bash
        mvn clean install -DskipTests
        ```

        After the connector is successfully built, a `NAR` package is generated under the `target` directory.

        ```bash
        ls pulsar-io-amqp1_0/target
        pulsar-io-amqp1_0-{version}.nar
        ```

# How to configure 

Before using the AMQP1_0 sink connector, you need to configure it.

You can create a configuration file (JSON or YAML) to set the following properties.

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `protocol` |String| true | "amqp" | The AMQP protocol. |
| `host` | String| true | " " (empty string) | The AMQP service host. |
| `port` | int |true | 5672 | The AMQP service port. |
| `username` | String|false | " " (empty string) | The username used to authenticate to ActiveMQ. |
| `password` | String|false | " " (empty string) | The password used to authenticate to ActiveMQ. |
| `queue` | String|false | " " (empty string) | The queue name that messages should be read from or written to. |
| `topic` | String|false | " " (empty string) | The topic name that messages should be read from or written to. |
| `activeMessageType` | String|false |0 | The ActiveMQ message simple class name. |
| `onlyTextMessage` | boolean | false | false | If it is set to `true`, the AMQP message type must be set to `TextMessage`. Pulsar consumers can consume the messages with schema ByteBuffer. |

**Example**

* JSON 

    ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "amqp1_0-sink",
        "inputs": ["user-op-queue-topic"],
        "archive": "connectors/pulsar-io-amqp1_0-{version}.nar",
        "parallelism": 1,
        "configs":
        {
            "protocol": "amqp",
            "host": "localhost",
            "port": "5672",
            "username": "guest",
            "password": "guest",
            "queue": "user-op-queue-pulsar"
        }
    }
    ```

* YAML

    ```yaml
    tenant: "public"
    namespace: "default"
    name: "amqp1_0-sink"
    inputs: 
      - "user-op-queue-topic"
    archive: "connectors/pulsar-io-amqp1_0-{version}.nar"
    parallelism: 1
    
    configs:
        protocol: "amqp"
        host: "localhost"
        port: "5672"
        username: "guest"
        password: "guest"
        queue: "user-op-queue-pulsar"
    ```

# How to use

You can use the AMQP1_0 sink connector as a non built-in connector or a built-in connector as below. 

## Use as non built-in connector 

If you already have a Pulsar cluster, you can use the AMQP1_0 sink connector as a non built-in connector directly.

This example shows how to create an AMQP1_0 sink connector on a Pulsar cluster using the command [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24).


```
PULSAR_HOME/bin/pulsar-admin sinks create \
--name amqp1_0-sink \
--archive pulsar-io-amqp1_0-{version}.nar \
--classname org.apache.pulsar.ecosystem.io.amqp.AmqpSink \
--sink-config-file amqp-sink-config.yaml
```

## Use as built-in connector

You can make the AMQP1_0 sink connector as a built-in connector and use it on standalone cluster, on-premises cluster, or K8S cluster.

### Standalone cluster

1. Prepare AMQP service using Solace.

    ```
    docker run -d -p 8080:8080 -p:8008:8008 -p:1883:1883 -p:8000:8000 -p:5672:5672 -p:9000:9000 -p:2222:2222 --shm-size=2g --env username_admin_globalaccesslevel=admin --env username_admin_password=admin --name=solace solace/solace-pubsub-standard
    ```

2. Copy the NAR package of the AMQP1_0 sink connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-amqp1_0-{version}.nar
    $PULSAR_HOME/connectors/pulsar-io-amqp1_0-{version}.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

   You can find the similar logs as below. 

    ```
    Searching for connectors in /Volumes/other/apache-pulsar-2.8.0-SNAPSHOT/./connectors
    Found connector ConnectorDefinition(name=amqp1_0, description=AMQP1_0 source and AMQP1_0 connector, sourceClass=org.apache.pulsar.ecosystem.io.amqp.AmqpSource, sinkClass=org.apache.pulsar.ecosystem.io.amqp.AmqpSink, sourceConfigClass=null, sinkConfigClass=null) from /Volumes/other/apache-pulsar-2.8.0-SNAPSHOT/./connectors/pulsar-io-amqp1_0-2.7.0.nar
    Searching for functions in /Volumes/other/apache-pulsar-2.8.0-SNAPSHOT/./functions
    ```

4. Create an AMQP1_0 sink.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-config-file amqp-sink-config.yaml \
    --custom-schema-inputs '{"user-op-queue-topic": "org.apache.pulsar.client.impl.schema.ByteBufferSchema"}'
    ```

    **Output**

    ```
    "Created successfully"
    ```

    Verify whether the sink is created successfully or not.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar-admin sinks list
    ```

    **Output**

    ```
    [
    "amqp1_0-sink"
    ]
    ```

    Check the sink status.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar-admin sinks status --name amqp1_0-sink
    ```

    **Output**

    ```
      "numInstances" : 1,
      "numRunning" : 1,
      "instances" : [ {
        "instanceId" : 0,
        "status" : {
          "running" : true,
          "error" : "",
          "numRestarts" : 0,
          "numReadFromPulsar" : 0,
          "numSystemExceptions" : 0,
          "latestSystemExceptions" : [ ],
          "numSinkExceptions" : 0,
          "latestSinkExceptions" : [ ],
          "numWrittenToSink" : 0,
          "lastReceivedTime" : 0,
          "workerId" : "c-standalone-fw-localhost-8080"
        }
      } ]
    }
    ```

5. Send messages to Pulsar topics.

    ```
    @Test
    public void generateMessages() throws Exception {
        @Cleanup
        PulsarClient pulsarClient = PulsarClient.builder().serviceUrl("pulsar://localhost:6650").build();
        @Cleanup
        Producer<ByteBuffer> producer = pulsarClient.newProducer(Schema.BYTEBUFFER)
                .topic("user-op-queue-topic")
                .create();

        JmsConnectionFactory jmsConnectionFactory = new JmsConnectionFactory();
        @Cleanup
        JMSContext jmsContext = jmsConnectionFactory.createContext();

        for (int i = 0; i < 10; i++) {
            JmsTextMessage textMessage = (JmsTextMessage) jmsContext.createTextMessage("text message - " + i);
            ByteBuf byteBuf = (ByteBuf) textMessage.getFacade().encodeMessage();
            producer.send(byteBuf.nioBuffer());
        }
        System.out.println("finish send messages.");
    }
    ```

6. Consume messages from AMQP service using the `receiveMessages` method.

    **Input**

    ```
    @Test
    public void receiveMessages() throws Exception {
        ConnectionFactory connectionFactory = new JmsConnectionFactory("guest", "guest", "amqp://localhost:5672");
        @Cleanup
        Connection connection = connectionFactory.createConnection();
        connection.start();
        @Cleanup
        Session session = connection.createSession();
        @Cleanup
        MessageConsumer consumer = session.createConsumer(new JmsQueue("user-op-queue-pulsar"));
        for (int i = 0; i < 10; i++) {
            JmsTextMessage textMessage = (JmsTextMessage) consumer.receive();
            System.out.println("receive msg content: " + textMessage.getText());
            textMessage.acknowledge();
        }
    }
    ```

    Check the sink status.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar-admin sinks status --name amqp1_0-sink
    ```

    **Output**

    ```
    {
      "numInstances" : 1,
      "numRunning" : 1,
      "instances" : [ {
        "instanceId" : 0,
        "status" : {
          "running" : true,
          "error" : "",
          "numRestarts" : 0,
          "numReadFromPulsar" : 10,
          "numSystemExceptions" : 0,
          "latestSystemExceptions" : [ ],
          "numSinkExceptions" : 0,
          "latestSinkExceptions" : [ ],
          "numWrittenToSink" : 10,
          "lastReceivedTime" : 1615192471713,
          "workerId" : "c-standalone-fw-localhost-8080"
        }
      } ]
    }
    ```

### On-premises cluster

This example explains how to create an AMQP1_0 sink connector on an on-premises cluster.

1. Copy the NAR package of the AMQP1_0 connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-amqp1_0-{version}.nar $PULSAR_HOME/connectors/pulsar-io-amqp1_0-{version}.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sinks reload
    ```

3. Check whether the AMQP1_0 sink connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks available-sinks
    ```

4. Create an AMQP1_0 sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-type amqp1_0 \
    --sink-config-file amqp-sink-config.yaml \
    --name amqp1_0-sink
    ```

### K8S cluster

This example demonstrates how to create an AMQP1_0 sink connector on a K8S cluster.

1. Build a new image based on the Pulsar image with the AMQP1_0 sink connector and push the new image to your image registry. 

    This example tags the new image as `streamnative/pulsar-amqp1_0:2.7.0`.

    ```Dockerfile
    FROM apachepulsar/pulsar-all:2.7.0
    RUN curl https://github.com/streamnative/pulsar-io-amqp1-0/releases/download/v{version}/pulsar-io-amqp1_0-{version}.nar -o /pulsar/connectors/pulsar-io-amqp1_0-{version}.nar
    ```

2. Extract the previous `--set` arguments from K8S to the `pulsar.yaml` file.

    ```
    helm get values <release-name> > pulsar.yaml
    ```

3. Replace the `images` section in the `pulsar.yaml` file with the `images` section of `streamnative/pulsar-amqp1_0:2.7.0`.

4. Upgrade the K8S cluster with the `pulsar.yaml` file.

    ```
    helm upgrade <release-name> streamnative/pulsar \
        --version <new version> \
        -f pulsar.yaml
    ```

    {% callout title="Tip" type="tip" %}
        For more information about how to upgrade a Pulsar cluster with Helm, see [Upgrade Guide](https://docs.streamnative.io/platform/latest/install-and-upgrade/helm/install/upgrade).
    {% /callout %}

5. Create an AMQP1_0 sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-type amqp1_0 \
    --sink-config-file amqp-sink-config.yaml \
    --name amqp1_0-sink
    ```


