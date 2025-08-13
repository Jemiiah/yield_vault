import React from "react";
import { ConnectButton as ArweaveConnectButton } from "@arweave-wallet-kit/react";
import "./ConnectButton.css";

const ConnectButton = () => {
  return (
    <div>
      <ArweaveConnectButton
        showBalance={false}
        showProfilePicture={false}
        profileModal={false}
        className="custom-connect-button"
      />
    </div>
  );
};
export default ConnectButton;
