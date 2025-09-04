import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getUrlMapping, recordClick } from '../utils/storage';
import { isUrlExpired } from '../utils/urlUtils';
import { logger } from '../utils/logger';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      setLoading(false);
      logger.logError('redirect', 'RedirectHandler called without short code');
      return;
    }

    handleRedirect(shortCode);
  }, [shortCode]);

  const handleRedirect = async (code: string) => {
    try {
      logger.logInfo('redirect', `Processing redirect for short code: ${code}`);
      
      const mapping = getUrlMapping(code);
      
      if (!mapping) {
        setError('Short URL not found');
        logger.logWarn('redirect', `Short code not found: ${code}`);
        setLoading(false);
        return;
      }

      // Check if URL has expired
      if (isUrlExpired(mapping.expiresAt)) {
        setError('This short URL has expired');
        logger.logWarn('redirect', `Expired URL accessed: ${code}`);
        setLoading(false);
        return;
      }

      // Record the click
      try {
        recordClick(code, {
          userAgent: navigator.userAgent,
          referrer: document.referrer
        });
        logger.logInfo('redirect', `Click recorded for ${code}`);
      } catch (clickError) {
        logger.logError('redirect', `Failed to record click for ${code}: ${clickError}`);
      }

      // Show redirecting message briefly before redirect
      setRedirecting(true);
      setLoading(false);

      // Redirect after a short delay to show the message
      setTimeout(() => {
        logger.logInfo('redirect', `Redirecting to: ${mapping.originalUrl}`);
        window.location.href = mapping.originalUrl;
      }, 1500);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process redirect';
      setError(errorMessage);
      logger.logError('redirect', `Redirect processing failed: ${errorMessage}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        textAlign="center"
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Processing your request...
        </Typography>
      </Box>
    );
  }

  if (redirecting) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        textAlign="center"
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Redirecting you now...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If you're not redirected automatically, please check your browser settings.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        textAlign="center"
        sx={{ px: 2 }}
      >
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2">
            The link you're looking for might have expired or doesn't exist.
          </Typography>
        </Alert>
        
        <Button
          variant="contained"
          component={RouterLink}
          to="/"
          size="large"
        >
          Create New Short URL
        </Button>
      </Box>
    );
  }

  return null;
};

export default RedirectHandler;
