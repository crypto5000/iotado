$(function() {
    
        // handle the generate address click        
        $("#generateAddress").on( "click", function() {		
            
            // hide button, show loading
            $("#generateAddress").hide();
            $("#loadingAddress").show();
            
            var iotaGenAdd = new IOTA({
                'host': 'https://nodes.iota.cafe',
                'port': 443
            });

            // get the seed, make uppercase
            let seedInput = $('#seed').val().trim();		
            seedInput = seedInput.toUpperCase();
            let seedValid = true;
            
            // validate the seed exists
            if (!seedInput) {
                seedValid = false;
                alert("Please enter a seed to generate addresses.");                
                $("#generateAddress").show();
                $("#loadingAddress").hide();                    
                return false;
            }

            // validate the seed length
            if (seedInput.length !== 81) {
                seedValid = false;
                alert("Please enter an 81 length seed.");                
                $("#generateAddress").show();
                $("#loadingAddress").hide();                    
                return false;
            }
                        
            // validate the seed is only letters and number nine
            for (var i = 0; i < seedInput.length; i++) {
                if (("9ABCDEFGHIJKLMNOPQRSTUVWXYZ").indexOf(seedInput.charAt(i)) < 0) {
                    seedValid = false;
                    alert("Seed should contain only letters A-Z or the number 9.");                    
                    $("#generateAddress").show();
                    $("#loadingAddress").hide();                    
                    return false;
                }
            }

            // if seed is valid, generate addresses
            if (seedValid) {

                // get 10 addresses
                iotaGenAdd.api.getNewAddress( seedInput, { 'total': 10, 'checksum': true }, function( e, addressArray ) {                    
                    if (!e) {
        
                        if ((addressArray) && (addressArray.length == 10)) {
                                                        
                            // set the values
                            $("#address1").val(addressArray[0]);
                            $("#address2").val(addressArray[1]);
                            $("#address3").val(addressArray[2]);
                            $("#address4").val(addressArray[3]);
                            $("#address5").val(addressArray[4]);
                            $("#address6").val(addressArray[5]);
                            $("#address7").val(addressArray[6]);
                            $("#address8").val(addressArray[7]);
                            $("#address9").val(addressArray[8]);
                            $("#address10").val(addressArray[9]);

                            $("#generateAddress").show();
                            $("#loadingAddress").hide();
                        }
        
                    } else {
        
                        console.log(e);
                        alert("There was an error generating your addresses. Try the secure method instead.");
                        $("#generateAddress").show();
                        $("#loadingAddress").hide();
                    }
                })

            }
            
            return false;
        });  	
        
     });