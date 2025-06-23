import React, { useState } from 'react';
import {
  Container, Typography, Stepper, Step, StepLabel, Box, Button, TextField, Card, CardContent, Divider, Grid, CircularProgress, Alert, useTheme, useMediaQuery, FormControl, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
// ... existing code ... 