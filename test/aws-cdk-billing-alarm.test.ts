import {
  expect as expectCDK, countResources, haveResource, haveResourceLike,
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { BillingAlarm } from '../lib';

test('BillingAlarm is created', () => {
  // GIVEN
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  // WHEN
  new BillingAlarm(stack, 'MyBillingAlarmConstruct', {
    monthlyThreshold: 50,
    email: 'admin@example.com',
  });

  // THEN
  expectCDK(stack).to(countResources('AWS::SNS::Topic', 1));
  expectCDK(stack).to(haveResource('AWS::SNS::Topic', {
    TopicName: 'BillingAlarmNotificationTopic',
  }));

  expectCDK(stack).to(countResources('AWS::SNS::Subscription', 1));
  expectCDK(stack).to(haveResource('AWS::SNS::Subscription', {
    Protocol: 'email-json',
    TopicArn: {
      Ref: 'MyBillingAlarmConstructBillingAlarmNotificationTopicEFAE92EB',
    },
    Endpoint: 'admin@example.com',
  }));

  expectCDK(stack).to(countResources('AWS::CloudWatch::Alarm', 1));
  expectCDK(stack).to(haveResource('AWS::CloudWatch::Alarm', {
    ComparisonOperator: 'GreaterThanOrEqualToThreshold',
    EvaluationPeriods: 1,
    AlarmActions: [
      {
        Ref: 'MyBillingAlarmConstructBillingAlarmNotificationTopicEFAE92EB',
      },
    ],
    AlarmDescription: 'Upper monthly billing cost limit',
    MetricName: 'EstimatedCharges',
    Namespace: 'AWS/Billing',
    Period: 32400,
    Statistic: 'Maximum',
    Threshold: 50,
  }));
});

test('BillingAlarm is created with non-round threshold', () => {
  // GIVEN
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  // WHEN
  new BillingAlarm(stack, 'MyBillingAlarmConstruct', {
    monthlyThreshold: 50.50,
    email: 'admin@example.com',
  });

  // THEN
  expectCDK(stack).to(countResources('AWS::SNS::Topic', 1));
  expectCDK(stack).to(countResources('AWS::SNS::Subscription', 1));
  expectCDK(stack).to(countResources('AWS::CloudWatch::Alarm', 1));
  expectCDK(stack).to(haveResourceLike('AWS::CloudWatch::Alarm', {
    Threshold: 50.5,
  }));
});
