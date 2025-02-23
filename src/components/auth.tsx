import { Button, Typography, Box, Container, Paper } from "@mui/material";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
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
    backgroundColor: "#1565c0", // Matches Dashboard button hover
  },
});

const StyledContainer = styled(Container)({
  background: "linear-gradient(to bottom right, #e8f0fe 0%, #ffffff 100%)",
  borderRadius: 20,
  padding: "40px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.06)",
  maxWidth: "sm", // Smaller container for auth page
  minHeight: "50vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const Auth = () => {
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate(); // Hook for navigation

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard"); // Navigate to Dashboard page
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", py: 8 }}>
      <StyledContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
            }}
          >
            {user ? (
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="#1976d2"
                  gutterBottom
                >
                  Welcome, {user.displayName || "User"}!
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ mb: 3 }}
                >
                  You’re signed in. Ready to explore your fitness journey?
                </Typography>
                <StyledButton
                  variant="contained"
                  color="primary" // Changed to primary for a positive action
                  onClick={handleGoToDashboard}
                  startIcon={<span>🏋️</span>} // Changed to fitness emoji
                >
                  Go to Dashboard
                </StyledButton>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="#424242"
                  gutterBottom
                >
                  Sign In
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ mb: 3 }}
                >
                  Log in with Google to access your personalized fitness
                  dashboard.
                </Typography>
                <StyledButton
                  variant="contained"
                  onClick={handleLogin}
                  startIcon={<span>🔑</span>}
                >
                  Sign in with Google
                </StyledButton>
              </Box>
            )}
          </Paper>
        </motion.div>
      </StyledContainer>
    </Box>
  );
};

export default Auth;
