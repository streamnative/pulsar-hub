---
description: Use AWS S3 offloader with Pulsar
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/master/tiered-storage/jcloud/src/main/java/org/apache/bookkeeper/mledger/offload/jcloud"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["AWS S3", "Offloader", "Pulsar"]
alias: AWS S3 offloader
features: ["Offload data from BookKeeper to AWS S3"]
icon: "/images/offloaders/aws-logo.png"
download: "https://www.apache.org/dyn/mirrors/mirrors.cgi?action=download&filename=pulsar/pulsar-2.5.1/apache-pulsar-offloaders-2.5.1-bin.tar.gz"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "aws-s3"
---

# Overview

To deliver an event streaming service, Pulsar needs to manage large numbers of messages and data in real-time, and this requires keeping large amounts of data on the platform, or readily accessible. As the data amount increases, it becomes significantly more expensive to store, manage, and retrieve data, so administrators and developers look to external stores for long-term storage. 

Pulsar leverages a unique **tiered storage** solution that addresses some of these key challenges faced by other distributed log systems. This tiered storage solution extends the storage capabilities of Pulsar by offloading data from Apache BookKeeper to scalable cloud-native storage or filesystems without adding storage. Older topic data can be offloaded to long-term storage that readily scales with the volume of data. 

* Tiered storage uses [Apache jclouds](https://jclouds.apache.org) to support
[AWS S3](https://aws.amazon.com/s3/) and [GCS (Google Cloud Storage)](https://cloud.google.com/storage/) for long term storage. 


    With jclouds, it is easy to add support for more
[cloud storage providers](https://jclouds.apache.org/reference/providers/#blobstore-providers) in the future.

* Tiered storage uses [Apache Hadoop](http://hadoop.apache.org/) to support file systems for long term storage. 

    With Hadoop, it is easy to add support for more file systems in the future.

In this way, on the one hand, tiered storage is much cheaper than the storage in Pulsar clusters; on the other hand, there is no perceivable difference in consuming a topic no matter whether data is stored on tiered storage or on Pulsar clusters. They produce and consume messages in exactly the same way.

Additionally, Pulsar is able to retain both historic and real-time data and provides a unified view as infinite event streams, which can be easily reprocessed or backloaded into new systems. You can integrate Pulsar with a unified data processing engine (such as Apache Flink or Apache Spark) to unlock many new use cases stemming from infinite data retention.

# Installation

Follow the steps below to install the AWS S3 offloader.

## Prerequisite

- Filesystem: 2.4.2 or later versions
  
- Apache jclouds: 2.2.0 or later versions

## Step

1. Download Pulsar tarball using one of the following ways:

   * download from the [Apache mirror](https://archive.apache.org/dist/pulsar/pulsar-2.5.1/apache-pulsar-2.5.1-bin.tar.gz)

   * download from the Pulsar [downloads page](https://pulsar.apache.org/download)

   * use [wget](https://www.gnu.org/software/wget):

     ```shell
     wget https://archive.apache.org/dist/pulsar/pulsar-2.5.1/apache-pulsar-2.5.1-bin.tar.gz
     ```

2. Download and untar the Pulsar offloaders package. 

    ```bash
    wget https://downloads.apache.org/pulsar/pulsar-2.5.1/apache-pulsar-offloaders-2.5.1-bin.tar.gz
    tar xvfz apache-pulsar-offloaders-2.5.1-bin.tar.gz
    ```

3. Copy the Pulsar offloaders as `offloaders` in the Pulsar directory.

    ```
    mv apache-pulsar-offloaders-2.5.1/offloaders apache-pulsar-2.5.1/offloaders

    ls offloaders
    ```

    **Output**

    As can be seen from the output, Pulsar uses [Apache jclouds](https://jclouds.apache.org) to support [AWS S3](https://aws.amazon.com/s3/) and [GCS](https://cloud.google.com/storage/) for long term storage. 


    ```
    tiered-storage-file-system-2.5.1.nar
    tiered-storage-jcloud-2.5.1.nar
    ```

    > #### Note
    >
    > * If you are running Pulsar in a bare metal cluster, make sure that `offloaders` tarball is unzipped in every broker's Pulsar directory.
    > 
    > * If you are running Pulsar in Docker or deploying Pulsar using a Docker image (such as K8S and DCOS), you can use the `apachepulsar/pulsar-all` image instead of the `apachepulsar/pulsar` image. `apachepulsar/pulsar-all` image has already bundled tiered storage offloaders.

# Configuration

> #### Note
> 
> Before offloading data from BookKeeper to AWS S3, you need to configure some properties of the AWS S3 offload driver.

Besides, you can also configure the AWS S3 offloader to run automatically or trigger it manually.

## Configure AWS S3 offloader driver

You can configure the AWS S3 offloader driver in the configuration file `broker.conf`.

- **Required** configurations are as below.
  
    Required configuration | Description | Example value
    |---|---|---
    `managedLedgerOffloadDriver` | Offloader driver name, which is case-insensitive. <br><br>**Note**: there is a third driver type, s3, which is identical to aws-s3, though it requires that you specify an endpoint URL using `s3ManagedLedgerOffloadServiceEndpoint`. This is useful if using an s3 compatible data store other than AWS S3. | aws-s3
    `offloadersDirectory` | Offloader directory | offloaders
    `s3ManagedLedgerOffloadBucket` | Bucket | pulsar-topic-offload


- **Optional** configurations are as below.

    Optional | Description | Example value
    |---|---|---
    `s3ManagedLedgerOffloadRegion` | Bucket region | eu-west-3
    `s3ManagedLedgerOffloadReadBufferSizeInBytes`|Size of block read|1 MB
    `s3ManagedLedgerOffloadMaxBlockSizeInBytes`|Size of block write|64 MB
    `managedLedgerMinLedgerRolloverTimeMinutes`|Minimum time between ledger rollover for a topic<br><br>**Note**: it is not recommended that you set this configuration in the product environment.|2
    `managedLedgerMaxEntriesPerLedger`|Max number of entries to append to a ledger before triggering a rollover.<br><br>**Note**: it is not recommended that you set this configuration in the product environment.|5000

### Bucket (required)

A bucket is a basic container that holds your data. Everything you store in AWS S3 must be contained in a bucket. You can use a bucket to organize your data and control access to your data, but unlike directory and folder, you cannot nest a bucket.

#### Example

This example names the bucket as _pulsar-topic-offload_.

```conf
s3ManagedLedgerOffloadBucket=pulsar-topic-offload
```

### Bucket region 

Bucket region is the region where a bucket is located. If a bucket region is not specified, the **default** region (`US East (N. Virginia)`) is used.

> #### Tip
>
> For more information about AWS regions and endpoints, see [here](https://docs.aws.amazon.com/general/latest/gr/rande.html].
> 
#### Example

This example sets the bucket region as _europe-west-3_.

```
s3ManagedLedgerOffloadRegion=eu-west-3
```

### Authentication (required)

To be able to access AWS S3, you need to authenticate with AWS S3.

Pulsar does not provide any direct methods of configuring authentication for AWS S3,
but relies on the mechanisms supported by the
[DefaultAWSCredentialsProviderChain](https://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/auth/DefaultAWSCredentialsProviderChain.html).

Once you have created a set of credentials in the AWS IAM console, you can configure credentials using the following method.

* Use EC2 instance metadata credentials

    If you are on AWS instance with an instance profile that provides credentials, StreamNative uses these credentials if no other mechanism is provided

* Set the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `conf/pulsar_env.s`.

    "export" is important so that the variables are made available in the environment of spawned processes.

    ```bash
    export AWS_ACCESS_KEY_ID=ABC123456789
    export AWS_SECRET_ACCESS_KEY=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c
    ```

* Add the Java system properties `aws.accessKeyId` and `aws.secretKey` to `PULSAR_EXTRA_OPTS` in `conf/pulsar_env.sh`.

    ```bash
    PULSAR_EXTRA_OPTS="${PULSAR_EXTRA_OPTS} ${PULSAR_MEM} ${PULSAR_GC} -Daws.accessKeyId=ABC123456789 -Daws.secretKey=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c -Dio.netty.leakDetectionLevel=disabled -Dio.netty.recycler.maxCapacity.default=1000 -Dio.netty.recycler.linkCapacity=1024"
    ```

* Set the access credentials in `~/.aws/credentials`.

    ```conf
    [default]
    aws_access_key_id=ABC123456789
    aws_secret_access_key=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c
    ```

* Assume an IAM role.

    This example uses the `DefaultAWSCredentialsProviderChain` for assuming this role.

    The broker must be rebooted for credentials specified in `pulsar_env` to take effect.

    ```conf
    s3ManagedLedgerOffloadRole=<aws role arn>
    s3ManagedLedgerOffloadRoleSessionName=pulsar-s3-offload
    ```

### Size of block read/write

You can configure the size of a request sent to or read from AWS S3 in the configuration file `broker.conf` or `standalone.conf`. 

Configuration|Description|Default value
|---|---|---
`s3ManagedLedgerOffloadReadBufferSizeInBytes`|Block size for each individual read when reading back data from AWS S3.|1 MB
`s3ManagedLedgerOffloadMaxBlockSizeInBytes`|Maximum size of a "part" sent during a multipart upload to GCS. It **cannot** be smaller than 5 MB. |64 MB

## Configure AWS S3 offloader to run automatically

Namespace policy can be configured to offload data automatically once a threshold is reached. The threshold is based on the size of data that a topic has stored on a Pulsar cluster. Once the topic reaches the threshold, an offloading operation is triggered automatically. 

Threshold value|Action
|---|---
0|It causes a broker to offload data as soon as possible.
Negative value|It disables automatic offloading.

Automatic offload runs when a new segment is added to a topic log. If you set the threshold on a namespace, but few messages are being produced to the topic, offload does not work until the current segment is full.

You can configure the threshold size using CLI tools, such as [pulsarctl](https://streamnative.io/docs/v1.0.0/manage-and-monitor/pulsarctl/overview/) or pulsar-admin.

### Example

This example sets the AWS S3 offloader threshold size to 10 MB using pulsar-admin.

```bash
bin/pulsar-admin namespaces set-offload-threshold --size 10M my-tenant/my-namespace
```

> #### Tip
>
> For more information about the `pulsar-admin namespaces set-offload-threshold options` command, including flags, descriptions, and default values, see [here](http://pulsar.apache.org/tools/pulsar-admin/2.6.0-SNAPSHOT/#-em-set-offload-threshold-em-). 

## Configure AWS S3 offloader to run manually

For individual topics, you can trigger AWS S3 offloader manually using the following methods:

- Use REST endpoint 

- Use CLI tools (such as [pulsarctl](https://streamnative.io/docs/v1.0.0/manage-and-monitor/pulsarctl/overview/) or pulsar-admin). 

    To trigger via CLI tools, you need to specify the maximum amount of data (threshold) that should be retained on a Pulsar cluster for a topic. If the size of the topic data on the Pulsar cluster exceeds this threshold, segments from the topic are moved to AWS S3 until the threshold is no longer exceeded. Older segments are moved first.

### Example

- This example triggers AWS S3 offloader to run manually using pulsar-admin.

    ```bash
    bin/pulsar-admin topics offload --size-threshold 10M my-tenant/my-namespace/topic1
    ``` 

    **Output**

    ```bash
    Offload triggered for persistent://my-tenant/my-namespace/topic1 for messages before 2:0:-1
    ```

    > #### Tip
    >
    > For more information about the `pulsar-admin topics offload options` command, including flags, descriptions, and default values, see [here](http://pulsar.apache.org/tools/pulsar-admin/2.6.0-SNAPSHOT/#-em-offload-em-). 

- This example checks AWS S3 offloader status using pulsar-admin.

    ```bash
    bin/pulsar-admin topics offload-status persistent://my-tenant/my-namespace/topic1
    ```

    **Output**

    ```bash
    Offload is currently running
    ```

    To wait for AWS S3 offloader to complete the job, add the `-w` flag.

    ```bash
    bin/pulsar-admin topics offload-status -w persistent://my-tenant/my-namespace/topic1
    ```

    **Output**
    
    ```
    Offload was a success
    ```


    If there is an error in offloading, the error is propagated to the `pulsar-admin topics offload-status` command.

    ```bash
    bin/pulsar-admin topics offload-status persistent://my-tenant/my-namespace/topic1
    ```

    **Output**

    ```
    Error in offload
    null

    Reason: Error offloading: org.apache.bookkeeper.mledger.ManagedLedgerException: java.util.concurrent.CompletionException: com.amazonaws.services.s3.model.AmazonS3Exception: Anonymous users cannot initiate multipart uploads.  Please authenticate. (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied; Request ID: 798758DE3F1776DF; S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=), S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=
    ````

    > #### Tip
    >
    > For more information about the `pulsar-admin topics offload-status options` command, including flags, descriptions, and default values, see [here](http://pulsar.apache.org/tools/pulsar-admin/2.6.0-SNAPSHOT/#-em-offload-status-em-). 



# Usage

This tutorial provides step-by-step instructions on how to use AWS S3 offloader with Pulsar.

## Step 1: configure AWS S3 offloader driver

As indicated in the [configuration chapter](#configuration), you need to configure some properties for the AWS S3 offloader driver before using it. This tutorial assumes that you have configured the AWS S3 offloader driver as below and run Pulsar in **standalone** mode.

- Set the following configurations in `conf/standalone.conf`.

    ```conf
    managedLedgerOffloadDriver=aws-s3

    s3ManagedLedgerOffloadBucket=test-pulsar-offload

    s3ManagedLedgerOffloadRegion=us-west-2
    ```

    > #### Note
    >
    > For testing purposes, you can set the following two configurations to speed up ledger rollover, but it is not recommended that you set them in the product environment.

    ```
    managedLedgerMinLedgerRolloverTimeMinutes=1

    managedLedgerMaxEntriesPerLedger=5000
    ```

- Set the following configurations in `conf/pulsar_env.sh`.

    ```conf
    export AWS_ACCESS_KEY_ID=ABCDEFG123456789

    export AWS_SECRET_ACCESS_KEY=QWERYHBDSSGJJBVCCDCCC
    ```

## Step 2: create AWS S3 bucket 

Before uploading data to AWS S3, you need to create a bucket in one of the AWS regions to store your data. After creating a bucket, you can upload an unlimited number of data objects to the bucket.

Buckets have configuration properties, including geographical region, access settings for the objects in the bucket, and other metadata.

1. Sign in to the AWS Management Console and open the [Amazon S3 console](https://console.aws.amazon.com/s3/).

2. Click **Create bucket**.

    ![](/images/offloaders/aws-s3/create-s3-1.png)


3. Set your **Bucket name** and [**Region**](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region).

    > #### Note
    >
    >  After creating a bucket, you cannot change its name. For information about naming buckets, see [rules for bucket naming](https://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html#bucketnamingrules). 

    The bucket name should be the same as the value of `s3ManagedLedgerOffloadBucket` and the region should be the same as the value of `s3ManagedLedgerOffloadRegion` that you configured in [Step 1: configure AWS S3 offloader driver](#step-1-configure-aws-s3-offloader-driver).

    ![](/images/offloaders/aws-s3/create-s3-2.png)


4. In **Bucket settings for Block Public Access**, choose the block public access settings that you want to apply to the bucket. 

    ![](/images/offloaders/aws-s3/create-s3-3.png)


5. Click **Create bucket**. Now you have successfully created a bucket.

    ![](/images/offloaders/aws-s3/create-s3-4.png)


## Step 3: create a group

1. Sign in to the AWS Management Console and open the [IAM console](https://console.aws.amazon.com/iam/).

2. In the navigation pane, click **Groups** > **Create New Group**.

    ![](/images/offloaders/aws-s3/create-group-1.png)

3. In the **Group Name** box, type the name of the group and click **Next Step**.

    ![](/images/offloaders/aws-s3/create-group-2.png)

4. In the list of policies, select the check box for each policy that you want to apply to all members of the group and click **Next Step**.

    ![](/images/offloaders/aws-s3/create-group-3.png)


5. Check all of the choices you made up to this point. When you are ready to proceed, choose **Create Group**.

    ![](/images/offloaders/aws-s3/create-group-4.png)

    You have successfully created a group as below.

    ![](/images/offloaders/aws-s3/create-group-5.png)

## Step 4: create a user

1. Sign in to the AWS Management Console and open the [IAM console](https://console.aws.amazon.com/iam/).

2. In the navigation pane, click **Users** > **Add user**. 

![](/images/offloaders/aws-s3/create-user-1.png)


3. Type your **user name** (not case-sensitive) and select **AWS access type**. 
   
![](/images/offloaders/aws-s3/create-user-2.png)


1. Click **Next Permissions**.


2. On the **Set permissions** page, specify how you want to assign permissions to your user. 

![](/images/offloaders/aws-s3/create-user-3.png)

6. Click **Next Tags**.

7. (Optional) Set tags for your user and click **Next: Review**.

> #### Tip
>
> For more information about using tags in IAM, see [tagging IAM users and roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_tags.html).

![](/images/offloaders/aws-s3/create-user-4.png)

8. Check all of the choices you made up to this point. When you are ready to proceed, choose **Create user**.

![](/images/offloaders/aws-s3/create-user-5.png)

9. To view the users' access keys (`access key IDs` and `secret access keys`), click **Show** next to each password and access key that you want to see. 

    The `access key IDs` should be the same as the value of `AWS_ACCESS_KEY_ID` and the `secret access keys` should be the same as the value of `AWS_SECRET_ACCESS_KEY` that you configured in [Step 1: configure AWS S3 offloader driver](#step-1-configure-aws-s3-offloader-driver).

    > #### Note
    > 
    >  To save the access keys, click **Download .csv** and then save the file to a safe location.
    This is your **only opportunity** to view or download the secret access keys, and you **must** provide this information to your users before they can use the AWS API. Make sure you have saved the user's new access key ID and secret access key in a safe and secure place. You **do not have access** to the secret keys again after this step.

    ![](/images/offloaders/aws-s3/create-user-6.png)


## Step 5: offload data from BookKeeper to AWS S3

Execute the following commands in the repository where you download Pulsar tarball. For example, `~/path/to/apache-pulsar-2.5.1`.

1. Start Pulsar standalone.

    ```
    ./bin/pulsar standalone -a 127.0.0.1
    ```

2. To ensure the data generated is not deleted immediately, it is recommended to set the [retention policy](https://pulsar.apache.org/docs/en/next/cookbooks-retention-expiry/#retention-policies), which can be either a **size** limit or a **time** limit. The larger value you set for the retention policy, the longer the data can be retained.

    ```
    ./bin/pulsar-admin namespaces set-retention public/default --size -10G --time 3d
    ```

    > #### Tip
    >
    > For more information about the `pulsar-admin namespaces set-retention options` command, including flags, descriptions, and default values, see [here](http://pulsar.apache.org/tools/pulsar-admin/2.6.0-SNAPSHOT/#-em-set-retention-em-). 

3. To configure AWS S3 offloader, you can set offloader policy at the namespace level.

	```
    ./bin/pulsar-admin namespaces set-offload-policies -b test-pulsar-offload -d aws-s3 -r us-west-2 public/default
    ```

    > #### Tip
    >
    > For more information about the `pulsar-admin namespaces set-offload-policies` command, including flags, descriptions, and default values, see [here](http://pulsar.apache.org/tools/pulsar-admin/2.6.0-SNAPSHOT/#-em-set-offload-policies-em-). 

	If you want to check whether you have configured the offloader successfully, you can use the command [`pulsar-admin namespaces get-offload-policies`](http://pulsar.apache.org/tools/pulsar-admin/2.6.0-SNAPSHOT/#-em-get-offload-policies-em-).

4. Produce data using pulsar-perf. 

    ```
    ./bin/pulsar-perf produce -r 1000 -s 2048 test-topic
    ```

5. The offloading operation starts after a ledge rollover is triggered. To ensure offload data successfully, it is recommended that you wait until several ledge rollovers are triggered. In this case, you might need to wait for a second. You can check the ledge status using pulsar-admin.
 
    ```
    ./bin/pulsar-admin topics stats-internal test-topic
    ```
	
6. After ledger rollover, trigger the offloading operation manually.

    You can also trigger the offloading operation automatically. For more information, see [Configure AWS S3 offloader to run automatically](#configure-aws-s3-offloader-to-run-automatically)

    ```
    ./bin/pulsar-admin topics offload --size-threshold 10M public/default/test-topic
    ```

    **Output**

    ```
    Offload triggered for persistent://public/default/test-topic for messages before 12:0:-1
    ```

7. Check the offloading operation status.

	```
    ./bin/pulsar-admin topics offload-status -w public/default/test-topic
    ```
	
	You might need to wait for a while until the offloading operation finishes.

    **Output**

    ```
    Offload was a success
    ```

	At last, you can see the data is offloaded to AWS S3 successfully.

    ![](/images/offloaders/aws-s3/complete-en.png)


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
