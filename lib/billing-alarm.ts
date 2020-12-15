import * as cdk from '@aws-cdk/core';

export interface BillingAlarmProps {
  // Define construct properties here
}

export class BillingAlarm extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: BillingAlarmProps = {}) {
    super(scope, id);

    // Define construct contents here
  }
}
