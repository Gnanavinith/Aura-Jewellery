export const calculateItemTotal = (weight, rate, makingCharges = 0) => {
  return (weight * rate) + makingCharges;
};

export const calculateBillTotals = (items, taxRate = 0, discount = 0) => {
  const subTotal = items.reduce((acc, item) => acc + item.total, 0);
  const taxAmount = (subTotal * taxRate) / 100;
  const grandTotal = subTotal + taxAmount - discount;

  return {
    subTotal,
    taxAmount,
    grandTotal
  };
};
