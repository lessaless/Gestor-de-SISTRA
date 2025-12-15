import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    main: {
        backgroundColor: 'var(--color-bg1)',
        border: 'solid 1px var(--color-borderdefault)',
        boxShadow: '0 2px 4px 0px var(--color-shadow)',
        color: 'var(--color-font4light)',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '.9rem',
        // minHeight: 'calc(100vh - var(--altura-topbar) - 46px)',
        padding: '10px',
        width: 'calc(100% - 10px)'
    }
});

const DirinfraCardBody = (props) => {
    const {children} = props;
    const classes = useStyles();

    return (
        <div className={classes.main}>
            {children}
        </div>
    );
};

export default DirinfraCardBody;