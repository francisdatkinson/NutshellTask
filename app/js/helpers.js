
random = (max) => { // returns a random number from 1 to the max
  return Math.ceil(Math.random() * max);
}

randomRGB = (alpha) => { // returns a random rgb colour string, with the option of adding an alpha component with the boolean parameter 'alpha'
  if (alpha) {
    return `rgba(${random(255)}, ${random(255)}, ${random(255)}, ${random(100) / 100}`;
  }
  return `rgb(${random(255)}, ${random(255)}, ${random(255)}`;
}

biasedRGB = (alpha, bias) => { 
//returns a random rgb colour string which is biased towards one end of the lightness spectrum, defined by the 'bias' parameter,
//and has <the option of adding an alpha component with the boolean parameter 'alpha'
  if (bias > 0) {
    let left = 255 - bias;
    if (alpha) {
      return `rgba(${bias + random(left)}, ${bias + random(left)}, ${bias + random(left)}, ${random(100) / 100}`;
    }
    return `rgb(${bias + random(left)}, ${bias + random(left)}, ${bias + random(left)}`;
  } else {
    if (alpha) {
      return `rgba(${random(Math.abs(bias))}, ${random(Math.abs(bias))}, ${random(Math.abs(bias))}, ${random(100) / 100}`;
    }
    return `rgb(${random(Math.abs(bias))}, ${random(Math.abs(bias))}, ${random(Math.abs(bias))}`;
  }
}

rgbVariation = (colour, tolerance, absolute) => {
  console.log(colour, tolerance, absolute);
// returns a variation on a given colour. The severity of the variation is defined by the 
// 'tolerance' parameter. This varies each component of the rgb string by a random number within the range of half the tolerance.
// if the 'absolute' parameter is true, each component of the rgb string will be varied by EXACTLY the provided tolerance.
  let rgb = colour.replace(/[^\d,]/g, '').split(',');
  if (absolute) {
    return `rgb(${(parseInt(rgb[0]) + tolerance)}, ${(parseInt(rgb[1]) + tolerance)}, ${(parseInt(rgb[2]) + tolerance)})`;
  }
  return `rgb(${(rgb[0] - (tolerance / 2)) + random(tolerance)}, ${(rgb[1] - (tolerance / 2)) + random(tolerance)}, ${(rgb[2] - (tolerance / 2)) + random(tolerance)})`;
}

loadJSON = (url, callback) => {   

  let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, false);
    xobj.onreadystatechange = () => {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(xobj.responseText);
      }
    };
    xobj.send(null);
}