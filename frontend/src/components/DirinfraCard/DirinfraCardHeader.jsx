import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    main: {
        backgroundColor: 'var(--color-theme2)',
        background: 'linear-gradient(0deg,var(--color-theme3), var(--color-theme1))',
        boxShadow: '0 -2px 4px 0px var(--color-shadow)',
        width: '100%',
        height: 'calc(var(--altura-topbar) * 0.9)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '4px',
        color: 'var(--color-font4dark)',
        padding: '10px',

        '& > label, > div > label': {
            fontSize: '0.93rem',
            fontWeight: '550',
            padding: '10px'
        }
    },

    titulo: {
        fontSize: '0.94rem',
        fontWeight: '600'
    }
});

const DirinfraCardHeader = (props) => {
    const { titulo, children } = props;
    const classes = useStyles();

    return (
        <div className={classes.main}>
            {titulo && <h2 className={classes.titulo}>{titulo}</h2>}
            {children}
        </div>
    );
};

export default DirinfraCardHeader;