let state = {
  recipes: [],
  activeRecipe: 6,
  showTimers: false,
  unit: 1,
  servings: 0,
  showTimers: true,
  query: '',
  filters: {
    tags: {
      enabled: false,
      data: []
    },
    time: {
      enabled: false,
      data: 1000
    }
  },
  filtersVisible: false
}

$(document).ready(() => {
  console.log("ready");

  

  init();
  
  
 
  // add event listeners ///////////////////////////////////////

  // hide recipe viewer on escape keypress
  $(document).keydown((e) => {
    if (e.keyCode == 27) {
      $(".recipeViewer").removeClass('showRecipeViewer');
    }
  });

  // hide recipe viewer on back button click
  $(".recipeViewer #title div").click(() => {
    $(".recipeViewer").removeClass('showRecipeViewer');
  });


  // update ingredient quantities based on user defined number of servings
  $(".recipeViewer #servings input").change(() => {
    state.servings = $(".recipeViewer #servings input").val(); 
    updateIngredients(state.recipes[state.activeRecipe]);
  });
  
  // show/hide filter options on recipe list
  $(".filter").click(() => {
    $(".filterOptionsWrapper").slideToggle(100);
    
    if (state.filtersVisible) {
      $(".shift").removeClass("filterVisible");
      state.filtersVisible = false;
    } else {
      $(".shift").addClass("filterVisible");
      state.filtersVisible = true;
    }
  });

  // filter recipes based on time slider
  // ideally would be realtime updates
  $(".slider").change(() => {
    updateBubble($(".slider").val());
    updateFilters({time: $(".slider").val()}, state.recipes);
  });

  // query recipe list while query is being entered
  $("nav .search input").keyup(() => {
    state.query = $("nav .search input").val();
    populateRecipeList(state.recipes);
    console.log(state.query);
  });

  //////////////////////////////////////////////////////////////
});

// initialise the page
init = () => {
  $("#date").text(getYear()); // set current year in footer
  $(".filterOptionsWrapper").hide(); // hide filter options initially

  // get recipes from a list of JSON files
  let urls = ['banana-oatmeal-cookie', 'basil-and-pesto-hummus', 'black-bean-and-rice-enchiladas', 'divine-hard-boiled-eggs', 'four-cheese-margherita-pizza', 'homemade-black-bean-veggie-burgers', 'homemade-chicken-enchiladas', 'marinated-grilled-shrimp', 'vegetable-fried-rice', 'vegetarian-korma', 'worlds-best-lasagna'];
  state.recipes = getRecipes(urls);

  populateRecipeList(state.recipes); // populate recipe list with recipes
  addFilterTags(state.recipes); // add tags to filter section

  console.log('Recipes', state.recipes);
}


viewRecipe = (recipes, id) => {
  let recipe = recipes.find(a => a.id == id);

  console.log(recipe);

  if (id != state.activeRecipe) {
    $(".recipeViewer").addClass('showRecipeViewer');
  } else {
    $(".recipeViewer #title").text(recipe.title);

    let tags = '';
    let author = recipe.author;


    $(".recipeViewer tags").empty();
    $(".recipeViewer tags").append(getTags(recipe)[0]);

    $(".recipeViewer #title p").text(recipe.title);
    $(".recipeViewer #author span").text(recipe.author.name);
    $(".recipeViewer #source a").attr("href", recipe.author.url);

    $(".recipeViewer #description").text(recipe.description);
    state.servings = recipe.servings;
    $(".recipeViewer #servings input").val(state.servings);
    $(".recipeViewer #oven p").text(getOven(recipe));
    $(".recipeViewer #oven div").show();
    $(".recipeViewer .ingredients, .recipeViewer .ingredients .content").text(recipe.ingredients);

    updateIngredients(recipe);

    $(".recipeViewer #directions").empty();
    $(".recipeViewer #directions").append(getDirections(recipe));

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
        `<div class="ingredient">${toFraction(ingredients[i].quantity * (state.servings / recipe.servings))} ${ingredients[i].ingredient}</div>`
      );
    }

    $(".recipeViewer .ingredients, .recipeViewer .ingredients .content").empty();
    $(".recipeViewer .ingredients, .recipeViewer .ingredients .content").append(output);
}

populateRecipeList = (recipes) => {
  $(".recipeList").empty(); // clear the recipe list

  let filteredRecipes = recipes.filter((r) => { // apply filters
    let totalTime = getTotalTime(r);
    console.log(totalTime);
    return totalTime < state.filters.time.data || state.filters.time.data == 7200;
  });

  let queriedRecipes = filteredRecipes.filter((r) => { // apply search query
    return r.title.toLowerCase().includes(state.query.toLowerCase()) || // search by title
    r.description.toLowerCase().includes(state.query.toLowerCase()) || // search by title
    r.author.name.toLowerCase().includes(state.query.toLowerCase()) // search by author
  });

  if (queriedRecipes.length % 2 != 0) { // pads out the recipe list to ensure individual recipes on a line are left-aligned 
    queriedRecipes.push({id:'-1', title: 'sentinel'});
  }
  for (let i = 0; i < queriedRecipes.length; i++) {
    let html = '';
    let tags = '';

    // for (tag in getTags(recipes[i])) { // create html string for recipe tags
    //   tags += `<div class="tag">${recipes[i].tags[tag]}</div>`;
    // }

    html += `<div class="recipe ${queriedRecipes[i].title == 'sentinel' ? 'sentinel' : ''}" data-index="${queriedRecipes[i].id}">
      <div class="title">${queriedRecipes[i].title}</div>
      <div class="tags">${getTags(queriedRecipes[i])[0]}</div>
      <div class="description">${queriedRecipes[i].description}</div>
    </div>`

    $(".recipeList").append(html);
  }

  $(".tag").each(function() {
    $(this).css("color", rgbVariation(PRIMARY, 50, false));
  });

  $(".recipeList .recipe").click(() => {
    let index = $(this).data("index");
    viewRecipe(recipes, parseInt(index));
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

getAllTags = (recipes) => {
  let tags = [];
  for (r in recipes) {
    for (t in recipes[r].tags) {
      if (!tags.includes(recipes[r].tags[t])) {
        tags.push(recipes[r].tags[t]);
      }
    } 
  }
  return tags;
}

getTags = (recipe) => {
  let output = [];
  let tags = [];

  for (t in recipe.tags) {
    output.push(`
      <div class="tag">${recipe.tags[t]}</div>
    `);
    tags.push(recipe.tags[t]);
  }

  return output, tags;
}

updateBubble = (value) => {
  $(".value").text(getISO(value) == '02:00:00' ? '02:00:00+' : getISO(value));
}

updateFilters = (values, recipes) => { // takes an object of filter values and updates the respective filters
  if (values.time) {
    state.filters.time.data = parseInt(values.time);
  }
  if (values.tags) {
    state.filters.tags.data = values.tags;
  }

  populateRecipeList(recipes);
}

addFilterTags = (recipes) => {
  let tags = getAllTags(recipes);
  let output = [];
  for (t in tags) {
    output.push(`
      <div class="tag" data-tag="${tags[t]}">${tags[t]}</div>
    `);
  }
  
  $(".FOTag").empty();
  $(".FOTag").append(output);

  $(".FOTag .tag").click(function() {
    console.log($(this));
    if (state.filters.tags.data.includes($(this).attr("tag"))) {
      state.filters.tags.data.splice(state.filters.tags.data.indexOf($(this).attr("tag")), 1);
    } else {
      state.filters.tags.data.push($(this).attr("tag"));
    }
    console.log(state.filters.tags.data);
  });
  
}

