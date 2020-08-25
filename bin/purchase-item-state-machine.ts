#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PurchaseItemStateMachineStack } from '../lib/purchase-item-state-machine-stack';

const app = new cdk.App();
new PurchaseItemStateMachineStack(app, 'PurchaseItemStateMachineStack');
