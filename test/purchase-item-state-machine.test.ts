import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as PurchaseItemStateMachine from '../lib/purchase-item-state-machine-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new PurchaseItemStateMachine.PurchaseItemStateMachineStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
