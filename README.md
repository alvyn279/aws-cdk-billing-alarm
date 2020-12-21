# aws-cdk-billing-alarm
[![Build status](https://github.com/alvyn279/aws-cdk-billing-alarm/workflows/build/badge.svg)](https://github.com/alvyn279/aws-cdk-billing-alarm/actions/)
[![NPM version](https://badge.fury.io/js/aws-cdk-billing-alarm.svg)](https://www.npmjs.com/package/aws-cdk-billing-alarm)
[![PyPI version](https://badge.fury.io/py/aws-cdk-billing-alarm.svg)](https://pypi.org/project/aws-cdk-billing-alarm/)
[![Mentioned in Awesome CDK](https://awesome.re/mentioned-badge.svg)](https://github.com/kolomied/awesome-cdk)

A CDK construct that sets up email notification for when you exceed a given AWS estimated charges amount.

Create this construct in any stack you find appropriate **with only a few lines**. This construct is an implementation of the manual
setup described on [AWS Estimated Charges Monitoring](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/gs_monitor_estimated_charges_with_cloudwatch.html).

## Get Started

### Pre-Requisites
 
> **IMPORTANT!** Only complete **_Step 1: Enable Billing Alerts_** of the following documentation link. This construct will take
care of creating the rest of the resources for you.

You must first enable billing alerts from the AWS Console as per [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/gs_monitor_estimated_charges_with_cloudwatch.html#gs_turning_on_billing_metrics).

Billing alerts will allow your AWS account to start collecting billing metrics (`EstimatedCharges`) on a periodic 6-hour basis.

### Installation

#### [Node documentation](https://www.npmjs.com/package/aws-cdk-billing-alarm)
```shell
npm install --save aws-cdk-billing-alarm
```

#### [Python documentation](https://pypi.org/project/aws-cdk-billing-alarm/)
```shell
pip install aws-cdk-billing-alarm
```

### Usage
```typescript
import * as cdk from '@aws-cdk/core';
import { BillingAlarm } from 'aws-cdk-billing-alarm';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an alarm that emails `admin@example.com`
    // if estimated charges exceed 50 USD
    new BillingAlarm(this, 'AWSAccountBillingAlarm', {
      monthlyThreshold: 50,
      emails: ['admin@example.com'],
    });
  }
}
```

### Post-Deployment

Confirm the subscription to the newly created topic for the emails you specified as endpoints in `BillingAlarmProps`.
You can do so by clicking on the `SubscribeURL` of the JSON email you received.
> **Note**: If you did not receive the email, you can fire a **Request confirmation** for the subscription from the AWS SNS Console.
   

## Limitations

- [USD currency](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html#creating_billing_alarm_with_wizard)
