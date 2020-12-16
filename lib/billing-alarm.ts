import * as cdk from '@aws-cdk/core';
import * as cw from '@aws-cdk/aws-cloudwatch';
import * as cwa from '@aws-cdk/aws-cloudwatch-actions';
import * as sns from '@aws-cdk/aws-sns';
import * as sub from '@aws-cdk/aws-sns-subscriptions';

/**
 * Properties for a BillingAlarm
 */
export interface BillingAlarmProps {
  /**
   * Monetary amount threshold in USD that represents the maximum exclusive
   * limit before which the alarm is triggered and the notification sent.
   */
  readonly monthlyThreshold: number;

  /**
   * The email to which the alarm-triggered notification will be sent.
   */
  readonly email: string;
}

/**
 * A CDK construct that sets up email notification for when you exceed a given AWS
 * estimated charges amount.
 *
 * Note: The email address used as SNS Topic endpoint must be manually confirmed
 * once the stack is deployed.
 */
export class BillingAlarm extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: BillingAlarmProps) {
    super(scope, id);

    const billingAlarmTopic: sns.ITopic = new sns.Topic(this, 'BillingAlarmNotificationTopic', {
      topicName: 'BillingAlarmNotificationTopic',
    });

    billingAlarmTopic.addSubscription(new sub.EmailSubscription(props.email, {
      json: true,
    }));

    const billingAlarmMetric: cw.Metric = new cw.Metric({
      metricName: 'EstimatedCharges',
      namespace: 'AWS/Billing',
      statistic: 'Maximum',
      dimensions: {
        Currency: 'USD',
      },
    }).with({
      // Evaluates the metric every 9 hours. This is needed because
      // `EstimatedCharges` metrics is updated every 6 hours
      // See: https://forums.aws.amazon.com/thread.jspa?threadID=135955
      period: cdk.Duration.hours(9),
    });

    const billingAlarm: cw.Alarm = new cw.Alarm(this, 'BillingCloudWatchAlarm', {
      alarmDescription: 'Upper monthly billing cost limit',
      comparisonOperator: cw.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 1,
      metric: billingAlarmMetric,
      threshold: props.monthlyThreshold,
    });

    const alarmAction: cwa.SnsAction = new cwa.SnsAction(billingAlarmTopic);

    billingAlarm.addAlarmAction(alarmAction);
  }
}
