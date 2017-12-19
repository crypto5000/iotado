$(function() {
    
        // handle the first step click
        $("#nextButton").on( "click", function() {		
            
            // get the addresses
            let addressArray = [];
            addressArray[0] = $('#address1').val().trim();		
            addressArray[1] = $('#address2').val().trim();		
            addressArray[2] = $('#address3').val().trim();		
            addressArray[3] = $('#address4').val().trim();		
            addressArray[4] = $('#address5').val().trim();		
            addressArray[5] = $('#address6').val().trim();		
            addressArray[6] = $('#address7').val().trim();		
            addressArray[7] = $('#address8').val().trim();		
            addressArray[8] = $('#address9').val().trim();		
            addressArray[9] = $('#address10').val().trim();		
            
            // initialize tasks
            let totalTasks = 0;
            let taskArray = [];
            let maxTasks = 10;
            let i = 0;
            let z = 1;

            // cycle through the 10 addresses
            while(i < maxTasks) {

                // check if field has an address
                if (addressArray[i]) {

                    // validate the address length             
                    if (addressArray[i].length !== 90) {
                        alert("Address #" + z +" is invalid. Addresses should be 90 characters.");                                        
                        return false;
                    }

                    // validate the address content
                    for (var j = 0; j < addressArray[i].length; j++) {
                        if (("9ABCDEFGHIJKLMNOPQRSTUVWXYZ").indexOf(addressArray[i].charAt(j)) < 0) {                            
                            alert("Address should contain only letters A-Z or the number 9. Address #" + z + " is invalid.");                                        
                            return false;
                        }
                    }
                    
                    // check if address is a duplicate of another task
                    if (taskArray.indexOf(addressArray[i]) > -1) {

                        // duplicate - don't include

                    } else {

                        // add the address to taskArray
                        taskArray.push(addressArray[i]);

                        // increment the total number of tasks
                        totalTasks = totalTasks + 1;
                    
                        // set the task address field - make uppercase                        
                        $("#task" + totalTasks + "Address").val(addressArray[i].toUpperCase());                                        
                    }

                }                

                i++;
                z++;
            }

            // set the total number of tasks
            if (totalTasks < 1) {
                alert("Please enter at least 1 address for your todo list.");                                        
                return false;
            } else {
                $("#taskCount").val(totalTasks);                                                        

                // disable the tasks not used                
                let k = totalTasks + 1;                
                while(k <= maxTasks) {
                    $( "#task"+k ).prop( "disabled", true );    
                    $( "#reward"+k ).prop( "disabled", true );    
                    k++;
                }                                

                // move to task page
                $("#inputAddress").fadeOut("slow");                                                        
                $("#inputTasks").fadeIn("slow");                                                        
            }
            
            return false;
        });  	
        
});