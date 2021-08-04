---
description: Pulsar Flink connector allows Flink reading data from Pulsar and writing data to Pulsar
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-flink/tree/release-2.4.12"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["Pulsar", "Flink", "Connector"]
alias: Pulsar Flink connector
features: ["Pulsar Flink connector allows Flink reading data from Pulsar and writing data to Pulsar"]
icon: "/images/data-processing/flink-logo.png"
download: "https://mvnrepository.com/artifact/io.streamnative.connectors/pulsar-flink-connector_2.11/2.4.28.7"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "pulsar-flink"
---

Pulsar Flink connector is an integration of [Apache Pulsar](https://pulsar.apache.org/en/) and [Apache Flink](https://flink.apache.org/) (data processing engine), which allows Flink reading data from Pulsar and writing data to Pulsar and provides exactly-once source semantics and at-least-once sink semantics.

![](/images/data-processing/pulsar-flink-connector.png)

This document describes how to link the Pulsar Flink connector.

# Prerequisite

Check the following requirements before installing the Pulsar Flink connector. 

Pulsar Flink connector version | Pulsar version | Flink version | Java version
---|---|---|---|
[2.4.8 - 2.4.1](https://github.com/streamnative/pulsar-flink/releases) | Pulsar 2.4.0 or later | Flink 1.9.0 or later | Java 8 or later

# Step
  
Currently, the artifact is available in [Bintray Maven repository of StreamNative](https://dl.bintray.com/streamnative/maven).

## Maven

For Maven project, you can add the repository as well as the artifact dependency to your `pom.xml` as follows.

```xml
    ....
<repository>
	<id>bintray-streamnative-maven</id>
	<name>bintray</name>
	<url>https://dl.bintray.com/streamnative/maven</url>
</repository>

<dependency>
	<groupId>io.streamnative.connectors</groupId>
	<artifactId>pulsar-flink-connector_2.11</artifactId>
	<version>2.4.8</version>
</dependency>
```

## Gradle

For a Gradle project, you can add the repository as well as the artifact dependency to your `build.gradle`.

```shell
repositories {
	maven {
		url  "https://streamnative.bintray.com/maven"
	}
}

implementation 'io.streamnative.connectors:pulsar-flink-connector_2.11:2.4.8'
```