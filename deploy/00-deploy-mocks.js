const { network } = require("hardhat")
const {
    developmentChains,
    INITIAL_ANSWER,
    DECIMALS,
} = require("../helper-hardhat-config")

/**
 * @param {import('hardhat/types').HardhatRuntimeEnvironment}
 */
module.exports = async function ({ getNamedAccounts, deployments }) {
    // State Variables
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local network detected, Deploying Mocks...")

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })

        log("Mocks Deployed!")
        log("-------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
