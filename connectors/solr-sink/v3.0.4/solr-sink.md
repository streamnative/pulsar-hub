---
description: The Solr sink connector pulls messages from Pulsar topics and persists the messages to Solr collections.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v3.0.4/pulsar-io/solr"
license: Apache License 2.0
tags: ["Pulsar IO", "Solr", "Sink"]
alias: Solr Sink
features: ["Use Solr sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/pulsar-hub.svg"
download: "https://archive.apache.org/dist/pulsar/pulsar-3.0.4/connectors/pulsar-io-solr-3.0.4.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
id: "solr-sink"
---

The Solr sink connector pulls messages from Pulsar topics and persists the messages to Solr collections.

# Configuration

The configuration of the Solr sink connector has the following properties.

## Property

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `solrUrl` | String|true|" " (empty string) | <li>Comma-separated zookeeper hosts with chroot used in the SolrCloud mode. <br>**Example**<br>`localhost:2181,localhost:2182/chroot` <br><br><li>URL to connect to Solr used in standalone mode. <br>**Example**<br>`localhost:8983/solr` |
| `solrMode` | String|true|SolrCloud| The client mode when interacting with the Solr cluster. <br><br>Below are the available options:<br><li>Standalone<br><li> SolrCloud|
| `solrCollection` |String|true| " " (empty string) | Solr collection name to which records need to be written. |
| `solrCommitWithinMs` |int| false|10 | The time within million seconds for Solr updating commits.|
| `username` |String|false|  " " (empty string) | The username for basic authentication.<br><br>**Note: `usename` is case-sensitive.** |
| `password` | String|false|  " " (empty string) | The password for basic authentication. <br><br>**Note: `password` is case-sensitive.** |


## Example

Before using the Solr sink connector, you need to create a configuration file through one of the following methods.

* JSON

    ```json
    {
        "solrUrl": "localhost:2181,localhost:2182/chroot",
        "solrMode": "SolrCloud",
        "solrCollection": "techproducts",
        "solrCommitWithinMs": 100,
        "username": "fakeuser",
        "password": "fake@123"
    }
    ```

* YAML

    ```yaml
    {
        solrUrl: "localhost:2181,localhost:2182/chroot"
        solrMode: "SolrCloud"
        solrCollection: "techproducts"
        solrCommitWithinMs: 100
        username: "fakeuser"
        password: "fake@123"
    }
    ```

