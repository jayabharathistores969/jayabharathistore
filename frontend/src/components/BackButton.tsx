import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  onClick?: () => void;
  tooltip?: string;
  color?: 'primary' | 'secondary' | 'inherit' | 'default';
  size?: 'small' | 'medium' | 'large';
  sx?: any;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  tooltip = 'Go Back', 
  color = 'primary',
  size = 'medium',
  sx = {}
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={handleClick}
        color={color}
        size={size}
        sx={{
          borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.2)',
            transform: 'scale(1.05)'
          },
          transition: 'all 0.2s ease',
          ...sx
        }}
      >
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  );
};

export default BackButton; 