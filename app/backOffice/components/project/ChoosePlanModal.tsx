import React, { useState } from "react";
import CloseButton from "~/components/common/closeButton";

const ChoosePlanModal = ({ closeModal }: { closeModal: () => void }) => {
  const [isMonthly, setIsMonthly] = useState(true);

  const monthlyPlans = [
    {
      name: "Basic",
      description:
        "Perfect for individuals exploring development, learning new skills, or working on personal projects.",
      price: "$0/month",
      tokens: "250k free tokens",
    },
    {
      name: "Starter",
      description:
        "Perfect for individuals exploring development, learning new skills, or working on personal projects.",
      price: "$29/month",
      tokens: "10M tokens per month",
    },
    {
      name: "Premium",
      description:
        "Perfect for individuals exploring development, learning new skills, or working on personal projects.",
      price: "$99/month",
      tokens: "50M tokens per month",
    },
  ];

  const yearlyPlans = [
    {
      name: "Basic Plus",
      description:
        "Perfect for individuals exploring development, learning new skills, or working on personal projects.",
      price: "$100/year",
      tokens: "5M tokens per month",
    },
    {
      name: "Starter Plus",
      description:
        "Perfect for individuals exploring development, learning new skills, or working on personal projects.",
      price: "$200/year",
      tokens: "25M tokens per month",
    },
    {
      name: "Premium Plus",
      description:
        "Perfect for individuals exploring development, learning new skills, or working on personal projects.",
      price: "$300/year",
      tokens: "80M tokens per month",
    },
  ];

  const plans = isMonthly ? monthlyPlans : yearlyPlans;

  const currentPlan = "Basic";

  return (
    <div className="fixed jusify-center inset-0 flex items-center justify-center z-50 bg-[linear-gradient(0deg,rgba(0,0,0,0.05)_0%,rgba(31,31,31,0.80)_100%)] backdrop-blur-[25px] w-full h-full">
      <div className="relative w-full h-full p-8 rounded-lg">
        <div className="flex justify-end mb-10">
          <CloseButton closeModal={closeModal} />
        </div>
        <div className="max-w-[920px] mx-auto text-center">
          <h1 className="text-5xl text-white font-medium">
            Choose a Plan or Reload Tokens as Needed
          </h1>
          <p className="text-base text-white leading-[52px] mt-3">
            Pick from our three flexible plans or purchase{" "}
            <span className="text-[#86F49C] font-medium">extra tokens</span>{" "}
            anytime to keep coding without limits.
          </p>
        </div>
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-3 p-1 rounded-full border border-[#2E2E2E] bg-[linear-gradient(180deg,#010101_57.32%,#161616_100%)]">
            <button
              className={`w-[94px] h-[34px] rounded-full transition-all duration-300 ${
                isMonthly
                  ? "border border-[#B0FFC0] bg-[#86F49C] shadow-[0px_0px_4px_0px_#86F49C] text-[#010101] font-medium"
                  : "border border-transparent bg-transparent text-[#d5d5d5] font-medium"
              }`}
              onClick={() => setIsMonthly(true)}
            >
              Monthly
            </button>
            <button
              className={`w-[94px] h-[34px] rounded-full transition-all duration-300 ${
                !isMonthly
                  ? "border border-[#B0FFC0] bg-[#86F49C] shadow-[0px_0px_4px_0px_#86F49C] text-[#010101] font-medium"
                  : "border border-transparent bg-transparent text-[#d5d5d5] font-medium"
              }`}
              onClick={() => setIsMonthly(false)}
            >
              Yearly
            </button>
          </div>
        </div>
        <div className="flex justify-between justify-self-center gap-8 mt-10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="p-[2px] bg-[linear-gradient(230deg,rgba(31,31,31,1)_30%,rgba(134,244,156,1)_50%,rgba(31,31,31,0.8)_75%)] backdrop-blur-[25px] rounded-lg"
            >
              <div className="relative overflow-hidden bg-[linear-gradient(0deg,rgba(0,0,0,1)_0%,rgba(31,31,31,1)_100%)] p-6 rounded-lg text-white max-w-[340px] max-h-[490px] w-full h-full">
                <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 w-[130px] h-[8px] bg-[linear-gradient(180deg,#28FF7A_50.04%,#030404_140.18%)] filter blur-[10px] rounded-full" />
                <h2 className="text-3xl font-semibold leading-[64px] mb-6">
                  {plan.name}
                </h2>
                <p className="text-base font-normal leading-[21px] text-[#d5d5d5] mb-8">
                  {plan.description}
                </p>
                <div className="mt-2 flex items-baseline mb-4">
                  <span className="text-6xl font-medium leading-[83px] text-white">
                    {plan.price.split("/")[0]}
                  </span>
                  <span className="text-xl font-light leading-[26px] text-[#d5d5d5]">
                    /
                    <span className="font-normal">
                      {plan.price.split("/")[1]}
                    </span>
                  </span>
                </div>
                <div className="w-[100%] h-[0.5px] bg-[#77777799]"></div>
                <p className="mt-10 mb-10 text-xl font-medium leading-[26px] text-[#86F49C]">
                  {plan.tokens}
                </p>
                {plan.name === currentPlan ? (
                  <button className="w-full h-[54px] px-4 py-2 rounded-[99px] border border-[rgba(255,255,255,0.19)] bg-[linear-gradient(0deg,rgba(0,0,0,1)_0%,rgba(31,31,31,1)_100%)] backdrop-blur-[25px] text-white text-lg font-normal">
                    Current Plan
                  </button>
                ) : (
                  <button className="w-full h-[54px] px-4 py-2 rounded-full border border-[#B0FFC0] bg-[#86F49C] shadow-[0px_0px_4px_0px_#86F49C] text-[#010101] text-lg font-medium">
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlanModal;
