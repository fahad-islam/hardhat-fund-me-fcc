const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async function () {
    // State Variables
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1") // sendValue = 1ETH
    /** Initialize Testing Environment */
    beforeEach(async function () {
        // Grab contract deployer account
        deployer = (await getNamedAccounts()).deployer

        // Deploy our @all contract
        await deployments.fixture(["all"])

        // Grab @FundME contract
        fundMe = await ethers.getContract("FundMe", deployer)

        // Grab @MockV3Aggregator contract for testing Price Feed Localy!
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    /**
     * Start Testing Contract
     */
    describe("constructor", async function () {
        it("Sets aggregator address correctly", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("Fails, If you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

        it("Updates the amount funded Data Structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Add funders to array of funders", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getFunder(0)
            assert.equal(response, deployer)
        })
    })

    describe("withdraw", async function () {
        /** Initialize Testing Environment */
        beforeEach(async function () {
            // fund Some Value to contract
            await fundMe.fund({ value: sendValue })
        })

        it("Withdraw ETH from a single founder", async function () {
            /** Arrange */
            // Initial State Before Withdraw
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Withdraw Value from @FundMe contract to @owner account
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gassCost = gasUsed.mul(effectiveGasPrice)

            // After Withdraw
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            /** Assert */
            // Check if owner got balance or not
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gassCost).toString()
            )
        })

        it("Allows us to withdraw ETH from multiple funders", async function () {
            /** Arrange */
            // Fund Value from Multiple Signers one-by-one
            const accounts = await ethers.getSigners()
            for (let number = 1; number < 6; number++) {
                // connect signer to be @FundME contract
                const connectedFundMeSigner = await fundMe.connect(
                    accounts[number]
                )
                // Fund value for contract from connected Signer Account
                await connectedFundMeSigner.fund({ value: sendValue })
            }

            // Initial State Before Withdraw
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            /** Act */
            // Withdraw Value from @FundMe contract to @owner account
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gassCost = gasUsed.mul(effectiveGasPrice)

            // After Withdraw
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            /** Assert */
            // Check if owner got balance or not
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gassCost).toString()
            )
            // Make sure funders are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (let number = 1; number < 6; number++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(
                        accounts[number].address
                    ),
                    0
                )
            }
        })

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })
    })
})
