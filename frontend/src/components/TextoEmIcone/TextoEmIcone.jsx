import React from 'react';
import { IconButton, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  box: {
    alignItems: "center",
    color: "inherit", // herda do pai
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    position: 'relative',
    userSelect: "none",

    "& svg": {
      color: "currentColor", // ícones herdam a cor
    },

    "&:hover": {
      opacity: 0.65,
    },

    "& .MuiTypography-root": {
      whiteSpace: "wrap",
      // overflow: "hidden",
      textOverflow: "ellipsis",
      // maxWidth: "100%",
    }

  },
});

const TextoEmIcone = ({ icon, label, onClick, className, style, ...props }) => {
  const classes = useStyles();

  return (
    <Box
      className={`${classes.box} ${className || ""}`}
      style={{ ...style }}
      onClick={onClick}
      {...props}
    >
      <IconButton
        style={{ color: "inherit" }}
        disableRipple
      >
        {icon}
      </IconButton>

      <Typography
        variant="caption"
        style={{ color: "inherit" }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default TextoEmIcone;
