---
description: The JDBC sink connector pulls messages from Pulsar topics and persists the messages to MySQL or SQlite.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/v2.5.1/pulsar-io/jdbc/src/main/java/org/apache/pulsar/io/jdbc"
license: Apache License 2.0
tags: ["Pulsar IO", "JDBC", "Sink"]
alias: JDBC Sink
features: ["Use JDBC sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/pulsar-hub.svg"
download: "https://archive.apache.org/dist/pulsar/pulsar-2.5.1/connectors/pulsar-io-jdbc-2.5.1.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: 
id: "jdbc-sink"
---

The JDBC sink connector pulls messages from Pulsar topics and persists the messages to MySQL or SQlite.

> Currently, INSERT, DELETE and UPDATE operations are supported.

# Configuration 

The configuration of the JDBC sink connector has the following properties.

## Property

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `userName` | String|false | " " (empty string) | The username used to connect to the database specified by `jdbcUrl`.<br><br>**Note: `userName` is case-sensitive.**|
| `password` | String|false | " " (empty string)| The password used to connect to the database specified by `jdbcUrl`. <br><br>**Note: `password` is case-sensitive.**|
| `jdbcUrl` | String|true | " " (empty string) | The JDBC URL of the database to which the connector connects. |
| `tableName` | String|true | " " (empty string) | The name of the table to which the connector writes. |
| `nonKey` | String|false | " " (empty string) | A comma-separated list contains the fields used in updating events.  |
| `key` | String|false | " " (empty string) | A comma-separated list contains the fields used in `where` condition of updating and deleting events. |
| `timeoutMs` | int| false|500 | The JDBC operation timeout in milliseconds. |
| `batchSize` | int|false | 200 | The batch size of updates made to the database. |

## Example

Before using the JDBC sink connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "userName": "root",
        "password": "jdbc",
        "jdbcUrl": "jdbc:mysql://127.0.0.1:3306/pulsar_mysql_jdbc_sink",
        "tableName": "pulsar_mysql_jdbc_sink"
    }
    ```

* YAML

    ```yaml
    configs:
        userName: "root"
        password: "jdbc"
        jdbcUrl: "jdbc:mysql://127.0.0.1:3306/pulsar_mysql_jdbc_sink"
        tableName: "pulsar_mysql_jdbc_sink"
    ```

# Usage

For more information about **how to use a JDBC sink connector**, see [connect Pulsar to MySQL](io-quickstart.md#connect-pulsar-to-mysql).
