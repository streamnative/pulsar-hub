---
description: The AMQP1_0 source connector receives messages from AMQP service and writes messages to Pulsar topics.
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-io-amqp-1-0/tree/branch-2.7.1/io-amqp1_0-impl/src/main/java/org/apache/pulsar/ecosystem/io/amqp"
license: Apache License 2.0
tags: ["Pulsar IO", "AMQP", "Qpid", "JMS", "Source"]
alias: AMQP1_0 source
features: ["Use AMQP1_0 source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/amqp-logo.png"
download: "https://github.com/streamnative/pulsar-io-amqp-1-0/releases/download/v2.7.1.1/pulsar-io-amqp1_0-2.7.1.1.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: 
id: "amqp-1-0-source"
---

The AMQP1_0 source connector receives messages from [AMQP 1.0](https://www.amqp.org/) and writes messages to Pulsar topics.

![](/images/connectors/amqp-1-0-source.png)

# How to get 

You can get the AMQP1_0 source connector using one of the following methods:

* Download the NAR package from [here](https://github.com/streamnative/pulsar-io-amqp-1-0/releases/download/v2.7.1.1/pulsar-io-amqp1_0-2.7.1.1.nar).

* Build it from the source code.

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

Before using the AMQP1_0 source connector, you need to configure it.

You can create a configuration file (JSON or YAML) to set the following properties.

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `protocol` |String| true | "amqp" | The AMQP protocol. |
| `host` | String| true | " " (empty string) | The AMQP service host. |
| `port` | int |true | 5672 | The AMQP service port. |
| `username` | String|false | " " (empty string) | The username used to authenticate to AMQP1_0. |
| `password` | String|false | " " (empty string) | The password used to authenticate to AMQP1_0. |
| `queue` | String|false | " " (empty string) | The queue name that messages should be read from or written to. |
| `topic` | String|false | " " (empty string) | The topic name that messages should be read from or written to. |
| `onlyTextMessage` | boolean | false | false | If it is set to `true`, the AMQP message type must be set to `TextMessage`. Pulsar consumers can consume the messages with schema ByteBuffer. |

**Example**

* JSON 

    ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "amqp1_0-source",
        "topicName": "user-op-queue-topic",
        "archive": "connectors/pulsar-io-amqp1_0-{version}.nar",
        "parallelism": 1,
        "configs": {
            "protocol": "amqp",
            "host": "localhost",
            "port": "5672",
            "username": "guest",
            "password": "guest",
            "queue": "user-op-queue"
        }
    }
    ```

* YAML

    ```yaml
        tenant: "public"
        namespace: "default"
        name: "amqp1_0-source"
        topicName: "user-op-queue-topic"
        archive: "connectors/pulsar-io-amqp1_0-{version}.nar"
        parallelism: 1
        
        configs:
            protocol: "amqp"
            host: "localhost"
            port: "5672"
            username: "guest"
            password: "guest"
            queue: "user-op-queue"
    ```

# How to use

You can use the AMQP1_0 source connector as a non built-in connector or a built-in connector as below. 

## Use as non built-in connector 

If you already have a Pulsar cluster, you can use the AMQP1_0 source connector as a non built-in connector directly.

This example shows how to create an AMQP1_0 source connector on a Pulsar cluster using the command [`pulsar-admin sources create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14).

```
PULSAR_HOME/bin/pulsar-admin sources create \
--name amqp1_0-source \
--archive pulsar-io-amqp1_0-{version}.nar \
--classname org.apache.pulsar.ecosystem.io.amqp.AmqpSource \
--source-config-file amqp-source-config.yaml
```

## Use as built-in connector

You can make the AMQP1_0 source connector as a built-in connector and use it on standalone cluster, on-premises cluster, or K8S cluster.

### Standalone cluster

1. Prepare AMQP service using Solace.

    ```
    docker run -p:8008:8008 -p:1883:1883 -p:8000:8000 -p:5672:5672 -p:9000:9000 -p:2222:2222 --shm-size=2g --env username_admin_globalaccesslevel=admin --env username_admin_password=admin --name=solace solace/solace-pubsub-standard
    ```

2. Copy the NAR package of the AMQP1_0 source connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-amqp1_0-{version}.nar $PULSAR_HOME/connectors/pulsar-io-amqp1_0-{version}.nar
    ```

3. Start Pulsar in standalone mode.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

    **Output**

    You can find the similar logs as below.

    ```
    Searching for connectors in /Volumes/other/apache-pulsar-2.8.0-SNAPSHOT/./connectors
    Found connector ConnectorDefinition(name=amqp1_0, description=AMQP1_0 source and AMQP1_0 connector, sourceClass=org.apache.pulsar.ecosystem.io.amqp.AmqpSource, sinkClass=org.apache.pulsar.ecosystem.io.amqp.AmqpSink, sourceConfigClass=null, sinkConfigClass=null) from /Volumes/other/apache-pulsar-2.8.0-SNAPSHOT/./connectors/pulsar-io-amqp1_0-2.7.0.nar
    Searching for functions in /Volumes/other/apache-pulsar-2.8.0-SNAPSHOT/./functions
    ```

4. Create an AMQP1_0 source.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar-admin sources create \
    --source-type amqp1_0 \
    --source-config-file amqp-source-config.yaml
    ```

    **Output**
    
    ```
    "Created successfully"
    ```

    Verify whether the source is created successfully or not.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar-admin sources list
    ```

    **Output**

    ```
    [
    "amqp1_0-source"
    ]
    ```

    Check the source status.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar-admin sources status --name amqp1_0-source
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
        "numReceivedFromSource" : 0,
        "numSystemExceptions" : 0,
        "latestSystemExceptions" : [ ],
        "numSourceExceptions" : 0,
        "latestSourceExceptions" : [ ],
        "numWritten" : 0,
        "lastReceivedTime" : 0,
        "workerId" : "c-standalone-fw-localhost-8080"
        }
        } ]
        }
    ```

5. Consume messages from Pulsar topics.

    ```
    PULSAR_HOME/bin/pulsar-client consume -s "test" public/default/user-op-queue-topic -n 10
    ```

6. Send messages to AMQP1_0 service using the method `sendMessage`.

    **Input**

    ```
    @Test
    public void sendMessage() throws Exception {
        ConnectionFactory connectionFactory = new JmsConnectionFactory("amqp://localhost:5672");
        @Cleanup
        Connection connection = connectionFactory.createConnection();
        connection.start();
        JMSProducer producer = connectionFactory.createContext().createProducer();
        producer.setDeliveryMode(DeliveryMode.NON_PERSISTENT);
        Destination destination = new JmsQueue("user-op-queue");
        for (int i = 0; i < 10; i++) {
            producer.send(destination, "Hello AMQP1_0 - " + i);
        }
    }
    ```

    Check the source status.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar-admin sources status --name amqp1_0-source
    ```

    **Output**

    The values of `numWritten` and `lastReceivedTime` are changed.

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
            "numReceivedFromSource" : 10,
            "numSystemExceptions" : 0,
            "latestSystemExceptions" : [ ],
            "numSourceExceptions" : 0,
            "latestSourceExceptions" : [ ],
            "numWritten" : 10,
            "lastReceivedTime" : 1615194014874,
            "workerId" : "c-standalone-fw-localhost-8080"
            }
        } ]
    }
    ```

    Now you can see the Pulsar consumer receives 10 messages. The message contents are not in regular formats since the message contents contain some extra information about `TextMessage`.

    **Output**

    ```
    ----- got message -----
    key:[null], properties:[], content:Sp�ASr�)�x-opt-jms-msg-typeQ�x-opt-jms-destQSs�\
    �/ID:67e69637-bd24-4ee1-86b7-be89e5a49b7f:1:1:1-1@�queue://user-op-queue@@@@@@�x?|�)Sw�
                                                                                        text str - 0
    ...
    ```

### On-premise cluster

This example explains how to create an AMQP1_0 source connector on an on-premises cluster.

1. Copy the NAR package of the AMQP1_0 connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-amqp1_0-{version}.nar $PULSAR_HOME/connectors/pulsar-io-amqp1_0-{version}.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sources reload
    ```

3. Check whether the AMQP1_0 source connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sources available-sources
    ```

4. Create an AMQP1_0 source connector on a Pulsar cluster using the [`pulsar-admin sources create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14) command.

    ```
    cp pulsar-io-amqp1_0-{version}.nar $PULSAR_HOME/connectors/pulsar-io-amqp1_0-{version}.nar
    ```

### On K8S cluster

This example demonstrates how to create an AMQP1_0 source connector on a K8S cluster.

1. Build a new image based on the Pulsar image with the AMQP1_0 source connector and push the new image to your image registry. 
   
   This example tags the new image as `streamnative/pulsar-amqp1_0:2.7.0`.

    ```Dockerfile
    FROM apachepulsar/pulsar-all:2.7.0
    RUN curl https://github.com/streamnative/pulsar-io-amqp-1-0/releases/download/v{version}/pulsar-io-amqp1_0-{version}.nar -o /pulsar/connectors/pulsar-io-amqp1_0-{version}.nar
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

    > **Tip**
    >
    > For more information about how to upgrade a Pulsar cluster with Helm, see [Upgrade Guide](https://docs.streamnative.io/platform/latest/install-and-upgrade/helm/install/upgrade).

5. Create an AMQP1_0 source connector on a Pulsar cluster using the [`pulsar-admin sources create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sources create \
    --source-type amqp1_0 \
    --source-config-file amqp-source-config.yaml \
    --name amqp1_0-source
    ```
