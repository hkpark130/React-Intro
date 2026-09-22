import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import './section/project-sections.css'

export default function NotFound() {
  return (
    <Box component="article" className="project-document project-not-found">
      <Typography component="h1" variant="inherit" className="project-section-heading">404</Typography>
      <Typography>페이지를 찾을 수 없습니다.</Typography>
    </Box>
  )
}
