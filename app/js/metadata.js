getIngredients = (recipe) => {

  // let fraction = /[1-9][0-9]*(?:\/[1-9][0-9])*/g;
  let fraction = /([^a-z]+)\s/g;
  let ingredient = '';

  let ingredientsQuantity = [];

  let ingredients = [];

  for (let i = 0; i < recipe.ingredients.length; i++) {
    let quantityArray = recipe.ingredients[i].match(fraction)[0].split(" ");
    let quantity = 0;
    
    let filteredQuantityArray = quantityArray.filter((a) => {
      return a != "";
    });

    for (q in filteredQuantityArray) {
      quantity += eval(filteredQuantityArray[q]);
    }

    ingredients.push({
      ingredient: recipe.ingredients[i].replace(fraction, ''),
      quantity: quantity
    });
  }

  return ingredients;
};

toFraction = (decimal) => {
  let components = decimal.split('.');

  console.log(components);

  // let whole = components[0];
  // let bottom = 
}

gcd = (a, b) => {
  return (b) ? gcd(b, a % b) : a;
}

toNumber = () => {

}

getOven = (recipe) => {
  const regex = /(\d{1,3})(?:.{1})?\s?degrees\s?(C|F)/g;
  const regexGM = /(gas mark|gasmark|gas|mark)\s*(\d{1,2})/g;

  let match = [];
  let value = 0;
  let denom = '';
  let oven = 0;

  match = (regex.exec(recipe.directions));

  if (!match) {
    match = (regexGM.exec(recipe.directions));
    if (!match) {
      oven = 0;
    } else {
      value = parseInt(match[2]);
      denom = 'gm';
    }
    
  } else {
    value = parseInt(match[1]);
    denom = match[2].toLowerCase();
  }

  return state.unit < 2 ? `${normaliseOven(value, denom)[state.unit]} ${UNITS[state.unit]}` : `${UNITS[state.unit]} ${normaliseOven(value, denom)[state.unit]}`;
}

normaliseOven = (value, denom) => {
  let c = 0;
  let f = 0;
  let gm = 0;
  
  switch (denom) {
    case 'c':
      c = value;
      f = Math.floor(((value * (1.8)) + 32) / 5) * 5;
      gm = this.getGasMark(c);
    break;
    case 'f':
      f = value;
      c = Math.floor(((value - 32) / 1.8) / 5) * 5;
      gm = this.getGasMark(c);
    break;
    case 'gm':
      gm = value;
      c = this.getCFromGM(gm);
      f = Math.floor(((c * (1.8)) + 32) / 5) * 5;
    break;
    default:
      c = value;
      f = Math.floor(((value * (1.8)) + 32) / 5) * 5;
      gm = this.getGasMark(c);
    break;
  }

  return [c, f, gm];
}

getCFromGM = (gm) => {
  return (
    Math.floor(((135 * (1 + (gm / 10))) - 15) / 5) * 5
  );
}

getGasMark = (tempInC) => {
  if (tempInC < 135 || tempInC > 260) {
    return tempInC + "C";
  } else {
    return (
      Math.ceil(((tempInC - 135) * 10) / 125)
    );
  }
}