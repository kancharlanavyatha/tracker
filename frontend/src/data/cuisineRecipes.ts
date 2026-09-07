import type { Phase, User } from '../api';

export interface Recipe {
  id: string;
  name: string;
  cuisine: 'Indian' | 'Mediterranean' | 'East Asian' | 'Mexican' | 'Middle Eastern' | 'Continental';
  dietary: 'veg' | 'non-veg' | 'vegan' | 'eggetarian' | 'pescatarian';
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  iron_mg: number;
  magnesium_mg: number;
  prep_time_mins: number;
  cook_time_mins: number;
  phase_benefit: string;
  recommended_phases: string[];
  allergens: string[];
  tags: string[];
  description: string;
  ingredients: string[];
  instructions: string[];
}

export interface DailyIntakeTargets {
  calories: number;
  protein_g: number;
  protein_per_kg: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  hydration_l: number;
  phase_metabolic_note: string;
  bmr: number;
}

export function calculateIntakeTargets(user?: User | null, phase?: Phase | null): DailyIntakeTargets {
  const weight = user?.weight_kg ?? 62;
  const height = user?.height_cm ?? 168;
  const age = user?.age ?? 24;
  const training = user?.training_level ?? 'Collegiate Distance Runner';
  const phaseName = (phase?.phase ?? 'follicular').toLowerCase();

  // 1. Mifflin-St Jeor BMR for women
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age - 161);

  // 2. Physical Activity Level (PAL)
  let pal = 1.45;
  if (training.includes('Collegiate') || training.includes('HIIT') || training.includes('CrossFit')) {
    pal = 1.75;
  } else if (training.includes('Endurance') || training.includes('Marathoner')) {
    pal = 1.70;
  } else if (training.includes('Strength') || training.includes('Powerlifting')) {
    pal = 1.60;
  } else if (training.includes('Sports')) {
    pal = 1.65;
  } else if (training.includes('Low Impact')) {
    pal = 1.30;
  } else if (training.includes('Wellness') || training.includes('Recovery')) {
    pal = 1.25;
  }

  // 3. Menstrual Phase Caloric & Metabolic Shift
  // Progesterone during the luteal phase elevates core body temperature by 0.3-0.5°C, increasing resting metabolic rate by 100-250 kcal/day.
  let phaseCalorieShift = 0;
  let phaseNote = 'Follicular phase: High insulin sensitivity and efficient glycogen replenishment.';

  if (phaseName === 'luteal') {
    phaseCalorieShift = 180;
    phaseNote = 'Luteal phase: Progesterone elevates basal metabolic rate by ~180 kcal/day. Prioritize complex carbs and magnesium to steady blood sugar.';
  } else if (phaseName === 'menstrual') {
    phaseCalorieShift = 50;
    phaseNote = 'Menstrual phase: Energy demands focus on immune maintenance and uterine renewal. Prioritize bioavailable iron and warming foods.';
  } else if (phaseName === 'ovulatory') {
    phaseCalorieShift = 80;
    phaseNote = 'Ovulation phase: Estrogen and testosterone peak. Optimal strength and high-intensity energy output.';
  }

  const baseTdee = bmr * pal;
  const totalCalories = Math.round(baseTdee + phaseCalorieShift);

  // 4. Protein Target
  const isHighIntensity = pal >= 1.6;
  const proteinGramsPerKg = isHighIntensity ? 1.9 : 1.4;
  const proteinGrams = Math.round(weight * proteinGramsPerKg);

  // 5. Fat Target (higher in luteal for steroid hormone synthesis)
  const fatPct = phaseName === 'luteal' ? 0.32 : 0.25;
  const fatGrams = Math.round((totalCalories * fatPct) / 9);

  // 6. Carb Target (remaining calories)
  const carbCalories = totalCalories - (proteinGrams * 4 + fatGrams * 9);
  const carbGrams = Math.max(120, Math.round(carbCalories / 4));

  // 7. Dietary Fibre Target (28-35g for hepatic estrogen binding & bowel regularity)
  const fiberGrams = 32;

  // 8. Hydration Target
  const hydrationLiters = Number(((weight * 0.035) + (pal > 1.5 ? 0.75 : 0.4)).toFixed(1));

  return {
    calories: totalCalories,
    protein_g: proteinGrams,
    protein_per_kg: Number(proteinGramsPerKg.toFixed(1)),
    carbs_g: carbGrams,
    fats_g: fatGrams,
    fiber_g: fiberGrams,
    hydration_l: hydrationLiters,
    phase_metabolic_note: phaseNote,
    bmr,
  };
}

export const CUISINES = [
  'All Cuisines',
  'Indian',
  'Mediterranean',
  'East Asian',
  'Mexican',
  'Middle Eastern',
  'Continental',
] as const;

export const DIETARY_PREFERENCES = [
  { id: 'all', label: 'All Diets' },
  { id: 'veg', label: 'Vegetarian' },
  { id: 'non-veg', label: 'Non-Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'pescatarian', label: 'Pescatarian' },
] as const;

export const ALLERGY_FILTERS = [
  { id: 'none', label: 'All Ingredients (No Exclusions)' },
  { id: 'gluten', label: 'Gluten-Free' },
  { id: 'dairy', label: 'Dairy-Free' },
  { id: 'nuts', label: 'Nut-Free' },
] as const;

export const NUTRITION_FOCUS_OPTIONS = [
  { id: 'all', label: 'All Nutrition Focuses' },
  { id: 'high_protein', label: 'High Protein (> 30g)' },
  { id: 'high_iron', label: 'High Iron (> 4.5mg)' },
  { id: 'high_magnesium', label: 'High Magnesium (> 90mg)' },
  { id: 'low_calorie', label: 'Under 450 Calories' },
] as const;

export const RECIPES_DATASET: Recipe[] = [
  // --- INDIAN ---
  {
    id: 'ind-1',
    name: 'Palak Paneer with Spiced Brown Basmati',
    cuisine: 'Indian',
    dietary: 'veg',
    calories: 440,
    protein_g: 22,
    carbs_g: 48,
    fats_g: 18,
    fiber_g: 8,
    iron_mg: 6.8,
    magnesium_mg: 95,
    prep_time_mins: 15,
    cook_time_mins: 20,
    phase_benefit: 'High Iron & Folate for Menstrual blood replenish',
    recommended_phases: ['menstrual', 'follicular'],
    allergens: ['dairy'],
    tags: ['Gluten-Free', 'High Iron', 'Comforting'],
    description: 'Tender cottage cheese cubes simmered in fresh pureed spinach, ginger, garlic, and roasted cumin.',
    ingredients: ['250g Fresh baby spinach', '120g Low-fat paneer cubes', '1 tsp Ginger-garlic paste', '75g Brown basmati rice', '1 tsp Cumin & turmeric', '1 tsp Cold-pressed ghee'],
    instructions: [
      'Blanch the baby spinach in boiling water for 2 minutes, then plunge into cold water and blend into a smooth puree.',
      'Heat ghee in a pan, add cumin seeds, minced garlic, ginger, and turmeric until aromatic.',
      'Pour in the blended spinach puree and simmer on low heat for 5 minutes.',
      'Add paneer cubes and a pinch of sea salt, simmering gently until warmed through.',
      'Serve alongside steamed brown basmati rice.',
    ],
  },
  {
    id: 'ind-2',
    name: 'Tandoori Spiced Salmon & Quinoa Pilaf',
    cuisine: 'Indian',
    dietary: 'pescatarian',
    calories: 520,
    protein_g: 38,
    carbs_g: 42,
    fats_g: 20,
    fiber_g: 6,
    iron_mg: 4.2,
    magnesium_mg: 110,
    prep_time_mins: 15,
    cook_time_mins: 18,
    phase_benefit: 'Omega-3 fatty acids soothe luteal inflammation & breast tenderness',
    recommended_phases: ['luteal', 'ovulation'],
    allergens: ['dairy'],
    tags: ['Gluten-Free', 'High Protein', 'Omega-3 Rich'],
    description: 'Wild salmon fillet marinated in Greek yogurt and fragrant tandoori spices, baked until crisp and served over lemon quinoa.',
    ingredients: ['180g Wild salmon fillet', '2 tbsp Greek yogurt', '70g Tri-color quinoa', '1 tbsp Tandoori masala & turmeric', '1 Lemon (juiced)', 'Fresh coriander'],
    instructions: [
      'Whisk Greek yogurt with tandoori spices, lemon juice, and a pinch of salt.',
      'Coat the salmon fillet thoroughly and let marinate for 10 minutes.',
      'Rinse quinoa and simmer in 150ml water for 14 minutes until fluffy.',
      'Bake or air-fry the salmon at 200°C (400°F) for 12-14 minutes until tender with crisp edges.',
      'Toss quinoa with lemon zest and fresh coriander, plating the salmon on top.',
    ],
  },
  {
    id: 'ind-3',
    name: 'Yellow Dal Tadka & Steamed Red Rice',
    cuisine: 'Indian',
    dietary: 'vegan',
    calories: 380,
    protein_g: 18,
    carbs_g: 62,
    fats_g: 7,
    fiber_g: 11,
    iron_mg: 5.4,
    magnesium_mg: 82,
    prep_time_mins: 10,
    cook_time_mins: 25,
    phase_benefit: 'Easy digestion and steady slow-release glucose for luteal PMS',
    recommended_phases: ['menstrual', 'luteal'],
    allergens: [],
    tags: ['Vegan', 'Gluten-Free', 'Nut-Free', 'Dairy-Free'],
    description: 'Light toor and moong lentils tempered with mustard seeds, curry leaves, hing, and fresh tomato over fiber-rich red rice.',
    ingredients: ['50g Toor dal', '40g Yellow moong dal', '60g Matta red rice', '1 Fresh tomato (diced)', '1 tsp Mustard seeds & curry leaves', 'Pinch of asafoetida (hing) & turmeric'],
    instructions: [
      'Pressure cook or boil toor and moong lentils with water, turmeric, and salt until completely soft.',
      'Cook red rice in 180ml boiling water until tender and nutty.',
      'In a small skillet, heat 1 tsp oil, add mustard seeds until they crackle, then add curry leaves and diced tomato.',
      'Pour the aromatic tempering into the cooked lentils and stir well.',
      'Serve hot over steamed red rice.',
    ],
  },
  {
    id: 'ind-4',
    name: 'Methi Egg Bhurji Bowl with Roti',
    cuisine: 'Indian',
    dietary: 'eggetarian',
    calories: 410,
    protein_g: 26,
    carbs_g: 36,
    fats_g: 16,
    fiber_g: 7,
    iron_mg: 4.9,
    magnesium_mg: 76,
    prep_time_mins: 10,
    cook_time_mins: 12,
    phase_benefit: 'Choline & Vitamin B12 for follicular ovarian follicle maturation',
    recommended_phases: ['follicular', 'ovulation'],
    allergens: ['gluten'],
    tags: ['High Protein', 'Nut-Free', 'Dairy-Free'],
    description: 'Farm-fresh eggs scrambled with hormone-balancing fenugreek leaves (methi), onions, and green chilies.',
    ingredients: ['3 Whole pasture-raised eggs', '1 cup Fresh fenugreek (methi) leaves chopped', '1 Red onion (finely chopped)', '2 Whole wheat phulkas/rotis', '1 Green chili & 1/2 tsp turmeric'],
    instructions: [
      'Whisk the eggs in a bowl with a pinch of sea salt and pepper.',
      'Sauté chopped onions and green chili in 1 tsp olive oil until translucent.',
      'Add chopped fenugreek leaves and turmeric, cooking for 3 minutes until wilted.',
      'Pour in the whisked eggs and gently scramble over medium heat until creamy and set.',
      'Serve warm alongside two light whole wheat phulkas.',
    ],
  },
  {
    id: 'ind-5',
    name: 'Murgh Tikka with Mint Chutney & Foxtail Millet',
    cuisine: 'Indian',
    dietary: 'non-veg',
    calories: 480,
    protein_g: 44,
    carbs_g: 38,
    fats_g: 14,
    fiber_g: 6,
    iron_mg: 4.1,
    magnesium_mg: 85,
    prep_time_mins: 15,
    cook_time_mins: 18,
    phase_benefit: 'Lean protein fueling peak athletic training during ovulation',
    recommended_phases: ['ovulation', 'follicular'],
    allergens: ['dairy'],
    tags: ['Gluten-Free', 'High Protein', 'Lean'],
    description: 'Boneless chicken breast pieces marinated in strained curd, crushed kasuri methi, and char-grilled with foxtail millet.',
    ingredients: ['180g Skinless chicken breast cubes', '3 tbsp Strained hung curd', '60g Foxtail millet', '1 tbsp Mint coriander chutney', '1 tsp Kashmiri chili & roasted cumin'],
    instructions: [
      'Marinate chicken cubes in hung curd, chili powder, cumin, kasuri methi, and salt for 15 minutes.',
      'Simmer foxtail millet in 150ml water for 12 minutes until fluffy.',
      'Thread chicken onto skewers or place on a grilling pan on high heat for 12 minutes, turning until charred.',
      'Serve with warm millet and fresh mint-coriander yogurt chutney.',
    ],
  },

  // --- MEDITERRANEAN ---
  {
    id: 'med-1',
    name: 'Greek Lemon Herb Chicken & Wild Orzo',
    cuisine: 'Mediterranean',
    dietary: 'non-veg',
    calories: 490,
    protein_g: 42,
    carbs_g: 44,
    fats_g: 15,
    fiber_g: 5,
    iron_mg: 3.6,
    magnesium_mg: 72,
    prep_time_mins: 15,
    cook_time_mins: 20,
    phase_benefit: 'Zinc & bioavailable protein for ovulation muscle recovery',
    recommended_phases: ['ovulation', 'follicular'],
    allergens: ['gluten'],
    tags: ['Nut-Free', 'High Protein', 'Mediterranean Diet'],
    description: 'Rosemary and oregano grilled chicken thighs paired with tender orzo pasta tossed in sun-dried tomatoes and kalamata olives.',
    ingredients: ['170g Chicken breast or tenderloins', '60g Whole wheat orzo', '6 Kalamata olives pitted', '3 Sun-dried tomatoes sliced', '1 tbsp Fresh oregano, garlic & lemon juice'],
    instructions: [
      'Marinate chicken in lemon juice, minced garlic, oregano, olive oil, and sea salt.',
      'Cook orzo in boiling salted water for 9 minutes, drain and toss with sun-dried tomatoes and olives.',
      'Grill the chicken in a hot skillet for 6-7 minutes per side until golden and fully cooked.',
      'Slice chicken and arrange over the warm herb orzo.',
    ],
  },
  {
    id: 'med-2',
    name: 'Mediterranean Chickpea & Roasted Vegetable Tahini Bowl',
    cuisine: 'Mediterranean',
    dietary: 'vegan',
    calories: 430,
    protein_g: 16,
    carbs_g: 58,
    fats_g: 16,
    fiber_g: 14,
    iron_mg: 5.8,
    magnesium_mg: 120,
    prep_time_mins: 12,
    cook_time_mins: 22,
    phase_benefit: 'Magnesium & zinc rich tahini soothing luteal cramps & muscle tension',
    recommended_phases: ['luteal', 'menstrual'],
    allergens: [],
    tags: ['Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'],
    description: 'Crispy roasted chickpeas, zucchini, red bell pepper, and purple cabbage drizzled with creamy garlic tahini sauce.',
    ingredients: ['200g Cooked chickpeas', '1 Medium zucchini (sliced)', '1 Red bell pepper (diced)', '2 tbsp Pure sesame tahini', '1 Lemon juiced & 1 clove garlic minced'],
    instructions: [
      'Toss chickpeas, zucchini, and bell peppers with 1 tsp olive oil, paprika, and sea salt.',
      'Roast on a baking sheet at 200°C (400°F) for 20 minutes until edges are caramelized.',
      'Whisk tahini with lemon juice, minced garlic, and warm water until velvety smooth.',
      'Assemble roasted vegetables and chickpeas in a bowl and drizzle with the tahini dressing.',
    ],
  },
  {
    id: 'med-3',
    name: 'Pan-Seared Sea Bass with Olive & Artichoke Salad',
    cuisine: 'Mediterranean',
    dietary: 'pescatarian',
    calories: 460,
    protein_g: 36,
    carbs_g: 22,
    fats_g: 24,
    fiber_g: 6,
    iron_mg: 2.8,
    magnesium_mg: 88,
    prep_time_mins: 10,
    cook_time_mins: 12,
    phase_benefit: 'Anti-inflammatory polyphenols & marine omega-3s',
    recommended_phases: ['follicular', 'ovulation'],
    allergens: [],
    tags: ['Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto-Friendly'],
    description: 'Crisp golden skin sea bass filet served over steamed baby artichokes, capers, kalamata olives, and cold-pressed olive oil.',
    ingredients: ['180g Sea bass fillet (skin on)', '100g Steamed baby artichoke hearts', '1 tbsp Capers & 6 kalamata olives', '1 tbsp Extra virgin olive oil', 'Fresh dill & lemon wedges'],
    instructions: [
      'Score the skin of the sea bass fillet and pat thoroughly dry with a paper towel.',
      'Heat olive oil in a non-stick pan over medium-high heat. Sear fish skin-side down for 4 minutes until crisp.',
      'Flip gently and cook for an additional 2-3 minutes until cooked through.',
      'Warm artichoke hearts, capers, and olives with fresh dill and lemon juice.',
      'Plate the crispy sea bass over the warm artichoke salad.',
    ],
  },
  {
    id: 'med-4',
    name: 'Shakshuka with Soft Poached Eggs & Sourdough',
    cuisine: 'Mediterranean',
    dietary: 'eggetarian',
    calories: 420,
    protein_g: 24,
    carbs_g: 40,
    fats_g: 18,
    fiber_g: 7,
    iron_mg: 4.8,
    magnesium_mg: 65,
    prep_time_mins: 10,
    cook_time_mins: 16,
    phase_benefit: 'Lycopene and bioavailable lutein supporting progesterone balance',
    recommended_phases: ['luteal', 'menstrual'],
    allergens: ['gluten'],
    tags: ['Nut-Free', 'Comfort Food', 'Anti-Inflammatory'],
    description: 'Eggs poached gently in a rich, spiced sauce of crushed Roma tomatoes, roasted bell peppers, garlic, and ground cumin.',
    ingredients: ['3 Large organic eggs', '250g Crushed San Marzano tomatoes', '1 Bell pepper (diced)', '1 Slice artisan whole grain sourdough', '1 tsp Ground cumin & smoked paprika', 'Fresh parsley'],
    instructions: [
      'Sauté diced bell peppers, onion, and garlic in a skillet until soft.',
      'Add crushed tomatoes, cumin, paprika, and simmer for 8 minutes until sauce thickens.',
      'Use a spoon to create three wells in the simmering sauce and crack an egg into each.',
      'Cover pan with a lid and cook on low for 5-6 minutes until egg whites are set and yolks remain runny.',
      'Garnish with chopped parsley and serve with toasted sourdough.',
    ],
  },

  // --- EAST ASIAN ---
  {
    id: 'ea-1',
    name: 'Ginger Garlic Tofu & Bok Choy Soba Noodle Bowl',
    cuisine: 'East Asian',
    dietary: 'vegan',
    calories: 410,
    protein_g: 21,
    carbs_g: 54,
    fats_g: 12,
    fiber_g: 8,
    iron_mg: 6.2,
    magnesium_mg: 105,
    prep_time_mins: 12,
    cook_time_mins: 12,
    phase_benefit: 'Soy isoflavones promote gentle estrogen balance in early follicular phase',
    recommended_phases: ['follicular'],
    allergens: ['gluten', 'soy'],
    tags: ['Vegan', 'Dairy-Free', 'Nut-Free'],
    description: 'Glazed organic firm tofu cubes with baby bok choy and shiitake mushrooms over Japanese 100% buckwheat soba.',
    ingredients: ['150g Organic firm tofu (cubed)', '60g Buckwheat soba noodles', '2 Heads baby bok choy', '4 Fresh shiitake mushrooms', '1 tbsp Tamari soy sauce, 1 tsp sesame oil & grated ginger'],
    instructions: [
      'Cook buckwheat soba noodles in boiling water for 5 minutes, rinse thoroughly under cold water.',
      'Pan-sear cubed tofu in sesame oil until golden on all sides.',
      'Add sliced shiitakes, grated ginger, and bok choy, stir-frying for 3 minutes.',
      'Toss in noodles, tamari, and a splash of vegetable broth to coat.',
      'Serve warm with toasted sesame seeds.',
    ],
  },
  {
    id: 'ea-2',
    name: 'Korean Kimchi & Egg Brown Rice Dolsot Bibimbap',
    cuisine: 'East Asian',
    dietary: 'eggetarian',
    calories: 450,
    protein_g: 20,
    carbs_g: 62,
    fats_g: 13,
    fiber_g: 9,
    iron_mg: 4.5,
    magnesium_mg: 88,
    prep_time_mins: 12,
    cook_time_mins: 15,
    phase_benefit: 'Probiotic kimchi optimizes gut microbiome for healthy hormone detoxification',
    recommended_phases: ['follicular', 'luteal'],
    allergens: ['soy'],
    tags: ['Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Probiotic'],
    description: 'Warm brown rice topped with probiotic aged kimchi, steamed spinach, shredded carrots, toasted sesame, and a sunny egg.',
    ingredients: ['150g Cooked short-grain brown rice', '50g Aged cabbage kimchi', '1 Organic egg', '50g Steamed baby spinach', '1/2 Carrot shredded', '1 tsp Sesame oil & gochujang'],
    instructions: [
      'Warm the cooked brown rice in a bowl.',
      'Lightly sauté spinach and carrots with sesame oil and a touch of salt.',
      'Fry the egg sunny-side up in a lightly oiled pan until edges are crisp.',
      'Arrange the kimchi, sautéed spinach, carrots, and sunny egg neatly atop the warm rice.',
      'Add a teaspoon of gochujang and mix together thoroughly before eating.',
    ],
  },
  {
    id: 'ea-3',
    name: 'Steamed Ginger Soy Salmon with Edamame',
    cuisine: 'East Asian',
    dietary: 'pescatarian',
    calories: 490,
    protein_g: 40,
    carbs_g: 30,
    fats_g: 21,
    fiber_g: 7,
    iron_mg: 3.9,
    magnesium_mg: 135,
    phase_benefit: 'High magnesium relaxes uterine smooth muscle and diminishes premenstrual bloating',
    recommended_phases: ['luteal', 'menstrual'],
    allergens: ['soy'],
    tags: ['Gluten-Free', 'Dairy-Free', 'High Protein', 'Nut-Free'],
    description: 'Gentle steamed salmon fillet infused with fresh ginger shreds and scallions, served with steamed edamame pods and jasmine rice.',
    ingredients: ['180g Salmon fillet', '80g Steamed shelled edamame', '2 Scallions (julienned)', '1 tbsp Fresh ginger matchsticks', '1 tbsp Gluten-free tamari & 1 tsp mirin', '50g Steamed jasmine rice'],
    instructions: [
      'Place salmon in a steamer basket or parchment pouch, topping with ginger matchsticks and scallions.',
      'Steam over simmering water for 9-11 minutes until the fish flakes easily.',
      'Whisk tamari, mirin, and a drop of toasted sesame oil, pouring over the hot fish.',
      'Serve alongside steamed edamame and jasmine rice.',
    ],
  },
  {
    id: 'ea-4',
    name: 'Teriyaki Free-Range Chicken Stir-Fry & Broccoli',
    cuisine: 'East Asian',
    dietary: 'non-veg',
    calories: 470,
    protein_g: 45,
    carbs_g: 42,
    fats_g: 11,
    fiber_g: 6,
    iron_mg: 3.4,
    magnesium_mg: 78,
    prep_time_mins: 12,
    cook_time_mins: 14,
    phase_benefit: 'Sulforaphane in broccoli assists liver clearance of used estrogen',
    recommended_phases: ['ovulation', 'follicular'],
    allergens: ['soy'],
    tags: ['Dairy-Free', 'High Protein', 'Nut-Free'],
    description: 'Tender chicken breast strips wok-tossed with crisp broccoli florets, snap peas, and housemade low-glycemic ginger glaze.',
    ingredients: ['180g Chicken breast strips', '150g Fresh broccoli florets', '50g Sugar snap peas', '60g Cooked brown rice', '1 tbsp Low-sodium tamari, garlic, and 1 tsp pure maple syrup'],
    instructions: [
      'Heat a wok or skillet over high heat with 1 tsp avocado oil.',
      'Stir-fry chicken breast strips for 5-6 minutes until lightly browned and cooked through.',
      'Add broccoli florets, snap peas, and 2 tbsp water, covering for 2 minutes to steam-fry.',
      'Stir in tamari, garlic, and maple syrup glaze, tossing for 1 minute until glossy.',
      'Serve immediately over steamed brown rice.',
    ],
  },

  // --- MEXICAN ---
  {
    id: 'mex-1',
    name: 'Black Bean & Roasted Corn Avocado Power Bowl',
    cuisine: 'Mexican',
    dietary: 'vegan',
    calories: 430,
    protein_g: 17,
    carbs_g: 65,
    fats_g: 14,
    fiber_g: 16,
    iron_mg: 5.1,
    magnesium_mg: 115,
    prep_time_mins: 12,
    cook_time_mins: 15,
    phase_benefit: 'Fiber from black beans binds excess circulating estrogen to prevent heavy flow',
    recommended_phases: ['follicular', 'luteal'],
    allergens: [],
    tags: ['Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'],
    description: 'Slow-simmered black beans, fire-roasted sweet corn, fresh pico de gallo, and creamy Hass avocado slices over brown rice.',
    ingredients: ['180g Cooked black beans', '60g Roasted sweet corn', '1/2 Hass avocado sliced', '3 tbsp Fresh tomato pico de gallo', '60g Steamed brown rice', 'Fresh cilantro & lime'],
    instructions: [
      'Warm the black beans in a pot with cumin, garlic powder, and a squeeze of lime.',
      'Char the sweet corn in a dry cast iron skillet for 4 minutes until golden spots appear.',
      'Spoon warm brown rice into a bowl, layering black beans, charred corn, and fresh pico de gallo.',
      'Top with fresh avocado slices, chopped cilantro, and lime wedges.',
    ],
  },
  {
    id: 'mex-2',
    name: 'Chipotle Grilled Shrimp Soft Corn Tacos',
    cuisine: 'Mexican',
    dietary: 'pescatarian',
    calories: 420,
    protein_g: 34,
    carbs_g: 38,
    fats_g: 12,
    fiber_g: 6,
    iron_mg: 3.8,
    magnesium_mg: 70,
    prep_time_mins: 15,
    cook_time_mins: 8,
    phase_benefit: 'High selenium and lean protein for cellular recovery during ovulation',
    recommended_phases: ['ovulation', 'follicular'],
    allergens: [],
    tags: ['Gluten-Free', 'Dairy-Free', 'Nut-Free', 'High Protein'],
    description: 'Jumbo wild shrimp marinated in smoky chipotle and lime, nestled in warm stone-ground corn tortillas with crunchy cilantro slaw.',
    ingredients: ['180g Wild caught shrimp (peeled)', '3 Stone-ground corn tortillas', '1 tsp Chipotle paste & 1 lime', '1 cup Shredded purple cabbage', 'Fresh cilantro & 1/4 avocado mashed'],
    instructions: [
      'Toss peeled shrimp with chipotle paste, lime juice, and a pinch of sea salt.',
      'Toss shredded purple cabbage with lime juice, cilantro, and salt for the crunchy slaw.',
      'Sear shrimp in a smoking hot skillet for 2 minutes per side until pink and opaque.',
      'Warm corn tortillas on a dry skillet for 30 seconds each.',
      'Fill tortillas with slaw, grilled shrimp, and avocado mash.',
    ],
  },
  {
    id: 'mex-3',
    name: 'Huevos Rancheros with Warm Corn Tortillas',
    cuisine: 'Mexican',
    dietary: 'eggetarian',
    calories: 440,
    protein_g: 22,
    carbs_g: 45,
    fats_g: 18,
    fiber_g: 9,
    iron_mg: 4.2,
    magnesium_mg: 82,
    phase_benefit: 'Vitamin D & healthy fats nourishing progesterone production',
    recommended_phases: ['luteal', 'menstrual'],
    allergens: ['dairy'],
    tags: ['Gluten-Free', 'Nut-Free', 'Comfort Food'],
    description: 'Two sunny eggs perched over warmed corn tortillas, smothered in ranchero tomato chili sauce and cotija cheese sprinkle.',
    ingredients: ['2 Farm pasture eggs', '2 Stone-ground corn tortillas', '100g Cooked pinto beans', '100g Warm ranchero tomato salsa', '20g Crumbled cotija or feta cheese', 'Fresh cilantro'],
    instructions: [
      'Warm pinto beans in a skillet, gently mashing half with a fork for texture.',
      'Warm tortillas in a dry pan until pliable and soft, then place on a plate.',
      'Fry eggs sunny-side up in a lightly oiled skillet until whites are set.',
      'Spread mashed beans onto tortillas, set fried eggs on top, and spoon warm ranchero salsa over.',
      'Sprinkle with crumbled cheese and cilantro.',
    ],
  },
  {
    id: 'mex-4',
    name: 'Pollo Asado Bowl with Guacamole & Cilantro Lime Quinoa',
    cuisine: 'Mexican',
    dietary: 'non-veg',
    calories: 510,
    protein_g: 46,
    carbs_g: 40,
    fats_g: 17,
    fiber_g: 8,
    iron_mg: 4.0,
    magnesium_mg: 92,
    phase_benefit: 'Complete branch-chain amino acids (BCAAs) for strength training performance',
    recommended_phases: ['ovulation', 'follicular'],
    allergens: [],
    tags: ['Gluten-Free', 'Dairy-Free', 'Nut-Free', 'High Protein'],
    description: 'Citrus and cumin marinated grilled chicken breast, fluffy lime quinoa, sweet bell peppers, and freshly mashed guacamole.',
    ingredients: ['180g Chicken breast', '60g Quinoa cooked in vegetable broth', '1 Bell pepper (sliced and grilled)', '1/2 Avocado mashed with lime and sea salt', '1 Lime, cumin & garlic marinade'],
    instructions: [
      'Marinate chicken breast with lime juice, cumin, garlic, and smoked paprika for 15 minutes.',
      'Grill chicken over medium-high heat for 6-7 minutes per side until charred and cooked through.',
      'Grill bell pepper slices until tender with grill marks.',
      'Fluff cooked quinoa with lime juice, lime zest, and cilantro.',
      'Slice chicken and arrange over quinoa with grilled peppers and freshly mashed guacamole.',
    ],
  },

  // --- MIDDLE EASTERN ---
  {
    id: 'me-1',
    name: 'Herbed Falafel Salad with Creamy Hummus & Sumac',
    cuisine: 'Middle Eastern',
    dietary: 'vegan',
    calories: 450,
    protein_g: 18,
    carbs_g: 56,
    fats_g: 17,
    fiber_g: 13,
    iron_mg: 6.4,
    magnesium_mg: 110,
    prep_time_mins: 15,
    cook_time_mins: 20,
    phase_benefit: 'High iron & complex carbs reducing cravings during the late luteal phase',
    recommended_phases: ['luteal', 'menstrual'],
    allergens: [],
    tags: ['Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'],
    description: 'Golden baked parsley and chickpea falafel patties over baby greens, Persian cucumbers, velvety hummus, and sumac vinaigrette.',
    ingredients: ['4 Baked chickpea & parsley falafels', '3 tbsp Homemade garlic hummus', '2 Persian cucumbers sliced', '1 cup Baby mixed greens & cherry tomatoes', '1 tsp Sumac & extra virgin olive oil'],
    instructions: [
      'Bake falafel patties at 200°C (400°F) for 18-20 minutes until crisp and golden on the outside.',
      'Spread hummus across the base of a serving bowl.',
      'Toss greens, cucumbers, and tomatoes with olive oil, lemon juice, and a pinch of salt.',
      'Nestle warm baked falafels on top of the greens and dust liberally with ruby sumac.',
    ],
  },
  {
    id: 'me-2',
    name: "Za'atar Roast Chicken with Pomegranate & Farro",
    cuisine: 'Middle Eastern',
    dietary: 'non-veg',
    calories: 530,
    protein_g: 44,
    carbs_g: 46,
    fats_g: 18,
    fiber_g: 7,
    iron_mg: 4.5,
    magnesium_mg: 94,
    prep_time_mins: 15,
    cook_time_mins: 22,
    phase_benefit: 'Pomegranate polyphenols shield ovarian follicle health during ovulation',
    recommended_phases: ['ovulation', 'follicular'],
    allergens: ['gluten'],
    tags: ['Dairy-Free', 'Nut-Free', 'High Protein', 'Antioxidant Rich'],
    description: "Chicken breast crusted with wild za'atar herbs and roasted, accompanied by ancient grain farro and ruby pomegranate jewels.",
    ingredients: ['180g Chicken breast', '60g Ancient grain farro', '2 tbsp Pomegranate arils', "1.5 tbsp Wild za'atar spice blend", '1 tbsp Extra virgin olive oil & lemon tahini drizzle'],
    instructions: [
      "Coat chicken breast with olive oil and press za'atar herb blend firmly onto both sides.",
      'Boil farro in salted water for 20 minutes until tender with a pleasant chew; drain.',
      'Roast chicken at 200°C (400°F) for 18-20 minutes until juices run clear.',
      'Slice chicken over warm farro and scatter ruby pomegranate jewels and lemon tahini drizzle over top.',
    ],
  },
  {
    id: 'me-3',
    name: 'Halloumi & Grilled Eggplant Warm Grain Bowl',
    cuisine: 'Middle Eastern',
    dietary: 'veg',
    calories: 460,
    protein_g: 22,
    carbs_g: 42,
    fats_g: 22,
    fiber_g: 9,
    iron_mg: 3.9,
    magnesium_mg: 84,
    prep_time_mins: 12,
    cook_time_mins: 15,
    phase_benefit: 'Calcium-dense halloumi to reduce premenstrual water retention and mood dips',
    recommended_phases: ['luteal', 'menstrual'],
    allergens: ['dairy'],
    tags: ['Gluten-Free', 'Nut-Free', 'Vegetarian'],
    description: 'Seared Cypriot halloumi slices with smoky roasted eggplant, cherry tomatoes, mint leaves, and warm pearl quinoa.',
    ingredients: ['80g Cypriot halloumi cheese (sliced)', '150g Eggplant sliced into rounds', '60g White pearl quinoa', '6 Cherry tomatoes halved', 'Fresh mint leaves & lemon olive oil'],
    instructions: [
      'Cook quinoa in 120ml water for 12 minutes until fluffy.',
      'Brush eggplant slices with olive oil and grill for 4 minutes per side until tender and smoky.',
      'Sear halloumi slices in a hot dry non-stick pan for 2 minutes per side until golden brown.',
      'Assemble quinoa, grilled eggplant, blistered tomatoes, and warm halloumi.',
      'Garnish with torn mint leaves and fresh lemon juice.',
    ],
  },

  // --- CONTINENTAL ---
  {
    id: 'con-1',
    name: 'Poached Eggs on Sourdough with Smoked Salmon & Asparagus',
    cuisine: 'Continental',
    dietary: 'pescatarian',
    calories: 460,
    protein_g: 34,
    carbs_g: 36,
    fats_g: 18,
    fiber_g: 5,
    iron_mg: 4.1,
    magnesium_mg: 75,
    prep_time_mins: 10,
    cook_time_mins: 8,
    phase_benefit: 'High folate in asparagus + marine omega-3s boost follicular follicle quality',
    recommended_phases: ['follicular', 'ovulation'],
    allergens: ['gluten'],
    tags: ['High Protein', 'Nut-Free', 'Dairy-Free'],
    description: 'Two poached cage-free eggs over toasted country sourdough, cold-smoked salmon slices, and grilled asparagus spears.',
    ingredients: ['2 Fresh organic eggs', '70g Wild smoked salmon slices', '1 Slice artisan country sourdough', '6 Tender asparagus spears', '1 tsp White vinegar (for poaching) & cracked black pepper'],
    instructions: [
      'Bring a small pot of water with vinegar to a gentle simmer. Swirl water and drop eggs in, poaching for 3 minutes.',
      'Toast the sourdough slice until crisp and golden.',
      'Grill asparagus spears in a skillet with 1/2 tsp olive oil for 4 minutes.',
      'Layer smoked salmon across the warm toast, top with grilled asparagus, and crown with poached eggs.',
      'Season with freshly cracked black pepper and a touch of sea salt.',
    ],
  },
  {
    id: 'con-2',
    name: 'Grilled Sirloin Steak Salad with Arugula, Beets & Walnuts',
    cuisine: 'Continental',
    dietary: 'non-veg',
    calories: 520,
    protein_g: 42,
    carbs_g: 24,
    fats_g: 28,
    fiber_g: 6,
    iron_mg: 6.9,
    magnesium_mg: 90,
    prep_time_mins: 12,
    cook_time_mins: 10,
    phase_benefit: 'Heme iron & nitrate-rich beets replenish hemoglobin after period onset',
    recommended_phases: ['menstrual', 'follicular'],
    allergens: ['nuts'],
    tags: ['Gluten-Free', 'Dairy-Free', 'High Iron', 'High Protein'],
    description: 'Tender sirloin steak slices over wild baby arugula, roasted ruby beets, toasted walnuts, and balsamic reduction.',
    ingredients: ['170g Grass-fed lean sirloin steak', '100g Baby wild arugula', '1 Roasted ruby beet (sliced)', '15g Raw walnuts toasted', '1 tbsp Aged balsamic reduction & olive oil'],
    instructions: [
      'Season steak generously with coarse sea salt and cracked pepper.',
      'Sear steak in a cast-iron skillet over high heat for 3-4 minutes per side for medium-rare.',
      'Let steak rest for 5 minutes before slicing against the grain.',
      'Toss arugula with olive oil and arrange on a platter with sliced roasted beets and toasted walnuts.',
      'Top with warm sliced steak and drizzle with aged balsamic reduction.',
    ],
  },
  {
    id: 'con-3',
    name: 'Creamy Truffle Mushroom & Pea Risotto',
    cuisine: 'Continental',
    dietary: 'veg',
    calories: 430,
    protein_g: 15,
    carbs_g: 64,
    fats_g: 14,
    fiber_g: 6,
    iron_mg: 3.5,
    magnesium_mg: 68,
    prep_time_mins: 10,
    cook_time_mins: 22,
    phase_benefit: 'Comforting slow carbohydrates supporting brain serotonin in late luteal phase',
    recommended_phases: ['luteal', 'menstrual'],
    allergens: ['dairy'],
    tags: ['Gluten-Free', 'Nut-Free', 'Comfort Food'],
    description: 'Arborio rice slowly simmered in vegetable broth with cremini and porcini mushrooms, sweet garden peas, and a touch of parmesan.',
    ingredients: ['65g Carnaroli or Arborio rice', '100g Cremini & dried porcini mushrooms', '50g Sweet garden peas', '20g Freshly grated Parmigiano-Reggiano', '1 tsp White truffle oil & fresh thyme'],
    instructions: [
      'Rehydrate porcini mushrooms in warm water; reserve the fragrant broth.',
      'Sauté sliced cremini mushrooms in olive oil with minced shallots and thyme until golden.',
      'Add arborio rice and toast for 2 minutes. Gradually ladle in warm mushroom broth, stirring continuously.',
      'Continue ladling liquid for 18 minutes until rice is creamy and al dente.',
      'Fold in sweet peas, grated parmesan, and finish with a delicate drizzle of truffle oil.',
    ],
  },
  {
    id: 'con-4',
    name: 'Overnight Chia, Cacao & Berry Oats',
    cuisine: 'Continental',
    dietary: 'vegan',
    calories: 390,
    protein_g: 16,
    carbs_g: 58,
    fats_g: 11,
    fiber_g: 12,
    iron_mg: 5.2,
    magnesium_mg: 140,
    prep_time_mins: 5,
    cook_time_mins: 0,
    phase_benefit: 'Pure cacao + chia provide powerhouse magnesium for banishing PMS cramps',
    recommended_phases: ['luteal', 'menstrual'],
    allergens: [],
    tags: ['Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Breakfast'],
    description: 'Rolled oats steeped overnight in oat milk with black chia seeds, raw cacao powder, cinnamon, and antioxidant blueberries.',
    ingredients: ['50g Gluten-free rolled oats', '1.5 tbsp Black chia seeds', '1 tbsp Raw Peruvian cacao powder', '150ml Unsweetened oat milk', '1/2 cup Fresh blueberries & raspberries', '1 tsp Pure maple syrup'],
    instructions: [
      'In a glass jar, mix rolled oats, chia seeds, raw cacao powder, and a pinch of cinnamon.',
      'Pour in oat milk and maple syrup, stirring well until thoroughly blended.',
      'Seal jar and refrigerate for at least 4 hours (or overnight) until thick and pudding-like.',
      'Top with fresh blueberries and raspberries before enjoying chilled.',
    ],
  },
];
