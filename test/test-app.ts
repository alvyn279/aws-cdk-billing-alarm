import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BillingAlarm } from '../lib/billing-alarm';

// TODO: fill in test inputs here
const ACCOUNT_ID = '<YOUR TEST ACCOUNT ID HERE>';
const REGION = '<REGION HERE>';
const SAMPLE_EMAIL = '<YOUR EMAIL HERE>';

class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new BillingAlarm(this, 'AWSAccountBillingAlarm', {
      monthlyThreshold: 50,
      emails: [SAMPLE_EMAIL],
    });
  }
}

const app = new App();

new CdkStack(app, 'TestBillingAlarmStack', {
  env: {
    account: ACCOUNT_ID,
    region: REGION,
  },
});

app.synth();
