//Get image size form Base64
export function getImageSize (imageSource) {
    return new Promise (function (resolve, rejected) {
        let imageElement = new Image();
        imageElement.addEventListener("load", function () {
            return resolve({
                "width": imageElement.width,
                "height": imageElement.height
            });
        });
        //Load the image
        imageElement.src = imageSource;
    });
}

//Resize an image from base64
export function resizeImage (imageSource, newWidth, newHeight) {
    return new Promise(function (resolve, reject) {
        let imageElement = new Image(); //Image element to store the image
        let canvas = document.createElement("canvas"); //Canvas element
        canvas.width = newWidth; //Set canvas width
        canvas.height = newHeight; //Set canvas height
        let context = canvas.getContext("2d");
        imageElement.addEventListener("load", function () {
            context.drawImage(imageElement, 0, 0, newWidth, newHeight);
            //Return the image 
            return resolve(canvas.toDataURL("image/png"));
        });
        //Load the image
        imageElement.src = imageSource;
    });
}




