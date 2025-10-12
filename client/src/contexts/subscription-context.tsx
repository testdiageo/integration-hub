import { createContext, useContext, useState, useEffect } from "react";

interface SubscriptionContextType {
  isTrial: boolean;
  isPaid: boolean;
  setSubscriptionStatus: (status: "trial" | "paid") => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptionStatus, setSubscriptionStatusState] = useState<"trial" | "paid">(() => {
    const stored = localStorage.getItem("subscription_status");
    return (stored as "trial" | "paid") || "trial";
  });

  useEffect(() => {
    localStorage.setItem("subscription_status", subscriptionStatus);
  }, [subscriptionStatus]);

  const setSubscriptionStatus = (status: "trial" | "paid") => {
    setSubscriptionStatusState(status);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isTrial: subscriptionStatus === "trial",
        isPaid: subscriptionStatus === "paid",
        setSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
