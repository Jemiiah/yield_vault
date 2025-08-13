import { ChevronDown, MoonIcon } from "lucide-react";
import React from "react";
import logo from "/yao_logo.svg";

const Header = () => {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/docs", label: "Docs" },
    { href: "/faqs", label: "FAQs" },
    { href: "/bridges", label: "Bridges" },
  ];

  return (
    <header className="relative z-10 flex items-center justify-between p-4 md:p-6 md:mx-12 mx-4">
      <div className="flex items-center space-x-4 md:space-x-8">
        <div className="text-xl md:text-2xl font-bold text-[#1a2228]">
          <img src={logo} alt="YAO" className="w-16 md:w-auto" />
        </div>
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => {
            const isActive = window.location.pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "text-[#1a2228] font-semibold"
                    : "text-[#7E868C] hover:text-[#1A2228]"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span>{item.label}</span>
                  <span>
                    {item.label === "Bridges" && (
                      <ChevronDown className="w-4 md:w-5 h-4 md:h-5" />
                    )}
                  </span>
                </div>
              </a>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] p-2 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer">
          <MoonIcon className="w-4 md:w-5 h-4 md:h-5" />
        </button>
        <button className="h-10 md:h-12 w-24 md:w-40 text-sm md:text-base rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer">
          Connect wallet
        </button>
      </div>
    </header>
  );
};

export default Header;
