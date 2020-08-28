npm run build  
cdk bootstrap aws://347998200077/eu-west-1
cdk deploy PurchaseItemStateMachineStack --require-approval never
# cdk deploy GenerateClientReportStack --require-approval never
# cdk deploy EncryptReportStack --require-approval never
# cdk deploy CleanupStack --require-approval never
# cdk deploy EmailReportStack --require-approval never
# cdk deploy LongTermStoreStack --require-approval never
