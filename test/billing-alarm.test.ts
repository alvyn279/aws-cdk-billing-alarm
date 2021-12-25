/* eslint-disable jest/expect-expect */
import {
  expect as expectCDK,
  countResources,
  haveResource,
  haveResourceLike,
} from '@aws-cdk/assert';
import { App, Stack } from 'aws-cdk-lib';
import { BillingAlarm } from '../lib';

test('BillingAlarm is created', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  // WHEN
  new BillingAlarm(stack, 'MyBillingAlarmConstruct', {
    monthlyThreshold: 50,
    emails: ['admin@example.com'],
  });

  // THEN
  expectCDK(stack).to(countResources('AWS::SNS::Topic', 1));
  expectCDK(stack).to(

    haveResource('AWS::SNS::Topic', {
      TopicName: 'BillingAlarmNotificationTopic',
    }),
  );

  expectCDK(stack).to(countResources('AWS::SNS::Subscription', 1));
  expectCDK(stack).to(
    haveResource('AWS::SNS::Subscription', {
      Protocol: 'email-json',
      TopicArn: {
        Ref:
          'MyBillingAlarmConstructBillingAlarmNotificationTopicEFAE92EB',
      },
      Endpoint: 'admin@example.com',
    }),
  );

  expectCDK(stack).to(countResources('AWS::CloudWatch::Alarm', 1));
  expectCDK(stack).to(
    haveResource('AWS::CloudWatch::Alarm', {
      ComparisonOperator: 'GreaterThanOrEqualToThreshold',
      EvaluationPeriods: 1,
      AlarmActions: [
        {
          Ref:
            'MyBillingAlarmConstructBillingAlarmNotificationTopicEFAE92EB',
        },
      ],
      AlarmDescription: 'Upper monthly billing cost limit',
      MetricName: 'EstimatedCharges',
      Namespace: 'AWS/Billing',
      Period: 32400,
      Statistic: 'Maximum',
      Threshold: 50,
    }),
  );
});

test('BillingAlarm is created with non-round threshold', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  // WHEN
  new BillingAlarm(stack, 'MyBillingAlarmConstruct', {
    monthlyThreshold: 50.5,
    emails: ['admin@example.com'],
  });

  // THEN
  expectCDK(stack).to(countResources('AWS::SNS::Topic', 1));
  expectCDK(stack).to(countResources('AWS::SNS::Subscription', 1));
  expectCDK(stack).to(countResources('AWS::CloudWatch::Alarm', 1));
  expectCDK(stack).to(
    haveResourceLike('AWS::CloudWatch::Alarm', {
      Threshold: 50.5,
    }),
  );
});

test('BillingAlarm construct holds a metric that has USD currency as dimension', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  // WHEN
  new BillingAlarm(stack, 'MyBillingAlarmConstruct', {
    monthlyThreshold: 50,
    emails: ['admin@example.com'],
  });

  // THEN
  expectCDK(stack).to(
    haveResourceLike('AWS::CloudWatch::Alarm', {
      Dimensions: [
        {
          Name: 'Currency',
          Value: 'USD',
        },
      ],
    }),
  );
});

test('BillingAlarm construct supports multiple emails in topic subscriptions', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  // WHEN
  new BillingAlarm(stack, 'MyBillingAlarmConstruct', {
    monthlyThreshold: 50,
    emails: ['admin@example.com', 'admin2@example.com'],
  });

  expectCDK(stack).to(countResources('AWS::SNS::Subscription', 2));
  expectCDK(stack).to(
    haveResource('AWS::SNS::Subscription', {
      Protocol: 'email-json',
      TopicArn: {
        Ref:
          'MyBillingAlarmConstructBillingAlarmNotificationTopicEFAE92EB',
      },
      Endpoint: 'admin@example.com',
    }),
  );
  expectCDK(stack).to(
    haveResource('AWS::SNS::Subscription', {
      Protocol: 'email-json',
      TopicArn: {
        Ref:
          'MyBillingAlarmConstructBillingAlarmNotificationTopicEFAE92EB',
      },
      Endpoint: 'admin2@example.com',
    }),
  );
});

test('BillingAlarm throws error when no emails are supplied', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  // WHEN
  expect(() => {
    new BillingAlarm(stack, 'MyBillingAlarmConstruct', {
      monthlyThreshold: 50,
      emails: [],
    });
  }).toThrow(/Cannot supply an empty array of email subscriptions/);
});
