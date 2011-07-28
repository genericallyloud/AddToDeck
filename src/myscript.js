(function($){

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
        var dataURL = canvas.toDataURL("image/png");
    
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    function addToDeck(){
        var cardInfo = $(".cardDetails .row");
        function textForLabel(label){
            return cardInfo.has(".label:contains('" + label + "')").find(".value").text().trim();
        }
        var cardUploadJson = {
            name:textForLabel("Card Name"),
            types:textForLabel("Types"),
            text:textForLabel("Card Text"),
            flavorText:textForLabel("Flavor Text"),
            powerToughness:textForLabel("P/T"),
            rarity:textForLabel("Rarity"),
            expansion:textForLabel("Expansion"),
            cardNumber:textForLabel("Card #"),
            artist:textForLabel("Artist")
        };
        var manaCost = cardInfo.has(".label:contains('Mana Cost')").find(".value");
        if(manaCost.size()){
            var colors = ["White","Blue","Black","Red","Green"];
            var hasColors = [];
            colors.forEach(function(color){
                if(manaCost.has("img[alt="+color+"]").size()){
                    hasColors.push(color);
                }
            });
            var cardColor = hasColors.length==0?"colorless"
                          : hasColors.length>1? "gold"
                          : hasColors[0];
            cardUploadJson.color = cardColor;
            cardUploadJson.cost = textForLabel("Converted Mana Cost")
        }
        //now that the textual data is sucked in, lets get that image
        var img = $(".cardDetails .leftCol img").get(0);
        cardUploadJson.imageData = getBase64Image(img);
        console.log(cardUploadJson);
        chrome.extension.sendRequest(cardUploadJson, function(response){
            console.log(response);
        });
    }
    
    $(document).ready(function(){
        $(".cardDetails .leftCol")
            .append(
                "<div id='add-card-button'>" +
                    "<div id='plus-vertical-bar'></div>" +
                    "<div id='plus-horizontal-bar'></div>" +
                "</div>"
            );
        $("#add-card-button").click(addToDeck);
    });
    
})(jQuery);