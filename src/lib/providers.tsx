'use client';

import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { JwtVerifiedCredentialFormatEnum } from "@dynamic-labs/sdk-api-core";

const ENVIRONMENT_ID = "9cea7fed-547a-466d-ac65-7a1293270bf9";

// expected response format from hlnames profile API
interface ProfileData {
  primaryName: string | null;
  avatar: string | null;
}

// fetch the primary name and avatar for an address in a single API call
const fetchProfileData = async (address: string): Promise<ProfileData | null> => {
  try {
    const response = await fetch(`https://api.hlnames.xyz/resolve/profile/${address}`, {
      method: 'GET',
      headers: {
        'X-API-Key': 'CPEPKMI-HUSUX6I-SE2DHEA-YYWFG5Y',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ProfileData = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching profile data:', error);
    return null;
  }
};

export default function App() {
  // Set the hlname profile on the NameService object in the verified credential.
  // This will dispaly the .hl name and avatar in the Connect Wallet button and Profile modal.
  // Only applies locally, does not affect the user object in dynamic backend.
  // https://www.dynamic.xyz/docs/react-sdk/objects/verified-credential#nameservicedata
  // https://www.dynamic.xyz/docs/users/verified-credential
  // https://www.dynamic.xyz/docs/users/verified-credential#jwtverifiedcredentialformatenum
  const handleAuthSuccess = async (args: any) => {
    try {
      console.log('Wallet connected:', args);

      const { verifiedCredentials } = args.user;

      // loop through each verified credential and look for Blockchain
      verifiedCredentials.forEach(async (credential: any) => {
        if (credential.format == JwtVerifiedCredentialFormatEnum.Blockchain && // only check wallets
          credential.address && // only check if address is present
          credential.nameService // only check if nameService is present
        ) {
          // Fetch hlnames profile data from the address
          const data = await fetchProfileData(credential.address);

          if (data?.primaryName) {
            credential.nameService.name = data.primaryName;
          }
          if (data?.avatar) {
            credential.nameService.avatar = data.avatar;
          }
        }
      });
    } catch (error) {
      console.error('Error handling wallet connection:', error);
    }
  };


  return (
    <DynamicContextProvider
      settings={{
        environmentId: ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
        events: {
          onAuthSuccess: handleAuthSuccess,
        },
      }}
    >
      <DynamicWidget />
    </DynamicContextProvider>
  );
}
