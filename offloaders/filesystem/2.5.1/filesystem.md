---
description: Use filesystem offloader with Pulsar
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/v2.5.1/tiered-storage/file-system"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["Filesystem", "offloader", "Pulsar", "HDFS"]
alias: Filesystem offloader
features: ["Offload data from BookKeeper to filesystem"]
icon: "/images/offloaders/filesystem/filesystem-logo.png"
download: "https://archive.apache.org/dist/pulsar/pulsar-2.5.1/apache-pulsar-offloaders-2.5.1-bin.tar.gz"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "filesystem"
---

# Overview

To deliver an event streaming service, Pulsar needs to manage large numbers of messages and data in real-time, and this requires keeping large amounts of data on the platform, or readily accessible. As the data amount increases, it becomes significantly more expensive to store, manage, and retrieve data, so administrators and developers look to external stores for long-term storage. 

Pulsar leverages a unique **tiered storage** solution that addresses some of these key challenges faced by other distributed log systems. This tiered storage solution extends the storage capabilities of Pulsar by offloading data from Apache BookKeeper to scalable cloud-native storage or filesystems without adding storage. Older topic data can be offloaded to long-term storage that readily scales with the volume of data. 

* Tiered storage uses [Apache jclouds](https://jclouds.apache.org) to support
[Amazon S3](https://aws.amazon.com/s3/) and [GCS (Google Cloud Storage)](https://cloud.google.com/storage/) for long term storage. 

    With jclouds, it is easy to add support for more
[cloud storage providers](https://jclouds.apache.org/reference/providers/#blobstore-providers) in the future.

* Tiered storage uses [Apache Hadoop](http://hadoop.apache.org/) to support file systems for long term storage. 

    With Hadoop, it is easy to add support for more file systems in the future.

In this way, on the one hand, tiered storage is much cheaper than the storage in Pulsar clusters; on the other hand, there is no perceivable difference in consuming a topic no matter whether data is stored on tiered storage or on Pulsar clusters. They produce and consume messages in exactly the same way.

Additionally, Pulsar is able to retain both historic and real-time data and provides a unified view as infinite event streams, which can be easily reprocessed or backloaded into new systems. You can integrate Pulsar with a unified data processing engine (such as Apache Flink or Apache Spark) to unlock many new use cases stemming from infinite data retention.


# Installation

Follow the steps below to install the filesystem offloader.

## Prerequisite

- Pulsar: 2.4.2 or later versions

- Hadoop: 3.x.x

## Step

1. Download Pulsar tarball using one of the following ways:

   * download the Pulsar tarball from the [Apache mirror](https://archive.apache.org/dist/pulsar/pulsar-2.5.1/apache-pulsar-2.5.1-bin.tar.gz)

   * download from the Pulsar [download page](https://pulsar.apache.org/download)

   * use [wget](https://www.gnu.org/software/wget)

     ```shell
     wget https://archive.apache.org/dist/pulsar/pulsar-2.5.1/apache-pulsar-2.5.1-bin.tar.gz
     ```

2. Download and untar the Pulsar offloaders package. 

    ```bash
    wget https://downloads.apache.org/pulsar/pulsar-2.5.1/apache-pulsar-offloaders-2.5.1-bin.tar.gz

    tar xvfz apache-pulsar-offloaders-2.5.1-bin.tar.gz
    ```

    > #### Note
    >
    > * If you are running Pulsar in a bare metal cluster, make sure that `offloaders` tarball is unzipped in every broker's Pulsar directory.
    > 
    > * If you are running Pulsar in Docker or deploying Pulsar using a Docker image (such as K8S and DCOS), you can use the `apachepulsar/pulsar-all` image instead of the `apachepulsar/pulsar` image. `apachepulsar/pulsar-all` image has already bundled tiered storage offloaders.

3. Copy the Pulsar offloaders as `offloaders` in the Pulsar directory.

    ```
    mv apache-pulsar-offloaders-2.5.1/offloaders apache-pulsar-2.5.1/offloaders

    ls offloaders
    ```

    **Output**

    ```
    tiered-storage-file-system-2.5.1.nar
    tiered-storage-jcloud-2.5.1.nar
    ```

    > #### Note
    >
    > * If you are running Pulsar in a bare metal cluster, make sure that `offloaders` tarball is unzipped in every broker's Pulsar directory.
    > 
    > * If you are running Pulsar in Docker or deploying Pulsar using a Docker image (such as K8s and DCOS), you can use the `apachepulsar/pulsar-all` image instead of the `apachepulsar/pulsar` image. `apachepulsar/pulsar-all` image has already bundled tiered storage offloaders.

# Configuration

> #### Note
> 
> Before offloading data from BookKeeper to filesystem, you need to configure some properties of the filesystem offloader driver. 

Besides, you can also configure the filesystem offloader to run it automatically or trigger it manually.

## Configure filesystem offloader driver

You can configure filesystem offloader driver in the configuration file `broker.conf` or `standalone.conf`.

- **Required** configurations are as below.
  
    Required configuration | Description | Example value
    |---|---|---
    `managedLedgerOffloadDriver` | Offloader driver name, which is case-insensitive. | filesystem
    `fileSystemURI` | Connection address | hdfs://127.0.0.1:9000
    `offloadersDirectory` | Hadoop profile path | ../conf/filesystem_offload_core_site.xml


- **Optional** configurations are as below.

    Optional configuration| Description | Example value
    |---|---|---
    `managedLedgerMinLedgerRolloverTimeMinutes`|Minimum time between ledger rollover for a topic<br><br>**Note**: it is not recommended that you set this configuration in the product environment.|2
    `managedLedgerMaxEntriesPerLedger`|Maximum number of entries to append to a ledger before triggering a rollover.<br><br>**Note**: it is not recommended that you set this configuration in the product environment.|5000

### Offloader driver (required)

Offloader driver name, which is case-insensitive.

This example sets the offloader driver name as _filesystem_.

```conf
managedLedgerOffloadDriver=filesystem
```

### Connection address (required)

Connection address is the URI to access the default Hadoop distributed file system. 

#### Example

This example sets the connection address as _hdfs://127.0.0.1:9000_.

```conf
fileSystemURI=hdfs://127.0.0.1:9000
```

### Hadoop profile path (required)

The configuration file is stored in the Hadoop profile path. It contains various settings for Hadoop performance tuning.

#### Example

This example sets the Hadoop profile path as _../conf/filesystem_offload_core_site.xml_.

```conf
fileSystemProfilePath=../conf/filesystem_offload_core_site.xml
```

You can set the following configurations in the _filesystem_offload_core_site.xml_ file.

```
<property>
    <name>fs.defaultFS</name>
    <value></value>
</property>

<property>
    <name>hadoop.tmp.dir</name>
    <value>pulsar</value>
</property>

<property>
    <name>io.file.buffer.size</name>
    <value>4096</value>
</property>

<property>
    <name>io.seqfile.compress.blocksize</name>
    <value>1000000</value>
</property>
<property>

    <name>io.seqfile.compression.type</name>
    <value>BLOCK</value>
</property>

<property>
    <name>io.map.index.interval</name>
    <value>128</value>
</property>
```

> #### Tip
>
> For more information about the Hadoop HDFS, see [here](https://hadoop.apache.org/docs/current/).

## Configure filesystem offloader to run automatically

Namespace policy can be configured to offload data automatically once a threshold is reached. The threshold is based on the size of data that a topic has stored on a Pulsar cluster. Once the topic reaches the threshold, an offload operation is triggered automatically. 

Threshold value|Action
|---|---
> 0 | It triggers the offloading operation if the topic storage reaches its threshold.
= 0|It causes a broker to offload data as soon as possible.
< 0 |It disables automatic offloading operation.

Automatic offload runs when a new segment is added to a topic log. If you set the threshold on a namespace, but few messages are being produced to the topic, offload does not work until the current segment is full.

You can configure the threshold size using CLI tools, such as [pulsarctl](https://streamnative.io/docs/v1.0.0/manage-and-monitor/pulsarctl/overview/) or puslar-admin.

### Example

This example sets the filesystem offloader threshold size to 10 MB using pulsarctl.

```bash
bin/pulsarctl namespaces set-offload-threshold --size 10M my-tenant/my-namespace
```

> #### Tip
>
> For more information about the `pulsarctl namespaces set-offload-threshold options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-set-offload-threshold-em-). 

## Configure filesystem offloader to run manually

For individual topics, you can trigger filesystem offloader manually using the following methods:

- Use REST endpoint 

- Use CLI tools (such as pulsarctl or pulsar-admin). 

To trigger via CLI tools, you need to specify the maximum amount of data (threshold) that should be retained on a Pulsar cluster for a topic. If the size of the topic data on the Pulsar cluster exceeds this threshold, segments from the topic are offloaded to filesystem until the threshold is no longer exceeded. Older segments are offloaded first.

### Example

- This example triggers the filesystem offloader to run manually using pulsarctl.

    ```bash
    bin/pulsarctl topic offload persistent://my-tenant/my-namespace/topic1 10M
    ``` 

    **Output**

    ```bash
    Offload triggered for persistent://my-tenant/my-namespace/topic1 for messages before 2:0:-1
    ```

    > #### Tip
    >
    > For more information about the `pulsarctl topic offload options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-offload-em-). 

- This example checks filesystem offloader status using pulsarctl.

    ```bash
    bin/pulsarctl topic offload-status persistent://my-tenant/my-namespace/topic1
    ```

    **Output**

    ```bash
    Offload is currently running
    ```

    To wait for filesystem to complete the job, add the `-w` flag.

    ```bash
    bin/pulsarctl topic offload-status -w persistent://my-tenant/my-namespace/topic1
    ```

    **Output**
    
    ```
    Offload was a success
    ```

    If there is an error in the offloading operation, the error is propagated to the `pulsarctl topic offload-status` command.

    ```bash
    bin/pulsarctl topic offload-status persistent://my-tenant/my-namespace/topic1
    ```

    **Output**

    ```
    Error in offload
    null

    Reason: Error offloading: org.apache.bookkeeper.mledger.ManagedLedgerException: java.util.concurrent.CompletionException: com.amazonaws.services.s3.model.AmazonS3Exception: Anonymous users cannot initiate multipart uploads.  Please authenticate. (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied; Request ID: 798758DE3F1776DF; S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=), S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=
    ````

    > #### Tip
    >
    > For more information about the `pulsarctl topic offload-status options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-offload-status-em-). 

# Usage

This tutorial provides step-by-step instructions on how to use filesystem offloader with Pulsar.

## Step 1: prepare HDFS environment

This tutorial sets up a Hadoop single node cluster and uses Hadoop 3.2.1.

> #### Tip
>
> For more information about setting up a Hadoop single node cluster, see [here](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html).

1. Download and uncompress Hadoop 3.2.1. 

    ```
    wget https://mirrors.bfsu.edu.cn/apache/hadoop/common/hadoop-3.2.1/hadoop-3.2.1.tar.gz  

    tar -zxvf hadoop-3.2.1.tar.gz -C $HADOOP_HOME
    ```

2. Configure Hadoop.

    ```
    # $HADOOP_HOME/etc/hadoop/core-site.xml
    <configuration>
        <property>
            <name>fs.defaultFS</name>
            <value>hdfs://localhost:9000</value>
        </property>
    </configuration>

    # $HADOOP_HOME/etc/hadoop/hdfs-site.xml
    <configuration>
        <property>
            <name>dfs.replication</name>
            <value>1</value>
        </property>
    </configuration>
    ```

3. Set passphraseless ssh.

    ```
    # Now check that you can ssh to the localhost without a passphrase:
    $ ssh localhost
    # If you cannot ssh to localhost without a passphrase, execute the following commands
    $ ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
    $ cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
    $ chmod 0600 ~/.ssh/authorized_keys
    ```

4. Start HDFS.

    ```
    # don't execute this command repeatedly, repeat execute will cauld the clusterId of the datanode is not consistent with namenode
    $HADOOP_HOME/bin/hadoop namenode -format
    $HADOOP_HOME/sbin/start-dfs.sh
    ```

5. Navigate to the [HDFS website](http://localhost:9870/). 
   
   You can see the **Overview** page.

    ![](/images/offloaders/filesystem/FileSystem-1.png)

6. At the top navigation bar, click **Datanodes** to check DataNode information.

    ![](/images/offloaders/filesystem/FileSystem-2.png)

7. Click **HTTP Address** to get more detailed information about localhost:9866.

    As can be seen below, the size of **Capacity Used** is 4 KB, which is the initial value.

    ![](/images/offloaders/filesystem/FileSystem-3.png)

## Step 2: Configure filesystem offloader

As indicated in the [configuration chapter](#configuration), you need to configure some properties for the filesystem offloader driver before using it. This tutorial assumes that you have configured the filesystem offloader driver as below and run Pulsar in **standalone** mode.

Set the following configurations in the `conf/standalone.conf` file.

```conf
managedLedgerOffloadDriver=filesystem

fileSystemURI=hdfs://127.0.0.1:9000

fileSystemProfilePath=../conf/filesystem_offload_core_site.xml
```

> #### Note
>
> For testing purposes, you can set the following two configurations to speed up ledger rollover, but it is not recommended that you set them in the product environment.

```
managedLedgerMinLedgerRolloverTimeMinutes=1

managedLedgerMaxEntriesPerLedger=100
```

## Step 3: offload data from BookKeeper to filesystem

Execute the following commands in the repository where you download Pulsar tarball. For example, `~/path/to/apache-pulsar-2.5.1`.

1. Start Pulsar standalone.

    ```
    ./bin/pulsar standalone -a 127.0.0.1
    ```

2. To ensure the data generated is not deleted immediately, it is recommended to set the [retention policy](https://pulsar.apache.org/docs/en/next/cookbooks-retention-expiry/#retention-policies), which can be either a **size** limit or a **time** limit. The larger value you set for the retention policy, the longer the data can be retained.

    ```
    ./bin/pulsarctl namespaces set-retention public/default --size 100M --time 2d
    ```

    > #### Tip
    >
    > For more information about the `pulsarctl namespaces set-retention options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-set-retention-em-). 

4. Produce data using pulsar-client.

    ```
    ./bin/pulsar-client produce -m "Hello FileSystem Offloader" -n 1000 public/default/fs-test
    ```

5. The offloading operation starts after a ledger rollover is triggered. To ensure offload data successfully, it is recommended that you wait until several ledger rollovers are triggered. In this case, you might need to wait for a second. You can check the ledger status using pulsarctl.

    ```
    ./bin/pulsarctl topics internal-stats public/default/fs-test
    ```

	**Output**

    The data of the ledger 696 is not offloaded.

    ```
    {
    "version": 1,
    "creationDate": "2020-06-16T21:46:25.807+08:00",
    "modificationDate": "2020-06-16T21:46:25.821+08:00",
    "ledgers": [
    {
        "ledgerId": 696,
        "isOffloaded": false
    }
    ],
    "cursors": {}
    }
    ```

6. Wait a second and send more messages to the topic.

    ```
    ./bin/pulsar-client produce -m "Hello FileSystem Offloader" -n 1000 public/default/fs-test
    ```

7. Check the ledger status using pulsarctl.

    ```
    ./bin/pulsarctl topics internal-stats public/default/fs-test
    ```

    **Output**

    The ledger 696 is rollovered.

    ```
    {
    "version": 2,
    "creationDate": "2020-06-16T21:46:25.807+08:00",
    "modificationDate": "2020-06-16T21:48:52.288+08:00",
    "ledgers": [
    {
        "ledgerId": 696,
        "entries": 1001,
        "size": 81695,
        "isOffloaded": false
    },
    {
        "ledgerId": 697,
        "isOffloaded": false
    }
    ],
    "cursors": {}
    }
    ```

8. Trigger the offloading operation manually using pulsarctl.
 
    ```
    ./bin/pulsarctl topic offload -s 0 public/default/fs-test
    ```

    **Output**

    Data in ledgers before the ledge 697 is offloaded.

    ```
    # offload info, the ledgers before 697 will be offloaded
    Offload triggered for persistent://public/default/fs-test3 for messages before 697:0:-1
    ```

10. Check the ledger status using pulsarctl.

    ```
    ./bin/pulsarctl topic internal-info public/default/fs-test
    ```

    **Output**

    The data of the ledger 696 is offloaded.

    ```
    {
    "version": 4,
    "creationDate": "2020-06-16T21:46:25.807+08:00",
    "modificationDate": "2020-06-16T21:52:13.25+08:00",
    "ledgers": [
    {
        "ledgerId": 696,
        "entries": 1001,
        "size": 81695,
        "isOffloaded": true
    },
    {
        "ledgerId": 697,
        "isOffloaded": false
    }
    ],
    "cursors": {}
    }
    ```

    And the **Capacity Used** is changed from 4 KB to 116.46 KB.

    ![](/images/offloaders/filesystem/FileSystem-8.png)

# How it works

Pulsar's **segment oriented architecture** allows for topic backlogs to effectively grow very large without limit. However, this can become expensive over time. One way to alleviate this cost is to use **tiered storage**. With tiered storage, older messages in the backlog can be moved from BookKeeper to a cheaper storage mechanism, while still allowing clients to access the backlog as if nothing had changed.

Currently, Pulsar supports **AWS S3**, **GCS**, and **filesystem** for long term storage. Offloading to long term storage can be triggered via REST API or CLI tools. You can pass as many as topics you want to retain on BookKeeper and brokers copy the backlog data to long term storage. The original data is deleted from BookKeeper after a configured delay.

A topic in Pulsar is backed by a log, known as a managed **ledger**. This log is composed of an ordered list of segments. Pulsar **only** writes to the final segment of the log. All previous segments are sealed. The data within the segment is immutable. This is known as a segment oriented architecture.

The tiered storage offloading mechanism takes advantage of this segment oriented architecture. When offloading is requested, the segments of the log are copied, one-by-one, to tiered storage. All segments of the log, apart from the segment currently being written to, can be offloaded.

![](/images/offloaders/gcs/pulsar-tiered-storage.png)

On the broker, you need to configure the bucket and credentials for the cloud storage service. The configured bucket must exist before attempting to offload. If it does not exist, the offload operation fails.

Pulsar uses multi-part objects to upload the segment data. It is possible that a broker could crash while uploading the data. It is recommended that you add a life cycle rule for your bucket to expire incomplete multi-part upload after a day or two to avoid getting charged for incomplete uploads.

# Reference

For more information about tiered storage for Pulsar topics, see [here](https://github.com/apache/pulsar/wiki/PIP-17:-Tiered-storage-for-Pulsar-topics).






