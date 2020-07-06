getRecipes = (urls) => {
  let recipes = [];

  for (url in urls) {
    loadJSON(`recipes/${urls[url]}.json`, response => {
      recipes.push({id: recipes.length, ...JSON.parse(response)}); // push an id for a recipe, plus the JSON response containing the recipe data
    });
  }
  
  return recipes;
}

getIngredients = (recipe) => {

  // let fraction = /[1-9][0-9]*(?:\/[1-9][0-9])*/g;
  let fraction = /([^a-z\()]+)\s/g;
  let ingredient = '';

  let ingredientsQuantity = [];

  let ingredients = [];

  for (let i = 0; i < recipe.ingredients.length; i++) {
    if (recipe.ingredients[i].match(fraction)) {
      let quantityArray = recipe.ingredients[i].match(fraction)[0].split(" ");
      let quantity = 0;
      
      let filteredQuantityArray = quantityArray.filter((a) => {
        return a != "";
      });

      console.log(filteredQuantityArray);

      for (q in filteredQuantityArray) {
        quantity += eval(filteredQuantityArray[q]);
      }

      ingredients.push({
        ingredient: recipe.ingredients[i].replace(fraction, ''),
        quantity: quantity
      });
    } else {
      ingredients.push({
        ingredient: recipe.ingredients[i].replace(fraction, '')
      });
    }
    
  }

  return ingredients;
};

toFraction = (decimal) => {
  if (decimal.toString().includes(".")) {
    let components = decimal.toString().split(".");
    let low = '0.' + components[1];

    let unit = components[0];
    let num = 0;
    let denom = 0;

    let normalised = components[1] * (Math.pow(10, (components[1].length) * -1));

    if (normalised > 0.75) { // this should be cleaner
      num = 7;
      denom = 8;
    } else if (normalised > 0.625) {
      num = 3;
      denom = 4;
    } else if (normalised > 0.5) {
      num = 5;
      denom = 8;
    }  else if (normalised > 0.375) {
      num = 1;
      denom = 2;
    }  else if (normalised > 0.25) {
      num = 3;
      denom = 8;
    }  else if (normalised > 0.125) {
      num = 1;
      denom = 4;
    }  else if (normalised > 0) {
      num = 1;
      denom = 8;
    } 

    return `${parseInt(unit) > 0 ? unit.toString() : ''} ${num}/${denom}`;
  } else {
    return decimal;
  }
}

gcd = (a, b) => {
  return (b) ? gcd(b, a % b) : a;
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
      return 0;
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

getDirections = (recipe) => {
  let directions = recipe.directions;
  let output = [];
  const regex = /([^t-](?:(?:\d{1, 3}\s?-\s?\d+\s?)|(?:\d+\s?))(?:min|mins|hr|hrs|minute|minutes|hour|hours|second|seconds|sec|secs))/g; // matches most time values (e.g. 30 seconds, 2hrs, 1 min)
  let matches = [];

  for (d in directions) {
    matches = directions[d].match(regex);

    output.push(`
      <div class="direction"><span class="firstChar">${parseInt(d) + 1}.</span> ${directions[d]}</div>
    `);

    if (matches && state.showTimers) {
      for (m in matches) {
        console.log(matches[m]);
        let exec = regex.exec(directions[d]);

        output.push(`
          <div class="timer">
            <p class="time">${getTime(exec)}</p>
            <div class="control"></div>
          </div>
        `);
      }
    }
  }

  return output;
}

getTime = (string) => { // gets the time in seconds from the match
  let matchNumber = /(\d+)/g; // regex to match numbers
  let matchDenom = /(min|mins|hr|hrs|minute|minutes|hour|hours|second|seconds|sec|secs)/g; // regecx to match denominations of time
  let number = matchNumber.exec(string); // find the number in the match
  let denomination = matchDenom.exec(string); // find the denomination in the match
  
  // arrays to compare the denomination to
  let secs = ['secs', 'sec', 'seconds', 'second', 's'];
  let mins = ['mins', 'min', 'minutes', 'minute', 'm'];
  let hrs = ['hrs', 'hr', 'hours', 'hour', 'h'];

  if (number && denomination) { // if a number and denomination are found in the match

    let timeInSecs = parseInt(number[0]);
    denomination = denomination[0];

    if (secs.indexOf(denomination) > -1) { // if time is in seconds
      // do nothing
    } else if (mins.indexOf(denomination) > -1) { // if time is in minutes
      timeInSecs = timeInSecs * 60; // multiply to get seconds
    } else if (hrs.indexOf(denomination) > -1) { // if time is in hours
      timeInSecs = timeInSecs * 3600; // multiply to get seconds
    }
    return getISO(timeInSecs); // return an ISO string of the time (HH:MM:SS)
  }
  return '';
}

getISO = (seconds) => {
  return new Date(parseInt(seconds) * 1000).toISOString().substr(11, 8);
}

getTotalTime = (r) => {
  let totalTime= 0;
  if (r.prep_time_min && r.cook_time_min) {
    totalTime = 60 * (r.prep_time_min + r.cook_time_min);
  }

  return totalTime;
  // console.log(r.directions.toString());
}