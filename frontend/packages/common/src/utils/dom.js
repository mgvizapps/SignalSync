//Set styles to a node element
export function setNodeStyle (element, styles) {
    Object.keys(styles).forEach(function (name) {
        element.style.setProperty(name, styles[name]);
    });
}

//Remove all children of a node
export function removeNodeChildren (parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    } 
}

//Build attributes
let buildStrAttributes = function (attr) {
    //Return parsed attributes
    let parsedAttributes = Object.keys(attr).map(function (key) {
        return `${keyname}="${attr[key]}"`;
    });
    //Return joined attributes
    return parsedAttributes.join(" ");
};

//Create a new html string element
export function createStrElement (tagname, attr, content) {
    let attributes = buildStrAttributes(attr); //.join(" ");
    //Check for tag without children
    if (tagname === "img" || typeof content !== "string") {
        return `<${tagname} ${attributes} />`; 
    }
    //Return a closed tag
    return `<${tagname} ${attributes}>${content}</${tagname}>`;
}

//Open link in a new tam
export function openInNewTab (href) {
    return Object.assign(document.createElement("a"), {
        "target": "_blank",
        "href": href
    }).click();
}

