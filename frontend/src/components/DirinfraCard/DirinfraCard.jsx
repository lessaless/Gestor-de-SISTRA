import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    main: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '30px',
        minWidth: '570px',
        width: '100%',
    }
});

const DirinfraCard = (props) => {
    const {children} = props;
    const classes = useStyles();

    return (
        <div className={classes.main}>
            {children}
        </div>
    );
};

export default DirinfraCard;