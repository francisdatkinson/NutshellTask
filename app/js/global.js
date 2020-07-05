let state = {
  activeRecipe: 1,
  showTimers: false,
  unit: 1,
  servings: 0
}

$(document).ready(() => {
  console.log("ready");

  let urls = ['banana-oatmeal-cookie', 'basil-and-pesto-hummus', 'black-bean-and-rice-enchiladas', 'divine-hard-boiled-eggs', 'four-cheese-margherita-pizza', 'homemade-black-bean-veggie-burgers', 'homemade-chicken-enchiladas', 'marinated-grilled-shrimp', 'vegetable-fried-rice', 'vegetarian-korma', 'worlds-best-lasagna'];
  let recipes = [];
  
  for (url in urls) {
    loadJSON(`recipes/${urls[url]}.json`, response => {
      recipes.push({id: recipes.length, ...JSON.parse(response)}); // push an id for a recipe, plus the JSON response containing the recipe data
    });
  }
  
  console.log(recipes);

  populateRecipeList(recipes);
  
  $("#date").text(getYear());

  $(".recipeList .recipe").click(() => {
    let index = $(this).data("index");
    console.log(index);
    viewRecipe(recipes, 1);
  });

  $(document).keydown((e) => {
    if (e.keyCode == 27) {
      $(".recipeViewer").removeClass('showRecipeViewer');
    }
  });

  $(".recipeViewer #servings input").change(() => {
    state.servings = $(".recipeViewer #servings input").val();
    updateIngredients(recipes[state.activeRecipe]);
  });

  $(".recipeViewer #title div").click(() => {
    $(".recipeViewer").removeClass('showRecipeViewer');
  });
});

viewRecipe = (recipes, id) => {
  console.log(id);

  let recipe = recipes.find(a => a.id = id);

  if (id != state.activeRecipe) {
    $(".recipeViewer").addClass('showRecipeViewer');
  } else {
    $(".recipeViewer #title").text(recipe.title);

    let tags = '';
    let author = recipe.author;
    console.log(author);

    for (tag in getTags(recipe)) {
      tags += `<div class='tag'>${getTags(recipe)[tag]}</div>`
    }

    console.log(tags);

    $(".recipeViewer tags").empty();
    $(".recipeViewer tags").append(tags);

    $(".recipeViewer #title p").text(recipe.title);
    $(".recipeViewer #author span").text(recipe.author.name);
    $(".recipeViewer #source a").attr("href", recipe.author.url);

    console.log(getOven(recipe));

    $(".recipeViewer #description").text(recipe.description);
    state.servings = recipe.servings;
    $(".recipeViewer #servings input").val(state.servings);
    $(".recipeViewer #oven p").text(getOven(recipe));
    $(".recipeViewer #oven div").show();
    $(".recipeViewer .ingredients, .recipeViewer .ingredients .content").text(recipe.ingredients);

    updateIngredients(recipe);

    $(".recipeViewer #directions").text(recipe.directions);
    $(".recipeViewer").addClass('showRecipeViewer');

    getIngredients(recipe);
  }

  state.activeRecipe = id;
}

updateIngredients = (recipe) => {
  let ingredients = getIngredients(recipe);
    let output = [];

    for (i in ingredients) {
      output.push(
        `<div class="ingredient">${ingredients[i].quantity * (state.servings / recipe.servings)} ${ingredients[i].ingredient}</div>`
      );
    }

    $(".recipeViewer .ingredients, .recipeViewer .ingredients .content").empty();
    $(".recipeViewer .ingredients, .recipeViewer .ingredients .content").append(output);
}

populateRecipeList = (recipes) => {
  $(".recipeList").empty(); // clear the recipe list

  if (recipes.length % 2 != 0) { // pads out the recipe list to ensure individual recipes on a line are left-aligned 
    recipes.push({id:'-1', title: 'sentinel'});
  }
  for (let i = 0; i < recipes.length; i++) {
    let html = '';
    let tags = '';

    for (tag in getTags(recipes[i])) { // create html string for recipe tags
      tags += `<div class="tag">${recipes[i].tags[tag]}</div>`;
    }

    html += `<div class="recipe ${recipes[i].title == 'sentinel' ? 'sentinel' : ''}" data-index="${recipes[i].id}">
      <div class="title">${recipes[i].title}</div>
      <div class="tags">${tags}</div>
      <div class="description">${recipes[i].description}</div>
    </div>`

    $(".recipeList").append(html);
  }

  $(".tag").each(function() {
    console.log($(this).css("color"));
    $(this).css("color", rgbVariation(PRIMARY, 50, false));
  });
}

getYear = () => {
  return new Date().getYear() + 1900;
}

showRecipeViewer = (show) => {
  if (show) {
    $(".recipeViewer").addClass('showRecipeViewer');
  } else {

  }
}

getTags = (recipe) => {
  let tags = [];

  for (tag in recipe.tags) {
    tags.push(recipe.tags[tag]);
  }

  return tags;
}


