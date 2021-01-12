/*
	libraries for aggregating, reducing, manipulating data:

		http://nytimes.github.io/pourover/

		https://github.com/techfort/LokiJS

		https://github.com/crossfilter/universe
		https://github.com/crossfilter/crossfilter
		https://github.com/crossfilter/reductio
	
	visualization:
		https://dc-js.github.io/dc.js/

*/

const deps = [
	'../shared.styl'
];

const proxy = 'http://localhost:3333/proxy/';
const lericoAPIRoot = "https://rangers.lerico.net/api/";
//get-current-res.js
//getCurrentRes
const lericoResources = {
	pvps: "getPvps",
	guilds: "getGuilds",
	rangers: "getRangersBasics",
	skills: "getSkills",

	translate: "v2/translate?keys=" + [
			"en:ABILITY",
			"en:AREA",
			"en:COMMON",
			"en:CUSTOM",
			"en:CUSTOM_LAB",
			"en:CUSTOM_SHORTFORM",
			"en:CUSTOM_UPGRADE",
			"en:EQUIP",
			"en:ITEM"
			"en:PROPERTIES",
			"en:SKILL",
			"en:UNIT",

			"en:STAGE",
			"en:ADVENT_STAGE",
			"en:SPECIAL_STAGE",
		].join(','),
	materials: 'getMaterials',
	equipments: "v2/equipments",
	abilities: "v2/abilities",
	stagesAdvent: "v2/stages/advent",
	stagesNormal: "v2/stages/normal",
	stagesSpecial: "v2/stages/special"
};
window.lerico = lericoResources;

;(async () => {
	await appendUrls(deps);
	await prism('javascript','', 'prism-preload');

	const cachedFetch = ((cache) => async (url) => {
		const cached = await cache.match(url);
		const headers = { pragma: 'no-cache', 'cache-control': 'no-cache'};
		if(!cached) await cache.put(url, await fetch(url, { headers }));
		return await caches.match(url);
	})(await caches.open('rangersCache'));

	const f = async (url) => (await cachedFetch(proxy + lericoAPIRoot + url)).json();
	const keys = Object.keys(lericoResources);
	for(var i=0, len=keys.length; i<len; i++){
		let data;
		try {
			data = await f(lericoResources[keys[i]])
		} catch(e){}
		lericoResources[keys[i]] = data;
	}

	//guilds
	/*
	await prism("json", '//top guild\n'+ JSON.stringify(
		lericoResources.guilds.sort((a,b)=>b.exp-a.exp)[0]
	, null, 2));
	await prism("json", '//bottom-cutoff guild\n'+ JSON.stringify(
		lericoResources.guilds.sort((a,b)=>b.exp-a.exp)[999]
	, null, 2));
	*/
	

	//skills
	/*
	prism("json", '//one skill\n'+ JSON.stringify(
		lericoResources.skills[0]
	, null, 2));
	*/
	
	let trackProps = {
		skillType: new Set(),
		targetType: new Set(),
		buffFactorType: new Set(),
		factorType: new Set(),
		factorApplyType: new Set(),
		subFactorType: new Set(),
		subFactorApplyType: new Set(),
	};
	let allBuffTargets = new Set();
	lericoResources.skills.forEach(x => {
		Object.keys(trackProps).forEach(key => {
			trackProps[key].add(x[key]);
			x.subSkills.forEach(y => trackProps[key].add(y[key]));
		});
	});
	/*
	prism("json", '//shape of data\n'+ JSON.stringify(
		Object.keys(trackProps).reduce((all, key) => {
			all[key] = Array.from(trackProps[key])
			return all;
		}, {})
	, null, 2));
	*/
	
	
	const speedSkills = lericoResources.skills.filter(x => x.skillType === "BUFF" && x.buffFactorType === 'SPEED'
		|| x.subSkills.find(y => y.skillType === "BUFF" && y.buffFactorType === 'SPEED')
	);

	const rangersWithSpeedSkill = speedSkills.reduce((all, x) => {
		const found = lericoResources.rangers
			.filter(r => ([ r.skillCode, r.skillCode2, r.skillCode3 ].includes(x.skillCode));
		all = [...all, ...found.map(f => ({ ...f, speedSkill: x }))];
		return all;
	}, []);
	rangersWithSpeedSkill.forEach(r => {
		r.speedSkill.name = lerico.translate['en:SKILL'][r.speedSkill.nameCode];
		r.unitName = lerico.translate['en:UNIT'][r.unitNameCode];
	});

	const groupRangerEvos = (rangers) => Object.entries(rangers.reduce((all, one) => {
		const { unitCode } = one;
		const { type, number, evo } = unitCode.match(/(?<type>[a-z])(?<number>\d*)(?<evo>[a-z])/).groups;
		if(!(type && number)) return all;
		all[type+number] = all[type+number] || {};
		all[type+number][evo] = one;
		return all;
	}, {})).map(([unit, body]) => {
		const evoName = {
			h: ' [H]',
			u: ' [U]',
			e: ''
		};
		const generalProperty = body[Object.keys(body)[0]];
		const { unitElement, unitCategoryType, speedSkill, grade } = generalProperty;
		return {
			unitCode: unit,
			unitElement, unitCategoryType, speedSkill, grade,
			unitName: Object.keys(body).map(k=> `${body[k].unitName}${evoName[k]}`).join(', '),
			skillName: Object.keys(body).map(k=> `${body[k].speedSkill.name} ${evoName[k]}`).join(', '),
			...body
		}
	});

	const rangerStyle = htmlToElement(`
		<style>
			.ranger {
				background: #FFFFFF08;
				width: 100%;
				min-height: 2em;
				margin-bottom: .25em;
				padding: 0.1em 0.25em;
				position: relative;
				display: flex;
				font-size: 0.9em;
				font-family: system-ui;
			}
			.ranger > div {
				display: flex;
				flex-direction: column;
				justify-content: center;
			}
			.ranger .icon {
				min-width: 9.4em;
				flex-direction: row;
				justify-content: center;
			}
			.ranger .icon > div {
				min-width: 40px;
				text-align: center;
			}
			.ranger .icon div + div { margin-left: 5px; }
			.ranger img {
				width: auto;
				height: 2.8em;
				margin-bottom: unset;
			}
			.ranger .details {
				position: relative;
				flex: 1;
			}
			.ranger .unitCode { opacity: 0.4; }
			.ranger .unit-category {
				font-weight: bold;
				margin-left: 7px;
				font-size: 0.8em;
			}
			.ranger .element {
				width: 10px;
				height: 10px;
				margin-top: auto;
				margin-bottom: auto;
				border-radius: 50%;
				margin-left: 10px;
				margin-right: 15px;
				box-shadow: 0px 0px 0 1px #0d0d0d55, inset 0px 1px #ffffffa8;;
			}
			.ranger .element.fire { background: #9f1604; }
			.ranger .element.water { background: #0d48c5; }
			.ranger .element.tree { background: #1b6800; }
			.ranger .element.light { background: #8f8f66; }
			.ranger .element.dark { background: #240321; }
		</style>
	`);
	document.body.append(rangerStyle);

//await prism("json", '//one speed ranger\n'+ JSON.stringify(groupRangerEvos(rangersWithSpeedSkill)[0], null, 2));

const getSpeedSkill = (skill) => {
	if(skill.buffFactorType === 'SPEED') return skill;
	return skill.subSkills.find(x => x.buffFactorType === 'SPEED')
};

// a = unit, b = skill
function combineEffect(a, b) {
	//console.log(a);
	//console.log(b);
		var c = {};
		c.unitCode = a.unitCode,
		c.skillCode = b.skillCode,
		c.nameCode = b.nameCode,
		c.descriptionCode = b.descriptionCode,
		c.effectCode = (b.skillType + "-" + b.buffFactorType).replace("-NONE", ""),
		c.iconResourcePath = b.iconResourcePath,
		c.probability = b.probability,
		c.range = b.range,
		c.skillDelayTime = b.skillDelayTime,
		c.dynDuration = !1,
		c.dynFactor = !1,
		c.dispFactor = "",
		c.skillTargetConditionType = b.skillTargetConditionType;
		var d = {
				ADD: "+",
				SUB: "-",
				MUL: "*",
				DIV: "/"
		}
			, e = function(a, b, c) {
				switch (a) {
				case "ADD":
						return b + c;
				case "SUB":
						return b - c;
				case "MUL":
						return b * c;
				case "DIV":
						return b / c;
				case "NONE":
				case null:
						return b;
				default:
						return console.log("undefined operand", a),
						0
				}
		}
			, f = function(a, b, c) {
				return undefined;
				/*
				var d = angular.injector(["ng"]).get("$filter")("number");
				return -1 != ["BUFF-CHANGE_SPLASH", "CHANGE_ENEMY", "CHANGE_FIRE_WATER", "CHANGE_WATER_FIRE", "CHANGE_TREE_FIRE", "CHANGE_WATER_TREE", "KNOCKBACK", "MOVE_ENEMY1", "MOVE_ENEMY2", "POLYMORPH", "SCALE", "SILENCE", "STUN", "SUMMON", "SUMMON_ENEMY", "TEMPT", "UNBEAT"].indexOf(a) || 0 == a.indexOf("CLEAN") ? "-" : b ? "DYN" : -1 != ["BUFF-HP", "BUFF-VAMPIRE", "MIRROR_MAG", "MIRROR_PHY"].indexOf(a) ? d(100 * c, 0) + "%" : 0 == a.indexOf("BUFF-") ? -1 != ["BUFF-SKILLRANGE", "BUFF-SPEED"].indexOf(a) ? "+" + d(100 * (c - 1), 0) + "%" : -1 != ["BUFF-NORMAL_DEF", "BUFF-SPECIAL_DEF"].indexOf(a) ? "+" + d(c, 0) : "+" + d(100 * c, 0) + "%" : 0 == a.indexOf("DEBUFF-") ? -1 != ["DEBUFF-ATK", "DEBUFF-ATKSPD", "DEBUFF-SKILLRANGE", "DEBUFF-SPEED"].indexOf(a) ? "-" + d(100 * (1 - c), 0) + "%" : -1 != ["DEBUFF-NORMAL_DEF", "DEBUFF-SPECIAL_DEF"].indexOf(a) ? "-" + d(c, 0) : "-" + d(100 * c, 0) + "%" : -1 != ["DMG", "DOT", "DOTHEAL", "HEAL"].indexOf(a) ? d(100 * c, 0) + "%" : (console.log("unknown factor type for skillEffect", a),
				Math.round(1e3 * c) / 1e3)
				*/
		}
			, g = function(a, b, c) {
				return -1 != ["CHANGE_ENEMY", "DMG", "HEAL", "KNOCKBACK", "MOVE_ENEMY2"].indexOf(a) || 0 == a.indexOf("CLEAN_") ? "-" : b ? "DYN" : Math.round(1e3 * c) / 1e3
		};
	//debugger
		switch (b.factorType) {
		case "ATTACK":
		case "HP":
				c.factor = b.factor;
				break;
		case "GRADE":
				c.factor = e(b.factorApplyType, a.grade, b.factor);
				break;
		case "LEVEL":
				c.dynFactor = !0,
				c.dynFactorField = b.factorType,
				c.dynFactorEffector = d[b.factorApplyType] + (b.factor > 10 ? b.factor.toFixed(0) : 100 * parseFloat(b.factor.toPrecision(4)) + "%");
				break;
		case "NONE":
				c.factor = 0;
				break;
		default:
				console.log("undefined factorType", b.factorType),
				c.factor = 0
		}
		switch (c.dispFactor = f(c.effectCode, c.dynFactor, c.factor),
		b.subFactorType) {
		case "NONE":
				c.duration = e(b.subFactorApplyType, 0, b.subFactor);
				break;
		case "GRADE":
				c.duration = e(b.subFactorApplyType, a.grade, b.subFactor);
				break;
		case "LEVEL":
				c.dynDuration = !0,
				c.dynDurationField = b.subFactorType,
				c.dynDurationEffector = d[b.subFactorApplyType] + parseFloat(b.subFactor.toPrecision(3));
				break;
		default:
				console.log("undefined subFactorType", b.subFactorType),
				c.duration = 0
		}
		return c.dispDuration = g(c.effectCode, c.dynDuration, c.duration),
		c
}

const poboCombine = (factor, type, grade) => {
	if(type === 'ADD') return grade + factor;
	return grade - factor;
}

const foundUnit = groupRangerEvos(rangersWithSpeedSkill).find(x => x.unitName.includes('Ais'));
const effectCombined = combineEffect(foundUnit.u, getSpeedSkill(foundUnit.speedSkill));
//await prism("json", '//foundUnit\n'+ JSON.stringify(foundUnit, null, 2));
//await prism("json", '//combineEffect\n'+ JSON.stringify(effectCombined, null, 2));

//combineEffect(a, b)

	groupRangerEvos(rangersWithSpeedSkill)
		//.map(x => `${x.e ? x.e.unitName : x.unitName} - - - ${x.skillName}`)
		.filter(x => x.u || x.h)
		.sort((a,b) => Number(a.unitCode.slice(1)) < 2000 && Number(b.unitCode.slice(1)) < 2000
			? Number(b.unitCode.slice(1)) - Number(a.unitCode.slice(1))
			: Number(a.unitCode.slice(1)) - Number(b.unitCode.slice(1))
		)
		.forEach(x => {
			const speed = getSpeedSkill(x.speedSkill);
			const factor = poboCombine(speed.factor, speed.factorApplyType, x.grade);
			const dur = poboCombine(speed.subFactor, speed.subFactorApplyType, x.grade);
			const el = htmlToElement(`
				<div class="ranger">
					<div class="icon">
					${[x.e,x.h,x.u].filter(x=>!!x).map(u => `
						<div>
						<img src="${proxy}https://rangers.lerico.net/res/${u.unitCode}/${u.unitCode}-thum.png">
						</div>
					`).join('\n')}
					</div>
					<div class="unit-category">${x.unitCategoryType}</div>
					<div class="element ${x.unitElement}"></div>
					<div class="details">
						<div>NAME: ${x.e ? x.e.unitName : x.unitName}, SKILL: ${x.skillName}</div>
						<div>RANGE: ${speed.range}, FACTOR: ${((factor-1)*100).toFixed(0)}%, DUR: ${dur}s, PROB: ${(100 * speed.probability).toFixed(0)}%, CD: ${speed.skillDelayTime}s</div>
					</div>
					<div class="unitCode">${x.unitCode}</div>
				</div>
			`);
			document.body.append(el);
		})


	/*

	what are the things that make OP rangers OP?
		
		skills
		gears
		stats
			- HP
			- Cost
			- Attack
			- Defense
			- Move Speed
			- ... etc (see skills)

	*/

})();
