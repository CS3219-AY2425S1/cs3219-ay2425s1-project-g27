import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Header = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogOut = () => {
    auth.logOut(navigate);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Website Name */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PeerPrep
        </Typography>

        <Button
          color="inherit"
          component={Link}
          to="/dashboard"
          sx={{
            mx: 0.5,
            color: "white",
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Home
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/questions"
          sx={{
            mx: 0.5,
            color: "white",
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Questions
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/matching"
          sx={{
            mx: 0.5,
            color: "white",
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Matching
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/dashboard/edit-profile"
          sx={{
            mx: 0.5,
            color: "white",
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Profile
        </Button>

        <Button
          color="inherit"
          onClick={handleLogOut}
          sx={{
            mx: 0.5,
            color: "white",
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
