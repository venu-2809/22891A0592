import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Link as LinkIcon,
  AccessTime,
  Visibility,
  GetApp,
  Refresh,
} from '@mui/icons-material';
import { getAnalyticsData, cleanupExpiredUrls } from '../utils/storage';
import { getTimeRemaining } from '../utils/urlUtils';
import { logger } from '../utils/logger';

interface AnalyticsData {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  expiredUrls: number;
  urlDetails: Array<{
    shortCode: string;
    originalUrl: string;
    clicks: number;
    createdAt: string;
    expiresAt: string;
    isExpired: boolean;
    clickHistory: any[];
  }>;
}

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    logger.logInfo('analytics', 'AnalyticsPage component mounted');
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Clean up expired URLs first
      const cleanedCount = cleanupExpiredUrls();
      if (cleanedCount > 0) {
        logger.logInfo('analytics', `Cleaned up ${cleanedCount} expired URLs`);
      }
      
      const data = getAnalyticsData();
      setAnalytics(data);
      logger.logInfo('analytics', `Analytics loaded: ${data.totalUrls} URLs, ${data.totalClicks} total clicks`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics';
      setError(errorMessage);
      logger.logError('analytics', `Failed to load analytics: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadAnalytics();
  };

  const exportData = () => {
    try {
      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        analytics: analytics
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `url-shortener-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      logger.logInfo('analytics', 'Analytics data exported successfully');
    } catch (error) {
      logger.logError('analytics', `Failed to export analytics data: ${error}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Loading analytics data...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadAnalytics} startIcon={<Refresh />}>
          Retry
        </Button>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Alert severity="info">
          No analytics data available.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshData}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={exportData}
            >
              Export Data
            </Button>
          </Box>
        </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LinkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total URLs</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {analytics.totalUrls}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Clicks</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {analytics.totalClicks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Visibility color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Active URLs</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {analytics.activeUrls}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Expired URLs</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {analytics.expiredUrls}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

        {/* Detailed Table */}
        <Paper elevation={3} sx={{ mt: 4 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              URL Details
            </Typography>
            
            {analytics.urlDetails.length === 0 ? (
              <Alert severity="info">
                No URLs have been created yet. Start by creating your first short URL!
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Short Code</TableCell>
                      <TableCell>Original URL</TableCell>
                      <TableCell align="center">Clicks</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Expires</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.urlDetails.map((url) => (
                      <TableRow key={url.shortCode} sx={{ 
                        opacity: url.isExpired ? 0.6 : 1,
                        bgcolor: url.isExpired ? 'grey.50' : 'inherit'
                      }}>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              color: url.isExpired ? 'text.disabled' : 'primary.main',
                              fontWeight: 'bold'
                            }}
                          >
                            /{url.shortCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            title={url.originalUrl}
                            sx={{ color: url.isExpired ? 'text.disabled' : 'text.primary' }}
                          >
                            {truncateUrl(url.originalUrl)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={url.clicks} 
                            size="small" 
                            color={url.clicks > 0 ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={url.isExpired ? 'Expired' : 'Active'}
                            size="small"
                            color={url.isExpired ? 'error' : 'success'}
                            variant={url.isExpired ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(url.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color={url.isExpired ? 'error' : 'text.secondary'}
                          >
                            {url.isExpired ? 'Expired' : getTimeRemaining(url.expiresAt)}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatDate(url.expiresAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>

        {/* Performance Metrics */}
        {analytics.totalUrls > 0 && (
          <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Click Rate
                </Typography>
                <Typography variant="body1">
                  Average clicks per URL: {(analytics.totalClicks / analytics.totalUrls).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Active vs Expired
                </Typography>
                <Typography variant="body1">
                  {((analytics.activeUrls / analytics.totalUrls) * 100).toFixed(1)}% of URLs are still active
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default AnalyticsPage;
