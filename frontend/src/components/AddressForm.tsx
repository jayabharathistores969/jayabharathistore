import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, CircularProgress
} from '@mui/material';

interface Address {
  _id?: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  mobileNumber: string;
}

interface AddressFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  address: Address | null;
  isLoading: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ open, onClose, onSave, address, isLoading }) => {
  const [formState, setFormState] = React.useState<Address>(address || {
    fullName: '', address: '', city: '', postalCode: '', country: '', mobileNumber: ''
  });

  React.useEffect(() => {
    setFormState(address || {
      fullName: '', address: '', city: '', postalCode: '', country: '', mobileNumber: ''
    });
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formState);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField name="fullName" label="Full Name" value={formState.fullName} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField name="address" label="Address" value={formState.address} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="city" label="City" value={formState.city} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="postalCode" label="Postal Code" value={formState.postalCode} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="country" label="Country" value={formState.country} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="mobileNumber" label="Mobile Number" value={formState.mobileNumber} onChange={handleChange} fullWidth />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressForm; 