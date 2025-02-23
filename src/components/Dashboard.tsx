import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  Button,
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Chip,
  Collapse,
} from "@mui/material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsIcon from "@mui/icons-material/Directions";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter"; // Added for workout plan button
import restaurantsData from "../data/RestrauntsData";
import dishData from "../data/DishData";

// Custom styled components
const StyledCard = styled(Card)({
  borderRadius: 16,
  background: "linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
  },
});

const StyledButton = styled(Button)({
  borderRadius: 24,
  padding: "12px 28px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  transition: "background-color 0.3s, transform 0.2s",
  "&:hover": { transform: "scale(1.05)", backgroundColor: "#1565c0" },
});

const ToggleButton = styled(Button)({
  borderRadius: 20,
  padding: "8px 24px",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.9rem",
  transition: "all 0.3s ease",
  "&:hover": { backgroundColor: "#bbdefb" },
});

const StyledContainer = styled(Container)({
  background: "linear-gradient(to bottom right, #e8f0fe 0%, #ffffff 100%)",
  borderRadius: 20,
  padding: "40px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.06)",
  maxWidth: "lg",
});

const IngredientChip = styled(Chip)({
  margin: "4px",
  borderRadius: 16,
  transition: "background-color 0.2s",
  "&:hover": { backgroundColor: "#e3f2fd" },
});

const TipCard = styled(Card)({
  borderRadius: 12,
  backgroundColor: "#fff",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  padding: "16px",
  transition: "transform 0.3s ease",
  "&:hover": { transform: "translateY(-2px)" },
  minHeight: "100px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const InfoCard = styled(Card)({
  borderRadius: 12,
  backgroundColor: "#fff",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  padding: "16px",
  transition: "transform 0.3s ease",
  "&:hover": { transform: "translateY(-2px)" },
  minHeight: "120px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const RestaurantCard = styled(Card)({
  borderRadius: 16,
  backgroundColor: "#fff",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  padding: "20px",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
  },
  border: "1px solid #e0e0e0",
  minHeight: "300px",
  maxWidth: "400px",
  background: "linear-gradient(135deg, #f9f9f9 0%, #fefefe 100%)",
});

const MapCard = styled(Card)({
  borderRadius: 12,
  backgroundColor: "#fff",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  padding: "16px",
  marginBottom: "20px",
});

// Declare Google Maps types
declare global {
  interface Window {
    initMap: () => void;
  }
}

const Dashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null); // Added for workout plan
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [workoutLoading, setWorkoutLoading] = useState(false); // Added for workout loading
  const [error, setError] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [ingredientCategory, setIngredientCategory] = useState<
    "veg" | "non-veg"
  >("veg");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(
    null
  );
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [restaurantLocations, setRestaurantLocations] = useState<{
    [key: string]: google.maps.LatLng;
  }>({});
  const [mapOpen, setMapOpen] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const categories = [
    "Low Calorie",
    "Low Fat",
    "High Protein",
    "Vegan",
    "Vegetarian",
    "Low Carb",
  ];

  const vegIngredients = [
    "Rice",
    "Pasta",
    "Tomatoes",
    "Spinach",
    "Potatoes",
    "Olive Oil",
    "Broccoli",
    "Carrots",
    "Lentils",
    "Onions",
    "Garlic",
    "Beans",
    "Peas",
  ];

  const nonVegIngredients = [
    "Chicken",
    "Beef",
    "Eggs",
    "Cheese",
    "Salmon",
    "Turkey",
    "Pork",
    "Shrimp",
    "Tuna",
    "Bacon",
  ];

  const fitnessTips = [
    {
      icon: "💧",
      text: "Drink at least 8 glasses of water daily to stay hydrated and boost metabolism.",
    },
    {
      icon: "🛌",
      text: "Aim for 7-9 hours of sleep nightly—research shows it aids muscle recovery.",
    },
    {
      icon: "🚶",
      text: "Walk 10,000 steps a day to improve heart health and burn extra calories.",
    },
    {
      icon: "🥗",
      text: "Eat more fiber-rich foods to support digestion and fullness.",
    },
    {
      icon: "💪",
      text: "Strength train 2-3 times a week to build muscle and increase BMR.",
    },
  ];

  const fitnessInfo = [
    {
      title: "BMI",
      text: "Body Mass Index measures body fat based on height and weight.",
    },
    {
      title: "BMR",
      text: "Basal Metabolic Rate is calories needed at rest for basic functions.",
    },
    {
      title: "TDEE",
      text: "Total Daily Energy Expenditure is BMR plus activity calories.",
    },
  ];

  const currentIngredients =
    ingredientCategory === "veg" ? vegIngredients : nonVegIngredients;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setIsAuthenticated(!!currentUser);
      if (currentUser) {
        const fetchUserData = async () => {
          try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) setUserData(userSnap.data());
            else setError("User data not found.");
          } catch (err) {
            setError("Failed to fetch user data.");
          } finally {
            setLoading(false);
          }
        };
        fetchUserData();

        if (!document.getElementById("google-maps-script")) {
          const mapsScript = document.createElement("script");
          mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${
            import.meta.env.VITE_GOOGLE_PLACES_API_KEY
          }&libraries=places,geometry&callback=initMap`;
          mapsScript.async = true;
          mapsScript.id = "google-maps-script";
          document.head.appendChild(mapsScript);

          window.initMap = () => {
            setIsGoogleMapsLoaded(true);
          };
        } else if (window.google && window.google.maps) {
          setIsGoogleMapsLoaded(true);
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      const script = document.getElementById("google-maps-script");
      if (script) script.remove();
    };
  }, []);

  useEffect(() => {
    if (isGoogleMapsLoaded && userData) {
      fetchRestaurants();
    }
  }, [isGoogleMapsLoaded, userData]);

  const fetchRestaurants = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation(new google.maps.LatLng(latitude, longitude));

          const map = new google.maps.Map(
            document.getElementById("map") as HTMLElement,
            {
              center: { lat: latitude, lng: longitude },
              zoom: 14,
            }
          );

          const service = new google.maps.places.PlacesService(map);
          const request = {
            location: { lat: latitude, lng: longitude },
            radius: 1500, // 1.5 km
            type: "restaurant",
          };

          service.nearbySearch(request, (results, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              results
            ) {
              const fetchedRestaurants = results
                .slice(0, 6)
                .map((place: any) => {
                  const position = place.geometry.location;
                  setRestaurantLocations((prev) => ({
                    ...prev,
                    [place.name]: position,
                  }));

                  const marker = new google.maps.Marker({
                    position: position,
                    map: map,
                    title: place.name,
                    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  });

                  const infoWindow = new google.maps.InfoWindow({
                    content: `<h1 style="color: black;">${place.name}</h1>`,
                  });

                  marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                  });

                  return {
                    name: place.name,
                    dietOptions: getDietOptions(place.name),
                    distance: calculateDistance(
                      latitude,
                      longitude,
                      position.lat(),
                      position.lng()
                    ),
                  };
                });

              setRestaurants(fetchedRestaurants);

              const userMarker = new google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: map,
                title: "You are here!",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              });

              const userInfoWindow = new google.maps.InfoWindow({
                content: "<h3>You are here!</h3>",
              });

              userMarker.addListener("click", () => {
                userInfoWindow.open(map, userMarker);
              });
            }
          });
        },
        (err) => {
          setLocationError(
            "Unable to retrieve your location. Showing sample data."
          );
          setRestaurants(getFallbackRestaurants(null, null));
        }
      );
    } else {
      setLocationError("Geolocation not supported. Showing sample data.");
      setRestaurants(getFallbackRestaurants(null, null));
    }
  };

  const getFallbackRestaurants = (lat: number | null, lng: number | null) => [
    {
      name: "Juliana's Pizza",
      dietOptions: getDietOptions("Juliana's Pizza"),
      distance:
        lat && lng
          ? calculateDistance(lat, lng, 40.7128, -74.006)
          : "0.5 miles",
    },
    {
      name: "Green Cafe",
      dietOptions: getDietOptions("Green Cafe"),
      distance:
        lat && lng
          ? calculateDistance(lat, lng, 40.7138, -74.007)
          : "1.2 miles",
    },
    {
      name: "Veggie Haven",
      dietOptions: getDietOptions("Veggie Haven"),
      distance:
        lat && lng
          ? calculateDistance(lat, lng, 40.7118, -74.005)
          : "0.8 miles",
    },
    {
      name: "Ocean Grill",
      dietOptions: getDietOptions("Ocean Grill"),
      distance:
        lat && lng
          ? calculateDistance(lat, lng, 40.712, -74.0065)
          : "0.7 miles",
    },
    {
      name: "Healthy Bites",
      dietOptions: getDietOptions("Healthy Bites"),
      distance:
        lat && lng ? calculateDistance(lat, lng, 40.713, -74.008) : "1.0 miles",
    },
    {
      name: "Burger Barn",
      dietOptions: getDietOptions("Burger Barn"),
      distance:
        lat && lng ? calculateDistance(lat, lng, 40.714, -74.009) : "1.3 miles",
    },
  ];

  const getDietOptions = (restaurantName: string) => {
    const nameLower = restaurantName.toLowerCase();
    const dietOptions: {
      [key: string]: {
        name: string;
        calories: number;
        carbs: number;
        protein: number;
        fats: number;
        attributes: string[];
      }[];
    } = {
      none: [],
      vegan: [],
      keto: [],
      halal: [],
      kosher: [],
      vegetarian: [],
      "low-carb": [],
      "high-protein": [],
      "low-cal": [],
      "low-fat": [],
    };

    restaurantsData.forEach((restoItem) => {
      if (restoItem.name.toLowerCase().includes(nameLower)) {
        const baseName = restoItem.item
          .replace(/Extra Large |White /gi, "")
          .trim();
        const dish = dishData[baseName] || {
          calories: 0,
          carbs: 0,
          protein: 0,
          fats: 0,
        };
        const attributes = [];
        if (restoItem.low_cal) attributes.push("low-cal");
        if (restoItem.low_carb) attributes.push("low-carb");
        if (restoItem.high_protein) attributes.push("high-protein");
        if (restoItem.vegan) attributes.push("vegan");
        if (restoItem.vegetarian) attributes.push("vegetarian");
        if (restoItem.low_fat) attributes.push("low-fat");

        const itemData = {
          name: restoItem.item,
          calories: dish.calories,
          carbs: dish.carbs,
          protein: dish.protein,
          fats: dish.fats,
          attributes,
        };

        if (restoItem.vegan) dietOptions.vegan.push(itemData);
        if (restoItem.vegetarian) dietOptions.vegetarian.push(itemData);
        if (restoItem.high_protein) dietOptions["high-protein"].push(itemData);
        if (restoItem.low_carb) dietOptions["low-carb"].push(itemData);
        if (restoItem.low_cal) dietOptions["low-cal"].push(itemData);
        if (restoItem.low_fat) dietOptions["low-fat"].push(itemData);
        if (nameLower.includes("halal")) dietOptions.halal.push(itemData);
        if (nameLower.includes("kosher")) dietOptions.kosher.push(itemData);
      }
    });

    return dietOptions;
  };

  const getCompatibleDietOptions = (diet: string, dietOptions: any) => {
    let compatibleItems: {
      name: string;
      calories: number;
      carbs: number;
      protein: number;
      fats: number;
      attributes: string[];
    }[] = dietOptions[diet] || [];

    if (compatibleItems.length === 0) {
      if (diet === "halal" && dietOptions.vegan.length > 0)
        compatibleItems = dietOptions.vegan;
      else if (diet === "kosher" && dietOptions.vegan.length > 0)
        compatibleItems = dietOptions.vegan;
      else if (diet === "vegan" && dietOptions.vegetarian.length > 0)
        compatibleItems = dietOptions.vegetarian;
      else if (diet === "keto" && dietOptions["low-carb"].length > 0)
        compatibleItems = dietOptions["low-carb"];
    }

    if (selectedCategories.length > 0) {
      compatibleItems = compatibleItems.filter((item) =>
        selectedCategories.every((category) => {
          switch (category) {
            case "Low Calorie":
              return item.attributes.includes("low-cal");
            case "Low Fat":
              return item.attributes.includes("low-fat");
            case "High Protein":
              return item.attributes.includes("high-protein");
            case "Vegan":
              return item.attributes.includes("vegan");
            case "Vegetarian":
              return item.attributes.includes("vegetarian");
            case "Low Carb":
              return item.attributes.includes("low-carb");
            default:
              return true;
          }
        })
      );
    }

    return compatibleItems;
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    return (
      google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(lat1, lon1),
        new google.maps.LatLng(lat2, lon2)
      ) / 1609.34
    ); // Convert meters to miles
  };

  const openGoogleMapsDirections = (restaurantPosition: google.maps.LatLng) => {
    if (userLocation) {
      const directionsURL = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat()},${userLocation.lng()}&destination=${restaurantPosition.lat()},${restaurantPosition.lng()}`;
      window.open(directionsURL, "_blank");
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Failed to log in. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (err) {
      setError("Failed to log out.");
    }
  };

  const handleProfile = () => {
    navigate("/setup");
  };

  const handleIngredientChange = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const fetchRecipe = async (isLowBudget: boolean = false) => {
    if (!userData) {
      setError("User data not loaded.");
      return;
    }

    // Skip ingredient check for low budget recipe
    if (!isLowBudget && selectedIngredients.length === 0) {
      setError("Please select at least one ingredient for a custom recipe.");
      return;
    }

    setRecipe(null);
    setError(null);
    setRecipeLoading(true);

    const calorieTarget = userData.caloricIntake / 3;
    let prompt = "";

    if (isLowBudget) {
      prompt = `You are a nutritionist and chef. Generate a single low-budget, simple recipe that aligns with a ${userData.dietaryPreference} diet and aims for approximately ${calorieTarget} calories. Use minimal, affordable ingredients and basic cooking techniques. Include a title, ingredients list, and step-by-step instructions.`;
    } else {
      prompt = `You are a nutritionist and chef. Generate a single recipe that uses the following ingredients: ${selectedIngredients.join(
        ", "
      )}. The recipe should align with a ${
        userData.dietaryPreference
      } diet and aim for approximately ${calorieTarget} calories. Include a title, ingredients list, and step-by-step instructions.`;
    }

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
          import.meta.env.VITE_GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) throw new Error("Gemini API request failed.");
      const data = await response.json();
      const recipeContent =
        data.candidates[0]?.content.parts[0]?.text ||
        "No response from Gemini.";
      setRecipe(recipeContent);
    } catch (err) {
      console.error("Error fetching recipe from Gemini:", err);
      setError("Error fetching recipe from Gemini.");
    } finally {
      setRecipeLoading(false);
    }
  };

  const fetchWorkoutPlan = async () => {
    if (!userData) {
      setError("User data not loaded.");
      return;
    }

    setWorkoutPlan(null);
    setError(null);
    setWorkoutLoading(true);

    const prompt = `You are a fitness trainer. Generate a weekly workout plan for a user with the following details: 
      - Gender: ${userData.gender}
      - Age: ${userData.age}
      - Weight: ${userData.weight} kg
      - Height: ${userData.height} cm
      - Fitness Goal: ${userData.goal} (bulking, cutting, or maintenance)
      - Activity Level: ${userData.activityLevel}
    The plan should include specific exercises, sets, reps, and rest days tailored to their goal and activity level. Provide a clear schedule for 7 days, including exercise names and brief instructions.`;

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
          import.meta.env.VITE_GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) throw new Error("Gemini API request failed.");
      const data = await response.json();
      const workoutContent =
        data.candidates[0]?.content.parts[0]?.text ||
        "No response from Gemini.";
      setWorkoutPlan(workoutContent);
    } catch (err) {
      console.error("Error fetching workout plan from Gemini:", err);
      setError("Error fetching workout plan from Gemini.");
    } finally {
      setWorkoutLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prevSelectedCategories) =>
      prevSelectedCategories.includes(category)
        ? prevSelectedCategories.filter((item) => item !== category)
        : [...prevSelectedCategories, category]
    );
  };

  const toggleMap = () => {
    setMapOpen(!mapOpen);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="primary" size={50} />
      </Box>
    );

  if (error)
    return (
      <Alert
        severity="error"
        sx={{ maxWidth: 600, mx: "auto", mt: 5, borderRadius: 2 }}
      >
        {error}
      </Alert>
    );

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", py: 8 }}>
        <StyledContainer>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              color="#424242"
              gutterBottom
            >
              Please Log In
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              color="textSecondary"
              sx={{ mb: 4 }}
            >
              Sign in to access your personalized fitness dashboard.
            </Typography>
            <Box sx={{ textAlign: "center" }}>
              <StyledButton
                variant="contained"
                onClick={handleLogin}
                startIcon={<span>🔑</span>}
              >
                Sign in with Google
              </StyledButton>
            </Box>
          </motion.div>
        </StyledContainer>
      </Box>
    );
  }

  if (!userData)
    return (
      <Typography variant="h6" textAlign="center" mt={5} color="textSecondary">
        No data found.
      </Typography>
    );

  const heightInMeters = userData.height / 100;
  const weight = parseFloat(userData.weight);
  const age = parseInt(userData.age);
  const isMale = userData.gender === "male";
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
  const bodyFat = isMale
    ? (1.2 * parseFloat(bmi) + 0.23 * age - 16.2).toFixed(2)
    : (1.2 * parseFloat(bmi) + 0.23 * age - 5.4).toFixed(2);
  const bmr = isMale
    ? 88.36 + 13.4 * weight + 4.8 * userData.height - 5.7 * age
    : 447.6 + 9.2 * weight + 3.1 * userData.height - 4.3 * age;
  const activityFactors: { [key: string]: number } = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    "very active": 1.9,
  };
  const tdee = (bmr * activityFactors[userData.activityLevel]).toFixed(2);
  const calorieIntake =
    userData.goal === "bulking"
      ? (parseFloat(tdee) + 500).toFixed(2)
      : userData.goal === "cutting"
      ? (parseFloat(tdee) - 500).toFixed(2)
      : tdee;
  const proteinIntake = (weight * 1.6).toFixed(2);
  const fatIntake = ((parseFloat(calorieIntake) * 0.25) / 9).toFixed(2);
  const carbIntake = (
    (parseFloat(calorieIntake) -
      parseFloat(proteinIntake) * 4 -
      parseFloat(fatIntake) * 9) /
    4
  ).toFixed(2);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", py: 8 }}>
      <StyledContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 5,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: "#1976d2", letterSpacing: "-0.5px" }}
            >
              🏋️ Your Fitness Dashboard
            </Typography>
          </motion.div>
          <Box sx={{ display: "flex", gap: 2 }}>
            <StyledButton
              variant="outlined"
              color="primary"
              onClick={handleProfile}
              sx={{ borderWidth: 2 }}
            >
              👤 Profile
            </StyledButton>
            <StyledButton
              variant="outlined"
              color="secondary"
              onClick={handleLogout}
              sx={{ borderWidth: 2 }}
            >
              🚪 Logout
            </StyledButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {[
            { title: "📊 BMI", value: bmi },
            { title: "💪 Body Fat %", value: `${bodyFat}%` },
            { title: "🔥 BMR", value: `${bmr.toFixed(2)} kcal/day` },
            { title: "🚀 TDEE", value: `${tdee} kcal/day` },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <StyledCard>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Typography
                      variant="h6"
                      color="textSecondary"
                      sx={{ fontSize: "1.1rem" }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="primary"
                      sx={{ mt: 1, fontSize: "1.8rem" }}
                    >
                      {stat.value}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color="#424242"
            gutterBottom
          >
            📚 What These Metrics Mean
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {fitnessInfo.map((info, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <InfoCard>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="#1976d2"
                        sx={{ mb: 1 }}
                      >
                        {info.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {info.text}
                      </Typography>
                    </Box>
                  </InfoCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box
          sx={{
            mt: 6,
            bgcolor: "#fff",
            p: 4,
            borderRadius: 3,
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            color="#424242"
          >
            🍎 Your Recommended Diet
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: "#e0e0e0" }} />
          <Table sx={{ maxWidth: 500, mx: "auto" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "#616161" }}>
                  Nutrient
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: "bold", color: "#616161" }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { nutrient: "Protein", amount: `${proteinIntake} g` },
                { nutrient: "Fat", amount: `${fatIntake} g` },
                { nutrient: "Carbs", amount: `${carbIntake} g` },
              ].map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.nutrient}</TableCell>
                  <TableCell align="right">{row.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mt: 2, fontStyle: "italic" }}
          >
            Stick to this plan, and you’ll see results in 4-6 weeks with
            consistency!
          </Typography>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color="#424242"
            gutterBottom
          >
            🌟 Fitness & Health Tips
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {fitnessTips.map((tip, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <TipCard>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="h6" sx={{ fontSize: "1.5rem" }}>
                        {tip.icon}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {tip.text}
                      </Typography>
                    </Box>
                  </TipCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color="#424242"
            gutterBottom
          >
            🍽️ Nearby Restaurants for Your Diet
          </Typography>
          <MapCard>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" color="#1976d2">
                Location Map
              </Typography>
              <Button variant="outlined" color="primary" onClick={toggleMap}>
                {mapOpen ? "Hide Map" : "Show Map"}
              </Button>
            </Box>
            <Collapse in={mapOpen}>
              <Box id="map" sx={{ width: "100%", height: "400px" }}></Box>
            </Collapse>
          </MapCard>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              mb: 4,
              flexWrap: "wrap",
            }}
          >
            {categories.map((category) => (
              <label
                key={category}
                style={{
                  color: "#424242",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  style={{ marginRight: "8px" }}
                />
                {category}
              </label>
            ))}
          </Box>
          {locationError && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              {locationError}
            </Alert>
          )}
          <Grid container spacing={3} justifyContent="center">
            {restaurants.map((restaurant, index) => {
              const compatibleOptions = getCompatibleDietOptions(
                userData.dietaryPreference,
                restaurant.dietOptions
              );
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <RestaurantCard>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <RestaurantIcon sx={{ color: "#1976d2", mr: 1 }} />
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="#1976d2"
                        >
                          {restaurant.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        <strong>Distance:</strong>{" "}
                        {restaurant.distance.toFixed(2)} miles
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DirectionsIcon />}
                        onClick={() =>
                          openGoogleMapsDirections(
                            restaurantLocations[restaurant.name]
                          )
                        }
                        sx={{ mb: 3, borderRadius: 20, textTransform: "none" }}
                      >
                        Get Directions
                      </Button>
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="div"
                        >
                          <strong>Available Meals:</strong>
                        </Typography>
                        {compatibleOptions.length > 0 ? (
                          <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                            {compatibleOptions.map((item) => (
                              <Box
                                component="li"
                                key={item.name}
                                sx={{ mb: 1 }}
                              >
                                <Typography variant="body2" color="textPrimary">
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {item.calories} kcal, {item.carbs}g carbs,{" "}
                                  {item.protein}g protein, {item.fats}g fats
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mt: 1 }}
                          >
                            No specific meals available for your preference.
                          </Typography>
                        )}
                      </Box>
                    </RestaurantCard>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color="#424242"
          >
            🥗 Select Ingredients for Your Recipe
          </Typography>
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <ToggleButton
                variant={
                  ingredientCategory === "veg" ? "contained" : "outlined"
                }
                color="primary"
                onClick={() => setIngredientCategory("veg")}
                sx={{
                  bgcolor:
                    ingredientCategory === "veg" ? "#4caf50" : "transparent",
                  minWidth: 150,
                }}
              >
                🌱 Vegetarian
              </ToggleButton>
              <ToggleButton
                variant={
                  ingredientCategory === "non-veg" ? "contained" : "outlined"
                }
                color="primary"
                onClick={() => setIngredientCategory("non-veg")}
                sx={{
                  bgcolor:
                    ingredientCategory === "non-veg"
                      ? "#f44336"
                      : "transparent",
                  minWidth: 150,
                }}
              >
                🍗 Non-Vegetarian
              </ToggleButton>
            </Box>
          </Box>
          <Grid container spacing={1} sx={{ mt: 3, justifyContent: "center" }}>
            {currentIngredients.map((ingredient) => (
              <Grid item key={ingredient}>
                <IngredientChip
                  label={ingredient}
                  clickable
                  color={
                    selectedIngredients.includes(ingredient)
                      ? "primary"
                      : "default"
                  }
                  onClick={() => handleIngredientChange(ingredient)}
                  variant={
                    selectedIngredients.includes(ingredient)
                      ? "filled"
                      : "outlined"
                  }
                />
              </Grid>
            ))}
          </Grid>
          <Box
            sx={{
              textAlign: "center",
              mt: 4,
              display: "flex",
              justifyContent: "center",
              gap: 3,
            }}
          >
            <StyledButton
              variant="contained"
              onClick={() => fetchRecipe(false)}
              disabled={recipeLoading || selectedIngredients.length === 0}
              startIcon={recipeLoading ? <CircularProgress size={20} /> : null}
            >
              {recipeLoading ? "Generating..." : "🍳 Generate Recipe"}
            </StyledButton>
            <StyledButton
              variant="contained"
              color="secondary"
              onClick={() => fetchRecipe(true)}
              disabled={recipeLoading} // No ingredient requirement for low budget
              startIcon={recipeLoading ? <CircularProgress size={20} /> : null}
            >
              {recipeLoading ? "Generating..." : "💰 Low Budget Recipe"}
            </StyledButton>
            <StyledButton
              variant="contained"
              color="success"
              onClick={fetchWorkoutPlan}
              disabled={workoutLoading}
              startIcon={
                workoutLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <FitnessCenterIcon />
                )
              }
            >
              {workoutLoading ? "Generating..." : "🏋️ Generate Workout Plan"}
            </StyledButton>
          </Box>
        </Box>

        {recipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                mt: 6,
                bgcolor: "#fff",
                p: 4,
                borderRadius: 3,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                textAlign="center"
                color="#424242"
              >
                🍳 Your Custom Recipe
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  whiteSpace: "pre-line",
                  fontFamily: "monospace",
                  color: "#212121",
                }}
              >
                {recipe}
              </Typography>
            </Box>
          </motion.div>
        )}

        {workoutPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                mt: 6,
                bgcolor: "#fff",
                p: 4,
                borderRadius: 3,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                textAlign="center"
                color="#424242"
              >
                🏋️ Your Weekly Workout Plan
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  whiteSpace: "pre-line",
                  fontFamily: "monospace",
                  color: "#212121",
                }}
              >
                {workoutPlan}
              </Typography>
            </Box>
          </motion.div>
        )}
      </StyledContainer>
    </Box>
  );
};

export default Dashboard;
