import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system"; // For custom styling
import { motion } from "framer-motion"; // For animations

// Custom styled components
const StyledButton = styled(Button)({
  borderRadius: 24,
  padding: "12px 28px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  transition: "background-color 0.3s, transform 0.2s",
  "&:hover": {
    transform: "scale(1.05)",
    backgroundColor: "#1565c0",
  },
});

const StyledContainer = styled(Box)({
  background: "linear-gradient(to bottom right, #e8f0fe 0%, #ffffff 100%)",
  borderRadius: 20,
  padding: "40px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.06)",
  maxWidth: 900,
  width: "100%",
  margin: "auto",
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "#fafafa",
    "&:hover fieldset": {
      borderColor: "#1976d2",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
  },
});

const StyledFormControl = styled(FormControl)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "#fafafa",
    "&:hover fieldset": {
      borderColor: "#1976d2",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
  },
});

const SetupForm = () => {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [heightCm, setHeightCm] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [goal, setGoal] = useState("cutting");
  const [gender, setGender] = useState("male");
  const [training, setTraining] = useState("strength");
  const [dietaryPreference, setDietaryPreference] = useState("none");
  const [eatingHabits, setEatingHabits] = useState("occasional");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [mealsPerDay, setMealsPerDay] = useState("3");
  const [alertVisible, setAlertVisible] = useState(false);

  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setAge(data.age || "");
        setWeight(
          data.weightUnit === "lbs"
            ? (data.weight * 2.205).toFixed(2)
            : data.weight || ""
        );
        setWeightUnit(data.weightUnit || "kg");
        setHeightUnit(data.heightUnit || "cm");
        if (data.heightUnit === "ft") {
          const totalInches = data.height / 2.54;
          setHeightFeet(Math.floor(totalInches / 12).toString());
          setHeightInches((totalInches % 12).toString());
        } else {
          setHeightCm(data.height || "");
        }
        setGoal(data.goal || "cutting");
        setGender(data.gender || "male");
        setTraining(data.training || "strength");
        setDietaryPreference(data.dietaryPreference || "none");
        setEatingHabits(data.eatingHabits || "occasional");
        setActivityLevel(data.activityLevel || "moderate");
        setMealsPerDay(data.mealsPerDay || "3");
      }
    };

    loadUserProfile();
  }, [user]);

  const convertToCm = () => {
    if (heightUnit === "cm") {
      return heightCm;
    } else {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      return (feet * 12 + inches) * 2.54;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          age,
          weight:
            weightUnit === "lbs"
              ? (parseFloat(weight) / 2.205).toFixed(2)
              : weight,
          height: convertToCm(),
          goal,
          gender,
          training,
          dietaryPreference,
          eatingHabits,
          activityLevel,
          mealsPerDay,
          weightUnit,
          heightUnit,
        },
        { merge: true } // Merge to preserve other fields (like caloricIntake if set elsewhere)
      );

      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
        navigate("/dashboard"); // Redirect to dashboard
      }, 2000);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

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
            color="#1976d2"
            gutterBottom
          >
            Hello, {user?.displayName || "User"}! Let's Get You Started!
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="textSecondary"
            sx={{ mb: 4 }}
          >
            Enter your details for personalized fitness and dietary
            recommendations.
          </Typography>

          <Divider sx={{ my: 3, bgcolor: "#e0e0e0" }} />

          {alertVisible && (
            <Alert
              icon={<CheckIcon fontSize="inherit" />}
              severity="success"
              sx={{ mb: 3, borderRadius: 2 }}
            >
              Profile saved successfully! Redirecting to your dashboard...
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Age Input */}
            <Grid item xs={12} md={6}>
              <StyledTextField
                label="Age"
                variant="outlined"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                fullWidth
                type="number"
              />
            </Grid>

            {/* Gender Selection */}
            <Grid item xs={12} md={6}>
              <StyledFormControl fullWidth variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Weight Input */}
            <Grid item xs={6} md={4}>
              <StyledTextField
                label={`Weight (${weightUnit})`}
                variant="outlined"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                fullWidth
                type="number"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <StyledFormControl fullWidth variant="outlined">
                <InputLabel>Unit</InputLabel>
                <Select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  label="Unit"
                >
                  <MenuItem value="kg">Kg</MenuItem>
                  <MenuItem value="lbs">Lbs</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Height Input */}
            <Grid item xs={6} md={4}>
              <StyledFormControl fullWidth variant="outlined">
                <InputLabel>Height Unit</InputLabel>
                <Select
                  value={heightUnit}
                  onChange={(e) => setHeightUnit(e.target.value)}
                  label="Height Unit"
                >
                  <MenuItem value="cm">Cm</MenuItem>
                  <MenuItem value="ft">Feet & Inches</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {heightUnit === "cm" ? (
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Height (cm)"
                  variant="outlined"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  fullWidth
                  type="number"
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={6} md={3}>
                  <StyledTextField
                    label="Feet"
                    variant="outlined"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    fullWidth
                    type="number"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StyledTextField
                    label="Inches"
                    variant="outlined"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    fullWidth
                    type="number"
                  />
                </Grid>
              </>
            )}

            {/* Goal Selection */}
            <Grid item xs={12} md={6}>
              <StyledFormControl fullWidth variant="outlined">
                <InputLabel>Goal</InputLabel>
                <Select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  label="Goal"
                >
                  <MenuItem value="cutting">Cutting</MenuItem>
                  <MenuItem value="bulking">Bulking</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Training Selection */}
            <Grid item xs={12} md={6}>
              <StyledFormControl fullWidth variant="outlined">
                <InputLabel>Training</InputLabel>
                <Select
                  value={training}
                  onChange={(e) => setTraining(e.target.value)}
                  label="Training"
                >
                  <MenuItem value="strength">Strength</MenuItem>
                  <MenuItem value="endurance">Endurance</MenuItem>
                  <MenuItem value="flexibility">Flexibility</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Activity Level */}
            <Grid item xs={12} md={6}>
              <StyledFormControl fullWidth variant="outlined">
                <InputLabel>Activity Level</InputLabel>
                <Select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  label="Activity Level"
                >
                  <MenuItem value="sedentary">Sedentary</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="very active">Very Active</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Meals Per Day */}
            <Grid item xs={12} md={6}>
              <StyledFormControl fullWidth variant="outlined">
                <InputLabel>Meals Per Day</InputLabel>
                <Select
                  value={mealsPerDay}
                  onChange={(e) => setMealsPerDay(e.target.value)}
                  label="Meals Per Day"
                >
                  <MenuItem value="1">1</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="3">3</MenuItem>
                  <MenuItem value="4">4</MenuItem>
                  <MenuItem value="5">5</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Dietary Preferences */}
            <Grid item xs={12} md={6}>
              <StyledFormControl fullWidth variant="outlined">
                <InputLabel>Dietary Preference</InputLabel>
                <Select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  label="Dietary Preference"
                >
                  <MenuItem value="none">No Preference</MenuItem>
                  <MenuItem value="vegan">Vegan</MenuItem>
                  <MenuItem value="halal">Halal</MenuItem>
                  <MenuItem value="kosher">Kosher</MenuItem>
                  <MenuItem value="keto">Keto</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Eating Habits */}
            <Grid item xs={12} md={6}>
              <StyledFormControl fullWidth variant="outlined">
                <InputLabel>Eating Habits</InputLabel>
                <Select
                  value={eatingHabits}
                  onChange={(e) => setEatingHabits(e.target.value)}
                  label="Eating Habits"
                >
                  <MenuItem value="always">Always Eats Out</MenuItem>
                  <MenuItem value="occasional">Occasionally Eats Out</MenuItem>
                  <MenuItem value="rarely">Rarely Eats Out</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <StyledButton
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                sx={{ mt: 3 }}
              >
                Save Profile
              </StyledButton>
            </Grid>
          </Grid>
        </motion.div>
      </StyledContainer>
    </Box>
  );
};

export default SetupForm;
