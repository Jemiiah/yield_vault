import { ChevronDown, MoonIcon, SunIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import logo from "/yao_logo.svg";
import yao_logo_white from "../../public/yao_logo_white.svg";
import ConnectButton from "./ConnectButton";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/docs", label: "Docs" },
    { href: "/faqs", label: "FAQs" },
    { href: "/bridges", label: "Bridges" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:py-6 md:px-16 transition-all duration-300 ${
        isScrolled
          ? "bg-white/40 dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] backdrop-blur-sm shadow-lg dark:border-none"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center space-x-4 md:space-x-8">
        <div className="text-xl md:text-2xl font-bold text-[#1a2228]">
          {theme === "light" ? (
            <img src={logo} alt="YAO" className="w-16 md:w-auto" />
          ) : (
            <img src={yao_logo_white} alt="YAO" className="w-16 md:w-auto" />
          )}
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
                    ? "text-[#1a2228] dark:text-white font-semibold"
                    : "text-[#7E868C] dark:text-gray-300 hover:text-[#1A2228] dark:hover:text-white"
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
        <button
          onClick={toggleTheme}
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] backdrop-blur-md dark:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer"
        >
          {theme === "light" ? (
            <MoonIcon className="w-4 md:w-5 h-4 md:h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <SunIcon className="w-4 md:w-5 h-4 md:h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;
