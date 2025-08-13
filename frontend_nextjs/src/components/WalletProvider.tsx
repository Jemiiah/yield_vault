// import type { ReactNode } from "react";
// import { AOWalletKit } from "@project-kardeshev/ao-wallet-kit";

// interface WalletProviderProps {
//   children: ReactNode;
// }

// export const WalletProvider = ({ children }: WalletProviderProps) => {
//   return (
//     <AOWalletKit
//       config={{
//         permissions: ["ACCESS_ADDRESS"],
//         ensurePermissions: true,
//         appInfo: {
//           name: "YAO - Yield Aggregator on AO",
//           logo: "/light-logo.png",
//         },
//       }}
//       theme={{
//         displayTheme: "dark",
//         // accent: { r: 255, g: 215, b: 0 },
//         radius: "default",
//         font: {
//           fontFamily: "Fractul, sans-serif",
//         },
//       }}
//     >
//       {children}
//     </AOWalletKit>
//   );
// };
