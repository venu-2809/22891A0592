import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, Chip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Login, Logout } from '@mui/icons-material';
import LinkIcon from '@mui/icons-material/Link';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from './AuthProvider';
import { LoginForm } from './LoginForm';
import { logger } from '../utils/logger';

const Header: React.FC = () => {
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout, isAuthenticated } = useAuth();

  const handleNavigation = (path: string) => {
    logger.logInfo('header', `Navigation to ${path} initiated`);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    logger.logInfo('header', 'User logged out');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box
            sx={{
              background: 'linear-gradient(45deg, #f59e0b, #f97316)',
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <AutoAwesomeIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #ffffff, #f1f5f9)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.25rem',
              }}
            >
              LinkShrink Pro
            </Typography>
            <Chip 
              label="v2.0" 
              size="small" 
              sx={{ 
                height: 16, 
                fontSize: '0.65rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
              }} 
            />
          </Box>
        </Box>
        
        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto', alignItems: 'center' }}>
          <Button
            component={RouterLink}
            to="/"
            onClick={() => handleNavigation('/')}
            color="inherit"
            startIcon={<LinkIcon />}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: location.pathname === '/' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Create Links
          </Button>
          
          <Button
            component={RouterLink}
            to="/analytics"
            onClick={() => handleNavigation('/analytics')}
            color="inherit"
            startIcon={<AnalyticsIcon />}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: location.pathname === '/analytics' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Analytics
          </Button>

          {/* Authentication Section */}
          {isAuthenticated ? (
            <>
              <Avatar
                onClick={handleUserMenuOpen}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  ml: 2,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              onClick={() => setLoginOpen(true)}
              color="inherit"
              startIcon={<Login />}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                ml: 2,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      <LoginForm open={loginOpen} onClose={() => setLoginOpen(false)} />
    </AppBar>
  );
};

export default Header;
