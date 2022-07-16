const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

/**
 * @param {import('hardhat/types').HardhatRuntimeEnvironment}
 */
module.exports = async function ({ getNamedAccounts, deployments }) {
    // State Variables
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // Grab Eth Usd Price Feed Address
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        // for TestNet [ Hardhat, localhost ] Chain
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        // for Real TestNets, MainNet Chain
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    // Constructor Args for Contract Verification
    const args = [ethUsdPriceFeedAddress]

    log("Deploying fundMe...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args, // PUT price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    log("FundMe Deployed!")
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args)
    }
    log("-------------------------------------------")
}

module.exports.tags = ["all", "fundMe"]
