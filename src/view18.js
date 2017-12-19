$(document).ready(function() {
    
    // get the address from the url
    var listAddress = "";
    var url_string = window.location.href
    var url = new URL(url_string);
    listAddress = url.searchParams.get("list");    

    // validate the address
    validateAddress(listAddress);
    
    function validateAddress(inputAddress) {

        // get the address            
        let viewAddress = inputAddress;		
        
        // check if field has an address
        if (!viewAddress) {
            alert("Address is invalid. Please enter a value.");                                        
            return false;
        }

        // validate the address length             
        if (viewAddress.length !== 90) {
            alert("Address is invalid. Addresses should be 90 characters.");                                        
            return false;
        }

        // validate the address content
        for (var j = 0; j < viewAddress.length; j++) {
            if (("9ABCDEFGHIJKLMNOPQRSTUVWXYZ").indexOf(viewAddress.charAt(j)) < 0) {                            
                alert("Address should contain only letters A-Z or the number 9. Address is invalid.");                                        
                return false;
            }
        }
        
    }

    // initialize object to start data fetch
    var iota = new IOTA({
        'host': 'https://nodes.iota.cafe',
        'port': 443
    });
        
    // set the number of tasks
    var taskCount = 1;

    // set the totalReward, completedRewards, percentComplete
    var totalReward = 0;
    var completedReward = 0;
    var percentComplete = 0;

    // fetch the first task
    if (listAddress.length > 1) {
        fetchTask(taskCount,listAddress);
    }

    function fetchTask(count,listAddress) {

        $("#status").html('<h3 class="page-header" id="fetchStatus">WAIT: Fetching Task #' + taskCount + ' from Tangle.</h3>');                

        // set the address
        var command = {            
            'addresses': [listAddress]                                                
        }                        

        // fetch the data for all transactions involving address in tangle
        iota.api.findTransactionObjects(command, function(e, addressData) {            

            // check that results exist                  
            if (!addressData) {
                // display no to do list found in tangle,            
                console.log("no data found");
                $("#status").html('<h3 class="page-header" id="fetchStatus">Address Not Found on the Tangle.</h3>');                
            } else {
                console.log("found address");
                $("#status").html('<h3 class="page-header" id="fetchStatus">Task #' + taskCount + ' Found on Tangle.</h3>');                
                
                // initialize values                    
                var i = 0;
                var openFlag = false;
                var closeFlag = false;                        
                var todoMessage = "";
                var timeValue = 0;
                var balValue = 0;

                // loop through all transactions for this address                    
                while (i < addressData.length) {

                    // set the current values
                    timeValue = addressData[i].attachmentTimestamp;
                    balValue = addressData[i].value;

                    // check if open value (0 or 1) and tag exists
                    if ((balValue === 1) || (balValue === 0)) { 

                        // check message exists (not just 99999s)
                        if (addressData[i].signatureMessageFragment === "999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999") {

                            // do nothing - not a valid item tag

                        // else if already open,
                        } else if (openFlag) {

                            // only store if timestamp is earlier (and exists)
                            if ((addressData[i].attachmentTimestamp) && (parseInt(addressData[i].attachmentTimestamp) <= parseInt(timeValue))) {

                                // store earlier tag as open item
                                todoMessage = addressData[i].signatureMessageFragment;

                                // store timeValue as new first time
                                timeValue = addressData[i].attachmentTimestamp;
                                
                            }

                        } else {

                            // store tag as open item - not set yet
                            todoMessage = addressData[i].signatureMessageFragment;
                            
                        }

                        // set to open
                        openFlag = true;

                    } else {

                        // check if close value (greater than 1)    
                        if (balValue > 1) {
                            closeFlag = true;
                        }
                    }
                    
                    i++;
                }

                // if valid item is found (open with proper tag),   
                if ((openFlag) && (todoMessage.length > 1)) {                 

                    // cut off trailing 9's from message signature
                    let totalLength = todoMessage.length;                        
                    let tempEnd = totalLength;
                    let countPos = totalLength;
                    let newMessage = "";
            
                    while (countPos > 0) {
            
                        if (todoMessage.substring(tempEnd - 1, tempEnd) == "9") {
                            // update tempEnd
                            tempEnd = tempEnd - 1;                
                        } else {
                            // found all 999's
                            newMessage = todoMessage.substring(0, countPos);
                            break;
                        }
                        countPos--;
                    }

                    // convert the new message from trytes
                    let convertMessage = iota.utils.fromTrytes(newMessage);

                    // parse the converted message to get next address, task, reward
                    let nextAddress = convertMessage.substring(0,90);
                    nextAddress = nextAddress.trim();
                    let tempMessage = convertMessage.slice(91);

                    // set the reward
                    let rewardArray = tempMessage.split(" ");
                    let reward = rewardArray[0];                        

                    // set the task
                    let taskPos = tempMessage.indexOf("IOTAS ");
                    let task = tempMessage.slice(taskPos);
                    task = task.substring(6);
                    
                    // set the reward, task, address
                    $("#iota"+taskCount).text(reward);
                    $("#address"+taskCount).text(listAddress);
                    $("#task"+taskCount).val(task);

                    // calculate the total reward, percent completed
                    if (!isNaN(parseInt(reward))) {
                        totalReward = totalReward + parseInt(reward);

                        // check if closed - update status and color
                        if (closeFlag) {

                            completedReward = completedReward + parseInt(reward);
                            $("#status"+taskCount).text("Closed");
                            $("#status"+taskCount).css({"color":"red"});
                            $("#iota"+taskCount).css({"color":"red"});
                        }

                        if (totalReward > 0) {
                            percentComplete = Math.round((completedReward/totalReward)*100);
                        }
                    }

                    // move to next item (else stop)   
                    if ((nextAddress == "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000") || (nextAddress == "999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999")) {                        

                        // at stop, display total reward, percent completed
                        $("#status").html('<h3 class="page-header" id="fetchStatus">' + completedReward + ' out ' + totalReward + ' IOTAs completed (' + percentComplete + '%).</h3>');                

                    } else if (nextAddress.length != 90) {

                        // at stop, display error with next task address
                        $("#status").html('<h3 class="page-header" id="fetchStatus">Fetch Error: The Next Task Address is Not Valid.</h3>');                

                    } else {

                        // update the task count, get next task
                        taskCount = taskCount + 1;
                        fetchTask(taskCount,nextAddress);

                    }

                }
                
            }

        })
    }           
        
    // handle the search list
    $("#fetchButton").on( "click", function() {		
        
        // get the address            
        let viewAddress = $('#address1View').val().trim();		
            
        validateAddress(viewAddress);

        // move to the view page
        window.location = "./view.html?list=" + viewAddress;
        
        return false;
    });  	
    
});
