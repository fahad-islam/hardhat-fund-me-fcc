const { run } = require("hardhat")

/**
 *  @param { string } contractAddress
 *  @param { string[] } args
 * */
const verify = async function (contractAddress, args) {
    console.log("Verify Contract...")

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        // Incase Already Verified!
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(error)
        }
    }
}

module.exports = { verify }
