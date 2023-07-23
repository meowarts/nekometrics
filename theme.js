import { createMuiTheme } from '@material-ui/core/styles';

const NekoColors = {
  WHITE: '#FCFCFC',
  BLACK: '#151515',
  DARKER_GREY: '#272727',
  DARK_GREY: '#505050',
  LIGHT_GREY: '#E2E2E2',
  NAVY: '#00091F',
  LIGHT_PURPLE: '#CEB1FF',
  PURPLE: '#AB7BFF',
  BLUE: '#328AC5',
  PINK: '#FF6384',
  RED: '#D83947',
  ORANGE: '#ff8c34',
  YELLOW: '#fff40b',
  GREEN: '#1eb51c',
  TEAL: '#4DC8A9',
  DARK_BACKGROUND_TRANSPARENT: '#1C2438',
  GRADIENT_DARK: 'linear-gradient(112.55deg, #48456de3 -42.13%, #0c132cd1 103.53%)',
  GRADIENT_DARKER: 'linear-gradient(112.55deg, #2c2730d9 -42.13%, #0c0829d1 103.53%)',
  PINK_BORDER: '#683365',
  PINK_TEXT: '#b844b1',
  WIDGET_BOX_SHADOW: 'none',
  ELEMENT_BOX_SHADOW: '0px 0px 5px 1px #0000001c',
};

const NekoFonts = {
  FAMILY: {
    CODA: 'Coda',
    NOVA_FLAT: 'Nova Flat',
    ROBOTO: 'Roboto'
  },
  SIZE: {
    10: '10px',
    12: '12px',
    14: '14px',
    16: '16px',
    18: '18px',
    20: '20px',
    25: '25px',
    32: '32px',
    40: '40px',
    55: '55px',
  },
  WEIGHT: {
    300: '300',
    400: '400',
    500: '500',
    600: '600',
    700: '700'
  }
};

const NekoStyles = {
  FONT_COLOR_NEGATIVE: '#D23737',
  FONT_COLOR_POSITIVE: '#3EB743',
  GRID_COLOR: '#B0B1C0',
  COLOR_PRIMARY_NEKO: NekoColors.WHITE,
  COLOR_SECONDARY_NEKO: NekoColors.PURPLE,
  COLOR_TERTIARY_NEKO: NekoColors.NAVY,
  WIDGET_BACKGROUND_SOLID: NekoColors.GRADIENT_DARK,
  WIDGET_BACKGROUND_IMAGE: NekoColors.GRADIENT_DARKER,
  WIDGET_BOX_SHADOW: NekoColors.WIDGET_BOX_SHADOW,
  ELEMENT_BOX_SHADOW: NekoColors.ELEMENT_BOX_SHADOW,
  PAGE_BACKGROUND: NekoColors.NAVY,
  HEADER_FOOTER_BACKGROUND: 'transparent', // NekoColors.NAVY
  BODY_BACKGROUND: NekoColors.WHITE,
  PINK_BUTTON_BORDER: NekoColors.PINK_BORDER,
  PINK_BUTTON_TEXT: NekoColors.PINK_TEXT,
  SERVICE_CARD_BACKGROUND: NekoColors.LIGHT_GREY,
  DISABLED_BUTTON: NekoColors.LIGHT_GREY,
  DARK_BACKGROUND_TRANSPARENT: NekoColors.DARK_BACKGROUND_TRANSPARENT
};

const NekoGradientText = {
  backgroundColor: '#9F68FF', //Fallback color
  backgroundImage: 'linear-gradient(45deg, #9F68FF, #FF4B49)',
  backgroundSize: '100%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  MozBackgroundClip: 'text',
  MozTextFillColor: 'transparent'
}

const NekoGradientsRepository = [
  {
    name: 'purple',
    color: NekoColors.PURPLE,
    gradient_start: "#5b68ba",
    gradient_end: "#6f33ad",
    offset_start: "15%",
    offset_end: "85%"
  }, {
    name: 'blue',
    color: NekoColors.BLUE,
    gradient_start: "#328ac5",
    gradient_end: "#323cc5",
    offset_start: "5%",
    offset_end: "95%"
  }, {
    name: 'navy',
    color: NekoColors.NAVY,
    gradient_start: "#83A7FF",
    gradient_end: "#142f71",
    offset_start: "5%",
    offset_end: "95%"
  }, {
    name: 'pink',
    color: NekoColors.PINK,
    gradient_start: "#F27A54",
    gradient_end: "#A154F2",
    offset_start: "5%",
    offset_end: "95%"
  }, {
    name: 'red',
    color: NekoColors.RED,
    gradient_start: "#FFAA5B",
    gradient_end: "#D83947",
    offset_start: "20%",
    offset_end: "80%"
  }, {
    name: 'orange',
    color: NekoColors.ORANGE,
    gradient_start: "#f6d111",
    gradient_end: "#ff8c34",
    offset_start: "10%",
    offset_end: "90%"
  }, {
    name: 'yellow',
    color: NekoColors.YELLOW,
    gradient_start: "#fbf295",
    gradient_end: "#fff40b",
    offset_start: "20%",
    offset_end: "80%"
  }, {
    name: 'green',
    color: NekoColors.GREEN,
    gradient_start: "#96d7a1",
    gradient_end: "#1eb51c",
    offset_start: "20%",
    offset_end: "80%"
  }, {
    name: 'teal',
    color: NekoColors.TEAL,
    gradient_start: "#C3A4E2",
    gradient_end: "#4DC8A9",
    offset_start: "20%",
    offset_end: "80%"
  }, {
    name: 'grey',
    color: NekoColors.LIGHT_GREY,
    gradient_start: "#ffffff",
    gradient_end: "#E2E2E2",
    offset_start: "10%",
    offset_end: "90%"
  }
];

const NekoTheme = createMuiTheme({
  common: NekoStyles,
  fonts: NekoFonts,
  colors: NekoColors,
  gradientRepo: NekoGradientsRepository,
  page: {
    marginTop: 60,
    marginBottom: 40,
    padding: 30,
    minHeight: 600,
    background: NekoStyles.PAGE_BACKGROUND,
    width: 1100,
    boxShadow: NekoStyles.ELEMENT_BOX_SHADOW,
  },
  gradient: NekoGradientText,
  overrides: {
    MuiCssBaseline: { // CssBaseline needed to set <body> background (?)
      '@global': {
        body: {
          backgroundColor: NekoStyles.PAGE_BACKGROUND,
        },
      },
    },
  }
});

const NekoWidgetSettingsStyles = theme => {
  return {
    summary: {
      alignItems: 'center'
    },
    titleTextField: {
      marginBottom: '20px'
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: '33.33%',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    accordionDetails: {
      fontSize: NekoFonts.SIZE[12]
    },
    googleWebProfileItem: {
      fontSize: NekoFonts.SIZE[12]
    }
  }
};

export { NekoTheme, NekoColors, NekoFonts, NekoStyles, NekoGradientText, NekoGradientsRepository, NekoWidgetSettingsStyles };