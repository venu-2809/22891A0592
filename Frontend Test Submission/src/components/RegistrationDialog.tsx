import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { completeRegistrationFlow, RegistrationData } from '../utils/registration';
import { logger } from '../utils/logger';

interface RegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const steps = ['Enter Details', 'Register', 'Authenticate', 'Complete'];

const RegistrationDialog: React.FC<RegistrationDialogProps> = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RegistrationData>({
    rollNumber: '',
    email: '',
    githubUsername: '',
    accessCode: ''
  });

  const handleInputChange = (field: keyof RegistrationData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.rollNumber.trim()) {
      setError('Roll number is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.githubUsername.trim()) {
      setError('GitHub username is required');
      return false;
    }
    if (!formData.accessCode.trim()) {
      setError('Access code is required');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      setActiveStep(1); // Register step
      logger.logInfo('registration-dialog', 'Starting registration process');
      
      setActiveStep(2); // Authenticate step
      const token = await completeRegistrationFlow(formData);
      
      setActiveStep(3); // Complete step
      logger.logInfo('registration-dialog', 'Registration and authentication completed successfully');
      
      setTimeout(() => {
        onSuccess(token);
        handleClose();
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      logger.logError('registration-dialog', `Registration failed: ${errorMessage}`);
      setActiveStep(0); // Reset to first step
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setActiveStep(0);
      setError('');
      setFormData({
        rollNumber: '',
        email: '',
        githubUsername: '',
        accessCode: ''
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Register with Evaluation Server
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Complete registration to enable logging functionality
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Roll Number"
              placeholder="Enter your university roll number"
              value={formData.rollNumber}
              onChange={handleInputChange('rollNumber')}
              disabled={loading}
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="Enter your university email"
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={loading}
              helperText="Must be your university/college email"
            />
            
            <TextField
              fullWidth
              label="GitHub Username"
              placeholder="Enter your GitHub username"
              value={formData.githubUsername}
              onChange={handleInputChange('githubUsername')}
              disabled={loading}
              helperText="Username only, not the full URL"
            />
            
            <TextField
              fullWidth
              label="Access Code"
              placeholder="Enter the access code from email"
              value={formData.accessCode}
              onChange={handleInputChange('accessCode')}
              disabled={loading}
              helperText="Access code provided in the evaluation email"
            />
          </Box>
        )}

        {activeStep > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              {activeStep === 1 && 'Registering with server...'}
              {activeStep === 2 && 'Authenticating...'}
              {activeStep === 3 && 'Setup complete!'}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Important:</strong> Make sure your GitHub repository name matches your roll number 
            and that all the information provided matches your university records.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {activeStep === 0 && (
          <Button 
            onClick={handleRegister} 
            variant="contained" 
            disabled={loading}
          >
            Register & Authenticate
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationDialog;
