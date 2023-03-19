import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import { MdExpandMore } from 'react-icons/md'
import styled from '@emotion/styled'

const ExpandIcon = styled(MdExpandMore)`
  font-size: 1.5rem;
`
const StyledAccordion = styled(Accordion)`
  margin-top: 10px;
  border-radius: 4px !important;
  &:before {
    background-color: transparent;
  }
`
const StyledAccordionSummary = styled(AccordionSummary)`
  p {
    font-weight: 700;
  }
`

interface Props {
  summary: string
}

const AccordionComponent = ({
  summary,
  children,
}: React.PropsWithChildren<Props>) => (
  <StyledAccordion TransitionProps={{ unmountOnExit: true }} disableGutters>
    <StyledAccordionSummary expandIcon={<ExpandIcon />}>
      <Typography>{summary}</Typography>
    </StyledAccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </StyledAccordion>
)

export default AccordionComponent
