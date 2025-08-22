import { axios } from "@axios";
import { toast } from "react-toastify";

// Get wallet address from the connected wallet
const getWalletAddress = (): string => {
  const connectedAddress = (window as any).connectedWalletAddress;
  if (!connectedAddress) {
    throw new Error("No wallet connected. Please connect your wallet first.");
  }
  return connectedAddress;
};

export interface UserBalance {
  BTC: number;
  ETH: number;
  LTC: number;
  XRP: number;
  USDT: number;
}

export interface UserStats {
  totalOrders: number;
  filledOrders: number;
  canceledOrders: number;
  pendingOrders: number;
  totalVolume: number;
  symbolBreakdown: Record<string, { orders: number; volume: number }>;
  totalPnL: number;
  positions: Record<string, any>;
}

// Create or get user
export const createOrGetUser = async () => {
  try {
    const walletAddress = getWalletAddress();
    const response = await axios.post("/user/create", {
      walletAddress,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      toast.error(response.data.message || "Failed to create user", {
        position: "top-center",
      });
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create user";
    toast.error(errorMessage, { position: "top-center" });
    throw error;
  }
};

// Get user balance
export const getUserBalance = async (): Promise<UserBalance | null> => {
  try {
    const walletAddress = getWalletAddress();
    const response = await axios.get(`/user/balance/${walletAddress}`);

    if (response.data.success) {
      return response.data.data.balances;
    } else {
      toast.error(response.data.message || "Failed to get balance", {
        position: "top-center",
      });
      return null;
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to get balance";
    toast.error(errorMessage, { position: "top-center" });
    return null;
  }
};

// Reset user balance to demo defaults
export const resetUserBalance = async (): Promise<UserBalance | null> => {
  try {
    const walletAddress = getWalletAddress();
    const response = await axios.post(`/user/balance/reset/${walletAddress}`);

    if (response.data.success) {
      toast.success("Demo balance reset successfully!", {
        position: "top-center",
      });
      return response.data.data.balances;
    } else {
      toast.error(response.data.message || "Failed to reset balance", {
        position: "top-center",
      });
      return null;
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to reset balance";
    toast.error(errorMessage, { position: "top-center" });
    return null;
  }
};

// Update user balance with custom amounts
export const updateUserBalance = async (
  balances: Partial<UserBalance>
): Promise<UserBalance | null> => {
  try {
    const walletAddress = getWalletAddress();
    const response = await axios.post(`/user/balance/update/${walletAddress}`, {
      balances,
    });

    if (response.data.success) {
      toast.success("Demo balance updated successfully!", {
        position: "top-center",
      });
      return response.data.data.balances;
    } else {
      toast.error(response.data.message || "Failed to update balance", {
        position: "top-center",
      });
      return null;
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update balance";
    toast.error(errorMessage, { position: "top-center" });
    return null;
  }
};
