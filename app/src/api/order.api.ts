import { axios } from "@axios";
import { toast } from "react-toastify";
import { IOrderAdd, IOrderHistory, OrderType } from "../types/api/order.type";

// Get wallet address from the connected wallet
const getWalletAddress = (): string => {
  const connectedAddress = (window as any).connectedWalletAddress;
  if (!connectedAddress) {
    throw new Error("No wallet connected. Please connect your wallet first.");
  }
  return connectedAddress;
};

export const addOrder = async ({
  type,
  symbol,
  price,
  quantity,
  total,
  status,
}: IOrderAdd) => {
  try {
    const walletAddress = getWalletAddress();
    const response = await axios.post("/order/add", {
      type,
      symbol,
      price,
      quantity,
      total,
      status,
      walletAddress,
    });

    if (response.data.success) {
      if (type === OrderType.BuyMarket || type === OrderType.SellMarktet) {
        toast.success("Successfully Filled!", { position: "top-center" });
      } else {
        toast.success("Order placed successfully!", { position: "top-center" });
      }
      await getOrderHistory();
      return response.data;
    } else {
      toast.error(response.data.message || "Failed to place order", {
        position: "top-center",
      });
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to place order";
    toast.error(errorMessage, { position: "top-center" });
    throw error;
  }
};

export const getOrderHistory = async () => {
  try {
    const walletAddress = getWalletAddress();
    const result = await axios.get(
      `/order/history?walletAddress=${walletAddress}`
    );

    if (result.status === 200 && result.data.success) {
      const orders = result.data.data.map((item: any) => {
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
  } catch (error: any) {
    console.error("Failed to get order history:", error);
    toast.error("Failed to load order history", { position: "top-center" });
    return [];
  }
};

export const cancelOrder = async (id: string) => {
  try {
    const walletAddress = getWalletAddress();
    const result = await axios.post(`/order/cancel/${id}`, {
      walletAddress,
    });

    if (result.status === 200 && result.data.success) {
      toast.success("Order canceled successfully!", { position: "top-center" });
      await getOrderHistory();
      return result.data;
    } else {
      toast.error(result.data.message || "Failed to cancel order", {
        position: "top-center",
      });
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to cancel order";
    toast.error(errorMessage, { position: "top-center" });
    throw error;
  }
};
