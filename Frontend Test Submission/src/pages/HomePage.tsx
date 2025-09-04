import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Fade,
  Grow,
  Collapse,
} from '@mui/material';
import {
  ContentCopy,
  Delete,
  Launch,
  AccessTime,
  CheckCircle,
  Error as ErrorIcon,
  AutoAwesome,
  TrendingUp,
  Speed,
  Security,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { logger } from '../utils/logger';
import { generateUniqueShortCode, isValidUrl, formatUrl } from '../utils/urlUtils';
import { saveUrlMapping, getUrlMappings } from '../utils/storage';

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  customCode?: string;
  createdAt: Date;
  expiresAt: Date;
  clicks: number;
}

const HomePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [validityMinutes, setValidityMinutes] = useState(30);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    logger.logInfo('homepage', 'HomePage component mounted');
    loadExistingUrls();
  }, []);

  const loadExistingUrls = () => {
    try {
      const mappings = getUrlMappings();
      const urlList = Object.entries(mappings).map(([shortCode, data]) => ({
        id: shortCode,
        originalUrl: data.originalUrl,
        shortCode,
        customCode: data.customCode,
        createdAt: new Date(data.createdAt),
        expiresAt: new Date(data.expiresAt),
        clicks: data.clicks || 0
      }));
      setShortenedUrls(urlList.reverse());
      logger.logInfo('homepage', `Loaded ${urlList.length} existing URL mappings`);
    } catch (error) {
      logger.logError('homepage', `Failed to load existing URLs: ${error}`);
    }
  };

  const handleShortenUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      logger.logWarn('homepage', 'URL shortening attempted with empty URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      logger.logWarn('homepage', `Invalid URL format provided: ${url}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.logInfo('homepage', `Starting URL shortening process for: ${url}`);

      let finalShortCode: string;
      
      if (useCustomCode && customCode.trim()) {
        // Validate custom code
        if (customCode.length < 3 || customCode.length > 20) {
          throw new Error('Custom code must be between 3 and 20 characters');
        }
        
        if (!/^[a-zA-Z0-9-_]+$/.test(customCode)) {
          throw new Error('Custom code can only contain letters, numbers, hyphens, and underscores');
        }

        // Check if custom code already exists
        const existingMappings = getUrlMappings();
        if (existingMappings[customCode]) {
          throw new Error('Custom code already exists. Please choose a different one.');
        }

        finalShortCode = customCode;
        logger.logInfo('homepage', `Using custom short code: ${customCode}`);
      } else {
        // Generate unique short code
        const existingMappings = getUrlMappings();
        const existingCodes = Object.keys(existingMappings);
        finalShortCode = generateUniqueShortCode(existingCodes);
        
        logger.logInfo('homepage', `Generated unique short code: ${finalShortCode}`);
      }

      const formattedUrl = formatUrl(url);
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + validityMinutes * 60 * 1000);

      const urlData = {
        originalUrl: formattedUrl,
        shortCode: finalShortCode,
        customCode: useCustomCode ? customCode : undefined,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        clicks: 0
      };

      saveUrlMapping(finalShortCode, urlData);

      const newShortenedUrl: ShortenedUrl = {
        id: finalShortCode,
        originalUrl: formattedUrl,
        shortCode: finalShortCode,
        customCode: useCustomCode ? customCode : undefined,
        createdAt,
        expiresAt,
        clicks: 0
      };

      setShortenedUrls(prev => [newShortenedUrl, ...prev]);
      setSuccess('URL shortened successfully!');
      
      // Reset form
      setUrl('');
      setCustomCode('');
      setUseCustomCode(false);
      
      logger.logInfo('homepage', `URL shortened successfully: ${finalShortCode} -> ${formattedUrl}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to shorten URL';
      setError(errorMessage);
      logger.logError('homepage', `URL shortening failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = (id: string) => {
    const updatedUrls = shortenedUrls.filter(url => url.id !== id);
    setShortenedUrls(updatedUrls);
    localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls));
    setSuccess('URL deleted successfully');
    logger.logInfo('homepage', `URL with ID ${id} deleted`);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
      logger.logInfo('homepage', 'URL copied to clipboard');
    } catch (error) {
      logger.logError('homepage', `Failed to copy to clipboard: ${error}`);
    }
  };

  const isExpired = (expiresAt: Date) => {
    return new Date() > expiresAt;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '20px',
                p: 2,
                mr: 2,
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
              }}
            >
              <AutoAwesome sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              LinkShrink Pro
            </Typography>
          </Box>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 2, fontWeight: 400 }}
          >
            Transform URLs into powerful, trackable links
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Advanced URL shortening with real-time analytics, custom branding, and enterprise-grade security
          </Typography>
          
          {/* Feature Highlights */}
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item>
              <Chip
                icon={<Speed />}
                label="Lightning Fast"
                variant="outlined"
                color="primary"
                sx={{ borderRadius: 3 }}
              />
            </Grid>
            <Grid item>
              <Chip
                icon={<TrendingUp />}
                label="Real-time Analytics"
                variant="outlined"
                color="secondary"
                sx={{ borderRadius: 3 }}
              />
            </Grid>
            <Grid item>
              <Chip
                icon={<Security />}
                label="Secure & Reliable"
                variant="outlined"
                color="success"
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          </Grid>
        </Box>
      </Fade>

      <Grid container spacing={4}>
        {/* URL Shortener Form */}
        <Grid item xs={12} md={8}>
          <Grow in timeout={1000}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                borderRadius: 4,
                overflow: 'visible',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
                  borderRadius: '16px 16px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Create Your Short Link
                </Typography>

                <TextField
                  fullWidth
                  label="Enter your URL"
                  placeholder="https://example.com/very-long-url"
                  variant="outlined"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    sx={{ borderRadius: 2 }}
                  >
                    Advanced Options
                  </Button>
                </Box>

                <Collapse in={showAdvanced}>
                  <Box sx={{ mb: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useCustomCode}
                          onChange={(e) => setUseCustomCode(e.target.checked)}
                        />
                      }
                      label="Use custom short code"
                      sx={{ mb: 2 }}
                    />
                    
                    {useCustomCode && (
                      <TextField
                        fullWidth
                        label="Custom short code"
                        placeholder="my-custom-code"
                        variant="outlined"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        sx={{ mb: 2 }}
                        helperText="Only letters, numbers, and hyphens allowed"
                      />
                    )}

                    <TextField
                      fullWidth
                      type="number"
                      label="Validity (minutes)"
                      value={validityMinutes}
                      onChange={(e) => setValidityMinutes(Math.max(1, parseInt(e.target.value) || 30))}
                      inputProps={{ min: 1, max: 10080 }}
                      helperText="Link will expire after this duration (default: 30 minutes)"
                    />
                  </Box>
                </Collapse>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleShortenUrl}
                  disabled={loading}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    },
                  }}
                >
                  {loading ? 'Creating...' : 'Shorten URL'}
                </Button>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Quick Stats Sidebar */}
        <Grid item xs={12} md={4}>
          <Grow in timeout={1200}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                borderRadius: 4,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Links
                    </Typography>
                    <Chip 
                      label={shortenedUrls.length} 
                      color="primary" 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Active Links
                    </Typography>
                    <Chip 
                      label={shortenedUrls.filter(url => !isExpired(url.expiresAt)).length} 
                      color="success" 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Expired Links
                    </Typography>
                    <Chip 
                      label={shortenedUrls.filter(url => isExpired(url.expiresAt)).length} 
                      color="error" 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Shortened URLs List */}
      {shortenedUrls.length > 0 && (
        <Fade in timeout={1400}>
          <Card
            elevation={0}
            sx={{
              mt: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Your Shortened URLs
              </Typography>
              <List>
                {shortenedUrls.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      border: '1px solid',
                      borderColor: isExpired(item.expiresAt) ? 'error.light' : 'primary.light',
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: isExpired(item.expiresAt) ? 'error.light' : 'background.paper',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
                            {window.location.origin}/{item.shortCode}
                          </Typography>
                          <Chip
                            size="small"
                            icon={isExpired(item.expiresAt) ? <ErrorIcon /> : <CheckCircle />}
                            label={isExpired(item.expiresAt) ? 'Expired' : 'Active'}
                            color={isExpired(item.expiresAt) ? 'error' : 'success'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {item.originalUrl}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <AccessTime sx={{ fontSize: 16 }} />
                            <Typography variant="caption">
                              Expires: {item.expiresAt.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(`${window.location.origin}/${item.shortCode}`)}
                          disabled={isExpired(item.expiresAt)}
                          sx={{ 
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'primary.light' }
                          }}
                        >
                          <ContentCopy />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => window.open(`${window.location.origin}/${item.shortCode}`, '_blank')}
                          disabled={isExpired(item.expiresAt)}
                          sx={{ 
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'info.light' }
                          }}
                        >
                          <Launch />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteUrl(item.id)}
                          color="error"
                          sx={{ 
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'error.light' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Fade>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HomePage;
