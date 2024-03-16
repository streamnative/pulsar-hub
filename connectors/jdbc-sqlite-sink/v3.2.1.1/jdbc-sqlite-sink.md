---
description: The JDBC sink connector pulls messages from Pulsar topics and persists the messages to MySQL or SQlite.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/streamnative/pulsar/tree/v3.2.1.1/pulsar-io/jdbc/mariadb"
license: Apache License 2.0
tags: ["Pulsar IO", "JDBC", "Sink"]
alias: JDBC Sink
features: ["Use JDBC sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/pulsar-hub.svg"
download: "https://github.com/streamnative/pulsar/releases/download/v3.2.1.1/pulsar-io-jdbc-mariadb-3.2.1.1.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-jdbc-mariadb
id: "jdbc-sink"
---

The JDBC sink connector pulls messages from Pulsar topics and persists the messages to MySQL or SQlite.

> Currently, INSERT, DELETE and UPDATE operations are supported.

# Configuration 

The configuration of the JDBC sink connector has the following properties.

## Property

| Name        | Type   | Required | Sensitive | Default            | Description                                                                                                          |
|-------------|--------|----------|-----------|--------------------|----------------------------------------------------------------------------------------------------------------------|
| `userName`  | String | false    | true      | " " (empty string) | The username used to connect to the database specified by `jdbcUrl`.<br><br>**Note: `userName` is case-sensitive.**  |
| `password`  | String | false    | true      | " " (empty string) | The password used to connect to the database specified by `jdbcUrl`. <br><br>**Note: `password` is case-sensitive.** |
| `jdbcUrl`   | String | true     | false     | " " (empty string) | The JDBC URL of the database to which the connector connects.                                                        |
| `tableName` | String | true     | false     | " " (empty string) | The name of the table to which the connector writes.                                                                 |
| `nonKey`    | String | false    | false     | " " (empty string) | A comma-separated list contains the fields used in updating events.                                                  |
| `key`       | String | false    | false     | " " (empty string) | A comma-separated list contains the fields used in `where` condition of updating and deleting events.                |
| `timeoutMs` | int    | false    | false     | 500                | The JDBC operation timeout in milliseconds.                                                                          |
| `batchSize` | int    | false    | false     | 200                | The batch size of updates made to the database.                                                                      |

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
