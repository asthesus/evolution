var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.createTemplateTagFirstArg=function(a){return a.raw=a};$jscomp.createTemplateTagFirstArgWithRaw=function(a,c){a.raw=c;return a};htmlCanvas=document.getElementById("c");ctx=htmlCanvas.getContext("2d");time_elapsed=0;culture_width=1400;culture_height=900;culture_x=50;culture_y=10;culture_diagonal=findDistance(0,0,culture_width,culture_height);culture_diagonal_half=culture_diagonal/2;culture_area=culture_width*culture_height;var food_matrix=[];
food_count_start=food_count=0;food_count_min=culture_area/6400;food_fatness=3;food_value_min=20;food_value_max=36;function food_value(){return randomNumber(food_value_min,food_value_max)}var ent_matrix=[];ent_id=ent_deaths=ent_count=0;ent_count_start=Math.floor(culture_area/48E3);oldest_age=average_age=total_lifespan_of_dead=oldest_generation=youngest_generation=lineages=0;average_colour="#999";
var stats_average_age=[],stats_average_colour=[],stats_youngest_average_colour=[],stats_descendants=[],stats_generations=[];stats_descendants[0]=0;highest_generations=highest_descendants=stats_generations[0]=0;breed_waste=.01;mutation_rarity=9;mutation_intensity=1;supermutation_rarity=9;supermutation_intensity=10;s_mutation_intensity=20;saved_highlight_id=highlight_id=-1;graph="descendants";graph_width=400;graph_height=300;graph_x1=culture_x+culture_width+10;graph_y1=culture_y+culture_height-graph_height;
graph_x2=graph_x1+graph_width;graph_y2=graph_y1+graph_height;highlight_pointer=!1;cursor_y=cursor_x=0;leftclick="select";ui_select_c=ui_select_h=!1;ui_select_x1=10;ui_select_y1=culture_y;ui_select_height=ui_select_width=30;ui_select_x2=ui_select_x1+ui_select_width;ui_select_y2=ui_select_y1+ui_select_height;ui_food_c=ui_food_h=!1;ui_food_x1=10;ui_food_y1=culture_y+40;ui_food_height=ui_food_width=30;ui_food_x2=ui_food_x1+ui_food_width;ui_food_y2=ui_food_y1+ui_food_height;ui_ent_c=ui_ent_h=!1;
ui_ent_x1=10;ui_ent_y1=culture_y+80;ui_ent_height=ui_ent_width=30;ui_ent_x2=ui_ent_x1+ui_ent_width;ui_ent_y2=ui_ent_y1+ui_ent_height;ui_mutate_c=ui_mutate_h=!1;ui_mutate_x1=10;ui_mutate_y1=culture_y+120;ui_mutate_height=ui_mutate_width=30;ui_mutate_x2=ui_mutate_x1+ui_mutate_width;ui_mutate_y2=ui_mutate_y1+ui_mutate_height;ui_g_descendants_c=ui_g_descendants_h=!1;ui_g_descendants_x1=graph_x2+10;ui_g_descendants_y1=graph_y1;ui_g_descendants_height=ui_g_descendants_width=30;
ui_g_descendants_x2=ui_g_descendants_x1+ui_g_descendants_width;ui_g_descendants_y2=ui_g_descendants_y1+ui_g_descendants_height;ui_g_generations_c=ui_g_generations_h=!1;ui_g_generations_x1=graph_x2+10;ui_g_generations_y1=graph_y1+40;ui_g_generations_height=ui_g_generations_width=30;ui_g_generations_x2=ui_g_generations_x1+ui_g_generations_width;ui_g_generations_y2=ui_g_generations_y1+ui_g_generations_height;
var randomNumber=function(a,c){return Math.random()*(c-a+1)+a},randomInteger=function(a,c){return Math.round(Math.random()*(c-a+1))+a},randomColour=function(a,c){return"#".concat(randomInteger(a,c).toString(16),randomInteger(a,c).toString(16),randomInteger(a,c).toString(16))};function findDistance(a,c,b,d){na1=a-b;na2=c-d;return Math.sqrt(na1*na1+na2*na2)}function findAngle(a,c,b,d){nb1=d-c;nb2=b-a;theta=Math.atan2(nb1,nb2);return theta*=180/Math.PI}
function findNewPoint(a,c,b,d){var e={};e.xc2=Math.round(Math.cos(b*Math.PI/180)*d+a);e.yc2=Math.round(Math.sin(b*Math.PI/180)*d+c);return e}
function drawUI(){ctx.beginPath();ctx.lineWidth="select"===leftclick?"2":"1";ctx.strokeStyle="#666";ctx.strokeRect(ui_select_x1,ui_select_y1,ui_select_width,ui_select_height);ctx.fillStyle="#777";ctx.font="14px Courier New";ctx.fillText("sel",ui_select_x1+2,ui_select_y1+13);ctx.fillText("ect",ui_select_x1+2,ui_select_y1+23);ui_select_h&&(ctx.fillStyle="#777",ctx.font="18px Courier New",ctx.fillText("Left click to select highlighted entity.",culture_x,culture_y+culture_height+18),ctx.fillText("Right click to clear highlight or selection.",
culture_x,culture_y+culture_height+36));ctx.beginPath();ctx.lineWidth="food"===leftclick?"2":"1";ctx.strokeStyle="#666";ctx.strokeRect(ui_food_x1,ui_food_y1,ui_food_width,ui_food_height);ctx.fillStyle="#777";ctx.font="16px Courier New";ctx.fillText("fo",ui_food_x1+4,ui_food_y1+13);ctx.fillText("od",ui_food_x1+4,ui_food_y1+26);ui_food_h&&(ctx.fillStyle="#777",ctx.font="18px Courier New",ctx.fillText("Left click to create food.",culture_x,culture_y+culture_height+18),ctx.fillText("Right click to feed entity.",
culture_x,culture_y+culture_height+36));ctx.beginPath();ctx.lineWidth="ent"===leftclick?"2":"1";ctx.strokeStyle="#666";ctx.strokeRect(ui_ent_x1,ui_ent_y1,ui_ent_width,ui_ent_height);ctx.fillStyle="#777";ctx.font="14px Courier New";ctx.fillText("ent",ui_ent_x1+3,ui_ent_y1+18);ui_ent_h&&(ctx.fillStyle="#777",ctx.font="18px Courier New",ctx.fillText("Left click to generate a random entity.",culture_x,culture_y+culture_height+18),ctx.fillText("Right click to delete entity.",culture_x,culture_y+culture_height+
36));ctx.beginPath();ctx.lineWidth="mutate"===leftclick?"2":"1";ctx.strokeStyle="#666";ctx.strokeRect(ui_mutate_x1,ui_mutate_y1,ui_mutate_width,ui_mutate_height);ctx.fillStyle="#777";ctx.font="14px Courier New";ctx.fillText("mut",ui_mutate_x1+3,ui_mutate_y1+13);ctx.fillText("ate",ui_mutate_x1+2,ui_mutate_y1+23);ui_mutate_h&&(ctx.fillStyle="#777",ctx.font="18px Courier New",ctx.fillText("Left click to mutate entity.",culture_x,culture_y+culture_height+18),ctx.fillText("Right click to mutate entity ten times.",
culture_x,culture_y+culture_height+36));ctx.beginPath();ctx.lineWidth="descendants"===graph?"2":"1";ctx.strokeStyle="#666";ctx.strokeRect(ui_g_descendants_x1,ui_g_descendants_y1,ui_g_descendants_width,ui_g_descendants_height);ctx.fillStyle="#777";ctx.font="14px Courier New";ctx.fillText("des",ui_g_descendants_x1+2,ui_g_descendants_y1+19);ui_g_descendants_h&&(ctx.fillStyle="#777",ctx.font="18px Courier New",ctx.fillText("Graph the total number of living descendants relative to the highest that value has been.",
culture_x,culture_y+culture_height+18),ctx.fillText("Line is the average colour of descendants at that moment.",culture_x,culture_y+culture_height+36));ctx.beginPath();ctx.lineWidth="generations"===graph?"2":"1";ctx.strokeStyle="#666";ctx.strokeRect(ui_g_generations_x1,ui_g_generations_y1,ui_g_generations_width,ui_g_generations_height);ctx.fillStyle="#777";ctx.font="14px Courier New";ctx.fillText("gen",ui_g_generations_x1+2,ui_g_generations_y1+18);ui_g_generations_h&&(ctx.fillStyle="#777",ctx.font=
"18px Courier New",ctx.fillText("Graph the highest generation achieved by any living lineage relative to the highest that value has been.",culture_x,culture_y+culture_height+18),ctx.fillText("Line is the average colour of only entities of the highest generation at that moment.",culture_x,culture_y+culture_height+36))}function drawVoid(){ctx.fillStyle="#000";ctx.fillRect(0,0,window.innerWidth,window.innerHeight)}
function drawCulture(){ctx.beginPath();ctx.strokeStyle="#666";ctx.lineWidth="2";ctx.strokeRect(culture_x,culture_y,culture_width,culture_height);ctx.stroke()}
function drawEntities(){if(0<ent_count){nd7=0;for(nd1=nd8=1;nd1<=ent_count;nd1++){od1=ent_matrix[nd1];xd1=od1.x;yd1=od1.y;nd11=od1.radius;nd14=od1.integrity/od1.circumference*2;ctx.beginPath();ctx.strokeStyle=od1.colour;nd3=od1.energy/od1.area*256;nd2=Math.floor(nd3/16);energy_hex=nd2.toString(16);energy_colour=!1===od1.demon?"#".concat(energy_hex,energy_hex,energy_hex):"#".concat(energy_hex,0,0);ctx.fillStyle=energy_colour;.5>nd14&&(nd14=.5);ctx.lineWidth=""+nd14;ctx.arc(xd1,yd1,nd11-nd14/2,0,2*
Math.PI);ctx.fill();ctx.stroke();if(ent_matrix[nd1].id===saved_highlight_id)ctx.beginPath(),ctx.lineWidth="2",ctx.strokeStyle="#0f0",ctx.arc(xd1,yd1,nd11-nd14/2+5,0,2*Math.PI),ctx.stroke(),ctx.strokeStyle=od1.colour;else if(ent_matrix[nd1].id===highlight_id||-1===saved_highlight_id&&ent_matrix[nd1].id===highlight_id)ctx.beginPath(),ctx.lineWidth="2",ctx.strokeStyle="#fff",ctx.arc(xd1,yd1,nd11-nd14/2+5,0,2*Math.PI),ctx.stroke(),ctx.strokeStyle=od1.colour;0<food_count&&(od2=entNearestFood(nd1),nd5=
entValueFetch(nd1),"food"===od1.seeking&&od2.nk5<=nd5&&0<entValueSpeed(nd1)&&0<od1.energy&&(ctx.lineWidth="1",ctx.beginPath(),ctx.moveTo(xd1,yd1),ctx.lineTo(od2.xk3,od2.yk3),ctx.stroke()));1<ent_count&&(od2=entNearestPrey(nd1),"prey"===od1.seeking&&0!==od2&&0<entValueSpeed(nd1)&&0<od1.energy&&(ctx.lineWidth="3",ctx.beginPath(),ctx.moveTo(xd1,yd1),ctx.lineTo(od2.xap1,od2.yap1),ctx.stroke()));od1.age>nd7&&(nd7=od1.age,nd8=nd1)}od3=ent_matrix[nd8];xd2=od3.x;yd2=od3.y;ctx.beginPath();ctx.lineWidth=3;
ctx.fillStyle=ent_matrix[nd8].colour;ctx.font="40px Courier New";ctx.fillText("*",ent_matrix[nd8].x-12,ent_matrix[nd8].y+17)}}function drawFood(){if(0<food_count)for(nd1=1;nd1<=food_count;nd1++)ctx.beginPath(),ctx.strokeStyle=food_matrix[nd1].colour,ctx.lineWidth=""+food_matrix[nd1].width,ctx.arc(food_matrix[nd1].x,food_matrix[nd1].y,food_matrix[nd1].radius,0,2*Math.PI),ctx.stroke()}
function drawText(){youngest_generation=0;ctx.beginPath();ctx.lineWidth=3;ctx.fillStyle="#555";ctx.font="15px Courier New";ctx.fillStyle="#fff";ctx.font="20px Courier New";nbt2=-37;for(nbt1=1;nbt1<=ent_count;nbt1++)ent_matrix[nbt1].generation>youngest_generation&&(youngest_generation=ent_matrix[nbt1].generation),ent_matrix[nbt1].id===saved_highlight_id&&(nbt2+=30,ctx.fillText("Selected:    "+ent_matrix[nbt1].id,culture_x+culture_width+5,nbt2+=30),ctx.fillText("Age:         "+Math.ceil(ent_matrix[nbt1].age),
culture_x+culture_width+5,nbt2+=30),ctx.fillText("Colour:",culture_x+culture_width+5,nbt2+=30),ctx.fillStyle=""+ent_matrix[nbt1].colour,13>parseInt(ent_matrix[nbt1].colour.charAt(1),16)&&9>parseInt(ent_matrix[nbt1].colour.charAt(2),16)&&(ctx.beginPath(),ctx.fillStyle=""+ent_matrix[nbt1].colour,ctx.strokeStyle=""+ent_matrix[nbt1].colour,ctx.fillRect(culture_x+culture_width+160,nbt2-16,39,20),ctx.fillStyle="#fff"),ctx.fillText("             "+ent_matrix[nbt1].colour.substr(1,3),culture_x+culture_width+
5,nbt2),ctx.fillStyle="#fff",ctx.fillText("Generation:  "+ent_matrix[nbt1].generation,culture_x+culture_width+5,nbt2+=30),ctx.fillText("Divergence:  "+ent_matrix[nbt1].divergence,culture_x+culture_width+5,nbt2+=30),ctx.fillText("Bred:        "+Math.ceil(ent_matrix[nbt1].bred),culture_x+culture_width+5,nbt2+=30),ctx.fillStyle="#fff");for(nbt1=1;nbt1<=ent_count;nbt1++)saved_highlight_id!==highlight_id&&ent_matrix[nbt1].id===highlight_id&&(nbt2+=30,ctx.fillText("Highlighted: "+ent_matrix[nbt1].id,culture_x+
culture_width+5,nbt2+=30),ctx.fillText("Age:         "+Math.ceil(ent_matrix[nbt1].age),culture_x+culture_width+5,nbt2+=30),ctx.fillText("Colour:",culture_x+culture_width+5,nbt2+=30),ctx.fillStyle=""+ent_matrix[nbt1].colour,13>parseInt(ent_matrix[nbt1].colour.charAt(1),16)&&9>parseInt(ent_matrix[nbt1].colour.charAt(2),16)&&(ctx.beginPath(),ctx.fillStyle=""+ent_matrix[nbt1].colour,ctx.strokeStyle=""+ent_matrix[nbt1].colour,ctx.fillRect(culture_x+culture_width+160,nbt2-16,39,20),ctx.fillStyle="#fff"),
ctx.fillText("             "+ent_matrix[nbt1].colour.substr(1,3),culture_x+culture_width+5,nbt2),ctx.fillStyle="#fff",ctx.fillText("Generation:  "+ent_matrix[nbt1].generation,culture_x+culture_width+5,nbt2+=30),ctx.fillText("Divergence:  "+ent_matrix[nbt1].divergence,culture_x+culture_width+5,nbt2+=30),ctx.fillText("Bred:        "+Math.ceil(ent_matrix[nbt1].bred),culture_x+culture_width+5,nbt2+=30),ctx.fillStyle="#fff")}
function drawGraph(){ctx.beginPath();ctx.lineWidth=2;ctx.strokeStyle="#666";ctx.strokeRect(graph_x1,graph_y1,graph_width,graph_height);ctx.stroke();if("descendants"===graph){ctx.lineWidth=1;xby1=graph_x1;yby1=graph_y2;for(nby1=1;nby1<=graph_width;nby1++)ctx.beginPath(),ctx.moveTo(xby1,yby1),ctx.strokeStyle=""+stats_average_colour[Math.round(nby1/graph_width*time_elapsed)],xby1=graph_x1+nby1,yby1=graph_y2-stats_descendants[Math.round(nby1/graph_width*time_elapsed)]/highest_descendants*graph_height,
ctx.lineTo(xby1,yby1),ctx.stroke();ctx.fillStyle="#fff";ctx.font="15px Courier New";cursor_x<=graph_x2&&cursor_x>=graph_x1&&cursor_y<=graph_y2&&cursor_y>=graph_y1&&(ctx.fillText(""+stats_descendants[Math.round((cursor_x-graph_x1)/graph_width*time_elapsed)],cursor_x+4,cursor_y-24),ctx.fillText(""+Math.ceil((cursor_x-graph_x1)/graph_width*time_elapsed/10),cursor_x+4,cursor_y-8))}if("generations"===graph){ctx.lineWidth=1;xby1=graph_x1;yby1=graph_y2;for(nby1=1;nby1<=graph_width;nby1++)ctx.beginPath(),
ctx.moveTo(xby1,yby1),ctx.strokeStyle=""+stats_youngest_average_colour[Math.round(nby1/graph_width*time_elapsed)],xby1=graph_x1+nby1,yby1=graph_y2-stats_generations[Math.round(nby1/graph_width*time_elapsed)]/highest_generations*graph_height,ctx.lineTo(xby1,yby1),ctx.stroke();ctx.fillStyle="#fff";ctx.font="15px Courier New";cursor_x<=graph_x2&&cursor_x>=graph_x1&&cursor_y<=graph_y2&&cursor_y>=graph_y1&&(ctx.fillText(""+stats_generations[Math.round((cursor_x-graph_x1)/graph_width*time_elapsed)],cursor_x+
4,cursor_y-24),ctx.fillText(""+Math.ceil((cursor_x-graph_x1)/graph_width*time_elapsed/10),cursor_x+4,cursor_y-8))}}function drawAll(){drawVoid();drawEntities();drawFood();drawCulture();drawUI();drawGraph();drawText()}function resizeCanvas(){htmlCanvas.width=window.innerWidth;htmlCanvas.height=window.innerHeight;drawAll()}
function entValueAttackpower(a){obr1=ent_matrix[a];return nbr2=obf1.attackpower+obr1.attackpower_energy*obr1.energy+obr1.attackpower_integrity*obr1.integrity+obr1.attackpower_abundance*obr1.abundance+obr1.attackpower_crowdedness*obr1.crowdedness}function entValueBreed(a){obi1=ent_matrix[a];return nbi2=obi1.breed+obi1.breed_integrity*obi1.integrity+obi1.breed_crowdedness*obi1.crowdedness+obi1.breed_abundance*obi1.abundance}
function entValueHealing(a){obf1=ent_matrix[a];return nbf2=obf1.healing+obf1.healing_energy*obf1.energy+obf1.healing_integrity*obf1.integrity+obf1.healing_abundance*obf1.abundance+obf1.healing_crowdedness*obf1.crowdedness}function entValueFortify(a){obh1=ent_matrix[a];nbh2=obh1.fortify+obh1.fortify_integrity*obh1.integrity+obh1.fortify_crowdedness*obh1.crowdedness+obh1.fortify_abundance*obh1.abundance;0>nbh2&&(nbh2=0);return nbh2}
function entValueNurture(a){obg1=ent_matrix[a];nbg2=obg1.nurture+obg1.nurture_integrity*obg1.integrity+obg1.nurture_crowdedness*obg1.crowdedness+obg1.nurture_abundance*obg1.abundance;0>nbg2&&(nbg2=0);return nbg2}function entValueHunt(a){oaw1=ent_matrix[a];return oaw1.hunt+oaw1.hunt_energy*oaw1.energy+oaw1.hunt_integrity*oaw1.integrity+oaw1.hunt_abundance*oaw1.abundance+oaw1.hunt_crowdedness*oaw1.crowdedness}
function entValuePreyMinEnergy(a){oaq1=ent_matrix[a];return oaq1.preyminenergy+oaq1.preyminenergy_energy*oaq1.energy+oaq1.preyminenergy_integrity*oaq1.integrity+oaq1.preyminenergy_abundance*oaq1.abundance+oaq1.preyminenergy_crowdedness*oaq1.crowdedness}
function entValuePreyMaxIntegrity(a){obk1=ent_matrix[a];return obk1.preymaxintegrity+obk1.preymaxintegrity_energy*obk1.energy+obk1.preymaxintegrity_integrity*obk1.integrity+obk1.preymaxintegrity_abundance*obk1.abundance+obk1.preymaxintegrity_crowdedness*obk1.crowdedness}
function entValueFoodSense(a){oaj=ent_matrix[a];naj2=oaj.foodsense+oaj.foodsense_integrity*oaj.integrity+oaj.foodsense_crowdedness*oaj.crowdedness+oaj.foodsense_energy*oaj.energy;naj2>culture_diagonal&&(naj2=culture_diagonal);return naj2}function entValueEntSense(a){oak=ent_matrix[a];nak2=oak.entsense+oak.entsense_integrity*oak.integrity+oak.entsense_abundance*oak.abundance+oak.entsense_energy*oak.energy;nak2>culture_diagonal&&(nak2=culture_diagonal);return nak2}
function entValueFetch(a){oal1=ent_matrix[a];nal2=oal1.fetch+oal1.fetch_integrity*oal1.integrity+oal1.fetch_energy*oal1.energy+oal1.fetch_crowdedness*oal1.crowdedness+oal1.fetch_abundance*oal1.abundance;oal1.fetchmin!==oal1.fetchmax&&(nal2>oal1.fetchmax&&(nal2=oal1.fetchmax),nal2<oal1.fetchmin&&(nal2=oal1.fetchmin));nal3=oal1.radius;nal2<nal3&&(nal2=nal3);return nal2}
function entValueSpeed(a){oam1=ent_matrix[a];return nam2=oam1.speed+oam1.speed_fooddistance*oam1.fooddistance+oam1.speed_preydistance*oam1.preydistance+oam1.speed_energy*oam1.energy+oam1.speed_integrity*oam1.integrity+oam1.speed_abundance*oam1.abundance+oam1.speed_crowdedness*oam1.crowdedness}
function entValueTick(a){obv1=ent_matrix[a];return nbv2=obv1.tick+obv1.tick_fooddistance*obv1.fooddistance+obv1.tick_preydistance*obv1.preydistance+obv1.tick_energy*obv1.energy+obv1.tick_abundance*obv1.abundance+obv1.tick_crowdedness*obv1.crowdedness}
function entValueLocus(a){obx1=ent_matrix[a];return nbx2=obx1.locus_fooddistance*obx1.fooddistance+obx1.locus_preydistance*obx1.preydistance+obx1.locus_energy*obx1.energy+obx1.locus_integrity*obx1.integrity+obx1.locus_abundance*obx1.abundance+obx1.locus_crowdedness*obx1.crowdedness}function entSpawn(a){a.id=ent_id++;ent_count++;ent_matrix[ent_count]=a}
function entGenesis(a,c){lineages++;oaa1={divergence:0,lineage:""+lineages,generation:0,bred:0,colour:""+randomColour(),demon:!1,id:0,radius:10,circumference:20*Math.PI,area:Math.PI*Math.pow(10,2),nurtured:0,healing:0,healing_integrity:0,healing_energy:0,healing_abundance:0,healing_crowdedness:0,nurture:Math.PI*Math.pow(10,2)/2,nurture_integrity:0,nurture_abundance:0,nurture_crowdedness:0,fortify:20*Math.PI,fortify_integrity:0,fortify_abundance:0,fortify_crowdedness:0,breed:Math.PI*Math.pow(10,2),
breed_integrity:0,breed_abundance:0,breed_crowdedness:0,speed:2,speed_integrity:0,speed_fooddistance:0,speed_preydistance:0,speed_energy:0,speed_abundance:0,speed_crowdedness:0,fetch:culture_diagonal/10,fetchmin:10,fetchmax:culture_diagonal/10,fetch_energy:0,fetch_integrity:0,fetch_abundance:0,fetch_crowdedness:0,fetch_width:90,hunt:culture_diagonal/30,hunt_energy:0,hunt_integrity:0,hunt_abundance:0,hunt_crowdedness:0,foodsense:culture_diagonal/10,foodsense_energy:0,foodsense_integrity:0,foodsense_crowdedness:0,
entsense:culture_diagonal/10,entsense_energy:0,entsense_integrity:0,entsense_abundance:0,preyminenergy:Math.PI*Math.pow(10,2)/2/10,preyminenergy_energy:0,preyminenergy_integrity:0,preyminenergy_abundance:0,preyminenergy_crowdedness:0,preymaxintegrity:20*Math.PI/2/5,preymaxintegrity_energy:0,preymaxintegrity_integrity:0,preymaxintegrity_abundance:0,preymaxintegrity_crowdedness:0,attackpower:1.5,attackpower_energy:0,attackpower_integrity:0,attackpower_abundance:0,attackpower_crowdedness:0,energy:Math.PI*
Math.pow(10,2),waste:0,gathered:0,integrity:20*Math.PI/2,x:a,y:c,age:0,fooddistance:0,preydistance:0,crowdedness:0,abundance:0,facing:0,pace:0,prey:0,seeking:"nothing"};oaa2={};Object.assign(oaa2,oaa1);for(entMutate(oaa2,0,s_mutation_intensity);!0===oaa2.demon;)Object.assign(oaa2,oaa1),entMutate(oaa2,0,s_mutation_intensity);oaa2.divergence=0;entSpawn(oaa2)}
function entNearestPrey(a){oap1=ent_matrix[a];nap6=Infinity;for(nap3=1;nap3<=ent_count;nap3++)if(a!==nap3&&(oap2=ent_matrix[nap3],nap4=findDistance(oap1.x,oap1.y,oap2.x,oap2.y),nap5=oap2.energy,nap4<nap6&&nap4<=entValueHunt(a)&&0<nap5&&nap5>=entValuePreyMinEnergy(a)&&oap2.integrity<=entValuePreyMaxIntegrity(a))){nap6=nap4;var c=nap3;oap3=oap2}if(Infinity>nap6){var b={};ent_matrix[a].preydistance=nap6;ent_matrix[a].prey=0;b.xap1=ent_matrix[c].x;b.yap1=ent_matrix[c].y;b.nap7=nap6}else b=0,ent_matrix[a].preydistance=
0,ent_matrix[a].prey=0;return b}function entCollideWall(a){og1=ent_matrix[a];xg1=og1.x;yg1=og1.y;ng2=og1.radius;xg1<culture_x+ng2&&entRelocate(a,culture_x+ng2,yg1);xg1>culture_x+culture_width-ng2&&entRelocate(a,culture_x+culture_width-ng2,yg1);yg1<culture_y+ng2&&entRelocate(a,xg1,culture_y+ng2);yg1>culture_y+culture_height-ng2&&entRelocate(a,xg1,culture_y+culture_height-ng2)}
function entCollideEnt(a){os3=ent_matrix[a];xs1=os3.x;ys1=os3.y;for(ns2=1;ns2<=ent_count;ns2++)a!==ns2&&(os4=ent_matrix[ns2],xs2=os4.x,ys2=os4.y,ns3=findDistance(xs1,ys1,xs2,ys2),ns4=(os3.radius+os4.radius-ns3)/2,ns5=findAngle(xs1,ys1,xs2,ys2),ns3<os3.radius+os4.radius&&(os1=findNewPoint(xs1,ys1,ns5,-1*ns4),os2=findNewPoint(xs2,ys2,ns5,ns4),entRelocate(a,os1.xc2,os1.yc2),entRelocate(ns2,os2.xc2,os2.yc2)))}
function entFight(a,c){obd1=ent_matrix[a];obd2=ent_matrix[c];nbd3=(Math.pow(Math.abs(entValueSpeed(a)),2)/10+obd1.area/2/1E4)*entValueAttackpower(a);nbd3>od1.energy&&(nbd3=od1.energy);0<nbd3&&0!==entNearestPrey(a)&&(nbd3<obd2.nurtured||nbd3<obd2.energy)&&obd1.prey===c&&(nbd4=0,nbd3>ent_matrix[c].integrity&&(nbd4+=ent_matrix[c].integrity-nbd3),ent_matrix[a].waste+=nbd4,ent_matrix[a].energy-=nbd3,ent_matrix[c].integrity-=nbd3,ent_matrix[a].prey=0,ent_matrix[a].preydistance=0,entNearestPrey(a),0>=ent_matrix[c].integrity&&
entCorpsify(c))}function entAge(a){ent_matrix[a].age+=.1;ent_matrix[a].integrity-=.1+.002*ent_matrix[a].circumference;0>=ent_matrix[a].integrity&&entCorpsify(a)}
function entHeal(a){obe1=ent_matrix[a];nbe2=entValueHealing(a);nbe2>obe1.energy&&(nbe2=obe1.energy);0<nbe2&&(nbe3=0,obe1.integrity+nbe2>obe1.circumference?nbe3+=nbe2-(obe1.circumference-obe1.integrity):nbe2>obe1.radius&&(nbe3+=nbe2-obe1.radius),ent_matrix[a].waste+=nbe3,ent_matrix[a].energy-=nbe2,nbe2>obe1.radius&&(nbe2=obe1.radius),ent_matrix[a].integrity+=nbe2,0>ent_matrix[a].energy&&(ent_matrix[a].energy=0),ent_matrix[a].integrity>ent_matrix[a].circumference&&(ent_matrix[a].integrity=ent_matrix[a].circumference-
.1))}function entEliminate(a){ent_deaths++;total_lifespan_of_dead+=ent_matrix[a].age;ent_matrix[a].id===saved_highlight_id&&(saved_highlight_id=-1);ent_matrix[a].id===highlight_id&&(highlight_id=-1);for(nu2=a;nu2<ent_count;nu2++)ent_matrix[nu2]=ent_matrix[nu2+1];ent_matrix[ent_count]={};ent_count--;nu4=0;nu6=ent_matrix[1].generation;for(nu2=1;nu2<=ent_count;nu2++)nu5=ent_matrix[nu2].generation,nu5>nu4&&(nu4=nu5),nu5<nu6&&(nu6=nu5)}
function entNearestFood(a){ok1=ent_matrix[a];xk1=ok1.x;yk1=ok1.y;nk1=Infinity;for(nk3=1;nk3<=food_count;nk3++)if(xk2=food_matrix[nk3].x,yk2=food_matrix[nk3].y,nk4=findDistance(xk1,yk1,xk2,yk2),nk4<nk1){nk1=nk4;var c=nk3}if(Infinity>nk1&&nk1<=entValueFetch(a)){var b={};ent_matrix[a].fooddistance=nk1;b.xk3=food_matrix[c].x;b.yk3=food_matrix[c].y;b.nk5=nk1}else b=0,ent_matrix[a].fooddistance=0;return b}
function entNearestEnt(a){oao1=ent_matrix[a];nao6=Infinity;for(nao3=1;nao3<=ent_count;nao3++)if(a!==nao3&&(oao2=ent_matrix[nao3],nao4=findDistance(oao1.x,oao1.y,oao2.x,oao2.y),nao4<nao6)){nao6=nao4;var c=nao3}Infinity>nao6?(a={},a.xao1=ent_matrix[c].x,a.yao1=ent_matrix[c].y,a.nao5=nao6):a=!1;return a}
function entFoodCount(a){nae5=0;nae4=entValueFoodSense(a);for(nae2=1;nae2<=food_count;nae2++)xae1=food_matrix[nae2].x,yae1=food_matrix[nae2].y,nae3=findDistance(ent_matrix[a].x,ent_matrix[a].y,xae1,yae1),nae3<=nae4&&nae5++;ent_matrix[a].abundance=nae5}function entEntCount(a){ent_matrix[a].crowdedness=0;for(naf2=1;naf2<=ent_count;naf2++)a!==naf2&&findDistance(ent_matrix[a].x,ent_matrix[a].y,ent_matrix[naf2].x,ent_matrix[naf2].y)<=entValueEntSense(a)&&ent_matrix[a].crowdedness++}
function entFoodSeek(a){if(0<food_count)if(ol2=ent_matrix[a],ol1=entNearestFood(a),nl4=ol1.nk5,0!==ol1)ent_matrix[a].seeking="food",ent_matrix[a].facing=findAngle(ol2.x,ol2.y,ol1.xk3,ol1.yk3);else return 0}function entPreySeek(a){if(1<ent_count)if(oas2=ent_matrix[a],oas1=entNearestPrey(a),nas4=oas1.nap7,0!==oas1)ent_matrix[a].seeking="prey",ent_matrix[a].facing=findAngle(oas2.x,oas2.y,oas1.xap1,oas1.yap1);else return 0}
function entSeek(a){oav1=ent_matrix[a];nav2=entNearestFood(a);nav3=entNearestPrey(a);0!==nav2&&0!==nav3?nav2.nk5<nav3.nap7?entFoodSeek(a):entPreySeek(a):0!==nav2?entFoodSeek(a):0!==nav3&&entPreySeek(a);0!==nav2||0!==nav3?(ent_matrix[a].pace=entValueSpeed(a),0<oav1.pace&&entMove(a)):ent_matrix[a].seeking="nothing"}
function entFoodCollide(a){on1=ent_matrix[a];for(nn2=1;nn2<=food_count;nn2++)nn3=findDistance(on1.x,on1.y,food_matrix[nn2].x,food_matrix[nn2].y),nn3<on1.radius+food_matrix[nn2].radius&&(nn4=food_matrix[nn2].value,isNaN(food_matrix[nn2].value)||(ent_matrix[a].energy+nn4>ent_matrix[a].area?(ent_matrix[a].waste+=nn4-(ent_matrix[a].area-ent_matrix[a].energy),ent_matrix[a].energy=ent_matrix[a].area-1):ent_matrix[a].energy+=nn4),foodEliminate(nn2))}
function entCorpsify(a){obc1={};Object.assign(obc1,ent_matrix[a]);entEliminate(a);obc1!=={}&&(nbc4=nbc3=0,0<obc1.nurtured&&(nbc3=obc1.nurtured),obc1.energy>nbc3&&(nbc3=obc1.energy),0<Math.sqrt(obc1.energy/Math.PI)&&(nbc4=Math.sqrt(obc1.energy/Math.PI)),10<=obc1.age&&0<nbc3&&2<nbc4&&foodSpawn(obc1.x,obc1.y,nbc3))}
function entBreed(a){oab1=ent_matrix[a];nab4=entValueBreed(a);nab2=entValueNurture(a)+entValueFortify(a);nab3=ent_matrix[a].area*breed_waste;if(0<=entValueNurture(a)&&1<entValueFortify(a)&&1<oab1.energy-nab3-nab2&&!1===ent_matrix[a].demon){genome={};Object.assign(genome,ent_matrix[a]);genome.generation++;for(nab6=nab7=1;nab6<=ent_count;nab6++)if(a!==nab6){sab1=ent_matrix[nab6].lineage;sab2=genome.lineage;for(nab9=sab1.length-1;","===sab1.charAt(nab9)&&-1!==nab9;nab9--);-1!==nab9&&(sab1=sab1.substring(0,
nab9-2));sab1===sab2&&nab7++}genome.lineage=genome.lineage.concat(", "+nab7);entMutate(genome,mutation_rarity,mutation_intensity);genome.energy=entValueNurture(a);genome.integrity=entValueFortify(a);genome.energy>genome.area&&(genome.energy=genome.area);genome.integrity>genome.circumference&&(genome.integrity=genome.circumference);genome.age=0;genome.waste=0;genome.gathered=0;genome.bred=0;genome.seeking="nothing";genome.nurtured=nab2;ent_matrix[a].energy-=nab3;ent_matrix[a].energy-=nab2;ent_count++;
genome.id=ent_id++;ent_matrix[ent_count]=genome;ent_matrix[a].bred++}}
function entMutate(a,c,b){if(0===randomInteger(0,c)){for(nad5=randomInteger(0,supermutation_rarity);0===nad5;nad5=randomInteger(0,supermutation_rarity))b+=supermutation_intensity;a.lineage=a.lineage.concat("|"+b);a.divergence+=b;sad4=a.colour;for(nad4=0;nad4<Math.ceil(b);nad4++)nad2=randomInteger(1,3),sad1=sad4.charAt(nad2),nad3=parseInt(sad1,16),nad3+=1+-2*randomInteger(0,1),0>nad3&&(nad3=1),15<nad3&&(nad3=14),sad2=nad3.toString(16),1===nad2&&(sad3="#".concat(sad2,sad4.substr(2))),2===nad2&&(sad3=
"#".concat(sad4.charAt(1),sad2,sad4.charAt(3))),3===nad2&&(sad3="#".concat(sad4.substr(1,2),sad2)),sad4=sad3;a.colour=sad4;a.radius+=randomNumber(-1,1)/(5/b);4>a.radius&&(a.radius=4);100<a.radius&&(a.radius=100);a.circumference=2*Math.PI*a.radius;a.area=Math.PI*Math.pow(a.radius,2);a.speed+=randomNumber(-1,1)/(1E3/b);a.speed_energy+=randomNumber(-1,1)/(1E5/b);a.speed_integrity+=randomNumber(-1,1)/(1E3/b);a.speed_fooddistance+=randomNumber(-1,1)/(5E3/b);a.speed_preydistance+=randomNumber(-1,1)/(5E3/
b);a.speed_abundance+=randomNumber(-1,1)/(400/b);a.speed_crowdedness+=randomNumber(-1,1)/(200/b);a.healing+=randomNumber(-1,1)/(1E4/b);a.healing_energy+=randomNumber(-1,1)/(1E5/b);a.healing_integrity+=randomNumber(-1,1)/(1E4/b);a.healing_abundance+=randomNumber(-1,1)/(400/b);a.healing_crowdedness+=randomNumber(-1,1)/(200/b);a.nurture+=randomNumber(-1,1)/(.1/b);a.nurture_integrity+=randomNumber(-1,1)/(100/b);a.nurture_abundance+=randomNumber(-1,1)/(8/b);a.nurture_crowdedness+=randomNumber(-1,1)/(4/
b);0>a.nurture&&0>=a.nurture_integrity&&0>=a.nurture_abundance&&0>=a.nurture_crowdedness&&(a.demon=!0);a.fortify+=randomNumber(-1,1)/(.1/b);a.fortify_integrity+=randomNumber(-1,1)/(100/b);a.fortify_abundance+=randomNumber(-1,1)/(8/b);a.fortify_crowdedness+=randomNumber(-1,1)/(4/b);0>=a.fortify&&0>=a.fortify_integrity&&0>=a.fortify_abundance&&0>=a.fortify_crowdedness&&(a.demon=!0);a.breed+=randomNumber(-1,1)/(.1/b);a.breed_integrity+=randomNumber(-1,1)/(100/b);a.breed_abundance+=randomNumber(-1,1)/
(8/b);a.breed_crowdedness+=randomNumber(-1,1)/(4/b);a.breed>a.area&&0<=a.breed_integrity&&0<=a.breed_abundance&&0<=a.breed_crowdedness&&(a.demon=!0);a.fetch+=randomNumber(-1,1)/(.5/b);a.fetchmin+=randomNumber(-1,1)/(1/b);a.fetchmax+=randomNumber(-1,1)/(1/b);a.fetch_energy+=randomNumber(-1,1)/(1E3/b);a.fetch_integrity+=randomNumber(-1,1)/(100/b);a.fetch_abundance+=randomNumber(-1,1)/(4/b);a.fetch_crowdedness+=randomNumber(-1,1)/(2/b);a.fetch>culture_diagonal&&(a.fetch=culture_diagonal);a.fetchmin<
a.radius&&(a.fetchmin=a.radius);a.fetchmax>culture_diagonal&&(a.fetchmax=culture_diagonal);a.fetchmax<a.fetchmin&&(a.fetchmax=a.fetchmin);a.fetchmin>a.fetchmax&&(a.fetchmin=a.fetchmax);a.foodsense+=randomNumber(-1,1)/(.5/b);a.foodsense_energy+=randomNumber(-1,1)/(1E3/b);a.foodsense_integrity+=randomNumber(-1,1)/(100/b);a.foodsense_crowdedness+=randomNumber(-1,1)/(2/b);a.entsense+=randomNumber(-1,1)/(.1/b);a.entsense_energy+=randomNumber(-1,1)/(1E3/b);a.entsense_integrity+=randomNumber(-1,1)/(100/
b);a.entsense_abundance+=randomNumber(-1,1)/(4/b);a.preyminenergy+=randomNumber(-1,1)/(.1/b);a.preyminenergy_energy+=randomNumber(-1,1)/(1E3/b);a.preyminenergy_integrity+=randomNumber(-1,1)/(100/b);a.preyminenergy_abundance+=randomNumber(-1,1)/(4/b);a.preyminenergy_crowdedness+=randomNumber(-1,1)/(2/b);a.preymaxintegrity+=randomNumber(-1,1)/(100/b);a.preymaxintegrity_energy+=randomNumber(-1,1)/(1E4/b);a.preymaxintegrity_integrity+=randomNumber(-1,1)/(1E3/b);a.preymaxintegrity_abundance+=randomNumber(-1,
1)/(40/b);a.preymaxintegrity_crowdedness+=randomNumber(-1,1)/(20/b);a.hunt+=randomNumber(-1,1)/(.5/b);a.hunt_energy+=randomNumber(-1,1)/(1E3/b);a.hunt_integrity+=randomNumber(-1,1)/(100/b);a.hunt_abundance+=randomNumber(-1,1)/(4/b);a.hunt_crowdedness+=randomNumber(-1,1)/(2/b);a.attackpower+=randomNumber(-1,1)/(1/b);a.attackpower_energy+=randomNumber(-1,1)/(1E4/b);a.attackpower_integrity+=randomNumber(-1,1)/(1E3/b);a.attackpower_abundance+=randomNumber(-1,1)/(40/b);a.attackpower_crowdedness+=randomNumber(-1,
1)/(20/b)}}function entRelocate(a,c,b){ent_matrix[a].x=c;ent_matrix[a].y=b}
function entMove(a,c,b){oo2=ent_matrix[a];distance=oo2.pace;angle=oo2.facing;no2=distance;1!==c&&(no2>oo2.radius&&(no2=oo2.radius),0!==oo2.prey&&oo2.preydistance<=oo2.radius+ent_matrix[oo2.prey].radius+no2?(entFight(a,a.prey),c=2):(no3=oo2.area/2,no4=Math.pow(Math.abs(distance),2)/10+no3/1E4,0<no4&&oo2.energy>=no4?(no5=0,distance>oo2.radius&&(no5+=no4-Math.pow(Math.abs(oo2.radius),2)/10+no3/1E4),ent_matrix[a].waste+=no5,ent_matrix[a].energy-=no4):c=2));2!==c&&(oo1=findNewPoint(oo2.x,oo2.y,angle,no2),
xo1=oo1.xc2,yo1=oo1.yc2,entRelocate(a,xo1,yo1));1!==c?(entCollideEnt(a),entCollideWall(a,1)):1===b&&(entCollideEnt(a),entCollideWall(a,1));entFoodCollide(a)}function condenseLineage(a){obu1=ent_matrix[a];sbu1=obu1.lineage;sbu2="";for(nbu2=nbu3=0;nbu2<sbu1.length;nbu2++)" "!==sbu1.charAt(nbu2-1)||"1"!==sbu1.charAt(nbu2)||","!==sbu1.charAt(nbu2+1)?1<nbu3?(sbu2.concat("1*"+nbu3),nbu3=0):1===nbu3?sbu2.concat(", 1"):sbu2=sbu2.concat(sbu1.charAt(nbu2)):nbu3++;return sbu2}
function entHighlight(){for(nbw1=1;nbw1<=ent_count;nbw1++)if(findDistance(cursor_x,cursor_y,ent_matrix[nbw1].x,ent_matrix[nbw1].y)<=ent_matrix[nbw1].radius)return ent_matrix[nbw1].id!==highlight_id&&(highlight_id=ent_matrix[nbw1].id),!0}function entQuake(a){entRelocate(a,ent_matrix[a].x+randomInteger(-1,1),ent_matrix[a].y+randomInteger(-1,1));entCollideWall(a);entCollideEnt(a);entFoodCollide(a)}
function entLapse(){for(nz1=1;nz1<=ent_count;nz1++)entBreed(nz1),entQuake(nz1),entFoodCount(nz1),entEntCount(nz1),entSeek(nz1),entHeal(nz1),entAge(nz1)}function foodSpawn(a,c,b){food_count++;nh1=food_count;food_matrix[nh1]={x:a,y:c,colour:"#900",value:b,radius:Math.sqrt(b/Math.PI),width:2,age:0}}function foodEliminate(a){for(ni2=a;ni2<food_count;ni2++)food_matrix[ni2]=food_matrix[ni2+1];food_matrix[food_count]={};food_count--}
function foodAge(a){food_matrix[a].age+=.1;food_matrix[a].age>3*food_matrix[a].value&&foodEliminate(a)}function foodLapse(){for(nbq1=1;nbq1<=food_count;nbq1++)foodAge(nbq1)}
htmlCanvas.addEventListener("mousemove",function(a){x=a.clientX;y=a.clientY;cursor_x=x;cursor_y=y;crosshair=pointer=!1;entHighlight()&&(highlight_pointer=pointer=!0);x>=ui_select_x1&&x<=ui_select_x2&&y>=ui_select_y1&&y<=ui_select_y2?pointer=ui_select_h=!0:ui_select_h=!1;x>=ui_food_x1&&x<=ui_food_x2&&y>=ui_food_y1&&y<=ui_food_y2?pointer=ui_food_h=!0:ui_food_h=!1;x>=ui_ent_x1&&x<=ui_ent_x2&&y>=ui_ent_y1&&y<=ui_ent_y2?pointer=ui_ent_h=!0:ui_ent_h=!1;x>=ui_mutate_x1&&x<=ui_mutate_x2&&y>=ui_mutate_y1&&
y<=ui_mutate_y2?pointer=ui_mutate_h=!0:ui_mutate_h=!1;x>=ui_g_descendants_x1&&x<=ui_g_descendants_x2&&y>=ui_g_descendants_y1&&y<=ui_g_descendants_y2?pointer=ui_g_descendants_h=!0:ui_g_descendants_h=!1;x>=ui_g_generations_x1&&x<=ui_g_generations_x2&&y>=ui_g_generations_y1&&y<=ui_g_generations_y2?pointer=ui_g_generations_h=!0:ui_g_generations_h=!1;x>=graph_x1&&x<=graph_x2&&y>=graph_y1&&y<=graph_y2&&(crosshair=!0);htmlCanvas.style.cursor=!0===pointer?"pointer":!0===crosshair?"crosshair":"initial"});
htmlCanvas.addEventListener("mouseup",function(a){x=a.clientX;y=a.clientY;ui_g_generations_c=ui_g_descendants_c=ui_mutate_c=ui_ent_c=ui_food_c=ui_select_c=!1});
htmlCanvas.addEventListener("mousedown",function(a){x=a.clientX;y=a.clientY;if(0===a.button)if(ui_select_h&&(ui_select_c=!0,leftclick="select"),ui_food_h&&(ui_food_c=!0,leftclick="food"),ui_ent_h&&(ui_ent_c=!0,leftclick="ent"),ui_mutate_h&&(ui_mutate_c=!0,leftclick="mutate"),ui_g_descendants_h&&(ui_g_descendants_c=!0,graph="descendants"),ui_g_generations_h&&(ui_g_generations_c=!0,graph="generations"),"select"===leftclick&&!1===ui_select_h&&!1===ui_food_h&&!1===ui_ent_h&&!1===ui_mutate_h)-1!==highlight_id&&
saved_highlight_id!==highlight_id&&(a=saved_highlight_id,saved_highlight_id=highlight_id,highlight_id=a);else if("ent"===leftclick)x<=culture_x+culture_width&&x>=culture_x&&y<=culture_y+culture_height&&y>=culture_y&&entGenesis(x,y);else if("food"===leftclick)x<=culture_x+culture_width&&x>=culture_x&&y<=culture_y+culture_height&&y>=culture_y&&foodSpawn(x,y,100);else{if("mutate"===leftclick&&!1===ui_select_h&&!1===ui_food_h&&!1===ui_ent_h&&!1===ui_mutate_h)if(-1!==saved_highlight_id)for(n1=1;n1<=ent_count;n1++)ent_matrix[n1].id===
saved_highlight_id&&entMutate(ent_matrix[n1],0,1);else if(-1!==highlight_id)for(n1=1;n1<=ent_count;n1++)ent_matrix[n1].id===highlight_id&&entMutate(ent_matrix[n1],0,1);else for(n1=1;n1<=ent_count;n1++)findDistance(x,y,ent_matrix[n1].x,ent_matrix[n1].y)<=ent_matrix[n1].radius&&entMutate(ent_matrix[n1],0,1)}else if(2===a.button)if("select"===leftclick)-1!==highlight_id&&highlight_id!==saved_highlight_id?highlight_id=-1:-1!==saved_highlight_id&&(saved_highlight_id=highlight_id=-1);else if("ent"===leftclick)if(-1!==
saved_highlight_id)for(n1=1;n1<=ent_count;n1++)ent_matrix[n1].id===saved_highlight_id&&entEliminate(n1);else if(-1!==highlight_id)for(n1=1;n1<=ent_count;n1++)ent_matrix[n1].id===highlight_id&&entEliminate(n1);else for(n1=1;n1<=ent_count;n1++)findDistance(x,y,ent_matrix[n1].x,ent_matrix[n1].y)<=ent_matrix[n1].radius&&entEliminate(n1);else if("food"===leftclick)if(-1!==saved_highlight_id)for(n1=1;n1<=ent_count;n1++)ent_matrix[n1].id===saved_highlight_id&&(ent_matrix[n1].energy=ent_matrix[n1].area-1);
else if(-1!==highlight_id)for(n1=1;n1<=ent_count;n1++)ent_matrix[n1].id===highlight_id&&(ent_matrix[n1].energy=ent_matrix[n1].area-1);else for(n1=1;n1<=ent_count;n1++)findDistance(x,y,ent_matrix[n1].x,ent_matrix[n1].y)<=ent_matrix[n1].radius&&(ent_matrix[n1].energy=ent_matrix[n1].area-1);else if("mutate"===leftclick&&!1===ui_select_h&&!1===ui_food_h&&!1===ui_ent_h&&!1===ui_mutate_h)if(-1!==saved_highlight_id)for(n1=1;n1<=ent_count;n1++)ent_matrix[n1].id===saved_highlight_id&&entMutate(ent_matrix[n1],
0,10);else if(-1!==highlight_id)for(n1=1;n1<=ent_count;n1++)ent_matrix[n1].id===highlight_id&&entMutate(ent_matrix[n1],0,10);else for(n1=1;n1<=ent_count;n1++)findDistance(x,y,ent_matrix[n1].x,ent_matrix[n1].y)<=ent_matrix[n1].radius&&entMutate(ent_matrix[n1],0,10)});window.addEventListener("resize",resizeCanvas);htmlCanvas.addEventListener("contextmenu",function(a){a.preventDefault()});
for(nq1=0;nq1<ent_count_start;nq1++)entGenesis(randomNumber(culture_x+10,culture_x+culture_width-10),randomNumber(culture_y+10,culture_y+culture_height-10));for(nr1=0;nr1<food_count_min;nr1++)foodSpawn(randomNumber(culture_x+10,culture_x+culture_width-10),randomNumber(culture_y+10,culture_y+culture_height-10),food_value());resizeCanvas();nt3=nt1=0;
(function(){function a(){window.requestAnimationFrame(a);nt1++;food_count+ent_count<food_count_min&&foodSpawn(randomNumber(culture_x+10,culture_x+culture_width-10),randomNumber(culture_y+10,culture_y+culture_height-10),food_value());0<food_count&&foodLapse();if(2>=ent_count)for(nt2=0;nt2<ent_count_start;nt2++)entGenesis(randomNumber(culture_x+10,culture_x+culture_width-10),randomNumber(culture_y+10,culture_y+culture_height-10));10===nt1&&(nt1=0,nt3++);100===nt3&&(nt3=0,3<ent_count&&entGenesis(randomNumber(culture_x+
10,culture_x+culture_width-10),randomNumber(culture_y+10,culture_y+culture_height-10)));entLapse();entHighlight()?(htmlCanvas.style.cursor="pointer",highlight_pointer=!0):(highlight_pointer&&(htmlCanvas.style.cursor="initial"),highlight_pointer=!1);drawAll();time_elapsed++;nt12=nt11=nt10=nt9=nt8=nt7=nt13=nt6=nt4=0;for(nt5=1;nt5<=ent_count;nt5++)ent_matrix[nt5].age>oldest_age&&(oldest_age=ent_matrix[nt5].age),nt4+=ent_matrix[nt5].age,0!==ent_matrix[nt5].generation&&(nt6++,nt7+=parseInt(ent_matrix[nt5].colour.charAt(1),
16),nt8+=parseInt(ent_matrix[nt5].colour.charAt(2),16),nt9+=parseInt(ent_matrix[nt5].colour.charAt(3),16)),ent_matrix[nt5].generation===youngest_generation&&(nt13++,nt10+=parseInt(ent_matrix[nt5].colour.charAt(1),16),nt11+=parseInt(ent_matrix[nt5].colour.charAt(2),16),nt12+=parseInt(ent_matrix[nt5].colour.charAt(3),16));nt7=Math.ceil(nt7/nt6).toString(16);nt8=Math.ceil(nt8/nt6).toString(16);nt9=Math.ceil(nt9/nt6).toString(16);average_colour="#".concat(nt7,nt8,nt9);nt10=Math.ceil(nt10/nt13).toString(16);
nt11=Math.ceil(nt11/nt13).toString(16);nt12=Math.ceil(nt12/nt13).toString(16);youngest_average_colour="#".concat(nt10,nt11,nt12);stats_average_colour[time_elapsed]=0<nt6?average_colour:"#fff";stats_average_colour[time_elapsed]=average_colour;stats_youngest_average_colour[time_elapsed]=0<nt13?youngest_average_colour:"#fff";stats_average_age[time_elapsed]=nt4/ent_count;nt6>highest_descendants&&(highest_descendants=nt6);stats_descendants[time_elapsed]=nt6;youngest_generation>highest_generations&&(highest_generations=
youngest_generation);stats_generations[time_elapsed]=youngest_generation}a()})();
