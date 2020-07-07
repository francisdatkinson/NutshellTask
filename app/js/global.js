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
  tagColours: [],
  filtersVisible: false
}

$(document).ready(() => {
  console.log("ready");

  init();
  
  
 
  // add event listeners ///////////////////////////////////////

  // hide recipe viewer on escape keypress
  $(document).keydown((e) => {
    if (e.keyCode == 27) {
      hideRecipe();
      
    }
  });

  // hide recipe viewer on back button click
  $(".recipeViewer #title div, .recipeViewerOverlay").click(() => {
    hideRecipe();
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
  $("nav .search input").keyup(function() {
    state.query = $(this).val();
    populateRecipeList(state.recipes);
  });

  // enable/disable time filter
  $(".FOTime .toggle").click(function() {
    state.filters.time.enabled = !state.filters.time.enabled;
    updateToggles();
    populateRecipeList(state.recipes);
  });

  // enable/disable tag filter
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

  // add/remove tag from filter list
  $(".FOTag .tag").click(function() {
    if (state.filters.tags.data.includes($(this).data("tag"))) {
      $(this).removeClass("active");
      state.filters.tags.data.splice(state.filters.tags.data.indexOf($(this).data("tag")), 1);
    } else {
      $(this).addClass("active");
      state.filters.tags.data.push($(this).data("tag"));
    }
    
    populateRecipeList(state.recipes);
  });

  //////////////////////////////////////////////////////////////
});

// initialise the page
init = () => {
  $(".recipeViewerOverlay").hide();
  $("#date").text(getYear()); // set current year in footer
  // $(".filterOptionsWrapper, #oven").hide(); // hide filter options initially

  // get recipes from a list of JSON files
  let urls = ['banana-oatmeal-cookie', 'basil-and-pesto-hummus', 'black-bean-and-rice-enchiladas', 'divine-hard-boiled-eggs', 'four-cheese-margherita-pizza', 'homemade-black-bean-veggie-burgers', 'homemade-chicken-enchiladas', 'marinated-grilled-shrimp', 'vegetable-fried-rice', 'vegetarian-korma', 'worlds-best-lasagna'];
  state.recipes = getRecipes(urls);

  updateToggles();
  populateRecipeList(state.recipes); // populate recipe list with recipes
  addFilterTags(state.recipes); // add tags to filter section

  generateTagColours(getAllTags(state.recipes));

  updateTagColours();
  

  console.log('Recipes', state.recipes);
}


viewRecipe = (recipes, id) => {
  let recipe = recipes.find(a => a.id == id);

  if (id != state.activeRecipe) {
    $(".recipeViewerOverlay").fadeIn();
    $(".recipeViewer").addClass('showRecipeViewer');
    setTimeout(() => {
      $("body").css("overflow", "hidden");
    }, 200);
  } else {
    setTimeout(() => {
      $("body").css("overflow", "hidden");
    }, 200);
    $(".recipeViewer #title p").text(recipe.title);

    $(".recipeViewerOverlay").fadeIn();



    $(".recipeViewer #tags").empty();
    $(".recipeViewer #tags").append(getTags(recipe)[0].toString().replace(/[\,\"\']/g, ''));

    $(".recipeViewer #title p").text(recipe.title);
    $(".recipeViewer .author span").text(recipe.author.name);
    $(".recipeViewer #source a").attr("href", recipe.author.url);

    $(".recipeViewer #description").text(recipe.description);
    state.servings = recipe.servings;
    $(".recipeViewer #servings input").val(state.servings);

    if (getOven(recipe).length > 1) {
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

  updateTagColours();
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
  let allTags = state.filters.tags.data;

  let filteredRecipes = recipes.filter((r) => { // apply filters
    let temp = true;
    if (!state.filters.time.enabled && !state.filters.tags.enabled) { // return true if all filters are disabled
      return true;
    }
    if (state.filters.time.enabled) { // run time filter if enabled
      let totalTime = getTotalTime(r);
      temp = (totalTime < state.filters.time.data || state.filters.time.data == 7200);
    }
    if (state.filters.tags.enabled) { // run tag filter if enabled
      
      let tags = getTags(r)[1];

      let tagIncluded = tags.filter(t => {
        return allTags.includes(t);
      });

      temp = temp && (tagIncluded.length > 0);
    }

    return temp;
  });

  let queriedRecipes = filteredRecipes.filter((r) => { // apply search query
    return r.title.toLowerCase().includes(state.query.toLowerCase()) || // search by title
    r.description.toLowerCase().includes(state.query.toLowerCase()) || // search by title
    r.author.name.toLowerCase().includes(state.query.toLowerCase()) // search by author
  });

  if (queriedRecipes.length % 2 != 0) { // pads out the recipe list to ensure individual recipes on a line are left-aligned 
    queriedRecipes.push({id:'-1', title: 'sentinel'});
  }
  let list1length = 0;
  let list2length = 0;

  let listCount = Math.floor($("main").width() / 540) > 3 ? 3 : Math.floor($("main").width() / 540) == 0 ? 1 : Math.floor($("main").width() / 540);

  $(".recipeListWrapper").empty(); // clear the recipe list
  for (let i = 0; i < listCount; i++) {
    $(".recipeListWrapper").append(`
      <div class="recipeList" id="recipeList${i}"></div>
    `);
  }

  $(".recipeList").css("flex-basis", `${100 / listCount - 2}%`);

  
  
  for (let i = 0; i < queriedRecipes.length - 1; i++) {
    let r = queriedRecipes[i];
    let html = '';

    html += `<div class="recipe ${r.title == 'sentinel' ? 'sentinel' : ''}" data-index="${r.id}">
      <div class="title">${r.title}</div>
      <div class="tags">${getTags(r)[0].toString().replace(/[\,\"\']/g, "")}</div>
      <div class="description">${r.description}</div>
      <div class="timeAuthor">
        <div class="recipeTime">${getTotalTime(r) == 0 ? '' : 'Recipe time: <span>' + getISO(getTotalTime(r)) + '</span>'}</div>
        <div class="author">By <span>${r.author.name}</span></div>
      </div>
      
    </div>`;

    $(shortestList(listCount)).append(html);

    updateTagColours();
    

    // if (list1length > list2length) {
    //   $("#recipeList1").append(html);
    //   // list2length += queriedRecipes[i].description.length;
    //   list2length = $("#recipeList1").height();
    // } else {
    //   $("#recipeList0").append(html);
    //   // list1length += queriedRecipes[i].description.length;
    //   list1length = $("#recipeList0").height();
    // }
  }

  $(".recipeList .recipe").click(function() {
    state.activeRecipe = parseInt($(this).data('index'));
    viewRecipe(recipes, state.activeRecipe);
  });
}

shortestList = (count) => {
  let lists = [];
  for (let i = 0; i < count; i++) {
    let listHeight = 0;
    $(`#recipeList${i}`).children().each(function() { // get combined height of list children
      listHeight += $(this).outerHeight(true);
    });
    lists.push(listHeight);
  }

  return `#recipeList${lists.indexOf(Math.min(...lists))}`; // return shortest list
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

generateTagColours = (tags) => {
  let tagColours = [];
  for (t in tags) {
    tagColours.push({tag: tags[t], colour: biasedRGB(false, 175)});
  }

  state.tagColours = tagColours;
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

  return [output, tags];
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
      <div class="tag disabled" data-tag="${tags[t]}">${tags[t]}</div>
    `);
  }
  
  $(".FOTag .tags").empty();
  $(".FOTag .tags").append(output);
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

hideRecipe = () => {
  $(".recipeViewer").removeClass('showRecipeViewer');
  $(".recipeViewerOverlay").fadeOut(100);
  $("body").css("overflow", "scroll");
}

updateTagColours = () => {
  $(".tag").each(function() {
    if (state.tagColours.find(a => a.tag == $(this).text())) {
      $(this).css("background", state.tagColours.find(a => a.tag == $(this).text()).colour);
    }
  });
}

