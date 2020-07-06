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
      data: 7200
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

  $(".FOTime .toggle").click(function() {
    state.filters.time.enabled = !state.filters.time.enabled;
    updateToggles();
    populateRecipeList(state.recipes);
  });

  $(".FOTag .toggle").click(function() {
    state.filters.tags.enabled = !state.filters.tags.enabled;
    if (state.filters.tags.enabled) {
      $(".FOTaf .tag").removeClass("disabled");
    } else {
      $(".FOTaf .tag").addClass("disabled");
    }
    
    updateToggles();
    populateRecipeList(state.recipes);
  });

  $(".FOTag .tag").click(function() {
    if (state.filters.tags.data.includes($(this).text())) {
      $(this).css({"background": rgbVariation(PRIMARY, 20, false), "color": WHITE});
    } else {
      $(this).css({"background": "transparent", "color": STEXT});
    }
    
    populateRecipeList(state.recipes);
  });

  //////////////////////////////////////////////////////////////
});

// initialise the page
init = () => {
  $("#date").text(getYear()); // set current year in footer
  $(".filterOptionsWrapper, #oven").hide(); // hide filter options initially

  // get recipes from a list of JSON files
  let urls = ['banana-oatmeal-cookie', 'basil-and-pesto-hummus', 'black-bean-and-rice-enchiladas', 'divine-hard-boiled-eggs', 'four-cheese-margherita-pizza', 'homemade-black-bean-veggie-burgers', 'homemade-chicken-enchiladas', 'marinated-grilled-shrimp', 'vegetable-fried-rice', 'vegetarian-korma', 'worlds-best-lasagna'];
  state.recipes = getRecipes(urls);

  updateToggles();
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
    $(".recipeViewer #title p").text(recipe.title);

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

    console.log(getOven(recipe));

    if (getOven(recipe).length > 1) {
      console.log("oven");
      $(".recipeViewer #oven p").text(getOven(recipe));
      $(".recipeViewer #oven").show();
    } else {
      $(".recipeViewer #oven").hide();
    }
    
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
    if (!state.filters.time.enabled) {
      return true;
    }
    return (totalTime < state.filters.time.data || state.filters.time.data == 7200);
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

  // $(".recipeList .tags").each(function() {
  //   console.log($(this));
  //   $(this).css("color", rgbVariation(PRIMARY, 50, false));
  // });

  $(".recipeList .recipe").click(function() {
    state.activeRecipe = parseInt($(this).data('index'));
    viewRecipe(recipes, state.activeRecipe);
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
  
  $(".FOTag .tags").empty();
  $(".FOTag .tags").append(output);

  $(".FOTag .tag").click(function() {
    if (state.filters.tags.data.includes($(this).data("tag"))) {
      state.filters.tags.data.splice(state.filters.tags.data.indexOf($(this).data("tag")), 1);
    } else {
      state.filters.tags.data.push($(this).data("tag"));
    }
    console.log(state.filters.tags.data);
  });
}

updateToggles = () => {
  if (state.filters.tags.enabled) {
    $(".FOTag .toggle .ball").addClass("enabled");
    $(".FOTag .tag").removeClass("disabled");
  } else {
    $(".FOTag .toggle .ball").removeClass("enabled");
    $(".FOTag .tag").addClass("disabled");
  }

  if (state.filters.time.enabled) {
    $(".FOTime .toggle .ball").addClass("enabled");
    $(".slider").removeClass("disabled");
  } else {
    $(".FOTime .toggle .ball").removeClass("enabled");
    $(".slider").addClass("disabled");
  }
}

