(function($){
    //closure scoped variables
    var currentStatus;
    var cardName;
    
    function setCurrentStatus(cardStatusDto){
        console.log(cardStatusDto);
        currentStatus = cardStatusDto;
        if(cardStatusDto.card){
            //put a count in the button
            $("#card-added-count").text("x" + cardStatusDto.card.count);
        }
    }
    
    function getBase64Image(img) {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
    
        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
    
        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        var dataURL = canvas.toDataURL("image/jpeg");
    
        return dataURL.replace(/^data:image\/(png|jpeg);base64,/, "");
    }
    
    function getCardName(){
        return $(".cardDetails .row").has(".label:contains('Card Name')").find(".value").text().trim();
    }
    
    function getCardUploadJson(){
        if(currentStatus.cardStatus != 'UPLOAD_AND_ADD'){
            return {name:cardName};
        }
        var cardInfo = $(".cardDetails .row");
        function textForLabel(label){
            return cardInfo.has(".label:contains('" + label + "')").find(".value").text().trim();
        }
        //get all the basic text stuff
        var cardUploadJson = {
            name:cardName,
            types:textForLabel("Types"),
            flavorText:textForLabel("Flavor Text"),
            powerToughness:textForLabel("P/T"),
            rarity:textForLabel("Rarity"),
            expansion:textForLabel("Expansion"),
            cardNumber:textForLabel("Card #"),
            artist:textForLabel("Artist")
        };
        
        //special setup for text in case of multiple lines
        var textRow = cardInfo.has(".label:contains('Card Text')").find(".value .cardtextbox");
        var cardText = textRow.map(function(){
            return $(this).text().trim();
        }).get().join("\n");
        cardUploadJson.text = cardText;
        
        //mana cost and color
        var manaCost = cardInfo.has(".label:contains('Mana Cost')").find(".value");
        if(manaCost.size()){
            var colors = ["White","Blue","Black","Red","Green"];
            var hasColors = [];
            colors.forEach(function(color){
                if(manaCost.has("img[alt~="+color+"]").size()){
                    hasColors.push(color);
                }
            });
            var cardColor = hasColors.length==0?"COLORLESS"
                          : hasColors.length>1? "GOLD"
                          : hasColors[0].toUpperCase();
            cardUploadJson.color = cardColor;
            cardUploadJson.cost = parseInt(textForLabel("Converted Mana Cost"));
        }
        
        //analyze gathered data to set some flags
        var primaryType = cardUploadJson.types.split("—")[0];//em dash
        cardUploadJson.land = primaryType.indexOf("Land") >= 0;
        cardUploadJson.creature = primaryType.indexOf("Creature") >= 0;
        cardUploadJson.permanent = primaryType.search(/(Land|Creature|Artifact|Enchantment)/) >= 0;
        
        //now that the textual data is sucked in, lets get that image
        var img = $(".cardDetails .leftCol img").get(0);
        cardUploadJson.imageData = getBase64Image(img);
        return cardUploadJson;
    }
    
    function performAction(message){
        chrome.extension.sendRequest(message, function(response){
            if(response && response.cardStatus){
                setCurrentStatus(response);
            }else{
                alert("Failed. Make sure you're logged in and shit. " + response);
            }
            $("#add-card-button").removeClass("loading");
        });
    }
    
    function addToDeck(){
        var button = $("#add-card-button");
        if(button.hasClass("loading")){
            return; //do nothing when loading
        }
        //give some feedback first
        button.addClass("loading");
        performAction({
            action:"UPLOAD",
            data:getCardUploadJson()
        });
        
    }
    
    $(document).ready(function(){
        //go ahead and throw the button up - start it loading
        $(".cardDetails .leftCol")
            .append(
                "<div id='add-card-button' class='loading'>" +
                    "<div id='plus-vertical-bar'></div>" +
                    "<div id='plus-horizontal-bar'></div>" +
                    '<div id="card-added-count"></div>' +
                    '<div class="spinner">' +
                        '<div class="bar1"></div>' +
                        '<div class="bar2"></div>' +
                        '<div class="bar3"></div>' +
                        '<div class="bar4"></div>' +
                        '<div class="bar5"></div>' +
                        '<div class="bar6"></div>' +
                        '<div class="bar7"></div>' +
                        '<div class="bar8"></div>' +
                        '<div class="bar9"></div>' +
                        '<div class="bar10"></div>' +
                        '<div class="bar11"></div>' +
                        '<div class="bar12"></div>' +
                    '</div>' +
                "</div>"
            );
        //get the status of the card in your deck
        cardName = getCardName();
        var cardNameArg = encodeURI(cardName);
        performAction({
            action:"STATUS",
            data:cardNameArg
        });
        $("#add-card-button").click(addToDeck);
    });
    
})(jQuery);