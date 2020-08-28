export interface UpdateInventoryEvent {
  quantityPurchased: number;
}

exports.updateInventoryHandler = (
  event: UpdateInventoryEvent,
  context: any,
  callback: Function
) => {
  const availableItems = 10;
  console.log(event.quantityPurchased);
  return callback(null, availableItems - event.quantityPurchased);
};

exports.notifySellerHandler = (event: any) => {
  console.log("Pushing to seller SQS, so seller get more items: event");
  return;
};
