import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import aiIcon from "../../../public/ai-search.svg";
import coinIcon from "../../../public/coins-dollar.svg";
import multichainIcon from "../../../public/multichain.svg";
import reloadIcon from "../../../public/reload.svg";
import securityIcon from "../../../public/security-check.svg";
import { Link } from "react-router-dom";

const SetsUsApart = () => {
  return (
    <section className="relative overflow-hidden md:mx-12 mx-4 min-h-[70vh] md:min-h-[90vh]">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-40 dark:opacity-10">
        <div
          className="absolute inset-0 animate-float-grid"
          style={{
            backgroundImage: `
              linear-gradient(#d9d9d9 1px, transparent 1px),
              linear-gradient(90deg, #d9d9d9 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <h2 className="text-[24px] md:text-[32px] relative z-10 px-4 md:px-6 font-bold text-[#1a2228] dark:text-white mb-6 md:mb-8 text-left">
        What Sets Us Apart
      </h2>
      <div className="relative z-10 max-w-3xl px-4 md:px-6">
        <div className="space-y-6 md:space-y-12">
          {[
            {
              icon: reloadIcon,
              title: "Auto-Compounding",
              description:
                "Your yields, on autopilot. YAO reinvests your earnings continuously to maximize returns without you lifting a finger.",
              offset: "translate-x-0",
            },
            {
              icon: aiIcon,
              title: "Strategy Optimization",
              description:
                "We scan and route your funds through the most profitable DeFi strategies across protocols so you always earn more, faster.",
              offset: "translate-x-0 md:translate-x-36",
            },
            {
              icon: securityIcon,
              title: "Security Audits",
              description:
                "YAO is built with safety in mind. Our smart contracts are rigorously audited by top firms and constantly monitored to ensure protocol integrity.",
              offset: "translate-x-0 md:translate-x-60",
            },
            {
              icon: coinIcon,
              title: "Lowest Fees",
              description:
                "Keep more of what you earn. With efficient contract architecture and minimal gas overhead, YAO offers one of the lowest fee structures in DeFi.",
              offset: "translate-x-0 md:translate-x-[336px]",
            },
            {
              icon: multichainIcon,
              title: "Multichain Support",
              description:
                "Yield without borders. Whether you're on Ethereum, Arbitrum, or Polygon, YAO brings you optimized returns across multiple chains.",
              offset: "translate-x-0 md:translate-x-[436px]",
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={` bg-transparent border-none translate-x-96 shadow-none max-wg transform transition-transform duration-300 hover:scale-105 ${feature.offset} p-0`}
              >
                <CardContent className=" bg-none flex flex-col md:flex-row items-start md:space-x-4 p-0">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-[#EBEBEBE5] dark:bg-[#161E24] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <img
                      src={Icon}
                      alt={feature.title}
                      className="w-4 h-4 md:w-6 md:h-6 text-[#565e64] dark:text-gray-300"
                    />
                  </div>
                  <div className="flex-1 bg-[#F6F5F2] dark:bg-[#11191F] rounded-lg p-3 md:p-4">
                    <h3 className="text-lg md:text-xl font-semibold text-[#1A2228] dark:text-white mb-2 md:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-[#565e64] dark:text-[#95A0A6] text-sm md:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Get Started Button */}
      <div className="relative z-10 px-4 md:px-6 text-center flex justify-end mt-6 md:mt-8">
        <Button
          asChild
          className="h-10 md:h-12 w-full md:w-[286px] text-sm md:text-base rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:bg-gradient-to-br dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] dark:text-[#1A2228] backdrop-blur-md dark:backdrop-blur-lg text-white flex items-center font-semibold justify-center transition-all duration-200 hover:scale-103 shadow-lg cursor-pointer"
        >
          <Link to="/dashboard">Get Started!</Link>
        </Button>
      </div>
    </section>
  );
};

export default SetsUsApart;
