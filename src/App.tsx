import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  HStack,
  Select,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { EIP1193Provider } from '@web3-onboard/common'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import walletLinkModule from '@web3-onboard/walletlink'
import { useState } from 'react'
import './App.css'
import { toHex, truncateAddress } from './utils'

const walletLink = walletLinkModule()
const walletConnect = walletConnectModule()
const injected = injectedModule()

const modules = [walletLink, walletConnect, injected]

const MAINNET_RPC_URL = `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`
const ROPSTEN_RPC_URL = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`

const onboard = Onboard({
  wallets: modules, // created in previous step
  chains: [
    {
      id: '0x1', // chain ID must be in hexadecimel
      token: 'ETH',
      namespace: 'evm',
      label: 'Ethereum Mainnet',
      rpcUrl: MAINNET_RPC_URL,
    },
    {
      id: '0x3',
      token: 'tROP',
      namespace: 'evm',
      label: 'Ethereum Ropsten Testnet',
      rpcUrl: ROPSTEN_RPC_URL,
    },
  ],
  appMetadata: {
    name: 'Sleepy Giant',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    description: 'My app using Onboard',
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
  },
})

function App() {
  const [_, setProvider] = useState<EIP1193Provider>()
  const [account, setAccount] = useState('')
  const [error, setError] = useState<any>()
  const [chainId, setChainId] = useState('0x3')
  const [network, setNetwork] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const connectWallet = async () => {
    try {
      const wallets = await onboard.connectWallet()
      setIsLoading(true)
      const { accounts, chains, provider } = wallets[0]
      setAccount(accounts[0].address)
      setChainId(chains[0].id)
      setProvider(provider)
      setIsLoading(false)
    } catch (error) {
      setError(error)
    }
  }

  const switchNetwork = async () => {
    await onboard.setChain({ chainId: toHex(network) })
  }

  const handleNetwork = (e: any) => {
    const id = e.target.value
    setNetwork(Number(id))
  }

  const disconnect = async () => {
    const [primaryWallet] = await onboard.state.get().wallets
    if (!primaryWallet) return
    await onboard.disconnectWallet({ label: primaryWallet.label })
    refreshState()
  }

  const refreshState = () => {
    setAccount('')
    setChainId('')
    setProvider(undefined)
  }

  return (
    <>
      <Text position="absolute" top={0} right="15px">
        If you're in the sandbox, first "Open in New Window" ⬆️
      </Text>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack marginBottom="10px">
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={['1.5em', '2em', '3em', '4em']}
            fontWeight="600">
            Let's connect with
          </Text>
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={['1.5em', '2em', '3em', '4em']}
            fontWeight="600"
            sx={{
              background: 'linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            Onboard
          </Text>
        </HStack>
        {isLoading && <div>Loading...</div>}
        <HStack>
          {!account ? (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {account ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          <Tooltip label={account} placement="right">
            <Text>{`Account: ${truncateAddress(account)}`}</Text>
          </Tooltip>
          <Text>{`Network ID: ${
            chainId ? Number(chainId) : 'No Network'
          }`}</Text>
        </VStack>
        {account && (
          <HStack justifyContent="flex-start" alignItems="flex-start">
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px">
              <VStack>
                <Button onClick={switchNetwork} isDisabled={!network}>
                  Switch Network
                </Button>
                <Select placeholder="Select network" onChange={handleNetwork}>
                  <option value="3">Ropsten</option>
                  <option value="4">Rinkeby</option>
                </Select>
              </VStack>
            </Box>
          </HStack>
        )}
        <Text>{error ? error.message : null}</Text>
      </VStack>
    </>
  )
}

export default App
