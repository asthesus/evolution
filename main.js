// From document
htmlCanvas = document.getElementById(`c`);
ctx = htmlCanvas.getContext(`2d`);

// Variables
culture_width = 1400;
culture_height = 900;
culture_x = 10;
culture_y = 10;
culture_diagonal = findDistance(0, 0, culture_width, culture_height);
culture_diagonal_half = culture_diagonal / 2;
culture_area = culture_width * culture_height;

timebar = culture_x;
timebar_direction = 1;
timebar_speed = 1;

let food_matrix = [];
food_count = 0;
food_count_start = 0;
food_count_min = culture_area / 6400;
food_fatness = 3;
food_value_min = 20;
food_value_max = 36;
function food_value() {
    return randomNumber(food_value_min, food_value_max);
}

let ent_matrix = [];
ent_count = 0;
ent_count_start = Math.floor(culture_area / 48000);
lineages = 0;
youngest_generation = 0;
oldest_generation = 0;

breed_waste = 0.01;
mutation_rarity = 9;
mutation_intensity = 1;
supermutation_rarity = 9;
supermutation_intensity = 10;
s_mutation_intensity = 20;

highlight_id = -1;
ent_id = 0;

// Functions

// - Math

const randomNumber = (min, max) => {
    return Math.random() * (max - min + 1) + min;
}

const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomColour = () => {
    return `#`.concat(randomInteger(0, 15).toString(16).concat(randomInteger(0, 15).toString(16).concat(randomInteger(0, 15).toString(16))));
}

function findDistance(xa1, ya1, xa2, ya2) {
    na1 = xa1 - xa2;
    na2 = ya1 - ya2;
    return Math.sqrt(na1*na1 + na2*na2);
}

function findAngle(xb1, yb1, xb2, yb2) {
    nb1 = yb2 - yb1;
    nb2 = xb2 - xb1;
    theta = Math.atan2(nb1, nb2);
    theta *= 180 / Math.PI;
    return theta;
}

function findNewPoint(xc1, yc1, angle, distance) {
    var result = {};
    result.xc2 = Math.round(Math.cos(angle * Math.PI / 180) * distance + xc1);
    result.yc2 = Math.round(Math.sin(angle * Math.PI / 180) * distance + yc1);
    return result;
}

// - Canvas

function drawVoid() {
    ctx.fillStyle = `#000`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawCulture() {
    ctx.beginPath();
    ctx.strokeStyle = `#666`;
    ctx.lineWidth = `2`;
    ctx.strokeRect(culture_x, culture_y, culture_width, culture_height);
    ctx.stroke();
}

function drawTimeBar() {
    timebar += timebar_direction * timebar_speed;
    if(timebar >= culture_x + 20) {
        timebar = culture_x;
    }
    ctx.strokeStyle = `#fff`;
    ctx.lineWidth = `1`;
    for(nac1 = 0; nac1 < culture_width; nac1 += 20) {
        ctx.beginPath();
        ctx.moveTo(timebar + nac1, culture_y + culture_height);
        ctx.lineTo(timebar + nac1, culture_y + culture_height + 5);
        ctx.stroke();
    }
}

function drawEntities() {
    if(ent_count > 0) {
        nd7 = 0;
        nd8 = 1;
        for(nd1 = 1; nd1 <= ent_count; nd1++) {
            // entity
            od1 = ent_matrix[nd1];
            xd1 = od1.x;
            yd1 = od1.y;
            nd11 = od1.radius;
            nd14 = (od1.integrity / od1.circumference) * 2;
            ctx.beginPath();
            ctx.strokeStyle = od1.colour;
            nd3 = (od1.energy / od1.area) * 256;
            nd2 = Math.floor(nd3 / 16);
            energy_hex = nd2.toString(16);
            if(od1.demon === false) {energy_colour = `#`.concat(energy_hex, energy_hex, energy_hex)} else {energy_colour = `#`.concat(energy_hex, 0, 0)};
            ctx.fillStyle = energy_colour;
            if(nd14 < 0.5) nd14 = 0.5;
            ctx.lineWidth = `${nd14}`;
            ctx.arc(xd1, yd1, nd11 - (nd14 / 2), 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            // highlight
            if(ent_matrix[nd1].id === highlight_id) {
                ctx.beginPath();
                ctx.lineWidth = `2`;
                ctx.strokeStyle = `#fff`;
                ctx.arc(xd1, yd1, (nd11 - (nd14 / 2)) + 5, 0, 2 * Math.PI);
                ctx.stroke();
                // text
                // ctx.beginPath();
                // ctx.lineWidth = 3;
                // ctx.strokeStyle = `#F90`;
                // ctx.fillStyle = `#F90`;
                // ctx.font = `20px Courier New`;
                // ctx.fillText(`${ent_matrix[nd1].id}`, xd1 + nd11, yd1);
                // ctx.strokeStyle = od1.colour;
                // ctx.lineWidth = `${nd14}`;
            }
            // food line
            if(food_count > 0) {
                od2 = entNearestFood(nd1);
                nd5 = entValueFetch(nd1);
                if(od1.seeking === `food`
                && od2.nk5 <= nd5
                && entValueSpeed(nd1) > 0
                && od1.energy > 0) {
                    ctx.lineWidth = `1`;
                    ctx.beginPath();
                    ctx.moveTo(xd1, yd1);
                    ctx.lineTo(od2.xk3, od2.yk3);
                    ctx.stroke();
                }
            } 
            // prey line
            if(ent_count > 1) {
                od2 = entNearestPrey(nd1);
                if(od1.seeking === `prey`
                && od2 !== 0) {
                    if(entValueSpeed(nd1) > 0 && od1.energy > 0) {
                        ctx.lineWidth = `3`;
                        ctx.beginPath();
                        ctx.moveTo(xd1, yd1);
                        ctx.lineTo(od2.xap1, od2.yap1);
                        ctx.stroke();
                    }
                }
            }
            // oldest ent
            if(od1.age > nd7) {nd7 = od1.age; nd8 = nd1};
        }
        // oldest ent
        od3 = ent_matrix[nd8];
        xd2 = od3.x;
        yd2 = od3.y;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.fillStyle = ent_matrix[nd8].colour;
        ctx.font = `40px Courier New`;
        ctx.fillText(`*`, ent_matrix[nd8].x - 12, ent_matrix[nd8].y + 17);
    }
}

function drawFood() {
    if(food_count > 0)
    for(nd1 = 1; nd1 <= food_count; nd1++) {
        ctx.beginPath();
        ctx.strokeStyle = food_matrix[nd1].colour;
        ctx.lineWidth = `${food_matrix[nd1].width}`;
        ctx.arc(food_matrix[nd1].x, food_matrix[nd1].y, food_matrix[nd1].radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

function drawText() {
    youngest_generation = 0;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.fillStyle = `#fff`;
    ctx.font = `20px Courier New`;
    for(nbt1 = 1; nbt1 <= ent_count; nbt1++) {
        if(ent_matrix[nbt1].generation > youngest_generation) youngest_generation = ent_matrix[nbt1].generation;
        // highlight
        if(ent_matrix[nbt1].id === highlight_id) {
            nbt2 = 30;
            ctx.fillText(`Highlighted: ${ent_matrix[nbt1].id}`, culture_x + culture_width + 5, (nbt2 += 30));
            ctx.fillText(`Age:         ${Math.ceil(ent_matrix[nbt1].age)}`, culture_x + culture_width + 5, (nbt2 += 30));
            ctx.fillText(`Colour:`, culture_x + culture_width + 5, (nbt2 += 30));
            ctx.fillStyle = `${ent_matrix[nbt1].colour}`;
            if(parseInt(ent_matrix[nbt1].colour.charAt(1), 16) < 13
            && parseInt(ent_matrix[nbt1].colour.charAt(2), 16) < 7
            // && parseInt(ent_matrix[nbt1].colour.charAt(3), 16) < 15
            ) {
                ctx.beginPath();
                ctx.fillStyle = `${ent_matrix[nbt1].colour}`;
                ctx.strokeStyle = `${ent_matrix[nbt1].colour}`;
                ctx.fillRect(culture_x + culture_width + 160, nbt2 - 16, 39, 20);
                ctx.fillStyle = `#fff`;
            }
            ctx.fillText(`             ${ent_matrix[nbt1].colour.substr(1, 3)}`, culture_x + culture_width + 5, nbt2);
            ctx.fillStyle = `#fff`;
            ctx.fillText(`Generation:  ${ent_matrix[nbt1].generation}`, culture_x + culture_width + 5, (nbt2 += 30));
            ctx.fillText(`Divergence:  ${ent_matrix[nbt1].divergence}`, culture_x + culture_width + 5, (nbt2 += 30));
            ctx.fillText(`Bred:        ${Math.ceil(ent_matrix[nbt1].bred)}`, culture_x + culture_width + 5, (nbt2 += 30));
            ctx.fillStyle = `#fff`;
        }
    }
    ctx.fillText(`Generations: ${youngest_generation}`, culture_x + culture_width + 5, culture_y + 10);
}

lineage_matrix = [];
function drawLineages() {
    for(nbs2 = 0; nbs2 <= youngest_generation; nbs2++) {
        for(nbs3 = 1; nbs2 === ent_matrix[nbs3].generation && nbs3 <= ent_count; nbs3++) {
            lineage_matrix[nbs2]++;
        }
    }
}

function drawAll() {
    drawVoid();
    drawEntities();
    drawFood();
    drawCulture();
    drawText();
}

function resizeCanvas() {
    htmlCanvas.width = window.innerWidth;
    htmlCanvas.height = window.innerHeight;
    drawAll();
}

// - Entities

function entValueAttackpower(nbr1) {
    obr1 = ent_matrix[nbr1];
    nbr2 = obf1.attackpower
    + (obr1.attackpower_energy * obr1.energy)
    + (obr1.attackpower_integrity * obr1.integrity)
    + (obr1.attackpower_abundance * obr1.abundance)
    + (obr1.attackpower_crowdedness * obr1.crowdedness)
    + (obr1.attackpower_clock * obr1.clock);
    return nbr2;
}
function entValueBreed(nbi1) {
    obi1 = ent_matrix[nbi1];
    nbi2 = obi1.breed
    + (obi1.breed_integrity * obi1.integrity)
    + (obi1.breed_crowdedness * obi1.crowdedness)
    + (obi1.breed_abundance * obi1.abundance)
    + (obi1.breed_clock * obi1.clock);
    return nbi2;
}
function entValueHealing(nbf1) {
    obf1 = ent_matrix[nbf1];
    nbf2 = obf1.healing
    + (obf1.healing_energy * obf1.energy)
    + (obf1.healing_integrity * obf1.integrity)
    + (obf1.healing_abundance * obf1.abundance)
    + (obf1.healing_crowdedness * obf1.crowdedness)
    + (obf1.healing_clock * obf1.clock);
    return nbf2;
}
function entValueFortify(nbh1) {
    obh1 = ent_matrix[nbh1];
    nbh2 = obh1.fortify
    + (obh1.fortify_integrity * obh1.integrity)
    + (obh1.fortify_crowdedness * obh1.crowdedness)
    + (obh1.fortify_abundance * obh1.abundance)
    + (obh1.fortify_clock * obh1.clock);
    if(nbh2 < 0) nbh2 = 0;
    return nbh2;
}
function entValueNurture(nbg1) {
    obg1 = ent_matrix[nbg1];
    nbg2 = obg1.nurture
    + (obg1.nurture_integrity * obg1.integrity)
    + (obg1.nurture_crowdedness * obg1.crowdedness)
    + (obg1.nurture_abundance * obg1.abundance)
    + (obg1.nurture_clock * obg1.clock);
    if(nbg2 < 0) nbg2 = 0;
    return nbg2;
}
function entValueHunt(naw1) {
    oaw1 = ent_matrix[naw1];
    return oaw1.hunt
    + (oaw1.hunt_energy * oaw1.energy)
    + (oaw1.hunt_integrity * oaw1.integrity)
    + (oaw1.hunt_abundance * oaw1.abundance)
    + (oaw1.hunt_crowdedness * oaw1.crowdedness)
    + (oaw1.hunt_clock * oaw1.clock);
}
function entValuePreyMinEnergy(naq1) {
    oaq1 = ent_matrix[naq1];
    return oaq1.preyminenergy
    + (oaq1.preyminenergy_energy * oaq1.energy)
    + (oaq1.preyminenergy_integrity * oaq1.integrity)
    + (oaq1.preyminenergy_abundance * oaq1.abundance)
    + (oaq1.preyminenergy_crowdedness * oaq1.crowdedness)
    + (oaq1.preyminenergy_clock * oaq1.clock);
}
function entValuePreyMaxIntegrity(nbk1) {
    obk1 = ent_matrix[nbk1];
    return obk1.preymaxintegrity
    + (obk1.preymaxintegrity_energy * obk1.energy)
    + (obk1.preymaxintegrity_integrity * obk1.integrity)
    + (obk1.preymaxintegrity_abundance * obk1.abundance)
    + (obk1.preymaxintegrity_crowdedness * obk1.crowdedness)
    + (obk1.preymaxintegrity_clock * obk1.clock);
}
function entValueFoodSense(naj1) {
    oaj = ent_matrix[naj1];
    naj2 = oaj.foodsense
    + (oaj.foodsense_integrity * oaj.integrity)
    + (oaj.foodsense_crowdedness * oaj.crowdedness)
    + (oaj.foodsense_energy * oaj.energy)
    + (oaj.foodsense_clock * oaj.clock);
    if(naj2 > culture_diagonal) naj2 = culture_diagonal;
    return naj2;
}
function entValueEntSense(nak1) {
    oak = ent_matrix[nak1];
    nak2 = oak.entsense
    + (oak.entsense_integrity * oak.integrity)
    + (oak.entsense_abundance * oak.abundance)
    + (oak.entsense_energy * oak.energy)
    + (oak.entsense_clock * oak.clock);
    if(nak2 > culture_diagonal) nak2 = culture_diagonal;
    return nak2;
}
function entValueFetch(nal1) {
    oal1 = ent_matrix[nal1];
    nal2 = oal1.fetch
    + (oal1.fetch_integrity * oal1.integrity)
    + (oal1.fetch_energy * oal1.energy)
    + (oal1.fetch_crowdedness * oal1.crowdedness)
    + (oal1.fetch_abundance * oal1.abundance)
    + (oal1.fetch_clock * oal1.clock);
    if(oal1.fetchmin !== oal1.fetchmax) {
        if(nal2 > oal1.fetchmax) nal2 = oal1.fetchmax;
        if(nal2 < oal1.fetchmin) nal2 = oal1.fetchmin;
    }
    nal3 = oal1.radius;
    if(nal2 < nal3) nal2 = nal3;
    return nal2;
}
function entValueSpeed(nam1) {
    oam1 = ent_matrix[nam1];
    nam2 = oam1.speed
    + (oam1.speed_fooddistance * oam1.fooddistance)
    + (oam1.speed_preydistance * oam1.preydistance)
    + (oam1.speed_energy * oam1.energy)
    + (oam1.speed_integrity * oam1.integrity)
    + (oam1.speed_abundance * oam1.abundance)
    + (oam1.speed_crowdedness * oam1.crowdedness)
    + (oam1.speed_clock * oam1.clock);
    return nam2;
}
function entValueTick(nbv1) {
    obv1 = ent_matrix[nbv1];
    nbv2 = obv1.tick
    + (obv1.tick_fooddistance * obv1.fooddistance)
    + (obv1.tick_preydistance * obv1.preydistance)
    + (obv1.tick_energy * obv1.energy)
    + (obv1.tick_abundance * obv1.abundance)
    + (obv1.tick_crowdedness * obv1.crowdedness)
    + (obv1.tick_clock * obv1.clock);
    return nbv2;
}

function entSpawn(of1) {
    of1.id = ent_id++;
    // ent_id++;
    ent_count++;
    ent_matrix[ent_count] = of1;
}

function entGenesis(xaa1, yaa1) {
    lineages++;
    oaa1 = {
        // Constants
        // - meta
        divergence: 0,
        lineage: `${lineages}`,
        generation: 0,
        bred: 0,
        colour: `${randomColour()}`,
        demon: false,
        id: 0,
        // - physical
        radius: 10,
        circumference: 2 * Math.PI * 10,
        area: Math.PI * (10 ** 2),
        nurtured: 0,

        healing: 0,
        healing_integrity: 0,
        healing_energy: 0,
        healing_abundance: 0,
        healing_crowdedness: 0,
        healing_clock: 0,

        nurture: (Math.PI * (10 ** 2)) / 2, // energy given to offspring
        nurture_integrity: 0,
        nurture_abundance: 0, // fecundity
        nurture_crowdedness: 0, // protectiveness
        nurture_clock: 0,

        fortify: 2 * Math.PI * 10, // integrity given to offspring
        fortify_integrity: 0,
        fortify_abundance: 0,
        fortify_crowdedness: 0,
        fortify_clock: 0,

        breed: Math.PI * (10 ** 2), // energy to breed at
        breed_integrity: 0,
        breed_abundance: 0, // fertility
        breed_crowdedness: 0, // horniness
        breed_clock: 0,
        
        speed: 2,
        speed_integrity: 0,
        speed_fooddistance: 0, // coverage
        speed_preydistance: 0,
        speed_energy: 0, // desparation
        speed_abundance: 0, // gluttony
        speed_crowdedness: 0, // greed
        speed_clock: 0,

        fetch: culture_diagonal / 10, // distance to look for food
        fetchmin: 10,
        fetchmax: culture_diagonal / 10,
        fetch_energy: 0, // hunger
        fetch_integrity: 0,
        fetch_abundance: 0,
        fetch_crowdedness: 0,
        fetch_clock: 0,

        hunt: culture_diagonal / 10, // distance to look for prey
        hunt_energy: 0,
        hunt_integrity: 0,
        hunt_abundance: 0,
        hunt_crowdedness: 0,
        hunt_clock: 0,
        
        foodsense: culture_diagonal / 10,
        foodsense_energy: 0,
        foodsense_integrity: 0,
        foodsense_crowdedness: 0,
        foodsense_clock: 0,

        entsense: culture_diagonal / 10,
        entsense_energy: 0,
        entsense_integrity: 0,
        entsense_abundance: 0,
        entsense_clock: 0,

        preyminenergy: ((Math.PI * (10 ** 2)) / 2) / 10,
        preyminenergy_energy: 0,
        preyminenergy_integrity: 0,
        preyminenergy_abundance: 0,
        preyminenergy_crowdedness: 0,
        preyminenergy_clock: 0,

        preymaxintegrity: ((2 * Math.PI * 10) / 2) / 5,
        preymaxintegrity_energy: 0,
        preymaxintegrity_integrity: 0,
        preymaxintegrity_abundance: 0,
        preymaxintegrity_crowdedness: 0,
        preymaxintegrity_clock: 0,

        attackpower: 1.5,
        attackpower_energy: 0,
        attackpower_integrity: 0,
        attackpower_abundance: 0,
        attackpower_crowdedness: 0,
        attackpower_clock: 0,

        tick: 0,
        tick_integrity: 0,
        tick_fooddistance: 0,
        tick_preydistance: 0,
        tick_energy: 0,
        tick_abundance: 0,
        tick_crowdedness: 0,
        tick_clock: 0,

        // Variables and senses
        clock: 0,
        energy: Math.PI * (10 ** 2),
        waste: 0,
        gathered: 0,
        integrity: (2 * Math.PI * 10) / 2,
        x: xaa1,
        y: yaa1,
        age: 0,
        fooddistance: 0, // distance from food
        preydistance: 0, //distance from prey
        crowdedness: 0, // number of other entities within fetch range
        abundance: 0, // number of food within fetch range
        // - intents
        facing: 0, // facing angle
        pace: 0, // distance moved per tick

        prey: 0,
        seeking: `nothing`,
    }
    oaa2 = {};
    Object.assign(oaa2, oaa1);
    entMutate(oaa2, 0, s_mutation_intensity);
    for(;oaa2.demon === true;) {Object.assign(oaa2, oaa1); entMutate(oaa2, 0, s_mutation_intensity)};
    oaa2.divergence = 0;
    entSpawn(oaa2);
}

function entNearestPrey(nap1) {
    oap1 = ent_matrix[nap1];
    nap6 = Infinity;
    var nap2;
    for(nap3 = 1; nap3 <= ent_count; nap3++) {
        if(nap1 !== nap3) {
            oap2 = ent_matrix[nap3];
            nap4 = findDistance(oap1.x, oap1.y, oap2.x, oap2.y);
            nap5 = oap2.energy;
            sap1 = oap2.lineage;
            for(nap8 = sap1.length -1; sap1.charAt(nap8) === `,` && nap8 !== -1; nap8--) {};
            if(nap8 !== -1) {sap1 = sap1.substring(0, nap8 - 2)};
            sap2 = oap1.lineage;
            for(nap9 = sap2.length -1; sap2.charAt(nap9) === `,` && nap9 !== -1; nap9--) {};
            if(nap9 !== -1) {sap2 = sap2.substring(0, nap9 - 2)};
            if(nap4 < nap6
            && oap1.lineage !== sap1 && oap2.lineage !== sap2 && sap1 !== sap2
            && nap4 <= entValueHunt(nap1)
            && nap5 > 0
            && nap5 >= entValuePreyMinEnergy(nap1)
            && oap2.integrity <= entValuePreyMaxIntegrity(nap1)
            ) {
                nap6 = nap4;
                nap2 = nap3;
                oap3 = oap2;
            }
        }
    }
    if(nap6 < Infinity) {
        var result = {};
        ent_matrix[nap1].preydistance = nap6;
        ent_matrix[nap1].prey = 0;
        result.xap1 = ent_matrix[nap2].x;
        result.yap1 = ent_matrix[nap2].y;
        result.nap7 = nap6;
    } else {
        result = 0;
        ent_matrix[nap1].preydistance = 0;
        ent_matrix[nap1].prey = 0;
    }
    return result;
}

function entCollideWall(ng1) {
    og1 = ent_matrix[ng1];
    xg1 = og1.x;
    yg1 = og1.y;
    ng2 = og1.radius;
    if(xg1 < culture_x + ng2) {ent_matrix[ng1].facing = 180; ent_matrix[ng1].pace = -1 * (culture_x + ng2 - xg1); entMove(ng1, 1)};
    if(xg1 > culture_x + culture_width - ng2) {ent_matrix[ng1].facing = 0; ent_matrix[ng1].pace = culture_x + culture_width - ng2 - xg1; entMove(ng1, 1)};
    if(yg1 < culture_y + ng2) {ent_matrix[ng1].facing = 270; ent_matrix[ng1].pace = -1 * (culture_y + ng2 - yg1); entMove(ng1, 1)};
    if(yg1 > culture_y + culture_height - ng2) {ent_matrix[ng1].facing = 90; ent_matrix[ng1].pace = culture_y + culture_height - ng2 - yg1; entMove(ng1, 1)};
}

function entCollideEnt(ns1) {
    os3 = ent_matrix[ns1];
    xs1 = os3.x;
    ys1 = os3.y;
    for(ns2 = 1; ns2 <= ent_count; ns2++) {
        if(ns1 !== ns2) {
            os4 = ent_matrix[ns2];
            xs2 = os4.x;
            ys2 = os4.y;
            ns3 = findDistance(xs1, ys1, xs2, ys2);
            ns4 = (ns3 - os3.radius - os4.radius) / 2;
            if(ns3 < os3.radius + os4.radius) {
                ent_matrix[ns1].pace = ns4;
                ent_matrix[ns1].facing = findAngle(xs1, ys1, xs2, ys2);
                entMove(ns1, 1);
                ent_matrix[ns2].pace = ns4;
                ent_matrix[ns2].facing = findAngle(xs2, ys2, xs1, ys1);
                entMove(ns2, 1);
            }
        }
    }
}

function entFight(nbd1, nbd2) {
    obd1 = ent_matrix[nbd1];
    obd2 = ent_matrix[nbd2];
    nbd3 = (((Math.abs(entValueSpeed(nbd1)) ** 2) / 10) + ((obd1.area / 2) / 10000)) * entValueAttackpower(nbd1);
    if(nbd3 > od1.energy) nbd3 = od1.energy;
    if(nbd3 > 0
    && entNearestPrey(nbd1) !== 0
    && (nbd3 < obd2.nurtured || nbd3 < obd2.energy)
    && obd1.prey === nbd2) {
        nbd4 = 0;
        if(nbd3 > ent_matrix[nbd2].integrity) nbd4 += ent_matrix[nbd2].integrity - nbd3;
        ent_matrix[nbd1].waste += nbd4;
        ent_matrix[nbd1].energy -= nbd3;
        ent_matrix[nbd2].integrity -= nbd3;
        ent_matrix[nbd1].prey = 0;
        ent_matrix[nbd1].preydistance = 0;
        entNearestPrey(nbd1);
        if(ent_matrix[nbd2].integrity <= 0) entCorpsify(nbd2);
    }
}

function entAge(nw1) {
    if(ent_matrix[nw1].clock < 359) {ent_matrix[nw1].clock += ent_matrix[nw1].tick}
    else if(ent_matrix[nw1].clock >= 359) {ent_matrix[nw1].clock = ent_matrix[nw1].clock - 359};
    ent_matrix[nw1].age += 0.1;
    ent_matrix[nw1].integrity -= 0.1 + (0.002 * ent_matrix[nw1].circumference);
    if(ent_matrix[nw1].integrity <= 0) entCorpsify(nw1);
}

function entHeal(nbe1) {
    obe1 = ent_matrix[nbe1];
    nbe2 = entValueHealing(nbe1);
    if(nbe2 > obe1.energy) nbe2 = obe1.energy;
    if(nbe2 > 0) {
        nbe3 = 0;
        if(obe1.integrity + nbe2 > obe1.circumference) {nbe3 += nbe2 - (obe1.circumference - obe1.integrity)} else if(nbe2 > obe1.radius) {nbe3 += nbe2 - obe1.radius};
        ent_matrix[nbe1].waste += nbe3;
        ent_matrix[nbe1].energy -= nbe2;
        if(nbe2 > obe1.radius) nbe2 = obe1.radius;
        ent_matrix[nbe1].integrity += nbe2;
        if(ent_matrix[nbe1].energy < 0) ent_matrix[nbe1].energy = 0;
        if(ent_matrix[nbe1].integrity > ent_matrix[nbe1].circumference) ent_matrix[nbe1].integrity = ent_matrix[nbe1].circumference - 0.1;
    }
}

function entEliminate(nu1) {
    for(nu2 = nu1; nu2 < ent_count; nu2++) {
        ent_matrix[nu2] = ent_matrix[nu2 + 1];
    }
    ent_matrix[ent_count] = {};
    ent_count--;
    nu4 = 0;
    nu6 = ent_matrix[1].generation;
    for(nu2 = 1; nu2 <= ent_count; nu2++) {
        nu5 = ent_matrix[nu2].generation;
        if(nu5 > nu4) nu4 = nu5;
        if(nu5 < nu6) nu6 = nu5;
    }
}

function entNearestFood(nk6) {
    ok1 = ent_matrix[nk6];
    xk1 = ok1.x;
    yk1 = ok1.y;
    nk1 = Infinity;
    var nk2;
    for(nk3 = 1; nk3 <= food_count; nk3++) {
        xk2 = food_matrix[nk3].x;
        yk2 = food_matrix[nk3].y;
        nk4 = findDistance(xk1, yk1, xk2, yk2);
        if(nk4 < nk1) {nk1 = nk4; nk2 = nk3};
    }
    if(nk1 < Infinity && nk1 <= entValueFetch(nk6)) {
        var result = {};
        ent_matrix[nk6].fooddistance = nk1;
        result.xk3 = food_matrix[nk2].x;
        result.yk3 = food_matrix[nk2].y;
        result.nk5 = nk1;
    } else {
        result = 0;
        ent_matrix[nk6].fooddistance = 0;
    }
    return result;
}

function entNearestEnt(nao1) {
    oao1 = ent_matrix[nao1];
    nao6 = Infinity;
    var nao2;
    for(nao3 = 1; nao3 <= ent_count; nao3++) {
        if(nao1 !== nao3) {
            oao2 = ent_matrix[nao3];
            nao4 = findDistance(oao1.x, oao1.y, oao2.x, oao2.y);
            if(nao4 < nao6) {nao6 = nao4; nao2 = nao3};
        }
    }
    if(nao6 < Infinity) {
        var result = {};
        result.xao1 = ent_matrix[nao2].x;
        result.yao1 = ent_matrix[nao2].y;
        result.nao5 = nao6;
    } else {
        result = false;
    }
    return result;
}

function entFoodCount(nae1) {
    nae5 = 0;
    nae4 = entValueFoodSense(nae1);
    for(nae2 = 1; nae2 <= food_count; nae2++) {
        xae1 = food_matrix[nae2].x;
        yae1 = food_matrix[nae2].y;
        nae3 = findDistance(ent_matrix[nae1].x, ent_matrix[nae1].y, xae1, yae1);
        if(nae3 <= nae4) nae5++;
    }
    ent_matrix[nae1].abundance = nae5;
}

function entEntCount(naf1) {
    naf5 = 0;
    naf4 = entValueEntSense(naf1);
    for(naf2 = 1; naf2 <= ent_count; naf2++) {
        if(naf1 !== naf2) {
            naf3 = findDistance(ent_matrix[naf1].x, ent_matrix[naf1].y, ent_matrix[naf2].x, ent_matrix[naf2].y);
            if(naf3 <= naf4) naf5++;
        }
    }
    ent_matrix[naf1].crowdedness = naf5;
}

function entFoodSeek(nl1) {
    if(food_count > 0) {
        ol2 = ent_matrix[nl1];
        ol1 = entNearestFood(nl1);
        nl4 = ol1.nk5;
        if(ol1 !== 0) {
            ent_matrix[nl1].seeking = `food`;
            ent_matrix[nl1].facing = findAngle(ol2.x, ol2.y, ol1.xk3, ol1.yk3);
        } else return 0;
    }
}

function entPreySeek(nas1) {
    if(ent_count > 1) {
        oas2 = ent_matrix[nas1];
        oas1 = entNearestPrey(nas1);
        nas4 = oas1.nap7;
        if(oas1 !== 0) {
            ent_matrix[nas1].seeking = `prey`;
            ent_matrix[nas1].facing = findAngle(oas2.x, oas2.y, oas1.xap1, oas1.yap1);
        } else return 0;
    }
}

function entSeek(nav1) {
    oav1 = ent_matrix[nav1];
    nav2 = entNearestFood(nav1);
    nav3 = entNearestPrey(nav1);
    if(nav2 !== 0 && nav3 !== 0) {
        if(nav2.nk5
        < nav3.nap7) {
            entFoodSeek(nav1);
        } else {
            entPreySeek(nav1);
        }
    } else if(nav2 !== 0) {
        entFoodSeek(nav1);
    } else if(nav3 !== 0) {
        entPreySeek(nav1);
    }
    if(nav2 !== 0 || nav3 !== 0) {
        ent_matrix[nav1].pace = entValueSpeed(nav1);
        if(oav1.pace > 0) entMove(nav1);
    } else {
        ent_matrix[nav1].seeking = `nothing`;
    }
}

function entFoodCollide(nn1) {
    on1 = ent_matrix[nn1];
    for(nn2 = 1; nn2 <= food_count; nn2++) {
        nn3 = findDistance(on1.x, on1.y, food_matrix[nn2].x, food_matrix[nn2].y);
        if(nn3 < on1.radius + food_matrix[nn2].radius) {
            nn4 = food_matrix[nn2].value;
            if(!(isNaN(food_matrix[nn2].value))) {
                if(ent_matrix[nn1].energy + nn4 > ent_matrix[nn1].area) {
                    ent_matrix[nn1].waste += nn4 - (ent_matrix[nn1].area - ent_matrix[nn1].energy);
                    ent_matrix[nn1].energy = ent_matrix[nn1].area - 1;
                } else {
                    ent_matrix[nn1].energy += nn4;
                }
            }
            foodEliminate(nn2);
        }
    }
}

function entCorpsify(nbc1) {
    obc1 = {};
    Object.assign(obc1, ent_matrix[nbc1]);
    entEliminate(nbc1);
    if(obc1 !== {}) {
        nbc3 = 0;
        nbc4 = 0;
        if(obc1.nurtured > 0) nbc3 = obc1.nurtured;
        if(obc1.energy > nbc3) nbc3 = obc1.energy;
        if(Math.sqrt(obc1.energy / Math.PI) > 0) nbc4 = Math.sqrt(obc1.energy / Math.PI);
        if(obc1.age >= 10 && nbc3 > 0 && nbc4 > 2) {
            foodSpawn(obc1.x, obc1.y, nbc3);
        }
    }
}

function entBreed(nab1) {
    oab1 = ent_matrix[nab1];
    nab4 = entValueBreed(nab1);
    nab2 = entValueNurture(nab1) + entValueFortify(nab1);
    nab3 = ent_matrix[nab1].area * breed_waste;
    if(entValueNurture(nab1) >= 0
    && entValueFortify(nab1) > 1
    && oab1.energy - nab3 - nab2 > 1
    && ent_matrix[nab1].demon === false) {
        genome = {};
        Object.assign(genome, ent_matrix[nab1]);
        genome.generation++;
        nab7 = 1;
        for(nab6 = 1; nab6 <= ent_count; nab6++) {
            if(nab1 !== nab6) {
                sab1 = ent_matrix[nab6].lineage;
                sab2 = genome.lineage;
                for(nab9 = sab1.length -1; sab1.charAt(nab9) === `,` && nab9 !== -1; nab9--) {};
                if(nab9 !== -1) {sab1 = sab1.substring(0, nab9 - 2)};
                if(sab1 === sab2) nab7++;
            }
        }
        genome.lineage = genome.lineage.concat(`, ${nab7}`);
        entMutate(genome, mutation_rarity, mutation_intensity);
        genome.energy = entValueNurture(nab1);
        genome.integrity = entValueFortify(nab1);
        if(genome.energy > genome.area) genome.energy = genome.area;
        if(genome.integrity > genome.circumference) genome.integrity = genome.circumference;
        genome.age = 0;
        genome.waste = 0;
        genome.gathered = 0;
        genome.bred = 0;
        genome.seeking = `nothing`;
        genome.nurtured = nab2;
        ent_matrix[nab1].energy -= nab3;
        ent_matrix[nab1].energy -= nab2;
        ent_count++;
        genome.id = ent_id++;
        ent_matrix[ent_count] = genome;
        ent_matrix[nab1].bred++;
    }
}

function entMutate(oad1, rarity, intensity) {
    if(randomInteger(0, rarity) === 0) {
        for(nad5 = randomInteger(0, supermutation_rarity); nad5 === 0; nad5 = randomInteger(0, supermutation_rarity)) {intensity += supermutation_intensity};

        oad1.lineage = oad1.lineage.concat(`|${intensity}`);
        oad1.divergence += intensity;

        sad4 = oad1.colour;
        for(nad4 = 0; nad4 < Math.ceil(intensity); nad4++) {
            nad2 = randomInteger(1, 3);
            sad1 = sad4.charAt(nad2);
            nad3 = parseInt(sad1, 16);
            nad3 += 1 + (-2 * randomInteger(0, 1));
            if(nad3 < 0) nad3 = 1;
            if(nad3 > 15) nad3 = 14;
            sad2 = nad3.toString(16);
            if(nad2 === 1) sad3 = `#`.concat(sad2, sad4.substr(2));
            if(nad2 === 2) sad3 = `#`.concat(sad4.charAt(1), sad2, sad4.charAt(3));
            if(nad2 === 3) sad3 = `#`.concat(sad4.substr(1, 2), sad2);
            sad4 = sad3;
        }
        oad1.colour = sad4;

        oad1.radius += randomNumber(-1, 1) / (5 / intensity);
        if(oad1.radius < 4) oad1.radius = 4;
        if(oad1.radius > 100) oad1.radius = 100;
        oad1.circumference = 2 * Math.PI * oad1.radius;
        oad1.area = Math.PI * (oad1.radius ** 2);

        oad1.speed += randomNumber(-1, 1) / (1000 / intensity);
        oad1.speed_energy += randomNumber(-1, 1) / (100000 / intensity);
        oad1.speed_integrity += randomNumber(-1, 1) / (1000 / intensity);
        oad1.speed_fooddistance += randomNumber(-1, 1) / (5000 / intensity);
        oad1.speed_preydistance += randomNumber(-1, 1) / (5000 / intensity);
        oad1.speed_abundance += randomNumber(-1, 1) / (400 / intensity);
        oad1.speed_crowdedness += randomNumber(-1, 1) / (200 / intensity);
        oad1.speed_clock += randomNumber(-1, 1) / (100000 / intensity);

        oad1.healing += randomNumber(-1, 1) / (10000 / intensity);
        oad1.healing_energy += randomNumber(-1, 1) / (100000 / intensity);
        oad1.healing_integrity += randomNumber(-1, 1) / (10000 / intensity);
        oad1.healing_abundance += randomNumber(-1, 1) / (400 / intensity);
        oad1.healing_crowdedness += randomNumber(-1, 1) / (200 / intensity);
        oad1.healing_clock += randomNumber(-1, 1) / (100000 / intensity);
        
        oad1.nurture += randomNumber(-1, 1) / (0.1 / intensity);
        oad1.nurture_integrity += randomNumber(-1, 1) / (100 / intensity);
        oad1.nurture_abundance += randomNumber(-1, 1) / (8 / intensity);
        oad1.nurture_crowdedness += randomNumber(-1, 1) / (4 / intensity);
        oad1.nurture_clock += randomNumber(-1, 1) / (100000 / intensity);

        oad1.fortify += randomNumber(-1, 1) / (0.1 / intensity);
        oad1.fortify_integrity += randomNumber(-1, 1) / (100 / intensity);
        oad1.fortify_abundance += randomNumber(-1, 1) / (8 / intensity);
        oad1.fortify_crowdedness += randomNumber(-1, 1) / (4 / intensity);
        oad1.fortify_clock += randomNumber(-1, 1) / (100000 / intensity);
        if(oad1.fortify <= 0
        && oad1.fortify_integrity <= 0
        && oad1.fortify_abundance <= 0
        && oad1.fortify_crowdedness <= 0
        && oad1.fortify_clock <= 0
        ) oad1.demon = true;

        oad1.breed += randomNumber(-1, 1) / (0.1 / intensity);
        oad1.breed_integrity += randomNumber(-1, 1) / (100 / intensity);
        oad1.breed_abundance += randomNumber(-1, 1) / (8 / intensity);
        oad1.breed_crowdedness += randomNumber(-1, 1) / (4 / intensity);
        oad1.breed_clock += randomNumber(-1, 1) / (100000 / intensity);
        if(oad1.breed > oad1.area
        && oad1.breed_integrity >= 0
        && oad1.breed_abundance >= 0
        && oad1.breed_crowdedness >= 0
        ) oad1.demon = true;

        oad1.fetch += randomNumber(-1, 1) / (0.5 / intensity);
        oad1.fetchmin += randomNumber(-1, 1) / (1 / intensity);
        oad1.fetchmax += randomNumber(-1, 1) / (1 / intensity);
        oad1.fetch_energy += randomNumber(-1, 1) / (1000 / intensity);
        oad1.fetch_integrity += randomNumber(-1, 1) / (100 / intensity);
        oad1.fetch_abundance += randomNumber(-1, 1) / (4 / intensity);
        oad1.fetch_crowdedness += randomNumber(-1, 1) / (2 / intensity);
        oad1.fetch_clock += randomNumber(-1, 1) / (1000 / intensity);
        if(oad1.fetch > culture_diagonal) oad1.fetch = culture_diagonal;
        if(oad1.fetchmin < oad1.radius) oad1.fetchmin = oad1.radius;
        if(oad1.fetchmax > culture_diagonal) oad1.fetchmax = culture_diagonal;
        if(oad1.fetchmax < oad1.fetchmin) oad1.fetchmax = oad1.fetchmin;
        if(oad1.fetchmin > oad1.fetchmax) oad1.fetchmin = oad1.fetchmax;

        oad1.foodsense += randomNumber(-1, 1) / (0.5 / intensity);
        oad1.foodsense_energy += randomNumber(-1, 1) / (1000 / intensity);
        oad1.foodsense_integrity += randomNumber(-1, 1) / (100 / intensity);
        oad1.foodsense_crowdedness += randomNumber(-1, 1) / (2 / intensity);
        oad1.foodsense_clock += randomNumber(-1, 1) / (1000 / intensity);

        oad1.entsense += randomNumber(-1, 1) / (0.1 / intensity);
        oad1.entsense_energy += randomNumber(-1, 1) / (1000 / intensity);
        oad1.entsense_integrity += randomNumber(-1, 1) / (100 / intensity);
        oad1.entsense_abundance += randomNumber(-1, 1) / (4 / intensity);
        oad1.entsense_clock += randomNumber(-1, 1) / (1000 / intensity);

        oad1.preyminenergy += randomNumber(-1, 1) / (0.1 / intensity);
        oad1.preyminenergy_energy += randomNumber(-1, 1) / (1000 / intensity);
        oad1.preyminenergy_integrity += randomNumber(-1, 1) / (100 / intensity);
        oad1.preyminenergy_abundance += randomNumber(-1, 1) / (4 / intensity);
        oad1.preyminenergy_crowdedness += randomNumber(-1, 1) / (2 / intensity);
        oad1.preyminenergy_clock += randomNumber(-1, 1) / (1000 / intensity);

        oad1.preymaxintegrity += randomNumber(-1, 1) / (100 / intensity);
        oad1.preymaxintegrity_energy += randomNumber(-1, 1) / (10000 / intensity);
        oad1.preymaxintegrity_integrity += randomNumber(-1, 1) / (1000 / intensity);
        oad1.preymaxintegrity_abundance += randomNumber(-1, 1) / (40 / intensity);
        oad1.preymaxintegrity_crowdedness += randomNumber(-1, 1) / (20 / intensity);
        oad1.preymaxintegrity_clock += randomNumber(-1, 1) / (10000 / intensity);

        oad1.hunt += randomNumber(-1, 1) / (0.5 / intensity);
        oad1.hunt_energy += randomNumber(-1, 1) / (1000 / intensity);
        oad1.hunt_integrity += randomNumber(-1, 1) / (100 / intensity);
        oad1.hunt_abundance += randomNumber(-1, 1) / (4 / intensity);
        oad1.hunt_crowdedness += randomNumber(-1, 1) / (2 / intensity);
        oad1.hunt_clock += randomNumber(-1, 1) / (1000 / intensity);

        oad1.attackpower += randomNumber(-1, 1) / (100 / intensity);
        oad1.attackpower_energy += randomNumber(-1, 1) / (10000 / intensity);
        oad1.attackpower_integrity += randomNumber(-1, 1) / (1000 / intensity);
        oad1.attackpower_abundance += randomNumber(-1, 1) / (40 / intensity);
        oad1.attackpower_crowdedness += randomNumber(-1, 1) / (20 / intensity);
        oad1.attackpower_clock += randomNumber(-1, 1) / (20 / intensity);

        oad1.tick += randomNumber(-1, 1) / (0.1 / intensity);
        if(oad1.tick < 0) oad1.tick === Math.abs(oad1.tick);
        oad1.tick_energy += randomNumber(-1, 1) / (100000 / intensity);
        oad1.tick_integrity += randomNumber(-1, 1) / (1000 / intensity);
        oad1.tick_fooddistance += randomNumber(-1, 1) / (5000 / intensity);
        oad1.tick_preydistance += randomNumber(-1, 1) / (5000 / intensity);
        oad1.tick_abundance += randomNumber(-1, 1) / (400 / intensity);
        oad1.tick_crowdedness += randomNumber(-1, 1) / (200 / intensity);
        // oad1.tick_clock += randomNumber(-1, 1) / (100000 / intensity);
    }
}

function entMove(no1, external, ece) {
    oo2 = ent_matrix[no1];
    distance = oo2.pace;
    angle = oo2.facing;
    no2 = distance;
    if(external !== 1) {
        if(no2 > oo2.radius) no2 = oo2.radius;
        if(oo2.prey !== 0 && oo2.preydistance <= oo2.radius + ent_matrix[oo2.prey].radius + no2) {
            entFight(no1, no1.prey);
            external = 2;
        } else {
            no3 = oo2.area / 2;
            no4 = ((Math.abs(distance) ** 2) / 10) + (no3 / 10000);
            if(no4 > 0 && oo2.energy >= no4) {
                no5 = 0;
                if(distance > oo2.radius) no5 += no4 - ((Math.abs(oo2.radius) ** 2) / 10) + (no3 / 10000);
                if(distance > oo2.radius) console.log(distance, oo2.radius);
                ent_matrix[no1].waste += no5;
                ent_matrix[no1].energy -= no4;
            } else {
                external = 2;
            }
        }
    }
    // Move
    if(external !== 2) {
        oo1 = findNewPoint(oo2.x, oo2.y, angle, no2);
        xo1 = oo1.xc2;
        yo1 = oo1.yc2;
        ent_matrix[no1].x = xo1;
        ent_matrix[no1].y = yo1;
    }
    if(external !== 1) {
        entCollideEnt(no1);
        entCollideWall(no1, 1);
    } else if(ece === 1) {
        entCollideEnt(no1);
        entCollideWall(no1, 1);
    }
    entFoodCollide(no1);
}

function condenseLineage(nbu1) {
    obu1 = ent_matrix[nbu1];
    sbu1 = obu1.lineage;
    sbu2 = ``;
    nbu3 = 0;
    for(nbu2 = 0; nbu2 < sbu1.length; nbu2++) {
        if(sbu1.charAt(nbu2 - 1) !== ` ` || sbu1.charAt(nbu2) !== `1` || sbu1.charAt(nbu2 + 1) !== `,`) {
            if(nbu3 > 1) {
                sbu2.concat(`1*${nbu3}`);
                nbu3 = 0;
            } else if(nbu3 === 1) {
                sbu2.concat(`, 1`);
            } else sbu2 = sbu2.concat(sbu1.charAt(nbu2));
        } else {
            nbu3++;
        }
    }
    return sbu2;
}

var xbw3;
var ybw3;
function entHighlight(xbw1, ybw1) {
    for(nbw1 = 1; nbw1 <= ent_count; nbw1++) {
        if(findDistance(xbw1, ybw1, ent_matrix[nbw1].x, ent_matrix[nbw1].y) <= ent_matrix[nbw1].radius) {
            // ent_matrix[nbw1].colour = `#090`;
            if(ent_matrix[nbw1].id !== highlight_id) {
                console.log(ent_matrix[nbw1]);
                highlight_id = ent_matrix[nbw1].id;
            }
        }
    }
    xbw3 = xbw1;
    ybw3 = ybw1;
}

function entQuake(np1, min, max) {
    ent_matrix[np1].pace = randomNumber(min, max);
    ent_matrix[np1].facing = randomInteger(0, 359);
    entMove(np1, 1, 1);
}

function entLapse() {
    for(nz1 = 1; nz1 <= ent_count; nz1++) {
        entBreed(nz1);
        entQuake(nz1, 0, 1);
        entFoodCount(nz1);
        entEntCount(nz1);
        entSeek(nz1);
        entHeal(nz1);
        entAge(nz1);
    }
}

// - Food
function foodSpawn(xh1, yh1, nh2) {
    food_count++;
    nh1 = food_count;
    food_matrix[nh1] = {
        x: xh1,
        y: yh1,
        colour: `#900`,
        value: nh2,
        radius: Math.sqrt(nh2 / Math.PI),
        width: 2,
        age: 0
    }
}

function foodEliminate(ni1) {
    for(ni2 = ni1; ni2 < food_count; ni2++) {
        food_matrix[ni2] = food_matrix[ni2 + 1];
    }
    food_matrix[food_count] = {};
    food_count--;
}

function foodAge(nbp1) {
    food_matrix[nbp1].age += 0.1;
    if(food_matrix[nbp1].age > food_matrix[nbp1].value * 3) foodEliminate(nbp1);
}

function foodLapse() {
    for(nbq1 = 1; nbq1 <= food_count; nbq1++) {
        foodAge(nbq1);
    }
}

// Event listeners
htmlCanvas.addEventListener(`mousemove`, e => {
    x = e.clientX;
    y = e.clientY;
    entHighlight(x, y);
})
htmlCanvas.addEventListener(`mouseup`, e => {
    x = e.clientX;
    y = e.clientY;
})
htmlCanvas.addEventListener(`mousedown`, e => {
    x = e.clientX;
    y = e.clientY;
    if(e.button === 0) {
        if(x > culture_x + culture_width || x < culture_x || y > culture_y + culture_height || y < culture_y) {
            highlight_id = -1;
        } else {
            entGenesis(x, y);
        }
    } else if(e.button === 2) {
        if(x > culture_x + culture_width || x < culture_x || y > culture_y + culture_height || y < culture_y) {
            for(n1 = 1; n1 <= ent_count; n1++) {
                if(ent_matrix[n1].id === highlight_id) entMutate(ent_matrix[n1], 0, 1);
            }
        } else {
            foodSpawn(x, y, 100);
        }
    }
})

window.addEventListener(`resize`, resizeCanvas);

htmlCanvas.addEventListener(`contextmenu`, function(e) {
    e.preventDefault();
})

// Play
for(nq1 = 0; nq1 < ent_count_start; nq1++) {
    entGenesis(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10));
}
for(nr1 = 0; nr1 < food_count_min; nr1++) {
    foodSpawn(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10), food_value());
}
resizeCanvas();

nt1 = 0;
nt3 = 0;
;(function () {
    function timeLapse() {
        window.requestAnimationFrame(timeLapse);
        nt1++;
        if(food_count + ent_count < food_count_min) {
            foodSpawn(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10), food_value());
        }
        if(food_count > 0) {
            foodLapse();
        }
        if(ent_count <= 2) {
            for(nt2 = 0; nt2 < ent_count_start; nt2++) {
                entGenesis(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10));
            }
        }
        if(nt1 === 10) {nt1 = 0; nt3++};
        if(nt3 === 100) {
            nt3 = 0;
            if(ent_count > 3) {
                entGenesis(randomNumber(culture_x + 10, culture_x + culture_width - 10), randomNumber(culture_y + 10, culture_y + culture_height - 10));
            }
        }
        entHighlight(xbw3, ybw3);
        entLapse();
        drawAll();
        
    }
    timeLapse();
})();

console.log(ent_matrix);
// Ent Matrix 2
// meta information: lineage, generation
// colour
// dimensions: radius, circumference, area
// energy related: energy, nurture, breed
// speed related: speed, speed_fooddistance, speed_energy
// food related: fetch, fetch_energy

// To-do list
// - Two levels of selection, "hover" and "click". If anything is selected in "click" it overrides anything selected in "hover".
// - Make the maximum clock and oscillator times genetic.
// - "Oscillator", like a clock but instead of starting from zero when it reached the maximum, it goes back to zero in the same way it went up to the maximum.
// - Function which takes an entity and prints out a code for it. The code can be fed into another function to spawn the given entity.
// - Convert decimals to percentages. Healing as a percentage of circumference, speed as a percentage of radius, etc. Convert multipliers to percentages as well.
// - Give the ability to spawn other things for low energy according to genetic traits, even things which can spawn other things.
// - Allow entities to calculate the average difference in colour of entities within their entSense range.
// - Add checkboxes for which information to display (sensing circles, fetch circle, etc.). Display all information about an entity when mousing over it.
// - "Complete mutation" - a mutation so strong that it the new entity has no genetic basis on the on that created it.
// - Line graphs.
// - A table which displays the survival rate of each generation and each lineage, or a line graph which displays that data over time.
// - Genetic "attention" - how long after acquiring a target the entity has to wait before acquiring a new target.
// - Add a "deviation" meter to measure genetic deviation from initial population.