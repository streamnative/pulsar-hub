---
description: The HDFS3 sink connector pulls the messages from Pulsar topics and persists the messages to HDFS files.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/v3.0.10/pulsar-io/hdfs3"
license: Apache License 2.0
tags: ["Pulsar IO", "HDFS3", "Sink"]
alias: HDFS3 Sink
features: ["Use HDFS3 sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/hadoop.png"
download: "https://archive.apache.org/dist/pulsar/pulsar-3.0.10/connectors/pulsar-io-hdfs3-3.0.10.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
id: "hdfs3-sink"
---

The HDFS3 sink connector pulls the messages from Pulsar topics and persists the messages to HDFS files.

# Configuration

The configuration of the HDFS3 sink connector has the following properties.

## Property

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `hdfsConfigResources` | String|true| None | A file or a comma-separated list containing the Hadoop file system configuration.<br/><br/>**Example**<br/>'core-site.xml'<br/>'hdfs-site.xml' |
| `directory` | String | true | None|The HDFS directory where files read from or written to. |
| `encoding` | String |false |None |The character encoding for the files.<br/><br/>**Example**<br/>UTF-8<br/>ASCII |
| `compression` | Compression |false |None |The compression code used to compress or de-compress the files on HDFS. <br/><br/>Below are the available options:<br/><li>BZIP2<br/><li>DEFLATE<br/><li>GZIP<br/><li>LZ4<br/><li>SNAPPY|
| `kerberosUserPrincipal` |String| false| None|The principal account of Kerberos user used for authentication. |
| `keytab` | String|false|None| The full pathname of the Kerberos keytab file used for authentication. |
| `filenamePrefix` |String| false |None |The prefix of the files created inside the HDFS directory.<br/><br/>**Example**<br/> The value of topicA result in files named topicA-. |
| `fileExtension` | String| false | None| The extension added to the files written to HDFS.<br/><br/>**Example**<br/>'.txt'<br/> '.seq' |
| `separator` | char|false |None |The character used to separate records in a text file. <br/><br/>If no value is provided, the contents from all records are concatenated together in one continuous byte array. |
| `syncInterval` | long| false |0| The interval between calls to flush data to HDFS disk in milliseconds. |
| `maxPendingRecords` |int| false|Integer.MAX_VALUE |  The maximum number of records that hold in memory before acking. <br/><br/>Setting this property to 1 makes every record send to disk before the record is acked.<br/><br/>Setting this property to a higher value allows buffering records before flushing them to disk. 

## Example

Before using the HDFS3 sink connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "hdfsConfigResources": "core-site.xml",
        "directory": "/foo/bar",
        "filenamePrefix": "prefix",
        "compression": "SNAPPY"
    }
    ```

* YAML

    ```yaml
    configs:
        hdfsConfigResources: "core-site.xml"
        directory: "/foo/bar"
        filenamePrefix: "prefix"
        compression: "SNAPPY"
    ```
