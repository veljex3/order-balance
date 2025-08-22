import { useState, useEffect } from "react";
import Web3 from "web3";
import {
  createOrGetUser,
  getUserBalance,
  resetUserBalance,
  updateUserBalance,
  UserBalance,
} from "../../api/user.api";

declare global {
  interface Window {
    ethereum: any;
  }
}

function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<any>(null);
  const [balances, setBalances] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editBalances, setEditBalances] = useState<UserBalance>({
    BTC: 0,
    ETH: 0,
    LTC: 0,
    XRP: 0,
    USDT: 0,
  });

  // Update the getWalletAddress function in the API files to use this account
  useEffect(() => {
    if (account) {
      // Store wallet address globally for API calls
      (window as any).connectedWalletAddress = account;
      initializeUser();
    }
  }, [account]);

  // Listen for balance refresh events from other components
  useEffect(() => {
    const handleBalanceRefresh = async () => {
      if (account) {
        const userBalances = await getUserBalance();
        setBalances(userBalances);
      }
    };

    // Listen for custom balance refresh events
    window.addEventListener("refreshBalances", handleBalanceRefresh);

    return () => {
      window.removeEventListener("refreshBalances", handleBalanceRefresh);
    };
  }, [account]);

  const initializeUser = async () => {
    if (!account) return;

    setLoading(true);
    try {
      // Create or get user from backend
      await createOrGetUser();

      // Fetch user balances
      const userBalances = await getUserBalance();
      setBalances(userBalances);
    } catch (error) {
      console.error("Failed to initialize user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetBalance = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const newBalances = await resetUserBalance();
      setBalances(newBalances);
    } catch (error) {
      console.error("Failed to reset balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBalance = () => {
    if (balances) {
      setEditBalances({ ...balances });
      setEditMode(true);
    }
  };

  const handleSaveBalance = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const newBalances = await updateUserBalance(editBalances);
      if (newBalances) {
        setBalances(newBalances);
        setEditMode(false);
      }
    } catch (error) {
      console.error("Failed to update balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (balances) {
      setEditBalances({ ...balances });
    }
  };

  const handleBalanceChange = (asset: keyof UserBalance, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditBalances((prev) => ({
      ...prev,
      [asset]: numValue,
    }));
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Get user accounts
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        // Listen for account changes
        window.ethereum.on("accountsChanged", (accounts: string[]) => {
          setAccount(accounts[0]);
          if (accounts[0]) {
            (window as any).connectedWalletAddress = accounts[0];
          }
        });

        // Listen for network changes
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("User denied account access or error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {account ? (
        <div>
          <p>
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          {loading ? (
            <p>Loading...</p>
          ) : balances ? (
            <div style={{ marginTop: "10px" }}>
              <h4>Demo Balances:</h4>
              {editMode ? (
                <div>
                  {Object.entries(editBalances).map(([asset, value]) => (
                    <div
                      key={asset}
                      style={{
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <label style={{ minWidth: "50px", fontSize: "14px" }}>
                        {asset}:
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          handleBalanceChange(
                            asset as keyof UserBalance,
                            e.target.value
                          )
                        }
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "14px",
                          width: "120px",
                        }}
                        min="0"
                        step="any"
                      />
                    </div>
                  ))}
                  <div
                    style={{ marginTop: "10px", display: "flex", gap: "8px" }}
                  >
                    <button
                      onClick={handleSaveBalance}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#4CAF50",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#f44336",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p>BTC: {balances.BTC}</p>
                  <p>ETH: {balances.ETH}</p>
                  <p>LTC: {balances.LTC}</p>
                  <p>XRP: {balances.XRP}</p>
                  <p>USDT: {balances.USDT}</p>
                  <div
                    style={{ marginTop: "10px", display: "flex", gap: "8px" }}
                  >
                    <button
                      onClick={handleEditBalance}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#2196F3",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Edit Balances
                    </button>
                    <button
                      onClick={handleResetBalance}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#ff9800",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnect;
