---
description: 
author: freeznet,Anonymitaet,nlu90,danpi
contributors: freeznet,Anonymitaet,nlu90,danpi
language: Java,Shell,Python,Dockerfile
document:
source: Private Source
license: Business License
license_link: "https://github.com/streamnative/pulsar-io-sqs/blob/master/LICENSE"
tags: 
alias: AWS SQS Source Connector
features: [""]
icon: /images/connectors/sqs-logo.png
download:
support: streamnative
support_link:
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile:
sn_available: true
id: "sqs-source"
---

## Pulsar IO :: AWS SQS Connector

pulsar-io-sqs is a [Pulsar IO Connector](http://pulsar.apache.org/docs/en/io-overview/) for copying data between Amazon AWS SQS and Pulsar.

### Get started

This section provides a step-by-step example how to use this AWS SQS connector, include using SQS source connector to copy queue data from a SQS queue to a Pulsar topic, and using SQS sink connector to copy topic data from a Pulsar topic to a SQS queue.

#### Build pulsar-io-sqs connector

1. Git clone `pulsar-io-sqs`. Assume *PULSAR_IO_SQS_HOME* is the home directory for your
   cloned `pulsar-io-sqs` repo for the remaining steps.
   ```bash
   git clone https://github.com/streamnative/pulsar-io-sqs
   ```

2. Build the connector in `${PULSAR_IO_SQS_HOME}` directory.
   ```bash
   mvn clean install -DskipTests
   ```
   After successfully built the connector, a *NAR* package is generated under *target* directory. The *NAR* package is the one you can applied to Pulsar.
   ```bash
   ls target/pulsar-io-sqs-2.7.0-SNAPSHOT.nar
   target/pulsar-io-sqs-2.7.0-SNAPSHOT.nar
   ```

#### Prepare a config for using pulsar-io-sqs connector

An example yaml config is available [here](https://github.com/streamnative/pulsar-io-sqs/blob/master/conf/pulsar-io-sqs.yaml)

This example yaml config is used for both source connector and sink connector.

#### Run pulsar-io-sqs connector
1. Download Pulsar 2.7.0 release from [Pulsar website](http://pulsar.apache.org/en/download/) and follow
   the [instructions](http://pulsar.apache.org/docs/en/standalone/) to start a standalone Pulsar.
   Assume *PULSAR_HOME* is the home directory for your Pulsar installation for the remaining steps.

   Example command to start a standalone Pulsar.
   ```bash
   cd ${PULSAR_HOME}
   bin/pulsar standalone
   ```

2. Setup SQS service according to [amazon aws documents](https://aws.amazon.com/sqs/getting-started/)

3. Copy the pulsar-io-sqs connector to `${PULSAR_HOME}/connectors` directory.
   ```bash
   cd ${PULSAR_HOME}
   mkdir -p connectors
   cp ${PULSAR_IO_SQS_HOME}/target/pulsar-io-sqs-2.7.0-SNAPSHOT.nar connectors/
   ```

4. Localrun the pulsar-io-sqs connector.

    Before localrun the connector, you should make sure config file is well-prepared. A config file template can be found from `conf/pulsar-io-sqs.yaml`. You have to make sure aws related configs are set. Once the config file is ready, we can start localrun.

    Assume your prepared config file is `${PULSAR_IO_SQS_HOME}/conf/pulsar-io-sqs.yaml`.

    - run as source connector
   ```
   cd ${PULSAR_HOME}
   bin/pulsar-admin sources localrun -a connectors/pulsar-io-sqs-2.7.0-SNAPSHOT.nar --tenant public --namespace default --name test-sqs-source --source-config-file ${PULSAR_IO_SQS_HOME}/conf/pulsar-io-sqs.yaml --destination-topic-name test-sqs-source-topic
   ```

    - run as sink connector
   ```
   cd ${PULSAR_HOME}
   bin/pulsar-admin sinks localrun -a connectors/pulsar-io-sqs-2.7.0-SNAPSHOT.nar --tenant public --namespace default --name test-sqs-sink --sink-config-file ${PULSAR_IO_SQS_HOME}/conf/pulsar-io-sqs.yaml -i test-sqs-sink-topic
   ```

   Once the connector is running, keep this terminal open during the remaining steps.

5. Now we can use aws cli to verify if the connector is working as expected.

    - verify the source connector
        - send a message to sqs queue
        ```bash
        aws sqs send-message --queue-url ${QUEUE_URL} --message-body "Hello From SQS"
        ```
        - consume the message from pulsar topic
        ```bash
        ${PULSAR_HOME}/bin/pulsar-client consume public/default/test-sqs-source-topic --subscription-name test-sqs-source-verifier 
        ```
        - you should be able to see message contains "Hello From SQS" from pulsar consumer.
    
    - verify the sink connector
        - send a message to pulsar topic
        ```bash
        ${PULSAR_HOME}/bin/pulsar-client produce public/default/test-sqs-sink-topic -m "Hello From Pulsar"
        ```
        
        - receive the message from aws sqs queue
        ```bash
        aws sqs receive-message --queue-url ${QUEUE_URL} --max-number-of-messages 1
        ```

        - you should be able to see message contains "Hello From Pulsar" from aws cli.

6. Add pulsar-io-sqs connector to your Pulsar Broker.

    After step 3, step 4, and step 5, you already move the connector to pulsar connectors folder, and verified the connector functions by localrun.

    Then you can check if pulsar-io-sqs connector is added to pulsar sinks and pulsar sources.
    ```bash
    bin/pulsar-admin sources reload
    bin/pulsar-admin sinks reload
    bin/pulsar-admin sources available-sources | grep sqs
    bin/pulsar-admin sinks available-sources | grep sqs
    ```
   
    And pulsar-io-sqs is ready to use.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fstreamnative%2Fpulsar-io-sqs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fstreamnative%2Fpulsar-io-sqs?ref=badge_large)

