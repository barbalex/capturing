import { createTheme } from '@mui/material/styles'
import { orange, purple, amber, deepOrange, grey } from '@mui/material/colors'

// see: https://mui.com/material-ui/customization/theming/

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      ...purple,
      ...(mode === 'dark' && {
        main: amber[300],
      }),
    },
    ...(mode === 'dark' && {
      background: {
        default: deepOrange[900],
        paper: deepOrange[900],
      },
    }),
    text: {
      ...(mode === 'light'
        ? {
            primary: grey[900],
            secondary: grey[800],
          }
        : {
            primary: '#fff',
            secondary: grey[500],
          }),
    },
  },
  typography: { fontFamily: ['Roboto'] },
})

export const darkModeTheme = createTheme(getDesignTokens('dark'))
export const lightModeTheme = createTheme(getDesignTokens('light'))

const theme = createTheme({
  palette: {
    primary: { main: purple[900] },
    secondary: { main: orange[900] },
  },
  typography: { fontFamily: ['Roboto'] },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', color: 'rgba(0,0,0,0.8)' },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
  },
})

export default theme
