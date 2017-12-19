$(function() {
    
        // handle the finish click
        $("#finishButton").on( "click", function() {		
            
            // create a list of https nodes
            let hostHttps = ['https://nodes.iota.cafe', 'https://iotanode.prizziota.com'];
            let portHttps = [443, 443];

            // initialize host and port
            let host = hostHttps[0];
            let port = portHttps[0];

            // pull a random https node to rotate usage (if nodes.iota gets overloaded)
            if (Math.random() > 1) {
                host = hostHttps[1];
                port = port[1];
            }

            // initialize curl library values
            curl.init();
            const MAX_TIMESTAMP_VALUE = (Math.pow(3,27) - 1) / 2;

            // instantiate IOTA object
            var iota = new IOTA({
                'host': host,
                'port': port        
            });
            
            // hide the button
            $("#finishButton").hide();
            
            // get the total tasks
            let taskCount = $('#taskCount').val();
            taskCount = parseInt(taskCount);

            // validate the task count            
            if ((taskCount < 1) || (taskCount > 10)) {
                alert("There should be only 1 to 10 tasks. Invalid task count.");                                        
                $("#finishButton").show();
                return false;
            }

            // validate the task count            
            if (isNaN(taskCount)) {
                alert("There should be only 1 to 10 tasks. Invalid task count.");                                        
                $("#finishButton").show();
                return false;
            }

            // get the addresses
            let addressArray = [];
            let rewardArray = [];
            let taskArray = [];
            let y = 0;
            let z = 1;
            while (y < taskCount) {

                // set the values
                addressArray[y] = $('#task' + z + 'Address').val().trim();		
                rewardArray[y] = $('#reward' + z).val().trim();	
                rewardArray[y] = parseInt(rewardArray[y]);
                taskArray[y] = $('#task' + z).val().trim();		                
                
                // validate the address length             
                if (addressArray[y].length !== 90) {
                    alert("Address #" + z + " is invalid. Addresses should be 90 characters.");                                        
                    $("#finishButton").show();
                    return false;
                }

                // validate the address content
                for (var jj = 0; jj < addressArray[y].length; jj++) {
                    if (("9ABCDEFGHIJKLMNOPQRSTUVWXYZ").indexOf(addressArray[y].charAt(jj)) < 0) {                            
                        alert("Address should contain only letters A-Z or the number 9. Address #" + z + " is invalid.");                                        
                        $("#finishButton").show();
                        return false;
                    }
                }
                
                // validate the reward
                if (!rewardArray[y]) {
                    alert("Reward #" + z + " is invalid. Please enter a value.");                                        
                    $("#finishButton").show();
                    return false;
                }

                // validate the reward is a number
                if (isNaN(rewardArray[y])) {
                    alert("Reward #" + z + " should be between 2 and 1000000000000000000.");                                        
                    $("#finishButton").show();
                    return false;
                }

                // validate the reward
                if ((rewardArray[y] < 2) || (rewardArray[y] > 1000000000000000000)) {
                    alert("Reward #" + z + " should be between 2 and 1000000000000000000.");                                        
                    $("#finishButton").show();
                    return false;
                }

                // validate the task
                if (!taskArray[y]) {
                    alert("Task #" + z + " is invalid. Please enter a task description.");                                        
                    $("#finishButton").show();
                    return false;
                }

                // validate the task
                if ((taskArray[y].length > 150)) {
                    alert("Task #" + z + " should be less than 150 characters.");                                        
                    $("#finishButton").show();
                    return false;
                }

                y++;
                z++;
            }
                        
            // start the fetch to tangle
            $('#process').html("Starting fetch to tangle...");	
                        
            // initialize transfer data
            let seed = generateSeed();
            let value = 0;     
            let address = [];
            let message = [];
            let tag = "";    
            let depth = 10;
            let weight = 14;
            
            // WARNING: Not cryptographically secure. Do not use any seeds generated by this generator to actually store any value.
            function generateSeed() {
                const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
                return Array.from(new Array(81), (x, i) => validChars[Math.floor(Math.random() * validChars.length)]).join('');
            }

            // returns a depth in [4, 12] inclusive
            function generateDepth() {
                depth = Math.floor(Math.random() * (12 - 4 + 1)) + 4;
                return depth;
            }

            // adapted from https://github.com/iotaledger/wallet/blob/master/ui/js/iota.lightwallet.js
            const localAttachToTangle = function(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, callback) {
        
                $('#process').html("Attaching to Tangle...");	

                const ccurlHashing = function(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, callback) {
                    const iotaObj = iota;

                    $('#process').html("Starting curl hashing...");	
                    
                    // inputValidator: Check if correct hash
                    if (!iotaObj.valid.isHash(trunkTransaction)) {
                        return callback(new Error("Invalid trunkTransaction"));
                    }

                    // inputValidator: Check if correct hash
                    if (!iotaObj.valid.isHash(branchTransaction)) {
                        return callback(new Error("Invalid branchTransaction"));
                    }

                    // inputValidator: Check if int
                    if (!iotaObj.valid.isValue(minWeightMagnitude)) {
                        return callback(new Error("Invalid minWeightMagnitude"));
                    }

                    let finalBundleTrytes = [];
                    let previousTxHash;
                    let i = 0;

                    function loopTrytes() {
                        getBundleTrytes(trytes[i], function(error) {
                            if (error) {
                                return callback(error);
                            } else {
                                i++;
                                if (i < trytes.length) {
                                    loopTrytes();
                                } else {
                                    // reverse the order so that it's ascending from currentIndex
                                    return callback(null, finalBundleTrytes.reverse());
                                }
                            }
                        });
                    }

                    function getBundleTrytes(thisTrytes, callback) {
                        // PROCESS LOGIC:
                        // Start with last index transaction
                        // Assign it the trunk / branch which the user has supplied
                        // IF there is a bundle, chain  the bundle transactions via
                        // trunkTransaction together

                        let txObject = iotaObj.utils.transactionObject(thisTrytes);
                        txObject.tag = txObject.obsoleteTag;
                        txObject.attachmentTimestamp = Date.now();
                        txObject.attachmentTimestampLowerBound = 0;
                        txObject.attachmentTimestampUpperBound = MAX_TIMESTAMP_VALUE;
                        // If this is the first transaction, to be processed
                        // Make sure that it's the last in the bundle and then
                        // assign it the supplied trunk and branch transactions
                        if (!previousTxHash) {
                            // Check if last transaction in the bundle
                            if (txObject.lastIndex !== txObject.currentIndex) {
                                return callback(new Error("Wrong bundle order. The bundle should be ordered in descending order from currentIndex"));
                            }

                            txObject.trunkTransaction = trunkTransaction;
                            txObject.branchTransaction = branchTransaction;
                        } else {
                            // Chain the bundle together via the trunkTransaction (previous tx in the bundle)
                            // Assign the supplied trunkTransaciton as branchTransaction
                            txObject.trunkTransaction = previousTxHash;
                            txObject.branchTransaction = trunkTransaction;
                        }

                        let newTrytes = iotaObj.utils.transactionTrytes(txObject);

                        curl.pow({trytes: newTrytes, minWeight: minWeightMagnitude}).then(function(nonce) {
                            var returnedTrytes = newTrytes.substr(0, 2673-81).concat(nonce);
                            var newTxObject= iotaObj.utils.transactionObject(returnedTrytes);

                            // Assign the previousTxHash to this tx
                            var txHash = newTxObject.hash;
                            previousTxHash = txHash;

                            finalBundleTrytes.push(returnedTrytes);
                            callback(null);
                        }).catch(callback);
                    }
                    loopTrytes()
                }

                ccurlHashing(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, function(error, success) {
                    if (error) {
                        console.log(error);
                        $('#process').html("Hashing error. Try starting over.");	
                    } else {
                        console.log(success);
                        $('#process').html("Hashing succeeded. Continuing...");	
                    }
                    if (callback) {
                        return callback(error, success);
                    } else {
                        return success;
                    }
                })
            }

            sendMessages();                        
            
            function sendMessages() {

                // using this because of bug with using curl.overrideAttachToTangle()
                iota.api.attachToTangle = localAttachToTangle;

                // get the number of tasks from the user
                let numberOfTasks = taskCount;                                
                
                // bundle the transfers for all the tasks 
                let transfers = [];
                let counter = 0
                while (counter < numberOfTasks) {

                    // message formated: NEXT_ADDRESS + " " + REWARD + " IOTAS" + " " + TASK
                    if (counter + 1 == numberOfTasks) {
                        // check for last task - set to dummy flag next address
                        message[counter] = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" + " " + rewardArray[counter] + " IOTAS" + " " + taskArray[counter];
                    } else {
                        message[counter] = addressArray[counter + 1] + " " + rewardArray[counter] + " IOTAS" + " " + taskArray[counter];
                    }

                    transfers.push({
                        address: addressArray[counter],
                        value: value,
                        message: iota.utils.toTrytes(message[counter]),
                        tag: tag
                    });
                    counter++;
                }
                                        
                $('#process').html("Performing PoW (Proof of Work)");	
                iota.api.sendTransfer(seed, generateDepth(), weight, transfers, function(error, success){
                    if (error) {
                        console.log("error in send transfer, api could be down",error);
                        $('#process').html("Error sending transfer. Public node could be done.");	
                        return
                    }
                    console.log("completed proof of work and sent",success);                        
                    $('#process').html('<a href="./newview.html?list='+addressArray[0]+'"><button class="btn btn-primary">Success: View List</button><a/>');	                                     
                })
            }
            
            return false;
        });  	
        
});