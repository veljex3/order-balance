import React, { useState, useEffect } from "react";
import { ISymbol } from "../../types/global/symbol.type";
import { Button, TextInput } from "@components/shared";
import { useSelector } from "react-redux";
import { IStoreState } from "domain/store";

export interface MakeOrderProps {
  symbol: ISymbol;
  defaultPrice: number;
  isMarket: boolean;
  buttonLabel: string;
  customStyle?: string;
  balanceCheck: (price: number, percent: number) => number;
  checkValidity: (price: number, quantity: number) => boolean;
  onSubmitted: (price: number, quantity: number) => void;
}

const MakeOrder: React.FC<MakeOrderProps> = ({
  symbol,
  defaultPrice,
  isMarket,
  buttonLabel,
  checkValidity,
  onSubmitted,
  customStyle,
}) => {
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const currentSymbolPrice = useSelector(
    (state: IStoreState) => state.currentSymbolPrice
  );

  useEffect(() => {
    setPrice(defaultPrice);
  }, [defaultPrice]);

  useEffect(() => {
    if (symbol.symbol === "BTC/USDT") setPrice(currentSymbolPrice);
  }, [currentSymbolPrice]);

  console.log(price);

  return (
    <div>
      {isMarket ? (
        <TextInput
          type="text"
          prefix="Price"
          suffix={symbol.coinB}
          placeholder="Market"
          onChange={() => {}}
        />
      ) : (
        <TextInput
          type="number"
          prefix="Price"
          suffix={symbol.coinB}
          value={price}
          isReadOnly={symbol.symbol === "BTC/USDT"}
          onChange={(value) => {
            if (symbol.symbol === "BTC/USDT") return;

            setPrice(value as number);
          }}
        />
      )}
      <TextInput
        type="number"
        prefix="Quantity"
        suffix={symbol.coinA}
        value={quantity}
        onChange={(value) => {
          setQuantity(value as number);
        }}
      />
      <Button
        disabled={!checkValidity(price, quantity)}
        label={buttonLabel}
        onClick={() => {
          onSubmitted(price, quantity);
        }}
        customStyle={customStyle}
      />
    </div>
  );
};

export default MakeOrder;
