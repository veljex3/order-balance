import axios from "axios";
import { toast } from "react-toastify";
import { IOrderAdd, IOrderHistory, OrderType } from "../@types/api/order.type";

export const addOrder = async ({
  type,
  symbol,
  price,
  quantity,
  total,
  status,
}: IOrderAdd) => {
  await axios.post("https://order-balance-simulation.onrender.com/order", {
    type,
    symbol,
    price,
    quantity,
    total,
    status,
  });
  if (type === OrderType.BuyMarket || type === OrderType.SellMarktet) {
    toast.success("Successfully Filled!", { position: "top-center" });
  }
  await getOrderHistory();
};

export const getOrderHistory = async () => {
  const result = await axios.get(
    "https://order-balance-simulation.onrender.com/order"
  );
  if (result.status === 200) {
    const data = result.data as [any];
    const orders = data.reverse().map((item) => {
      return {
        _id: item._id,
        created: item.created,
        status: item.status,
        completed: item.completed,
        order: {
          price: item.price,
          quantity: item.quantity,
          total: item.total,
          type: item.type,
          symbol: item.symbol,
        },
      } as IOrderHistory;
    });

    return orders;
  }
};

export const cancelOrder = async (id: string) => {
  const result = await axios.get(
    `https://order-balance-simulation.onrender.com/order/cancel/${id}`
  );
  if (result.status === 200) {
    if (result.data === true) {
      toast.success("Successfully Canceled!", { position: "top-center" });
      await getOrderHistory();
    }
  }
};
