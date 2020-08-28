import { Stack, Construct, StackProps, Duration } from "@aws-cdk/core";
import { Function, Code, Runtime } from "@aws-cdk/aws-lambda";
import {
  Chain,
  StateMachine,
  Task,
  Pass,
  Choice,
  Wait,
  WaitTime,
  Condition,
  Parallel,
} from "@aws-cdk/aws-stepfunctions";
import { InvokeFunction } from "@aws-cdk/aws-stepfunctions-tasks";

export class PurchaseItemStateMachineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaUpdateInventory = new Function(this, "LambdaUpdateInventory", {
      runtime: Runtime.NODEJS_12_X,
      handler: "lambda-handlers.updateInventoryHandler",
      code: Code.asset("resources"),
    });

    const lambdaNotifySeller = new Function(this, "LambdaNotifySeller", {
      runtime: Runtime.NODEJS_12_X,
      handler: "lambda-handlers.notifySellerHandler",
      code: Code.asset("resources"),
    });

    const exitOnFailureTask = new Pass(this, "exitOnFailureTask");
    const updateInventoryTask = new Task(this, "UpdateInventoryTask", {
      task: new InvokeFunction(lambdaUpdateInventory),
      resultPath: "$.remainingItems",
    }).addRetry({
      maxAttempts: 2,
      interval: Duration.seconds(2),
    })
      .addCatch(exitOnFailureTask, {
        errors: ["NoChoiceMatched", "Timeout", "TypeError"],
      });

    const callBillingGatewayTask = new Pass(this, "CallBillingGatewayTask");

    const checkRemainingItemsChoice = new Choice(
      this,
      "CheckRemainingItemsChoice"
    );
    const waitForAWhile = new Wait(this, "WaitForAWhileWait", {
      time: WaitTime.duration(Duration.seconds(5)),
    });
    const notifySellerTask = new Task(this, "NotifySellerTask", {
      task: new InvokeFunction(lambdaNotifySeller),
    });

    const sendCustomerNotificationTask = new Pass(this, "SendCustomerNotificationTask");
    const sendSellerNotificationTask = new Pass(this, "SendSellerNotificationTask");
    const sendNotificationParallel = new Parallel(this, "SendNotificationParallel");
  
    const workflow = Chain.start(updateInventoryTask).next(
      checkRemainingItemsChoice
        .when(Condition.numberGreaterThanEquals("$.remainingItems", 0), 
          callBillingGatewayTask.next(
            sendNotificationParallel
              .branch(sendCustomerNotificationTask)
              .branch(sendSellerNotificationTask)
          ))
        .otherwise(notifySellerTask.next(waitForAWhile).next(updateInventoryTask))
    );

    //"Flow started when user purchase an item, must pass itemId and quantity",
    new StateMachine(this, "PurchaseItemStateMachine", {
      stateMachineName: "PurchaseItemStateMachine",
      definition: workflow,
    });
  }
}
