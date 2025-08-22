import React, { ReactNode, useEffect, useState } from "react";

interface Tab {
  label: String;
  child: ReactNode;
}

export interface TabViewProps {
  tabs: Tab[];
  isLimitDisabled?: boolean;
}

const TabView: React.FC<TabViewProps> = ({ tabs, isLimitDisabled }) => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (isLimitDisabled) setActiveTab(1);
  }, [isLimitDisabled]);

  return (
    <div className="rounded-xl border bg-slate-900 border-slate-500 flex flex-col default-sty">
      <div className="flex mt-0 border-slate-500 py-4">
        <div className="grow flex-1"></div>
        {tabs.map((tab, index) => (
          <button
            disabled={isLimitDisabled && index === 0}
            key={index}
            onClick={() => {
              if (isLimitDisabled && index === 0) return;

              setActiveTab(index);
            }}
            className={`relative shadow-2xl  px-4 py-2 left-button w-64 transition-colors duration-200 ${
              index === 0
                ? "rounded-l-full"
                : index === 1
                ? "rounded-r-full"
                : ""
            } ${
              activeTab === index
                ? index === 0
                  ? "bg-green-500 text-white shadow-green-400"
                  : "bg-red-500 shadow-red-400 text-white"
                : "bg-gray-900 text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="grow flex-1"></div>
      </div>
      <div className="flex mt-0 p-4">
        <div className="grow"></div>
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`${activeTab === index ? "block" : "hidden"}`}
          >
            {tab.child}
          </div>
        ))}
        <div className="grow"></div>
      </div>
    </div>
  );
};

export default TabView;
