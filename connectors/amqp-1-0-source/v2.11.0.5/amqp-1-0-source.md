---
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-amqp-1-0"
alias: AMQP1_0 Source Connector
---

# AMQP1_0 source connector

The AMQP1_0 source connector receives messages from [AMQP 1.0](https://www.amqp.org/) and writes messages to Pulsar topics.

![](/docs/amqp-1-0-source.png)

# How to get 

You can get the AMQP1_0 source connector using one of the following methods.

## Use it with Function Worker

- Download the NAR package from [here](https://github.com/streamnative/pulsar-io-amqp-1-0/releases/download/v2.11.0.5/pulsar-io-amqp1_0-2.11.0.5.nar).

- Build it from the source code.

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
        pulsar-io-amqp1_0-2.11.0.5.nar
        ```

## Use it with Function Mesh

Pull the AMQP1_0 connector Docker image from [here](https://hub.docker.com/r/streamnative/pulsar-io-amqp-1-0).

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

## Configure it with Function Worker

You can create a configuration file (JSON or YAML) to set the properties as below.

**Example**

* JSON 

    ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "amqp1_0-source",
        "topicName": "user-op-queue-topic",
        "archive": "connectors/pulsar-io-amqp1_0-2.11.0.5.nar",
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
        archive: "connectors/pulsar-io-amqp1_0-2.11.0.5.nar"
        parallelism: 1
        
        configs:
            protocol: "amqp"
            host: "localhost"
            port: "5672"
            username: "guest"
            password: "guest"
            queue: "user-op-queue"
    ```

## Configure it with Function Mesh

You can submit a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to create an AMQP1_0 source connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes ecosystem. For more information about Pulsar source CRD configurations, see [here](https://functionmesh.io/docs/connectors/io-crd-config/source-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Source
metadata:
  name: amqp-source-sample
spec:
  image: streamnative/pulsar-io-amqp-1-0:2.11.0.5
  className: org.apache.pulsar.ecosystem.io.amqp.AmqpSource
  replicas: 1
  output:
    topic: persistent://public/default/user-op-queue-topic
    typeClassName: “java.nio.ByteBuffer”
  sourceConfig:
    protocol: "amqp"
    host: "localhost"
    port: "5672"
    username: "guest"
    password: "guest"
    queue: "user-op-queue"
  pulsar:
    pulsarConfig: "test-pulsar-source-config"
  resources:
    limits:
    cpu: "0.2"
    memory: 1.1G
    requests:
    cpu: "0.1"
    memory: 1G
  java:
    jar: connectors/pulsar-io-amqp1_0-2.11.0.5.nar
  clusterName: test-pulsar
```

# How to use

You can use the AMQP1_0 source connector with Function Worker or Function Mesh.

## Use it with Function Worker

You can use the AMQP1_0 source connector as a non built-in connector or a built-in connector.

### Use it as non built-in connector 

If you already have a Pulsar cluster, you can use the AMQP1_0 source connector as a non built-in connector directly.

This example shows how to create an AMQP1_0 source connector on a Pulsar cluster using the command [`pulsar-admin sources create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14).

```
PULSAR_HOME/bin/pulsar-admin sources create \
--name amqp1_0-source \
--archive pulsar-io-amqp1_0-2.11.0.5.nar \
--classname org.apache.pulsar.ecosystem.io.amqp.AmqpSource \
--source-config-file amqp-source-config.yaml
```

### Use it as built-in connector

You can make the AMQP1_0 source connector as a built-in connector and  use it on a standalone cluster or on-premises cluster.

#### Standalone cluster

This example describes how to use the AMQP1_0 source connector to feed data from AMQP and write data to Pulsar topics in standalone mode.

1. Prepare AMQP service using Solace.

    ```
    docker run -p:8008:8008 -p:1883:1883 -p:8000:8000 -p:5672:5672 -p:9000:9000 -p:2222:2222 --shm-size=2g --env username_admin_globalaccesslevel=admin --env username_admin_password=admin --name=solace solace/solace-pubsub-standard
    ```

2. Copy the NAR package of the AMQP1_0 source connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-amqp1_0-2.11.0.5.nar $PULSAR_HOME/connectors/pulsar-io-amqp1_0-2.11.0.5.nar
    ```

3. Start Pulsar in standalone mode.

    **Input**

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

    **Output**

    You can find the similar logs below.

    ```
    Searching for connectors in /Volumes/other/apache-pulsar-2.8.0-SNAPSHOT/./connectors
    Found connector ConnectorDefinition(name=amqp1_0, description=AMQP1_0 source and AMQP1_0 connector, sourceClass=org.apache.pulsar.ecosystem.io.amqp.AmqpSource, sinkClass=org.apache.pulsar.ecosystem.io.amqp.AmqpSink, sourceConfigClass=null, sinkConfigClass=null) from /Volumes/other/apache-pulsar-2.8.0-SNAPSHOT/./connectors/pulsar-io-amqp1_0-2.11.0.5.nar
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

#### On-premise cluster

This example explains how to create an AMQP1_0 source connector on an on-premises cluster.

1. Copy the NAR package of the AMQP1_0 connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-amqp1_0-2.11.0.5.nar $PULSAR_HOME/connectors/pulsar-io-amqp1_0-2.11.0.5.nar
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
   PULSAR_HOME/bin/pulsar-admin sources create \
    --source-type amqp1_0 \
    --source-config-file amqp-source-config.yaml \
    --name amqp1_0-source
```

## Use it with Function Mesh

This example demonstrates how to create an AMQP1_0 source connector through Function Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).

- Create a [Pulsar cluster](https://pulsar.apache.org/docs/en/kubernetes-helm/) in the Kubernetes cluster.

- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes cluster.

- Prepare AMQP service. 
  
### Step

1. Define the AMQP1_0 source connector with a YAML file and save it as `source-sample.yaml`.

    This example shows how to publish the AMQP1_0 source connector to Function Mesh with a Docker image.

    ```yaml
    apiVersion: compute.functionmesh.io/v1alpha1
    kind: Source
    metadata:
    name: amqp-source-sample
    spec:
    image: streamnative/pulsar-io-amqp-1-0:2.11.0.5
    className: org.apache.pulsar.ecosystem.io.amqp.AmqpSource
    replicas: 1
    output:
        topic: persistent://public/default/user-op-queue-topic
        typeClassName: “java.nio.ByteBuffer”
    sourceConfig:
        protocol: "amqp"
        host: "localhost"
        port: "5672"
        username: "guest"
        password: "guest"
        queue: "user-op-queue"
    pulsar:
        pulsarConfig: "test-pulsar-source-config"
    resources:
        limits:
        cpu: "0.2"
        memory: 1.1G
        requests:
        cpu: "0.1"
        memory: 1G
    java:
        jar: connectors/pulsar-io-amqp1_0-2.11.0.5.nar
    clusterName: test-pulsar
    ```

2. Apply the YAML file to create the AMQP1_0 source connector.

    **Input**

    ```
    kubectl apply -f  <path-to-source-sample.yaml>
    ```

    **Output**

    ```
    source.compute.functionmesh.io/amqp-source-sample created
    ```

3. Check whether the AMQP1_0 source connector is created successfully.

    **Input**

    ```
    kubectl get all
    ```

    **Output**

    ```
    NAME                                READY   STATUS      RESTARTS   AGE
    pod/amqp-source-sample-0               1/1     Running     0          77s
    ```

    After that, you can produce and consume messages using the AMQP1_0 source connector between Pulsar and AMQP1_0.
