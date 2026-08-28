window.FG_CONFIG={
  APP_NAME:"FitGlass AI",
  LEGACY_NAME:"IA KSC",
  APP_IMAGE_URL:"https://i.imgur.com/REEMPLAZA_ESTA_IMAGEN.jpg",
  HERO_IMAGE_URL:"https://i.imgur.com/REEMPLAZA_ESTA_IMAGEN.jpg",

  // These placeholders are replaced by GitHub Actions from repository Secrets.
  GROQ_API_KEY:"__GROQ_API_KEY__",
  USDA_API_KEY:"__USDA_API_KEY__",

  // Optional secure proxy endpoints. Leave blank for the educational direct-key mode.
  GROQ_PROXY_URL:"",
  USDA_PROXY_URL:"",

  GROQ_MODEL:"openai/gpt-oss-120b",
  GROQ_VISION_MODEL:"meta-llama/llama-4-scout-17b-16e-instruct",
  ENABLE_API:true,
  OPEN_FOOD_FACTS:true,
  OPEN_METEO:true,

  FIREBASE_ENABLED:true,
  FIREBASE_CONFIG:{
    apiKey:"__FIREBASE_API_KEY__",
    authDomain:"__FIREBASE_AUTH_DOMAIN__",
    projectId:"__FIREBASE_PROJECT_ID__",
    storageBucket:"__FIREBASE_STORAGE_BUCKET__",
    messagingSenderId:"__FIREBASE_MESSAGING_SENDER_ID__",
    appId:"__FIREBASE_APP_ID__"
  },
  DEMO_MODE:false,
  REGION_OPTIONS:["Piura","Cusco"],

  AUTHORS_SHORT:"Andre y Sebastian",
  SCHOOL:"IEP El Triunfo Castilla",
  CLASSROOM:"Mateo Garcia Pumacahua",
  GRADE:"4.º de secundaria"
};
