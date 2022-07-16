require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const {
    RINKEBY_RPC_URL,
    RINKEBY_PRIVATE_KEY,
    REPORT_GAS,
    ETHERSCAN_API_KEY,
    COINMARKETCAP_API_KEY,
} = process.env || {
    RINKEBY_RPC_URL: "",
    RINKEBY_PRIVATE_KEY: "",
    REPORT_GAS: false,
    ETHERSCAN_API_KEY: "",
    COINMARKETCAP_API_KEY: "",
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [{ version: "0.6.6" }, { version: "0.8.8" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        rinkeby: {
            url: RINKEBY_RPC_URL || "",
            accounts: RINKEBY_PRIVATE_KEY !== "" ? [RINKEBY_PRIVATE_KEY] : [],
            chainId: 4,
            blockConfirmations: 6,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MAGIC",
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
}
