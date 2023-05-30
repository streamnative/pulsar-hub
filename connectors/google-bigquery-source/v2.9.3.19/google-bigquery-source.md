---
description: BigQuery Connector integrates Apache Pulsar with Google BigQuery.
author: shibd,danpi,codelipenghui,streamnativebot
contributors: shibd,danpi,codelipenghui,streamnativebot
language: Java,Shell,Dockerfile
document:
source: "https://github.com/streamnative/pulsar-io-bigquery"
license: Apache License 2.0
license_link: "https://github.com/streamnative/pulsar-io-bigquery/blob/master/LICENSE"
tags: 
alias: pulsar-io-bigquery
features: ["BigQuery Connector integrates Apache Pulsar with Google BigQuery."]
icon: /images/connectors/google-bigquery-logo.png
download: "https://api.github.com/repos/streamnative/pulsar-io-bigquery/tarball/refs/tags/v2.9.3.19"
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-bigquery
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: ""
id: "google-bigquery-source"
---

## Google BigQuery sink connector

The [Google Cloud BigQuery](https://cloud.google.com/bigquery) connector is a [Pulsar IO connector](http://pulsar.apache.org/docs/en/next/io-overview/) for copying data between Google BigQuery and Pulsar. 

This connector pulls data from Pulsar topics and persists data to Google BigQuery.

![](https://raw.githubusercontent.com/streamnative/pulsar-io-bigquery/v2.9.3.19/docs/google-bigquery-sink.png)

Currently, Google BigQuery connector versions (`x.y.z`) are based on Pulsar versions (`x.y.z`).

| Google BigQuery connector version                                                   | Pulsar version                                  | Doc                                                                                                         |
|:------------------------------------------------------------------------------------|:------------------------------------------------|:------------------------------------------------------------------------------------------------------------|
| [2.8.x](https://github.com/streamnative/pulsar-io-bigquery/releases/tag/v2.8.3.5)   | [2.8.3](http://pulsar.apache.org/en/download/)  | [Google BigQuery sink connector doc](https://hub.streamnative.io/connectors/google-bigquery-sink/v2.8.3.5)  |
| [2.9.x](https://github.com/streamnative/pulsar-io-bigquery/releases/tag/v2.9.3.2)   | [2.9.3](http://pulsar.apache.org/en/download/)  | [Google BigQuery sink connector doc](https://hub.streamnative.io/connectors/google-bigquery-sink/v2.9.3.2)  |
| [2.10.x](https://github.com/streamnative/pulsar-io-bigquery/releases/tag/v2.10.1.4) | [2.10.1](http://pulsar.apache.org/en/download/) | [Google BigQuery sink connector doc](https://hub.streamnative.io/connectors/google-bigquery-sink/v2.10.1.4) |


## Project layout

Below are the sub folders and files of this project and their corresponding descriptions.

```bash
├── conf // examples of configuration files of this connector
├── docs // user guides of this connector
├── script // scripts of this connector
├── src // source code of this connector
│   ├── checkstyle // checkstyle configuration files of this connector
│   ├── license // license header for this project. `mvn license:format` can
    be used for formatting the project with the stored license header in this directory
│   │   └── ALv2
│   ├── main // main source files of this connector
│   │   └── java
│   ├── spotbugs // spotbugs configuration files of this connector
│   └── test // test related files of this connector
│       └── java
```

## License

Licensed under the Apache License Version 2.0: http://www.apache.org/licenses/LICENSE-2.0

