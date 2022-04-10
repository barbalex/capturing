import { createTheme } from '@mui/material/styles'
import { orange, purple } from '@mui/material/colors'

// see: https://mui.com/material-ui/customization/theming/

const theme = createTheme({
  palette: {
    primary: { main: purple[900] },
    secondary: { main: orange[900] },
  },
  typography: { fontFamily: ['Roboto'] },
})

export default theme
