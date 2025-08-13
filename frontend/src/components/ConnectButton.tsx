import { ConnectButton as ArweaveConnectButton } from "@arweave-wallet-kit/react";
import "./ConnectButton.css";

const ConnectButton = () => {
  return (
    <div>
      <ArweaveConnectButton
        showBalance={true}
        showProfilePicture={false}
        profileModal={true}
        className="custom-connect-button"
      />
    </div>
  );
};
export default ConnectButton;
