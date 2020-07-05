let state = {
  recipe: 1,
  showTimers: false
}

$(document).ready(() => {
  console.log("ready");

  // let file = new File([], 'recipes/banana-oatmeal-cookie.json');
  // let fileReader = new FileReader();
  // fileReader

  // let items = [];
  // let thisRecipe = $.getJSON('recipes/banana-oatmeal-cookie.json', (json) => {
  //   return json.parse();
  // });

  let urls = ['banana-oatmeal-cookie', 'basil-and-pesto-hummus', 'black-bean-and-rice-enchiladas', 'divine-hard-boiled-eggs', 'four-cheese-margherita-pizza', 'homemade-black-bean-veggie-burgers', 'homemade-chicken-enchiladas', 'marinated-grilled-shrimp', 'vegetable-fried-rice', 'vegetarian-korma', 'worlds-best-lasagna'];
  let recipes = [];
  
  for (url in urls) {
    loadJSON(`recipes/${urls[url]}.json`, response => {
      recipes.push(JSON.parse(response));
    });
  }
  
  console.log(recipes);
});


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