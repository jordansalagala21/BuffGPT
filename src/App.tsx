import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  ThemeProvider,
  createTheme,
  Toolbar,
  IconButton,
  Zoom,
  useMediaQuery,
  Paper,
  Avatar,
  Divider,
  Chip,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion } from "framer-motion";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import PersonIcon from "@mui/icons-material/Person";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TimelineIcon from "@mui/icons-material/Timeline";
import MenuIcon from "@mui/icons-material/Menu";
import StarIcon from "@mui/icons-material/Star";
import SpeedIcon from "@mui/icons-material/Speed";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Create a custom theme with enhanced design
const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#db2777",
      light: "#f472b6",
      dark: "#be185d",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    success: {
      main: "#059669",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },
    h4: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          textTransform: "none",
          fontSize: "1.075rem",
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
  },
});

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      textAlign: "center",
      border: "1px solid",
      borderColor: "grey.200",
      borderRadius: 4,
    }}
  >
    <Icon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
    <Typography variant="h4" gutterBottom>
      {value}
    </Typography>
    <Typography color="text.secondary">{label}</Typography>
  </Paper>
);

const App = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);
    navigate("/setup");
  };

  interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    delay: number;
  }

  const FeatureCard: React.FC<FeatureCardProps> = ({
    icon: Icon,
    title,
    description,
    delay,
  }) => (
    <Zoom in style={{ transitionDelay: `${delay}ms` }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 56,
                height: 56,
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.2)",
              }}
            >
              <Icon sx={{ fontSize: 32 }} />
            </Avatar>
          </Box>
          <Typography variant="h5" gutterBottom fontWeight="700">
            {title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.7 }}
          >
            {description}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="text"
              color="primary"
              endIcon={<ChevronRightIcon />}
              sx={{ fontWeight: 600 }}
            >
              Learn more
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Enhanced Navigation */}
        <AppBar
          position="fixed"
          color="transparent"
          sx={{
            backdropFilter: "blur(20px)",
            backgroundColor: scrolled
              ? "rgba(255, 255, 255, 0.9)"
              : "transparent",
            transition: "all 0.3s ease-in-out",
            borderBottom: scrolled ? "1px solid" : "none",
            borderColor: "grey.100",
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ py: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  BuffGPT
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              {!isSmallScreen && (
                <Box sx={{ mr: 4 }}>
                  <Button color="inherit" sx={{ mx: 1 }}>
                    Features
                  </Button>
                  <Button color="inherit" sx={{ mx: 1 }}>
                    Pricing
                  </Button>
                  <Button color="inherit" sx={{ mx: 1 }}>
                    About
                  </Button>
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={user ? () => navigate("/setup") : handleLogin}
                startIcon={<PersonIcon />}
              >
                {user ? "Dashboard" : "Get Started"}
              </Button>
              {isSmallScreen && (
                <IconButton sx={{ ml: 1 }}>
                  <MenuIcon />
                </IconButton>
              )}
            </Toolbar>
          </Container>
        </AppBar>

        {/* Hero Section */}
        <Box
          sx={{
            pt: { xs: 15, md: 20 },
            pb: { xs: 10, md: 15 },
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.05
            )} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Chip
                    label="AI-Powered Fitness"
                    color="primary"
                    size="small"
                    sx={{ mb: 3, fontWeight: 600 }}
                  />
                  <Typography
                    variant="h1"
                    gutterBottom
                    sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}
                  >
                    Transform Your Body with AI
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ mb: 4, color: "text.secondary", lineHeight: 1.6 }}
                  >
                    Experience the future of fitness with personalized AI
                    coaching, real-time tracking, and smart nutrition guidance.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={
                        user ? () => navigate("/dashboard") : handleLogin
                      }
                      startIcon={<StarIcon />}
                    >
                      {user ? "Go to Dashboard" : "Try For Free Now!"}
                    </Button>
                  </Box>
                  <Box sx={{ mt: 6, display: "flex", gap: 4 }}>
                    <Box>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        gutterBottom
                      >
                        50K+
                      </Typography>
                      <Typography color="text.secondary">
                        Probable Users
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        gutterBottom
                      >
                        95%
                      </Typography>
                      <Typography color="text.secondary">
                        Success Rate
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -40,
                      right: -40,
                      bottom: -40,
                      left: -40,
                      background:
                        "radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0) 70%)",
                      zIndex: -1,
                    },
                  }}
                ></Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Stats Section */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatCard icon={SpeedIcon} value="89%" label="Faster Progress" />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={TimelineIcon}
                value="50K+"
                label="Probable Users"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard icon={StarIcon} value="4.9/5" label="User Rating" />
            </Grid>
          </Grid>
        </Container>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 12 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" gutterBottom>
              Power Your Fitness Journey with AI
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto" }}
            >
              Experience breakthrough results with our advanced AI technology
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={FitnessCenterIcon}
                title="Smart Workout Plans"
                description="Get personalized workout plans tailored to your fitness level and goals."
                delay={100}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={RestaurantIcon}
                title="Nutrition Guidance"
                description="Receive meal plans and nutrition tips to fuel your workouts."
                delay={200}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={AutoGraphIcon}
                title="AI Coaching"
                description="Get real-time feedback and coaching from our AI assistant."
                delay={400}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={SmartphoneIcon}
                title="Mobile App"
                description="Access your fitness plans and track progress on the go."
                delay={500}
              />
            </Grid>
            <Grid item xs={12} md={4}></Grid>
          </Grid>
        </Container>
        {/* Footer */}
        <Box
          sx={{
            py: 6,
            bgcolor: "background.paper",
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 2 }}
            >
              © {new Date().getFullYear()} Fitness AI. All rights reserved.
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={2}
            >
              <Button color="inherit">Privacy Policy</Button>
              <Divider orientation="vertical" flexItem />
              <Button color="inherit">Terms of Service</Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
export default App;
