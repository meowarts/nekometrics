import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';
import { Typography } from '@material-ui/core';

const Footer = () => {
  const css = useStyles();

  return (
    <div className={css.wrapper}>
      <Link href='/about/terms-of-service'>TERMS OF SERVICE</Link>
      <Link href="/">
        <div className={css.logoContainer}>
          <Typography className={css.title}>Nekometrics</Typography>
        </div>
      </Link>
      <Link href='/about/privacy-policy'>PRIVACY POLICY</Link>
    </div>
  )
};

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: ' 0 0 20px 0',
    background: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    '& a': {
      fontSize: theme.fonts.SIZE[14],
      fontFamily: theme.fonts.FAMILY.CODA,
      alignSelf: 'center',
    },
    [theme.breakpoints.down(900)]: { flexDirection: 'column' }
  },
  title: {
    color: theme.common.COLOR_PRIMARY_NEKO,
    fontWeight: theme.fonts.WEIGHT[600],
    fontSize: theme.fonts.SIZE[18],
    textAlign: 'center',
    margin: '0 250px',
    [theme.breakpoints.down(900)]: { margin: 0 }
  },

}));


export default Footer;