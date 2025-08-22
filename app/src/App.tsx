import RealtimeChart from "./components/custom/RealtimeChart";
import OrderBook from "./components/custom/OrderBook";
import { useDispatch, useSelector } from "react-redux";
import {
  IStoreState,
  setCurrentSymbol,
  setOrders,
  setBalance1,
  setBalance2,
} from "./domain/store";
import { colorVariants, symbols } from "./utils/constant";
import { useState, useEffect } from "react";
import MakeOrder from "./components/custom/MakeOrder";
import OrderHistory from "./components/custom/OrderHistory";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletConnect from "./components/wallet-connect/WalletConnect";
import { addOrder, cancelOrder, getOrderHistory } from "./api/order.api";
import { getUserBalance, UserBalance } from "./api/user.api";
import { OrderStatus, OrderType } from "./types/api/order.type";
import { SelectInput, TabView } from "@components/shared";

function App() {
  const [symbolIndex, setSymbolIndex] = useState(0);
  const [selectedBuyPrice, setSelectedBuyPrice] = useState(0);
  const [isSelectDisabled, setIsSelectDisabled] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [backendBalances, setBackendBalances] = useState<UserBalance | null>(
    null
  );
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const tokenA = useSelector((state: IStoreState) => state.currentSymbol.coinA);
  const tokenB = useSelector((state: IStoreState) => state.currentSymbol.coinB);
  const balance1 = useSelector((state: IStoreState) => state.balance1);

  const currentSymbol = useSelector(
    (state: IStoreState) => state.currentSymbol
  );
  const currentSymbolPrice = useSelector(
    (state: IStoreState) => state.currentSymbolPrice
  );

  const orderHistory = useSelector((state: IStoreState) => state.orders);
  const dispatch = useDispatch();

  // Get actual balances from backend based on current symbol
  const getTokenBalance = (token: string): number => {
    if (!backendBalances) return balance1; // Fallback to Redux state

    switch (token.toUpperCase()) {
      case "BTC":
        return backendBalances.BTC;
      case "ETH":
        return backendBalances.ETH;
      case "LTC":
        return backendBalances.LTC;
      case "XRP":
        return backendBalances.XRP;
      case "USDT":
        return backendBalances.USDT;
      default:
        return 0;
    }
  };

  const actualBalance1 = getTokenBalance(tokenA);
  const actualBalance2 = getTokenBalance(tokenB);

  // Load balances from backend
  const loadUserBalances = async () => {
    if (!walletAddress) return;

    setIsLoadingBalances(true);
    try {
      const balances = await getUserBalance();
      if (balances) {
        setBackendBalances(balances);
        // Update Redux state to keep UI in sync
        dispatch(setBalance1(getTokenBalance(tokenA)));
        dispatch(setBalance2(getTokenBalance(tokenB)));

        // Trigger balance refresh event for WalletConnect component
        window.dispatchEvent(new CustomEvent("refreshBalances"));
      }
    } catch (error) {
      console.error("Failed to load user balances:", error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Load order history from backend
  const loadOrderHistory = async () => {
    try {
      const orders = await getOrderHistory();
      if (orders) {
        dispatch(setOrders(orders));
      }
    } catch (error) {
      console.error("Failed to load order history:", error);
    }
  };

  // Check wallet connection and load data
  useEffect(() => {
    const checkWalletConnection = () => {
      const connectedAddress = (window as any).connectedWalletAddress;
      if (connectedAddress && connectedAddress !== walletAddress) {
        setWalletAddress(connectedAddress);
      }
    };

    // Check wallet connection on mount and set up interval
    checkWalletConnection();
    const walletCheckInterval = setInterval(checkWalletConnection, 1000);

    return () => {
      clearInterval(walletCheckInterval);
    };
  }, []);

  // Load balances and order history when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadUserBalances();
      loadOrderHistory();
    }
  }, [walletAddress]);

  // Update Redux balances when backend balances or symbol changes
  useEffect(() => {
    if (backendBalances) {
      dispatch(setBalance1(getTokenBalance(tokenA)));
      dispatch(setBalance2(getTokenBalance(tokenB)));
    }
  }, [backendBalances, tokenA, tokenB]);

  return (
    <>
      <div className="min-w-full bg-slate-950 min-h-svh pt-10">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl text-left">Order Trading Platform</h2>
            <WalletConnect />
          </div>
          <div className="flex flex-wrap flex-col justify-between items-center gap-4 mt-4 xl:flex-row">
            <SelectInput
              disabled={isSelectDisabled}
              onChange={(value: number | string) => {
                setIsSelectDisabled(true);
                dispatch(setCurrentSymbol(symbols[value as number].symbol));
                setSymbolIndex(value as number);
              }}
              options={symbols.map((item, index) => {
                return {
                  label: `${item.coinA}/${item.coinB}`,
                  value: index,
                };
              })}
              value={symbolIndex}
            ></SelectInput>
            <div className="flex-grow"></div>
          </div>
          <div className="flex flex-row py-2 justify-end items-start text-gray-500">
            <h4 className="pr-16">
              This website is test website and all of data is mock data. Please
              be aware of it.
            </h4>
          </div>
          <div className="flex justify-between items-center flex-col-reverse xl:flex-row xl:items-start gap-4">
            <div className="w-full xl:flex-1">
              <OrderBook
                onSocketMount={() => setIsSelectDisabled(false)}
                symbol={currentSymbol}
                onPriceSelected={(price: number) => {
                  setSelectedBuyPrice(price as number);
                }}
              ></OrderBook>
            </div>
            <div className="xl:flex-grow w-full">
              <RealtimeChart symbol={currentSymbol}></RealtimeChart>
              <div className="flex-col">
                <div className="flex-row items-center">
                  <TabView
                    isLimitDisabled={currentSymbol.symbol !== "BTC/USDT"}
                    tabs={[
                      {
                        label: "Limit",
                        child: (
                          <div className="flex md:flex-row gap-10 flex-col">
                            <MakeOrder
                              symbol={currentSymbol}
                              defaultPrice={selectedBuyPrice}
                              isMarket={false}
                              buttonLabel="BUY LIMIT"
                              balanceCheck={(
                                price: number,
                                percent: number
                              ) => {
                                return (actualBalance2 * percent) / 100 / price;
                              }}
                              checkValidity={(
                                price: number,
                                quantity: number
                              ) => {
                                return (
                                  price > 0 &&
                                  quantity > 0 &&
                                  price * quantity < actualBalance2
                                );
                              }}
                              onSubmitted={async (
                                price: number,
                                quantity: number
                              ) => {
                                if (!walletAddress) {
                                  return;
                                }

                                try {
                                  await addOrder({
                                    type: OrderType.BuyLimit,
                                    price,
                                    quantity,
                                    total: price * quantity,
                                    status: OrderStatus.Pending,
                                    symbol: currentSymbol.symbol,
                                  });

                                  // Refresh balances and order history after successful order
                                  await loadUserBalances();
                                  await loadOrderHistory();
                                } catch (error) {
                                  console.error(
                                    "Failed to place order:",
                                    error
                                  );
                                }
                              }}
                              customStyle={colorVariants.blue}
                            ></MakeOrder>
                            <MakeOrder
                              symbol={currentSymbol}
                              defaultPrice={selectedBuyPrice}
                              isMarket={false}
                              buttonLabel="SELL LIMIT"
                              balanceCheck={(_: number, percent: number) => {
                                return (actualBalance1 * percent) / 100;
                              }}
                              checkValidity={(
                                price: number,
                                quantity: number
                              ) => {
                                return (
                                  price > 0 &&
                                  quantity > 0 &&
                                  quantity < actualBalance1
                                );
                              }}
                              onSubmitted={async (
                                price: number,
                                quantity: number
                              ) => {
                                if (!walletAddress) {
                                  return;
                                }

                                try {
                                  await addOrder({
                                    type: OrderType.SellLimit,
                                    price,
                                    quantity,
                                    total: price * quantity,
                                    status: OrderStatus.Pending,
                                    symbol: currentSymbol.symbol,
                                  });

                                  // Refresh balances and order history after successful order
                                  await loadUserBalances();
                                  await loadOrderHistory();
                                } catch (error) {
                                  console.error(
                                    "Failed to place order:",
                                    error
                                  );
                                }
                              }}
                              customStyle={colorVariants.red}
                            ></MakeOrder>
                          </div>
                        ),
                      },
                      {
                        label: "Market",
                        child: (
                          <div className="flex md:flex-row gap-10 flex-col">
                            <MakeOrder
                              symbol={currentSymbol}
                              defaultPrice={currentSymbolPrice}
                              isMarket={true}
                              buttonLabel="BUY MARKET"
                              balanceCheck={(
                                price: number,
                                percent: number
                              ) => {
                                return (actualBalance2 * percent) / 100 / price;
                              }}
                              checkValidity={(
                                price: number,
                                quantity: number
                              ) => {
                                return (
                                  price > 0 &&
                                  quantity > 0 &&
                                  price * quantity < actualBalance2
                                );
                              }}
                              onSubmitted={async (
                                price: number,
                                quantity: number
                              ) => {
                                if (!walletAddress) {
                                  return;
                                }

                                try {
                                  await addOrder({
                                    type: OrderType.BuyMarket,
                                    price,
                                    quantity,
                                    total: price * quantity,
                                    status: OrderStatus.Filled,
                                    symbol: currentSymbol.symbol,
                                  });

                                  // Refresh balances and order history after successful order
                                  await loadUserBalances();
                                  await loadOrderHistory();
                                } catch (error) {
                                  console.error(
                                    "Failed to place order:",
                                    error
                                  );
                                }
                              }}
                              customStyle={colorVariants.blue}
                            ></MakeOrder>
                            <MakeOrder
                              symbol={currentSymbol}
                              defaultPrice={currentSymbolPrice}
                              isMarket={true}
                              balanceCheck={(_: number, percent: number) => {
                                return (actualBalance1 * percent) / 100;
                              }}
                              buttonLabel="SELL MARKET"
                              checkValidity={(
                                price: number,
                                quantity: number
                              ) => {
                                return (
                                  price > 0 &&
                                  quantity > 0 &&
                                  quantity < actualBalance1
                                );
                              }}
                              onSubmitted={async (
                                price: number,
                                quantity: number
                              ) => {
                                if (!walletAddress) {
                                  return;
                                }

                                try {
                                  await addOrder({
                                    type: OrderType.SellMarktet,
                                    price,
                                    quantity,
                                    total: price * quantity,
                                    status: OrderStatus.Filled,
                                    symbol: currentSymbol.symbol,
                                  });

                                  // Refresh balances and order history after successful order
                                  await loadUserBalances();
                                  await loadOrderHistory();
                                } catch (error) {
                                  console.error(
                                    "Failed to place order:",
                                    error
                                  );
                                }
                              }}
                              customStyle={colorVariants.red}
                            ></MakeOrder>
                          </div>
                        ),
                      },
                    ]}
                  ></TabView>
                </div>
              </div>
            </div>
          </div>
          <div className="pb-8 mt-4">
            <OrderHistory
              data={orderHistory}
              onHistoryItemCancelClicked={async (cancelId: string) => {
                if (!walletAddress) {
                  return;
                }

                try {
                  await cancelOrder(cancelId);

                  // Refresh balances and order history after successful cancellation
                  await loadUserBalances();
                  await loadOrderHistory();
                } catch (error) {
                  console.error("Failed to cancel order:", error);
                }
              }}
            ></OrderHistory>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
