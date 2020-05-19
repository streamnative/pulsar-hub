---
description: The Flume source connector pulls messages from logs to Pulsar topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v2.5.0/pulsar-io/flume"
license: Apache License 2.0
tags: ["Pulsar IO", "Flume", "Source"]
alias: Flume Source
features: ["Use Flume source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/flume.jpg"
download: "https://archive.apache.org/dist/pulsar/pulsar-2.5.0/connectors/pulsar-io-flume-2.5.0.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: 
id: "flume-source"
---
The Flume source connector pulls messages from logs to Pulsar topics.

# Configuration

The configuration of the Flume source connector has the following properties.

## Property

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
`name`|String|true|"" (empty string)|The name of the agent.
`confFile`|String|true|"" (empty string)|The configuration file.
`noReloadConf`|Boolean|false|false|Whether to reload configuration file if changed.
`zkConnString`|String|true|"" (empty string)|The ZooKeeper connection.
`zkBasePath`|String|true|"" (empty string)|The base path in ZooKeeper for agent configuration.

## Example

Before using the Flume source connector, you need to create a configuration file through one of the following methods.

> For more information about the `source.conf` in the example below, see [here](https://github.com/apache/pulsar/blob/master/pulsar-io/flume/src/main/resources/flume/source.conf).

* JSON 

    ```json
    {
        "name": "a1",
        "confFile": "source.conf",
        "noReloadConf": "false",
        "zkConnString": "",
        "zkBasePath": ""
    }
    ```

* YAML

    ```yaml
    configs:
        name: a1
        confFile: source.conf
        noReloadConf: false
        zkConnString: ""
        zkBasePath: ""
    ```
