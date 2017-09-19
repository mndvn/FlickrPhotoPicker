// Initial variables
var choosedPhotos = new Map(); // selected images that are saved for gallery
var visibleGallery = false; // if currently in viewing gallery "mode"
var photoResults;
var jsonDatas = {
    "nojsoncallback": "1",
    "method": "flickr.photos.search",
    "format": "json",
    "api_key": "dd97fe1f49ec23d84b8c0be209d64137"
}

// Selected photos on Gallery
var makeVisible = function() {
    visibleGallery = true;
    showPhotos(choosedPhotos);
};

// making XMLhttpRequest to flickr server, Building URL to get photos
var req = function(jsonDatas, cb) {
    var xhr;
    var url = "https://api.flickr.com/services/rest/";
    var begin = true;

    for ( var item in jsonDatas) {
        if (jsonDatas.hasOwnProperty(item)) {
            url += (begin ? "?" : "&") + item + "=" + jsonDatas[item];
            begin = false;
        }
    }

    xhr = new XMLHttpRequest();
    xhr.onload = function() {
        cb(this.response);
    };
    //Standarts of XML req
    xhr.open('get', url, true);
    xhr.send();

};

// Search on Flickr by means of InputText Data
var searchPhotosFlickr = function(searchInput) {
    visibleGallery = false;
    jsonDatas['text'] = searchInput;
    req(jsonDatas, function(data) {
        var results = JSON.parse(data);
        //photoResults = results.photos.photo;
        photoResults = new Map(results.photos.photo.map((i) => [i.id, i])); // convert to hash map
        for (var i=0; i < results.photos.photo.length; i++) {
            console.log(results)
        }
        console.log(results.photos.photo.length);
        showPhotos(photoResults);
    });
    return false;
};

// Display photos from a given JSON object with flickr photo data
var showPhotos = function(photosJSON) {
    var container = document.getElementById("img-container");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    // append photo results
    photosJSON.forEach(function(photo) {
        try {
            var img = createImg(photo.farm, photo.server, photo.id, photo.secret, photo.title);
            container.appendChild(img);
        } catch(err) {
            console.log(err.message);
        }
    });

};

// creates and returns an image DOM from flickr variables
var createImg = function(farm_id, server_id, id, secret, title) {
    // img block (parent DOM)
    var imgBlock = document.createElement("div");
    imgBlock.classList.add("img-block");
    imgBlock.setAttribute("id", id);
    imgBlock.addEventListener("click", imgClick, false);
    // flickr size suffix (q=large square 150x150) (n=small, 320 on longest side)
    var imgSize = (visibleGallery) ? 'q' : 'n';
    // image DOM
    var src_url = "https://farm"+farm_id+".staticflickr.com/"+server_id+"/"+id+"_"+secret+"_"+imgSize+".jpg";
    var img_DOM = document.createElement("img");
    img_DOM.setAttribute("src", src_url);
    img_DOM.setAttribute("alt", title);
    img_DOM.setAttribute("title", title);
    imgBlock.appendChild(img_DOM);

    // visualize if selected
    if (!visibleGallery && choosedPhotos.has(id)) {
        imgBlock.classList.add('selected');
    }

    // image title DOM
    var imgBlockTitle = document.createElement("div");
    imgBlockTitle.classList.add("img-block-title");

    var title_text = document.createTextNode(title);
    imgBlockTitle.appendChild(title_text);
    imgBlock.appendChild(imgBlockTitle);
    return imgBlock;
};

// image click
var imgClick = function(element) {
    if(visibleGallery) {
        zoomImg(element);
    } else {
        toggleSelect(element);
    }
};

// toggle image selection
var toggleSelect = function(element) {
    var selectedImgBlock = element.target.parentElement;
    var imgID = selectedImgBlock.id;

    // check if it exists in array
    if (choosedPhotos.has(imgID)) {
        choosedPhotos.delete(imgID);
        selectedImgBlock.classList.remove('selected');
    } else {
        choosedPhotos.set(imgID,photoResults.get(imgID));
        selectedImgBlock.classList.add('selected');
    }

};

// Creating a modal
var zoomImg = function(element) {
    var modal = document.getElementById('imgModal');
    var modalImg = document.getElementById("displayImg");
    var modalCaption = document.getElementById("caption");
    modal.style.display = "block";
    var selectedImgBlock = element.target.parentElement;
    var selectedImg = choosedPhotos.get(selectedImgBlock.id);
    var img_url = "https://farm"+selectedImg.farm+".staticflickr.com/"+selectedImg.server+"/"+selectedImg.id+"_"+selectedImg.secret+".jpg";
    modalImg.src = img_url;
    modalCaption.innerHTML = element.target.title;
};

