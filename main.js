var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.createTemplateTagFirstArg = function(a) {
  return a.raw = a;
};
$jscomp.createTemplateTagFirstArgWithRaw = function(a, b) {
  a.raw = b;
  return a;
};
var htmlCanvas = document.getElementById("c"), ctx = htmlCanvas.getContext("2d");
time_elapsed = 0;
var culture_width = 1400, culture_height = 900, culture_x = 50, culture_y = 10, culture_diagonal = findDistance(0, 0, culture_width, culture_height), culture_diagonal_half = culture_diagonal / 2, culture_area = culture_width * culture_height, food_matrix = [], food_count_start = food_count = 0, food_count_min = culture_area / 6400, food_fatness = 3, food_value_min = 20, food_value_max = 36;
function food_value() {
  return randomNumber(food_value_min, food_value_max);
}
var ent_matrix = [];
ent_id = ent_deaths = ent_count = 0;
var ent_count_start = Math.floor(culture_area / 48000);
oldest_age = average_age = total_lifespan_of_dead = oldest_generation = youngest_generation = lineages = 0;
average_colour = "#999";
var stats_average_age = [], stats_average_colour = [], stats_youngest_average_colour = [], stats_descendants = [], stats_generations = [];
stats_descendants[0] = 0;
highest_generations = highest_descendants = stats_generations[0] = 0;
var breed_waste = 0.01, mutation_rarity = 9, mutation_intensity = 1, supermutation_rarity = 9, supermutation_intensity = 10, s_mutation_intensity = 20;
saved_highlight_id = highlight_id = -1;
graph = "descendants";
var graph_width = 400, graph_height = 300, graph_x1 = culture_x + culture_width + 10, graph_y1 = culture_y + culture_height - graph_height, graph_x2 = graph_x1 + graph_width, graph_y2 = graph_y1 + graph_height;
highlight_pointer = !1;
cursor_y = cursor_x = 0;
leftclick = "select";
ui_select_c = ui_select_h = !1;
var ui_select_x1 = 10, ui_select_y1 = culture_y, ui_select_width = 30, ui_select_height = 30, ui_select_x2 = ui_select_x1 + ui_select_width, ui_select_y2 = culture_y + ui_select_height;
ui_food_c = ui_food_h = !1;
var ui_food_x1 = 10, ui_food_y1 = culture_y + 40, ui_food_width = 30, ui_food_height = 30, ui_food_x2 = ui_food_x1 + ui_food_width, ui_food_y2 = ui_food_y1 + ui_food_height;
ui_ent_c = ui_ent_h = !1;
var ui_ent_x1 = 10, ui_ent_y1 = culture_y + 80, ui_ent_width = 30, ui_ent_height = 30, ui_ent_x2 = ui_ent_x1 + ui_ent_width, ui_ent_y2 = ui_ent_y1 + ui_ent_height;
ui_mutate_c = ui_mutate_h = !1;
var ui_mutate_x1 = 10, ui_mutate_y1 = culture_y + 120, ui_mutate_width = 30, ui_mutate_height = 30, ui_mutate_x2 = ui_mutate_x1 + ui_mutate_width, ui_mutate_y2 = ui_mutate_y1 + ui_mutate_height;
ui_g_descendants_c = ui_g_descendants_h = !1;
var ui_g_descendants_x1 = graph_x2 + 10, ui_g_descendants_y1 = graph_y1, ui_g_descendants_width = 30, ui_g_descendants_height = 30, ui_g_descendants_x2 = ui_g_descendants_x1 + ui_g_descendants_width, ui_g_descendants_y2 = graph_y1 + ui_g_descendants_height;
ui_g_generations_c = ui_g_generations_h = !1;
var ui_g_generations_x1 = graph_x2 + 10, ui_g_generations_y1 = graph_y1 + 40, ui_g_generations_width = 30, ui_g_generations_height = 30, ui_g_generations_x2 = ui_g_generations_x1 + ui_g_generations_width, ui_g_generations_y2 = ui_g_generations_y1 + ui_g_generations_height, randomNumber = function(a, b) {
  return Math.random() * (b - a + 1) + a;
}, randomInteger = function(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}, randomColour = function() {
  return colour = "#".concat(randomInteger(0, 15).toString(16), randomInteger(0, 15).toString(16), randomInteger(0, 15).toString(16));
};
function findDistance(a, b, c, d) {
  na1 = a - c;
  na2 = b - d;
  return Math.sqrt(na1 * na1 + na2 * na2);
}
function findAngle(a, b, c, d) {
  nb1 = d - b;
  nb2 = c - a;
  theta = Math.atan2(nb1, nb2);
  return theta *= 180 / Math.PI;
}
function findNewPoint(a, b, c, d) {
  var e = {};
  e.xc2 = Math.round(Math.cos(c * Math.PI / 180) * d + a);
  e.yc2 = Math.round(Math.sin(c * Math.PI / 180) * d + b);
  return e;
}
function drawUI() {
  ctx.beginPath();
  ctx.lineWidth = "select" === leftclick ? "2" : "1";
  ctx.strokeStyle = "#666";
  ctx.strokeRect(ui_select_x1, culture_y, ui_select_width, ui_select_height);
  ctx.fillStyle = "#777";
  ctx.font = "14px Courier New";
  ctx.fillText("sel", ui_select_x1 + 2, culture_y + 13);
  ctx.fillText("ect", ui_select_x1 + 2, culture_y + 23);
  ui_select_h && (ctx.fillStyle = "#777", ctx.font = "18px Courier New", ctx.fillText("Left click to select highlighted entity.", culture_x, culture_y + culture_height + 18), ctx.fillText("Right click to clear highlight or selection.", culture_x, culture_y + culture_height + 36));
  ctx.beginPath();
  ctx.lineWidth = "food" === leftclick ? "2" : "1";
  ctx.strokeStyle = "#666";
  ctx.strokeRect(ui_food_x1, ui_food_y1, ui_food_width, ui_food_height);
  ctx.fillStyle = "#777";
  ctx.font = "16px Courier New";
  ctx.fillText("fo", ui_food_x1 + 4, ui_food_y1 + 13);
  ctx.fillText("od", ui_food_x1 + 4, ui_food_y1 + 26);
  ui_food_h && (ctx.fillStyle = "#777", ctx.font = "18px Courier New", ctx.fillText("Left click to create food.", culture_x, culture_y + culture_height + 18), ctx.fillText("Right click to feed entity.", culture_x, culture_y + culture_height + 36));
  ctx.beginPath();
  ctx.lineWidth = "ent" === leftclick ? "2" : "1";
  ctx.strokeStyle = "#666";
  ctx.strokeRect(ui_ent_x1, ui_ent_y1, ui_ent_width, ui_ent_height);
  ctx.fillStyle = "#777";
  ctx.font = "14px Courier New";
  ctx.fillText("ent", ui_ent_x1 + 3, ui_ent_y1 + 18);
  ui_ent_h && (ctx.fillStyle = "#777", ctx.font = "18px Courier New", ctx.fillText("Left click to generate a random entity.", culture_x, culture_y + culture_height + 18), ctx.fillText("Right click to delete entity.", culture_x, culture_y + culture_height + 36));
  ctx.beginPath();
  ctx.lineWidth = "mutate" === leftclick ? "2" : "1";
  ctx.strokeStyle = "#666";
  ctx.strokeRect(ui_mutate_x1, ui_mutate_y1, ui_mutate_width, ui_mutate_height);
  ctx.fillStyle = "#777";
  ctx.font = "14px Courier New";
  ctx.fillText("mut", ui_mutate_x1 + 3, ui_mutate_y1 + 13);
  ctx.fillText("ate", ui_mutate_x1 + 2, ui_mutate_y1 + 23);
  ui_mutate_h && (ctx.fillStyle = "#777", ctx.font = "18px Courier New", ctx.fillText("Left click to mutate entity.", culture_x, culture_y + culture_height + 18), ctx.fillText("Right click to mutate entity ten times.", culture_x, culture_y + culture_height + 36));
  ctx.beginPath();
  ctx.lineWidth = "descendants" === graph ? "2" : "1";
  ctx.strokeStyle = "#666";
  ctx.strokeRect(ui_g_descendants_x1, graph_y1, ui_g_descendants_width, ui_g_descendants_height);
  ctx.fillStyle = "#777";
  ctx.font = "14px Courier New";
  ctx.fillText("des", ui_g_descendants_x1 + 2, graph_y1 + 19);
  ui_g_descendants_h && (ctx.fillStyle = "#777", ctx.font = "18px Courier New", ctx.fillText("Graph the total number of living descendants relative to the highest that value has been.", culture_x, culture_y + culture_height + 18), ctx.fillText("Line is the average colour of descendants at that moment.", culture_x, culture_y + culture_height + 36));
  ctx.beginPath();
  ctx.lineWidth = "generations" === graph ? "2" : "1";
  ctx.strokeStyle = "#666";
  ctx.strokeRect(ui_g_generations_x1, ui_g_generations_y1, ui_g_generations_width, ui_g_generations_height);
  ctx.fillStyle = "#777";
  ctx.font = "14px Courier New";
  ctx.fillText("gen", ui_g_generations_x1 + 2, ui_g_generations_y1 + 18);
  ui_g_generations_h && (ctx.fillStyle = "#777", ctx.font = "18px Courier New", ctx.fillText("Graph the highest generation achieved by any living lineage relative to the highest that value has been.", culture_x, culture_y + culture_height + 18), ctx.fillText("Line is the average colour of only entities of the highest generation at that moment.", culture_x, culture_y + culture_height + 36));
}
function drawVoid() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}
function drawCulture() {
  ctx.beginPath();
  ctx.strokeStyle = "#666";
  ctx.lineWidth = "2";
  ctx.strokeRect(culture_x, culture_y, culture_width, culture_height);
  ctx.stroke();
}
function drawEntities() {
  if (0 < ent_count) {
    for (nd1 = 1; nd1 <= ent_count; nd1++) {
      var a = ent_matrix[nd1], b = a.x, c = a.y, d = a.radius, e = a.integrity / a.circumference * 2;
      ctx.beginPath();
      ctx.strokeStyle = a.colour;
      var f = Math.floor(a.energy / a.area * 256 / 16).toString(16);
      energy_colour = !1 === a.demon ? "#".concat(f, f, f) : "#".concat(f, 0, 0);
      ctx.fillStyle = energy_colour;
      0.5 > e && (e = 0.5);
      ctx.lineWidth = "" + e;
      ctx.arc(b, c, d - e / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      if (ent_matrix[nd1].id === saved_highlight_id) {
        ctx.beginPath(), ctx.lineWidth = "2", ctx.strokeStyle = "#0f0", ctx.arc(b, c, d - e / 2 + 5, 0, 2 * Math.PI), ctx.stroke(), ctx.strokeStyle = a.colour;
      } else {
        if (ent_matrix[nd1].id === highlight_id || -1 === saved_highlight_id && ent_matrix[nd1].id === highlight_id) {
          ctx.beginPath(), ctx.lineWidth = "2", ctx.strokeStyle = "#fff", ctx.arc(b, c, d - e / 2 + 5, 0, 2 * Math.PI), ctx.stroke(), ctx.strokeStyle = a.colour;
        }
      }
      0 < food_count && (d = entNearestFood(nd1), e = entValueFetch(nd1), "food" === a.seeking && d.nk5 <= e && 0 < entValueSpeed(nd1) && 0 < a.energy && (ctx.lineWidth = "1", ctx.beginPath(), ctx.moveTo(b, c), ctx.lineTo(d.xk3, d.yk3), ctx.stroke()));
      1 < ent_count && (d = entNearestPrey(nd1), "prey" === a.seeking && 0 !== d && 0 < entValueSpeed(nd1) && 0 < a.energy && (ctx.lineWidth = "3", ctx.beginPath(), ctx.moveTo(b, c), ctx.lineTo(d.xap1, d.yap1), ctx.stroke()));
    }
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.fillStyle = ent_matrix[1].colour;
    ctx.font = "40px Courier New";
    ctx.fillText("*", ent_matrix[1].x - 12, ent_matrix[1].y + 17);
  }
}
function drawFood() {
  if (0 < food_count) {
    for (nd1 = 1; nd1 <= food_count; nd1++) {
      ctx.beginPath(), ctx.strokeStyle = food_matrix[nd1].colour, ctx.lineWidth = "" + food_matrix[nd1].width, ctx.arc(food_matrix[nd1].x, food_matrix[nd1].y, food_matrix[nd1].radius, 0, 2 * Math.PI), ctx.stroke();
    }
  }
}
function drawText() {
  youngest_generation = 0;
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.fillStyle = "#555";
  ctx.font = "15px Courier New";
  ctx.fillStyle = "#fff";
  ctx.font = "20px Courier New";
  for (var a = -37, b = 1; b <= ent_count; b++) {
    ent_matrix[b].generation > youngest_generation && (youngest_generation = ent_matrix[b].generation), ent_matrix[b].id === saved_highlight_id && (a += 30, ctx.fillText("Selected:    " + ent_matrix[b].id, culture_x + culture_width + 5, a += 30), ctx.fillText("Age:         " + Math.ceil(ent_matrix[b].age), culture_x + culture_width + 5, a += 30), ctx.fillText("Colour:", culture_x + culture_width + 5, a += 30), ctx.fillStyle = "" + ent_matrix[b].colour, 13 > parseInt(ent_matrix[b].colour.charAt(1), 
    16) && 9 > parseInt(ent_matrix[b].colour.charAt(2), 16) && (ctx.beginPath(), ctx.fillStyle = "" + ent_matrix[b].colour, ctx.strokeStyle = "" + ent_matrix[b].colour, ctx.fillRect(culture_x + culture_width + 160, a - 16, 39, 20), ctx.fillStyle = "#fff"), ctx.fillText("             " + ent_matrix[b].colour.substr(1, 3), culture_x + culture_width + 5, a), ctx.fillStyle = "#fff", ctx.fillText("Generation:  " + ent_matrix[b].generation, culture_x + culture_width + 5, a += 30), ctx.fillText("Divergence:  " + 
    ent_matrix[b].divergence, culture_x + culture_width + 5, a += 30), ctx.fillText("Bred:        " + Math.ceil(ent_matrix[b].bred), culture_x + culture_width + 5, a += 30), ctx.fillStyle = "#fff");
  }
  for (b = 1; b <= ent_count; b++) {
    saved_highlight_id !== highlight_id && ent_matrix[b].id === highlight_id && (a += 30, ctx.fillText("Highlighted: " + ent_matrix[b].id, culture_x + culture_width + 5, a += 30), ctx.fillText("Age:         " + Math.ceil(ent_matrix[b].age), culture_x + culture_width + 5, a += 30), ctx.fillText("Colour:", culture_x + culture_width + 5, a += 30), ctx.fillStyle = "" + ent_matrix[b].colour, 13 > parseInt(ent_matrix[b].colour.charAt(1), 16) && 9 > parseInt(ent_matrix[b].colour.charAt(2), 16) && (ctx.beginPath(), 
    ctx.fillStyle = "" + ent_matrix[b].colour, ctx.strokeStyle = "" + ent_matrix[b].colour, ctx.fillRect(culture_x + culture_width + 160, a - 16, 39, 20), ctx.fillStyle = "#fff"), ctx.fillText("             " + ent_matrix[b].colour.substr(1, 3), culture_x + culture_width + 5, a), ctx.fillStyle = "#fff", ctx.fillText("Generation:  " + ent_matrix[b].generation, culture_x + culture_width + 5, a += 30), ctx.fillText("Divergence:  " + ent_matrix[b].divergence, culture_x + culture_width + 5, a += 30), 
    ctx.fillText("Bred:        " + Math.ceil(ent_matrix[b].bred), culture_x + culture_width + 5, a += 30), ctx.fillStyle = "#fff");
  }
}
function drawGraph() {
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#666";
  ctx.strokeRect(graph_x1, graph_y1, graph_width, graph_height);
  ctx.stroke();
  if ("descendants" === graph) {
    ctx.lineWidth = 1;
    for (var a = graph_x1, b = graph_y2, c = 1; c <= graph_width; c++) {
      ctx.beginPath(), ctx.moveTo(a, b), ctx.strokeStyle = "" + stats_average_colour[Math.round(c / graph_width * time_elapsed)], a = graph_x1 + c, b = graph_y2 - stats_descendants[Math.round(c / graph_width * time_elapsed)] / highest_descendants * graph_height, ctx.lineTo(a, b), ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.font = "15px Courier New";
    cursor_x <= graph_x2 && cursor_x >= graph_x1 && cursor_y <= graph_y2 && cursor_y >= graph_y1 && (ctx.fillText("" + stats_descendants[Math.round((cursor_x - graph_x1) / graph_width * time_elapsed)], cursor_x + 4, cursor_y - 24), ctx.fillText("" + Math.ceil((cursor_x - graph_x1) / graph_width * time_elapsed / 10), cursor_x + 4, cursor_y - 8));
  }
  if ("generations" === graph) {
    ctx.lineWidth = 1;
    a = graph_x1;
    b = graph_y2;
    for (c = 1; c <= graph_width; c++) {
      ctx.beginPath(), ctx.moveTo(a, b), ctx.strokeStyle = "" + stats_youngest_average_colour[Math.round(c / graph_width * time_elapsed)], a = graph_x1 + c, b = graph_y2 - stats_generations[Math.round(c / graph_width * time_elapsed)] / highest_generations * graph_height, ctx.lineTo(a, b), ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.font = "15px Courier New";
    cursor_x <= graph_x2 && cursor_x >= graph_x1 && cursor_y <= graph_y2 && cursor_y >= graph_y1 && (ctx.fillText("" + stats_generations[Math.round((cursor_x - graph_x1) / graph_width * time_elapsed)], cursor_x + 4, cursor_y - 24), ctx.fillText("" + Math.ceil((cursor_x - graph_x1) / graph_width * time_elapsed / 10), cursor_x + 4, cursor_y - 8));
  }
}
function drawAll() {
  drawVoid();
  drawEntities();
  drawFood();
  drawCulture();
  drawUI();
  drawGraph();
  drawText();
}
function resizeCanvas() {
  htmlCanvas.width = window.innerWidth;
  htmlCanvas.height = window.innerHeight;
  drawAll();
}
function entValueAttackpower(a) {
  a = ent_matrix[a];
  return obf1.attackpower + a.attackpower_energy * a.energy + a.attackpower_integrity * a.integrity + a.attackpower_abundance * a.abundance + a.attackpower_crowdedness * a.crowdedness;
}
function entValueBreed(a) {
  a = ent_matrix[a];
  return a.breed + a.breed_integrity * a.integrity + a.breed_crowdedness * a.crowdedness + a.breed_abundance * a.abundance;
}
function entValueHealing(a) {
  a = ent_matrix[a];
  return a.healing + a.healing_energy * a.energy + a.healing_integrity * a.integrity + a.healing_abundance * a.abundance + a.healing_crowdedness * a.crowdedness;
}
function entValueFortify(a) {
  a = ent_matrix[a];
  a = a.fortify + a.fortify_integrity * a.integrity + a.fortify_crowdedness * a.crowdedness + a.fortify_abundance * a.abundance;
  0 > a && (a = 0);
  return a;
}
function entValueNurture(a) {
  a = ent_matrix[a];
  a = a.nurture + a.nurture_integrity * a.integrity + a.nurture_crowdedness * a.crowdedness + a.nurture_abundance * a.abundance;
  0 > a && (a = 0);
  return a;
}
function entValueHunt(a) {
  a = ent_matrix[a];
  return a.hunt + a.hunt_energy * a.energy + a.hunt_integrity * a.integrity + a.hunt_abundance * a.abundance + a.hunt_crowdedness * a.crowdedness;
}
function entValuePreyMinEnergy(a) {
  a = ent_matrix[a];
  return a.preyminenergy + a.preyminenergy_energy * a.energy + a.preyminenergy_integrity * a.integrity + a.preyminenergy_abundance * a.abundance + a.preyminenergy_crowdedness * a.crowdedness;
}
function entValuePreyMaxIntegrity(a) {
  a = ent_matrix[a];
  return a.preymaxintegrity + a.preymaxintegrity_energy * a.energy + a.preymaxintegrity_integrity * a.integrity + a.preymaxintegrity_abundance * a.abundance + a.preymaxintegrity_crowdedness * a.crowdedness;
}
function entValueFoodSense(a) {
  a = ent_matrix[a];
  a = a.foodsense + a.foodsense_integrity * a.integrity + a.foodsense_crowdedness * a.crowdedness + a.foodsense_energy * a.energy;
  a > culture_diagonal && (a = culture_diagonal);
  return a;
}
function entValueEntSense(a) {
  a = ent_matrix[a];
  a = a.entsense + a.entsense_integrity * a.integrity + a.entsense_abundance * a.abundance + a.entsense_energy * a.energy;
  a > culture_diagonal && (a = culture_diagonal);
  return a;
}
function entValueFetch(a) {
  var b = ent_matrix[a];
  a = b.fetch + b.fetch_integrity * b.integrity + b.fetch_energy * b.energy + b.fetch_crowdedness * b.crowdedness + b.fetch_abundance * b.abundance;
  b.fetchmin !== b.fetchmax && (a > b.fetchmax && (a = b.fetchmax), a < b.fetchmin && (a = b.fetchmin));
  b = b.radius;
  a < b && (a = b);
  return a;
}
function entValueSpeed(a) {
  a = ent_matrix[a];
  return a.speed + a.speed_fooddistance * a.fooddistance + a.speed_preydistance * a.preydistance + a.speed_energy * a.energy + a.speed_integrity * a.integrity + a.speed_abundance * a.abundance + a.speed_crowdedness * a.crowdedness;
}
function entValueTick(a) {
  a = ent_matrix[a];
  return a.tick + a.tick_fooddistance * a.fooddistance + a.tick_preydistance * a.preydistance + a.tick_energy * a.energy + a.tick_abundance * a.abundance + a.tick_crowdedness * a.crowdedness;
}
function entValueLocus(a) {
  a = ent_matrix[a];
  return a.locus_fooddistance * a.fooddistance + a.locus_preydistance * a.preydistance + a.locus_energy * a.energy + a.locus_integrity * a.integrity + a.locus_abundance * a.abundance + a.locus_crowdedness * a.crowdedness;
}
function entSpawn(a) {
  a.id = ent_id++;
  ent_count++;
  ent_matrix[ent_count] = a;
}
function entGenesis(a, b) {
  lineages++;
  var c = {divergence:0, lineage:"" + lineages, generation:0, bred:0, colour:"" + randomColour(0, 15), demon:!1, id:0, radius:10, circumference:20 * Math.PI, area:Math.PI * Math.pow(10, 2), nurtured:0, healing:0, healing_integrity:0, healing_energy:0, healing_abundance:0, healing_crowdedness:0, nurture:Math.PI * Math.pow(10, 2) / 2, nurture_integrity:0, nurture_abundance:0, nurture_crowdedness:0, fortify:20 * Math.PI, fortify_integrity:0, fortify_abundance:0, fortify_crowdedness:0, breed:Math.PI * 
  Math.pow(10, 2), breed_integrity:0, breed_abundance:0, breed_crowdedness:0, speed:2, speed_integrity:0, speed_fooddistance:0, speed_preydistance:0, speed_energy:0, speed_abundance:0, speed_crowdedness:0, fetch:culture_diagonal / 10, fetchmin:10, fetchmax:culture_diagonal / 10, fetch_energy:0, fetch_integrity:0, fetch_abundance:0, fetch_crowdedness:0, fetch_width:90, hunt:culture_diagonal / 30, hunt_energy:0, hunt_integrity:0, hunt_abundance:0, hunt_crowdedness:0, foodsense:culture_diagonal / 10, 
  foodsense_energy:0, foodsense_integrity:0, foodsense_crowdedness:0, entsense:culture_diagonal / 10, entsense_energy:0, entsense_integrity:0, entsense_abundance:0, preyminenergy:Math.PI * Math.pow(10, 2) / 2 / 10, preyminenergy_energy:0, preyminenergy_integrity:0, preyminenergy_abundance:0, preyminenergy_crowdedness:0, preymaxintegrity:20 * Math.PI / 2 / 5, preymaxintegrity_energy:0, preymaxintegrity_integrity:0, preymaxintegrity_abundance:0, preymaxintegrity_crowdedness:0, attackpower:1.5, attackpower_energy:0, 
  attackpower_integrity:0, attackpower_abundance:0, attackpower_crowdedness:0, energy:Math.PI * Math.pow(10, 2), waste:0, gathered:0, integrity:20 * Math.PI / 2, x:a, y:b, age:0, fooddistance:0, preydistance:0, crowdedness:0, abundance:0, facing:0, pace:0, prey:0, seeking:"nothing", }, d = {};
  Object.assign(d, c);
  for (entMutate(d, 0, s_mutation_intensity); d.demon;) {
    Object.assign(d, c), entMutate(d, 0, s_mutation_intensity);
  }
  d.divergence = 0;
  entSpawn(d);
}
function entNearestPrey(a) {
  var b = ent_matrix[a], c = Infinity;
  for (nap3 = 1; nap3 <= ent_count; nap3++) {
    if (a !== nap3) {
      var d = ent_matrix[nap3], e = findDistance(b.x, b.y, d.x, d.y), f = d.energy;
      if (e < c && e <= entValueHunt(a) && 0 < f && f >= entValuePreyMinEnergy(a) && d.integrity <= entValuePreyMaxIntegrity(a)) {
        c = e;
        var g = nap3;
      }
    }
  }
  Infinity > c ? (b = {}, ent_matrix[a].preydistance = c, ent_matrix[a].prey = 0, b.xap1 = ent_matrix[g].x, b.yap1 = ent_matrix[g].y, b.nap7 = c) : (b = 0, ent_matrix[a].preydistance = 0, ent_matrix[a].prey = 0);
  return b;
}
function entCollideWall(a) {
  var b = ent_matrix[a], c = b.x, d = b.y;
  b = b.radius;
  c < culture_x + b && entRelocate(a, culture_x + b, d);
  c > culture_x + culture_width - b && entRelocate(a, culture_x + culture_width - b, d);
  d < culture_y + b && entRelocate(a, c, culture_y + b);
  d > culture_y + culture_height - b && entRelocate(a, c, culture_y + culture_height - b);
}
function entCollideEnt(a) {
  for (var b = ent_matrix[a], c = b.x, d = b.y, e = 1; e <= ent_count; e++) {
    if (a !== e) {
      var f = ent_matrix[e], g = f.x, l = f.y, h = findDistance(c, d, g, l), m = (b.radius + f.radius - h) / 2, k = findAngle(c, d, g, l);
      h < b.radius + f.radius && (f = findNewPoint(c, d, k, -1 * m), g = findNewPoint(g, l, k, m), entRelocate(a, f.xc2, f.yc2), entRelocate(e, g.xc2, g.yc2));
    }
  }
}
function entFight(a, b) {
  var c = ent_matrix[a], d = ent_matrix[b], e = (Math.pow(Math.abs(entValueSpeed(a)), 2) / 10 + c.area / 2 / 10000) * entValueAttackpower(a);
  e > od1.energy && (e = od1.energy);
  0 < e && 0 !== entNearestPrey(a) && (e < d.nurtured || e < d.energy) && c.prey === b && (c = 0, e > ent_matrix[b].integrity && (c += ent_matrix[b].integrity - e), ent_matrix[a].waste += c, ent_matrix[a].energy -= e, ent_matrix[b].integrity -= e, ent_matrix[a].prey = 0, ent_matrix[a].preydistance = 0, entNearestPrey(a), 0 >= ent_matrix[b].integrity && entCorpsify(b));
}
function entAge(a) {
  ent_matrix[a].age += 0.1;
  ent_matrix[a].integrity -= 0.1 + 0.002 * ent_matrix[a].circumference;
  0 >= ent_matrix[a].integrity && entCorpsify(a);
}
function entHeal(a) {
  var b = ent_matrix[a], c = entValueHealing(a);
  c > b.energy && (c = b.energy);
  if (0 < c) {
    var d = 0;
    b.integrity + c > b.circumference ? d += c - (b.circumference - b.integrity) : c > b.radius && (d += c - b.radius);
    ent_matrix[a].waste += d;
    ent_matrix[a].energy -= c;
    c > b.radius && (c = b.radius);
    ent_matrix[a].integrity += c;
    0 > ent_matrix[a].energy && (ent_matrix[a].energy = 0);
    ent_matrix[a].integrity > ent_matrix[a].circumference && (ent_matrix[a].integrity = ent_matrix[a].circumference - 0.1);
  }
}
function entEliminate(a) {
  ent_deaths++;
  total_lifespan_of_dead += ent_matrix[a].age;
  ent_matrix[a].id === saved_highlight_id && (saved_highlight_id = -1);
  for (ent_matrix[a].id === highlight_id && (highlight_id = -1); a < ent_count; a++) {
    ent_matrix[a] = ent_matrix[a + 1];
  }
  ent_matrix[ent_count] = {};
  ent_count--;
  a = 0;
  for (var b = ent_matrix[1].generation, c = 1; c <= ent_count; c++) {
    var d = ent_matrix[c].generation;
    d > a && (a = d);
    d < b && (b = d);
  }
}
function entNearestFood(a) {
  var b = ent_matrix[a], c = b.x, d = b.y;
  b = Infinity;
  for (var e, f = 1; f <= food_count; f++) {
    var g = findDistance(c, d, food_matrix[f].x, food_matrix[f].y);
    g < b && (b = g, e = f);
  }
  c = {};
  Infinity > b && b <= entValueFetch(a) ? (ent_matrix[a].fooddistance = b, c.xk3 = food_matrix[e].x, c.yk3 = food_matrix[e].y, c.nk5 = b) : (c = 0, ent_matrix[a].fooddistance = 0);
  return c;
}
function entNearestEnt(a) {
  for (var b = ent_matrix[a], c = Infinity, d, e = 1; e <= ent_count; e++) {
    if (a !== e) {
      var f = ent_matrix[e];
      f = findDistance(b.x, b.y, f.x, f.y);
      f < c && (c = f, d = e);
    }
  }
  a = {};
  Infinity > c ? (a.xao1 = ent_matrix[d].x, a.yao1 = ent_matrix[d].y, a.nao5 = c) : a = !1;
  return a;
}
function entFoodCount(a) {
  for (var b = 0, c = entValueFoodSense(a), d = 1; d <= food_count; d++) {
    findDistance(ent_matrix[a].x, ent_matrix[a].y, food_matrix[d].x, food_matrix[d].y) <= c && b++;
  }
  ent_matrix[a].abundance = b;
}
function entEntCount(a) {
  ent_matrix[a].crowdedness = 0;
  for (var b = 1; b <= ent_count; b++) {
    a !== b && findDistance(ent_matrix[a].x, ent_matrix[a].y, ent_matrix[b].x, ent_matrix[b].y) <= entValueEntSense(a) && ent_matrix[a].crowdedness++;
  }
}
function entFoodSeek(a) {
  if (0 < food_count) {
    var b = ent_matrix[a], c = entNearestFood(a);
    if (0 !== c) {
      ent_matrix[a].seeking = "food", ent_matrix[a].facing = findAngle(b.x, b.y, c.xk3, c.yk3);
    } else {
      return 0;
    }
  }
}
function entPreySeek(a) {
  if (1 < ent_count) {
    var b = ent_matrix[a], c = entNearestPrey(a);
    if (0 !== c) {
      ent_matrix[a].seeking = "prey", ent_matrix[a].facing = findAngle(b.x, b.y, c.xap1, c.yap1);
    } else {
      return 0;
    }
  }
}
function entSeek(a) {
  var b = ent_matrix[a], c = entNearestFood(a), d = entNearestPrey(a);
  0 !== c && 0 !== d ? c.nk5 < d.nap7 ? entFoodSeek(a) : entPreySeek(a) : 0 !== c ? entFoodSeek(a) : 0 !== d && entPreySeek(a);
  0 !== c || 0 !== d ? (ent_matrix[a].pace = entValueSpeed(a), 0 < b.pace && entMove(a)) : ent_matrix[a].seeking = "nothing";
}
function entFoodCollide(a) {
  for (var b = ent_matrix[a], c = 1; c <= food_count; c++) {
    if (findDistance(b.x, b.y, food_matrix[c].x, food_matrix[c].y) < b.radius + food_matrix[c].radius) {
      var d = food_matrix[c].value;
      isNaN(food_matrix[c].value) || (ent_matrix[a].energy + d > ent_matrix[a].area ? (ent_matrix[a].waste += d - (ent_matrix[a].area - ent_matrix[a].energy), ent_matrix[a].energy = ent_matrix[a].area - 1) : ent_matrix[a].energy += d);
      foodEliminate(c);
    }
  }
}
function entCorpsify(a) {
  var b = {};
  Object.assign(b, ent_matrix[a]);
  entEliminate(a);
  if (b !== {}) {
    var c = a = 0;
    0 < b.nurtured && (a = b.nurtured);
    b.energy > a && (a = b.energy);
    0 < Math.sqrt(b.energy / Math.PI) && (c = Math.sqrt(b.energy / Math.PI));
    10 <= b.age && 0 < a && 2 < c && foodSpawn(b.x, b.y, a);
  }
}
function entBreed(a) {
  var b = ent_matrix[a];
  entValueBreed(a);
  var c = entValueNurture(a) + entValueFortify(a), d = ent_matrix[a].area * breed_waste;
  if (0 <= entValueNurture(a) && 1 < entValueFortify(a) && 1 < b.energy - d - c && !1 === ent_matrix[a].demon) {
    b = {};
    Object.assign(b, ent_matrix[a]);
    b.generation++;
    for (var e = 1, f = 1; f <= ent_count; f++) {
      if (a !== f) {
        var g = ent_matrix[f].lineage, l = b.lineage, h;
        for (h = g.length - 1; "," === g.charAt(h) && -1 !== h; h--) {
        }
        -1 !== h && (g = g.substring(0, h - 2));
        g === l && e++;
      }
    }
    b.lineage = b.lineage.concat(", " + e);
    entMutate(b, mutation_rarity, mutation_intensity);
    b.energy = entValueNurture(a);
    b.integrity = entValueFortify(a);
    b.energy > b.area && (b.energy = b.area);
    b.integrity > b.circumference && (b.integrity = b.circumference);
    b.age = 0;
    b.waste = 0;
    b.gathered = 0;
    b.bred = 0;
    b.seeking = "nothing";
    b.nurtured = c;
    ent_matrix[a].energy -= d;
    ent_matrix[a].energy -= c;
    ent_count++;
    b.id = ent_id++;
    ent_matrix[ent_count] = b;
    ent_matrix[a].bred++;
  }
}
function entMutate(a, b, c) {
  if (0 === randomInteger(0, b)) {
    for (b = randomInteger(0, supermutation_rarity); 0 === b; b = randomInteger(0, supermutation_rarity)) {
      c += supermutation_intensity;
    }
    a.lineage = a.lineage.concat("|" + c);
    a.divergence += c;
    b = a.colour;
    for (nad4 = 0; nad4 < Math.ceil(c); nad4++) {
      var d = randomInteger(1, 3), e = b.charAt(d);
      e = parseInt(e, 16);
      e += 1 + -2 * randomInteger(0, 1);
      0 > e && (e = 1);
      15 < e && (e = 14);
      e = e.toString(16);
      var f = "";
      1 === d && (f = "#".concat(e, b.substr(2)));
      2 === d && (f = "#".concat(b.charAt(1), e, b.charAt(3)));
      3 === d && (f = "#".concat(b.substr(1, 2), e));
      b = f;
    }
    a.colour = b;
    a.radius += randomNumber(-1, 1) / (5 / c);
    4 > a.radius && (a.radius = 4);
    100 < a.radius && (a.radius = 100);
    a.circumference = 2 * Math.PI * a.radius;
    a.area = Math.PI * Math.pow(a.radius, 2);
    a.speed += randomNumber(-1, 1) / (1000 / c);
    a.speed_energy += randomNumber(-1, 1) / (100000 / c);
    a.speed_integrity += randomNumber(-1, 1) / (1000 / c);
    a.speed_fooddistance += randomNumber(-1, 1) / (5000 / c);
    a.speed_preydistance += randomNumber(-1, 1) / (5000 / c);
    a.speed_abundance += randomNumber(-1, 1) / (400 / c);
    a.speed_crowdedness += randomNumber(-1, 1) / (200 / c);
    a.healing += randomNumber(-1, 1) / (10000 / c);
    a.healing_energy += randomNumber(-1, 1) / (100000 / c);
    a.healing_integrity += randomNumber(-1, 1) / (10000 / c);
    a.healing_abundance += randomNumber(-1, 1) / (400 / c);
    a.healing_crowdedness += randomNumber(-1, 1) / (200 / c);
    a.nurture += randomNumber(-1, 1) / (0.1 / c);
    a.nurture_integrity += randomNumber(-1, 1) / (100 / c);
    a.nurture_abundance += randomNumber(-1, 1) / (8 / c);
    a.nurture_crowdedness += randomNumber(-1, 1) / (4 / c);
    0 > a.nurture && 0 >= a.nurture_integrity && 0 >= a.nurture_abundance && 0 >= a.nurture_crowdedness && (a.demon = !0);
    a.fortify += randomNumber(-1, 1) / (0.1 / c);
    a.fortify_integrity += randomNumber(-1, 1) / (100 / c);
    a.fortify_abundance += randomNumber(-1, 1) / (8 / c);
    a.fortify_crowdedness += randomNumber(-1, 1) / (4 / c);
    0 >= a.fortify && 0 >= a.fortify_integrity && 0 >= a.fortify_abundance && 0 >= a.fortify_crowdedness && (a.demon = !0);
    a.breed += randomNumber(-1, 1) / (0.1 / c);
    a.breed_integrity += randomNumber(-1, 1) / (100 / c);
    a.breed_abundance += randomNumber(-1, 1) / (8 / c);
    a.breed_crowdedness += randomNumber(-1, 1) / (4 / c);
    a.breed > a.area && 0 <= a.breed_integrity && 0 <= a.breed_abundance && 0 <= a.breed_crowdedness && (a.demon = !0);
    a.fetch += randomNumber(-1, 1) / (0.5 / c);
    a.fetchmin += randomNumber(-1, 1) / (1 / c);
    a.fetchmax += randomNumber(-1, 1) / (1 / c);
    a.fetch_energy += randomNumber(-1, 1) / (1000 / c);
    a.fetch_integrity += randomNumber(-1, 1) / (100 / c);
    a.fetch_abundance += randomNumber(-1, 1) / (4 / c);
    a.fetch_crowdedness += randomNumber(-1, 1) / (2 / c);
    a.fetch > culture_diagonal && (a.fetch = culture_diagonal);
    a.fetchmin < a.radius && (a.fetchmin = a.radius);
    a.fetchmax > culture_diagonal && (a.fetchmax = culture_diagonal);
    a.fetchmax < a.fetchmin && (a.fetchmax = a.fetchmin);
    a.fetchmin > a.fetchmax && (a.fetchmin = a.fetchmax);
    a.foodsense += randomNumber(-1, 1) / (0.5 / c);
    a.foodsense_energy += randomNumber(-1, 1) / (1000 / c);
    a.foodsense_integrity += randomNumber(-1, 1) / (100 / c);
    a.foodsense_crowdedness += randomNumber(-1, 1) / (2 / c);
    a.entsense += randomNumber(-1, 1) / (0.1 / c);
    a.entsense_energy += randomNumber(-1, 1) / (1000 / c);
    a.entsense_integrity += randomNumber(-1, 1) / (100 / c);
    a.entsense_abundance += randomNumber(-1, 1) / (4 / c);
    a.preyminenergy += randomNumber(-1, 1) / (0.1 / c);
    a.preyminenergy_energy += randomNumber(-1, 1) / (1000 / c);
    a.preyminenergy_integrity += randomNumber(-1, 1) / (100 / c);
    a.preyminenergy_abundance += randomNumber(-1, 1) / (4 / c);
    a.preyminenergy_crowdedness += randomNumber(-1, 1) / (2 / c);
    a.preymaxintegrity += randomNumber(-1, 1) / (100 / c);
    a.preymaxintegrity_energy += randomNumber(-1, 1) / (10000 / c);
    a.preymaxintegrity_integrity += randomNumber(-1, 1) / (1000 / c);
    a.preymaxintegrity_abundance += randomNumber(-1, 1) / (40 / c);
    a.preymaxintegrity_crowdedness += randomNumber(-1, 1) / (20 / c);
    a.hunt += randomNumber(-1, 1) / (0.5 / c);
    a.hunt_energy += randomNumber(-1, 1) / (1000 / c);
    a.hunt_integrity += randomNumber(-1, 1) / (100 / c);
    a.hunt_abundance += randomNumber(-1, 1) / (4 / c);
    a.hunt_crowdedness += randomNumber(-1, 1) / (2 / c);
    a.attackpower += randomNumber(-1, 1) / (1 / c);
    a.attackpower_energy += randomNumber(-1, 1) / (10000 / c);
    a.attackpower_integrity += randomNumber(-1, 1) / (1000 / c);
    a.attackpower_abundance += randomNumber(-1, 1) / (40 / c);
    a.attackpower_crowdedness += randomNumber(-1, 1) / (20 / c);
  }
}
function entRelocate(a, b, c) {
  ent_matrix[a].x = b;
  ent_matrix[a].y = c;
}
function entMove(a, b, c) {
  var d = ent_matrix[a], e = d.pace, f = d.facing, g = e;
  if (1 !== b) {
    if (g > d.radius && (g = d.radius), 0 !== d.prey && d.preydistance <= d.radius + ent_matrix[d.prey].radius + g) {
      entFight(a, a.prey), b = 2;
    } else {
      var l = d.area / 2, h = Math.pow(Math.abs(e), 2) / 10 + l / 10000;
      if (0 < h && d.energy >= h) {
        var m = 0;
        e > d.radius && (m += h - Math.pow(Math.abs(d.radius), 2) / 10 + l / 10000);
        ent_matrix[a].waste += m;
        ent_matrix[a].energy -= h;
      } else {
        b = 2;
      }
    }
  }
  2 !== b && (d = findNewPoint(d.x, d.y, f, g), entRelocate(a, d.xc2, d.yc2));
  1 !== b ? (entCollideEnt(a), entCollideWall(a, 1)) : 1 === c && (entCollideEnt(a), entCollideWall(a, 1));
  entFoodCollide(a);
}
function condenseLineage(a) {
  a = ent_matrix[a].lineage;
  for (var b = "", c = 0, d = 0; d < a.length; d++) {
    " " !== a.charAt(d - 1) || "1" !== a.charAt(d) || "," !== a.charAt(d + 1) ? 1 < c ? (b.concat("1*" + c), c = 0) : 1 === c ? b.concat(", 1") : b = b.concat(a.charAt(d)) : c++;
  }
  return b;
}
function entHighlight() {
  for (var a = 1; a <= ent_count; a++) {
    if (findDistance(cursor_x, cursor_y, ent_matrix[a].x, ent_matrix[a].y) <= ent_matrix[a].radius) {
      return ent_matrix[a].id !== highlight_id && (highlight_id = ent_matrix[a].id), !0;
    }
  }
}
function entQuake(a) {
  entRelocate(a, ent_matrix[a].x + randomInteger(-1, 1), ent_matrix[a].y + randomInteger(-1, 1));
  entCollideWall(a);
  entCollideEnt(a);
  entFoodCollide(a);
}
function entLapse() {
  for (var a = 1; a <= ent_count; a++) {
    entBreed(a), entQuake(a), entFoodCount(a), entEntCount(a), entSeek(a), entHeal(a), entAge(a);
  }
}
function foodSpawn(a, b, c) {
  food_count++;
  food_matrix[food_count] = {x:a, y:b, colour:"#900", value:c, radius:Math.sqrt(c / Math.PI), width:2, age:0};
}
function foodEliminate(a) {
  for (; a < food_count; a++) {
    food_matrix[a] = food_matrix[a + 1];
  }
  food_matrix[food_count] = {};
  food_count--;
}
function foodAge(a) {
  food_matrix[a].age += 0.1;
  food_matrix[a].age > 3 * food_matrix[a].value && foodEliminate(a);
}
function foodLapse() {
  for (var a = 1; a <= food_count; a++) {
    foodAge(a);
  }
}
htmlCanvas.addEventListener("mousemove", function(a) {
  x = a.clientX;
  y = a.clientY;
  cursor_x = x;
  cursor_y = y;
  var b = a = !1;
  entHighlight() && (highlight_pointer = a = !0);
  x >= ui_select_x1 && x <= ui_select_x2 && y >= culture_y && y <= ui_select_y2 ? a = ui_select_h = !0 : ui_select_h = !1;
  x >= ui_food_x1 && x <= ui_food_x2 && y >= ui_food_y1 && y <= ui_food_y2 ? a = ui_food_h = !0 : ui_food_h = !1;
  x >= ui_ent_x1 && x <= ui_ent_x2 && y >= ui_ent_y1 && y <= ui_ent_y2 ? a = ui_ent_h = !0 : ui_ent_h = !1;
  x >= ui_mutate_x1 && x <= ui_mutate_x2 && y >= ui_mutate_y1 && y <= ui_mutate_y2 ? a = ui_mutate_h = !0 : ui_mutate_h = !1;
  x >= ui_g_descendants_x1 && x <= ui_g_descendants_x2 && y >= graph_y1 && y <= ui_g_descendants_y2 ? a = ui_g_descendants_h = !0 : ui_g_descendants_h = !1;
  x >= ui_g_generations_x1 && x <= ui_g_generations_x2 && y >= ui_g_generations_y1 && y <= ui_g_generations_y2 ? a = ui_g_generations_h = !0 : ui_g_generations_h = !1;
  x >= graph_x1 && x <= graph_x2 && y >= graph_y1 && y <= graph_y2 && (b = !0);
  htmlCanvas.style.cursor = a ? "pointer" : b ? "crosshair" : "initial";
});
htmlCanvas.addEventListener("mouseup", function(a) {
  x = a.clientX;
  y = a.clientY;
  ui_g_generations_c = ui_g_descendants_c = ui_mutate_c = ui_ent_c = ui_food_c = ui_select_c = !1;
});
htmlCanvas.addEventListener("mousedown", function(a) {
  x = a.clientX;
  y = a.clientY;
  if (0 === a.button) {
    if (ui_select_h && (ui_select_c = !0, leftclick = "select"), ui_food_h && (ui_food_c = !0, leftclick = "food"), ui_ent_h && (ui_ent_c = !0, leftclick = "ent"), ui_mutate_h && (ui_mutate_c = !0, leftclick = "mutate"), ui_g_descendants_h && (ui_g_descendants_c = !0, graph = "descendants"), ui_g_generations_h && (ui_g_generations_c = !0, graph = "generations"), "select" === leftclick && !1 === ui_select_h && !1 === ui_food_h && !1 === ui_ent_h && !1 === ui_mutate_h) {
      -1 !== highlight_id && saved_highlight_id !== highlight_id && (a = saved_highlight_id, saved_highlight_id = highlight_id, highlight_id = a);
    } else {
      if ("ent" === leftclick) {
        x <= culture_x + culture_width && x >= culture_x && y <= culture_y + culture_height && y >= culture_y && entGenesis(x, y);
      } else {
        if ("food" === leftclick) {
          x <= culture_x + culture_width && x >= culture_x && y <= culture_y + culture_height && y >= culture_y && foodSpawn(x, y, 100);
        } else {
          if ("mutate" === leftclick && !1 === ui_select_h && !1 === ui_food_h && !1 === ui_ent_h && !1 === ui_mutate_h) {
            if (-1 !== saved_highlight_id) {
              for (n1 = 1; n1 <= ent_count; n1++) {
                ent_matrix[n1].id === saved_highlight_id && entMutate(ent_matrix[n1], 0, 1);
              }
            } else {
              if (-1 !== highlight_id) {
                for (n1 = 1; n1 <= ent_count; n1++) {
                  ent_matrix[n1].id === highlight_id && entMutate(ent_matrix[n1], 0, 1);
                }
              } else {
                for (n1 = 1; n1 <= ent_count; n1++) {
                  findDistance(x, y, ent_matrix[n1].x, ent_matrix[n1].y) <= ent_matrix[n1].radius && entMutate(ent_matrix[n1], 0, 1);
                }
              }
            }
          }
        }
      }
    }
  } else {
    if (2 === a.button) {
      if ("select" === leftclick) {
        -1 !== highlight_id && highlight_id !== saved_highlight_id ? highlight_id = -1 : -1 !== saved_highlight_id && (saved_highlight_id = highlight_id = -1);
      } else {
        if ("ent" === leftclick) {
          if (-1 !== saved_highlight_id) {
            for (n1 = 1; n1 <= ent_count; n1++) {
              ent_matrix[n1].id === saved_highlight_id && entEliminate(n1);
            }
          } else {
            if (-1 !== highlight_id) {
              for (n1 = 1; n1 <= ent_count; n1++) {
                ent_matrix[n1].id === highlight_id && entEliminate(n1);
              }
            } else {
              for (n1 = 1; n1 <= ent_count; n1++) {
                findDistance(x, y, ent_matrix[n1].x, ent_matrix[n1].y) <= ent_matrix[n1].radius && entEliminate(n1);
              }
            }
          }
        } else {
          if ("food" === leftclick) {
            if (-1 !== saved_highlight_id) {
              for (n1 = 1; n1 <= ent_count; n1++) {
                ent_matrix[n1].id === saved_highlight_id && (ent_matrix[n1].energy = ent_matrix[n1].area - 1);
              }
            } else {
              if (-1 !== highlight_id) {
                for (n1 = 1; n1 <= ent_count; n1++) {
                  ent_matrix[n1].id === highlight_id && (ent_matrix[n1].energy = ent_matrix[n1].area - 1);
                }
              } else {
                for (n1 = 1; n1 <= ent_count; n1++) {
                  findDistance(x, y, ent_matrix[n1].x, ent_matrix[n1].y) <= ent_matrix[n1].radius && (ent_matrix[n1].energy = ent_matrix[n1].area - 1);
                }
              }
            }
          } else {
            if ("mutate" === leftclick && !1 === ui_select_h && !1 === ui_food_h && !1 === ui_ent_h && !1 === ui_mutate_h) {
              if (-1 !== saved_highlight_id) {
                for (n1 = 1; n1 <= ent_count; n1++) {
                  ent_matrix[n1].id === saved_highlight_id && entMutate(ent_matrix[n1], 0, 10);
                }
              } else {
                if (-1 !== highlight_id) {
                  for (n1 = 1; n1 <= ent_count; n1++) {
                    ent_matrix[n1].id === highlight_id && entMutate(ent_matrix[n1], 0, 10);
                  }
                } else {
                  for (n1 = 1; n1 <= ent_count; n1++) {
                    findDistance(x, y, ent_matrix[n1].x, ent_matrix[n1].y) <= ent_matrix[n1].radius && entMutate(ent_matrix[n1], 0, 10);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});
window.addEventListener("resize", resizeCanvas);
htmlCanvas.addEventListener("contextmenu", function(a) {
  a.preventDefault();
});
for (var nq1 = 0; nq1 < ent_count_start; nq1++) {
  entGenesis(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10));
}
for (var nr1 = 0; nr1 < food_count_min; nr1++) {
  foodSpawn(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10), food_value());
}
resizeCanvas();
nt3 = nt1 = 0;
(function() {
  function a() {
    window.requestAnimationFrame(a);
    nt1++;
    food_count + ent_count < food_count_min && foodSpawn(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10), food_value());
    0 < food_count && foodLapse();
    if (2 >= ent_count) {
      for (var b = 0; b < ent_count_start; b++) {
        entGenesis(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10));
      }
    }
    10 === nt1 && (nt1 = 0, nt3++);
    100 === nt3 && (nt3 = 0, 3 < ent_count && entGenesis(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10)));
    entLapse();
    entHighlight() ? (htmlCanvas.style.cursor = "pointer", highlight_pointer = !0) : (highlight_pointer && (htmlCanvas.style.cursor = "initial"), highlight_pointer = !1);
    drawAll();
    time_elapsed++;
    for (var c = b = 0, d = 0, e = 0, f = 0, g = 0, l = 0, h = 0, m = 0, k = 1; k <= ent_count; k++) {
      ent_matrix[k].age > oldest_age && (oldest_age = ent_matrix[k].age), b += ent_matrix[k].age, 0 !== ent_matrix[k].generation && (c++, e += parseInt(ent_matrix[k].colour.charAt(1), 16), f += parseInt(ent_matrix[k].colour.charAt(2), 16), g += parseInt(ent_matrix[k].colour.charAt(3), 16)), ent_matrix[k].generation === youngest_generation && (d++, l += parseInt(ent_matrix[k].colour.charAt(1), 16), h += parseInt(ent_matrix[k].colour.charAt(2), 16), m += parseInt(ent_matrix[k].colour.charAt(3), 16));
    }
    e = Math.ceil(e / c).toString(16);
    f = Math.ceil(f / c).toString(16);
    g = Math.ceil(g / c).toString(16);
    average_colour = "";
    average_colour = "#".concat(e, f, g);
    l = Math.ceil(l / d).toString(16);
    h = Math.ceil(h / d).toString(16);
    m = Math.ceil(m / d).toString(16);
    youngest_average_colour = "";
    youngest_average_colour = "#".concat(l, h, m);
    0 < c ? stats_average_colour.push(average_colour) : stats_average_colour.push("#999");
    0 < d ? stats_youngest_average_colour.push(youngest_average_colour) : stats_youngest_average_colour.push("#999");
    stats_average_age.push(b / ent_count);
    c > highest_descendants && (highest_descendants = c);
    stats_descendants.push(c);
    youngest_generation > highest_generations && (highest_generations = youngest_generation);
    stats_generations.push(youngest_generation);
  }
  a();
})();
